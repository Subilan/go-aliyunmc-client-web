import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import WrappedTable, { useTableNavigation } from '@/components/wrapped-table';
import { fetchPlayTimeRanking } from '@/lib/requests/fetchPlayTimeRanking';
import { fetchPlayTimeOverview } from '@/lib/requests/fetchPlayTimeOverview';
import times from '@/lib/times';
import type { PlayTimeRankingItem } from '@/types/PlayTimeRanking';
import type { PlayTimeOverview } from '@/types/PlayTimeOverview';
import { useEffect, useMemo, useState } from 'react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Empty, EmptyContent, EmptyDescription, EmptyTitle } from '@/components/ui/empty';
import OverviewMetric from './OverviewMetric';

type SortBy = 'playTime' | 'lastSeen' | 'nickname';
type SortOrder = 'asc' | 'desc';

export default function PlayTimeRankingCard() {
	const [tableLoading, setTableLoading] = useState(false);
	const [overviewLoading, setOverviewLoading] = useState(false);
	const [data, setData] = useState<PlayTimeRankingItem[]>([]);
	const [total, setTotal] = useState(0);
	const [overview, setOverview] = useState<PlayTimeOverview | null>(null);
	const [sortBy, setSortBy] = useState<SortBy>('playTime');
	const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
	const nav = useTableNavigation();

	const pageCount = useMemo(() => Math.ceil(total / nav.pageSize), [total, nav.pageSize]);

	useEffect(() => {
		(async () => {
			setTableLoading(true);
			const result = await fetchPlayTimeRanking(nav.page, nav.pageSize, sortBy, sortOrder);
			setTableLoading(false);
			setData(result.items);
			setTotal(result.total);
		})();
	}, [nav.page, nav.pageSize, sortBy, sortOrder]);

	useEffect(() => {
		// 当排序条件或 pageSize 改变时，重置到第一页
		nav.setPage(1);
	}, [sortBy, sortOrder]);

	useEffect(() => {
		(async () => {
			setOverviewLoading(true);
			const overviewData = await fetchPlayTimeOverview();
			setOverviewLoading(false);
			if (overviewData) {
				setOverview(overviewData);
			}
		})();
	}, []);

	return (
		<Card>
			<CardHeader>
				<CardTitle>游玩数据</CardTitle>
			</CardHeader>
			<CardContent>
				{overviewLoading ? (
					<Spinner />
				) : data.length > 0 ? (
					<div className="flex flex-col gap-3">
						<div className="grid grid-cols-2 justify-center lg:flex lg:justify-start items-center gap-3 lg:gap-10">
							<OverviewMetric title="总游戏时长">
								{((overview?.totalPlayTime ?? 0) / 20 / 3600).toFixed(1)}h
							</OverviewMetric>
							<OverviewMetric title="最近在线">
								{times.formatDateAgo(overview?.latestPlayerLastSeen ?? 0)}
								<small className="text-neutral-500 hidden lg:inline-block">
									（{overview?.latestPlayerName}）
								</small>
							</OverviewMetric>
						</div>
						<div className="flex gap-3 justify-end">
							<Select value={sortBy} onValueChange={v => setSortBy(v as SortBy)}>
								<SelectTrigger className="w-[120px]">
									<SelectValue placeholder="排序字段" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="playTime">游戏时长</SelectItem>
									<SelectItem value="lastSeen">最后在线</SelectItem>
									<SelectItem value="nickname">游戏名</SelectItem>
								</SelectContent>
							</Select>
							<Select
								value={sortOrder}
								onValueChange={v => setSortOrder(v as SortOrder)}
							>
								<SelectTrigger className="w-[100px]">
									<SelectValue placeholder="排序顺序" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="desc">降序</SelectItem>
									<SelectItem value="asc">升序</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<WrappedTable
							data={data}
							getKey={item => item.nickname}
							keys={['nickname', 'playTime', 'firstJoin', 'lastSeen']}
							header={{
								nickname: '游戏名',
								playTime: '游戏时长',
								firstJoin: '首次登录',
								lastSeen: '最后在线'
							}}
							render={{
								nickname: item => <>{item.nickname}</>,
								playTime: item => {
									const seconds = item.playTime / 20;
									const hours = Math.floor(seconds / 3600);
									const minutes = Math.floor((seconds % 3600) / 60);
									return `${hours}h ${minutes}m`;
								},
								firstJoin: item => times.formatDatetime(item.firstJoin),
								lastSeen: item => times.formatDatetime(item.lastSeen)
							}}
							pageSize={nav.pageSize}
							setPageSize={nav.setPageSize}
							page={nav.page}
							setPage={nav.setPage}
							pageCount={pageCount}
							loading={tableLoading}
						/>
					</div>
				) : (
					<Empty>
						<EmptyContent>
							<EmptyTitle>暂无排行榜数据</EmptyTitle>
							<EmptyDescription>目前没有玩家游戏时长记录</EmptyDescription>
						</EmptyContent>
					</Empty>
				)}
			</CardContent>
		</Card>
	);
}
