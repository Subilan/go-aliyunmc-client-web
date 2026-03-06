import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import mchead from '@/lib/mchead';
import { Spinner } from '@/components/ui/spinner';
import { req } from '@/lib/req';
import type { OnlinePlayerHistoryItem } from '@/types/OnlinePlayerHistoryItem';
import type { OnlinePlayerOverview } from '@/types/OnlinePlayerOverview';
import * as echarts from 'echarts';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { InfoIcon } from 'lucide-react';
import times from '@/lib/times';
import OverviewMetric from './OverviewMetric';
import { Button } from '@/components/ui/button';

type TimeRange = '1h' | '6h' | '1d' | '1w';

export default function PlayerOnlineHistoryCard() {
	const [loading, setLoading] = useState(false);
	const [overviewLoading, setOverviewLoading] = useState(false);
	const [timeRange, setTimeRange] = useState<TimeRange>('1h');
	const [historyData, setHistoryData] = useState<OnlinePlayerHistoryItem[]>([]);
	const [overviewData, setOverviewData] = useState<OnlinePlayerOverview | null>(null);
	const chartRef = useRef<HTMLDivElement>(null);
	const chartInstance = useRef<echarts.ECharts | null>(null);

	const fetchHistory = useCallback(async (range: TimeRange) => {
		setLoading(true);
		const { data, error } = await req<OnlinePlayerHistoryItem[]>(
			`/server/online-player-history?timeRange=${range}`,
			'get'
		);
		setLoading(false);
		if (error === null && data) {
			setHistoryData(data);
		} else {
			setHistoryData([]);
		}
	}, []);

	const fetchOverview = useCallback(async () => {
		setOverviewLoading(true);
		const { data, error } = await req<OnlinePlayerOverview>(
			'/server/online-player-overview?timeRange=1w',
			'get'
		);
		setOverviewLoading(false);
		if (error === null && data) {
			setOverviewData(data);
		}
	}, []);

	useEffect(() => {
		fetchHistory(timeRange);
	}, [timeRange, fetchHistory]);

	useEffect(() => {
		fetchOverview();
	}, [fetchOverview]);

	useEffect(() => {
		return () => {
			if (chartInstance.current) {
				chartInstance.current.dispose();
				chartInstance.current = null;
			}
		};
	}, []);

	useLayoutEffect(() => {
		if (!chartRef.current || historyData.length === 0) return;

		if (chartInstance.current) {
			chartInstance.current.dispose();
			chartInstance.current = null;
		}

		chartInstance.current = echarts.init(chartRef.current);

		const timeRangeMs: Record<TimeRange, number> = {
			'1h': 60 * 60 * 1000,
			'6h': 6 * 60 * 60 * 1000,
			'1d': 24 * 60 * 60 * 1000,
			'1w': 7 * 24 * 60 * 60 * 1000
		};

		const now = Date.now();
		const startTime = now - timeRangeMs[timeRange];
		const granularity = 5 * 1000;

		const dataMap = new Map<string, number>();
		historyData.forEach(item => {
			const timestamp = new Date(item.createdAt).getTime();
			const roundedTime = Math.floor(timestamp / granularity) * granularity;
			dataMap.set(roundedTime.toString(), item.playerCount);
		});

		const seriesData: [number, number][] = [];

		for (let t = startTime; t <= now; t += granularity) {
			const roundedTime = Math.floor(t / granularity) * granularity;

			if (dataMap.has(roundedTime.toString())) {
				seriesData.push([roundedTime, dataMap.get(roundedTime.toString())!]);
			} else {
				seriesData.push([roundedTime, 0]);
			}
		}

		const option: echarts.EChartsOption = {
			tooltip: {
				trigger: 'axis',
				formatter: params => {
					const [param] = params as any[];
					const [timestamp, count] = param.value;

					const item = historyData.find(d => {
						const itemTime = new Date(d.createdAt).getTime();
						const roundedItemTime = Math.floor(itemTime / granularity) * granularity;
						return roundedItemTime === timestamp;
					});

					const players = item?.players ?? [];
					const avatarsHtml =
						players.length > 0
							? `<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; margin-top: 8px;">
								${players
									.map(
										(player: string) =>
											`<img src="${mchead(player, 25)}" alt="${player}" style="width: 20px; height: 20px;" />`
									)
									.join('')}
							</div>`
							: '';

					return `${times.formatDatetime(new Date(timestamp))}<br/>在线人数：${count}${avatarsHtml}`;
				}
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '3%',
				top: '10%',
				containLabel: true
			},
			xAxis: {
				type: 'time'
			},
			yAxis: {
				type: 'value',
				name: '在线人数',
				min: 0,
				interval: 1
			},
			series: [
				{
					name: '在线人数',
					type: 'line',
					data: seriesData,
					smooth: true,
					showSymbol: false,
					lineStyle: {
						width: 2
					},
					areaStyle: {
						opacity: 0.2
					}
				}
			]
		};

		chartInstance.current.setOption(option);
		chartInstance.current.resize();
	}, [historyData, timeRange]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					周在线人数历史{' '}
					<Popover>
						<PopoverTrigger asChild>
							<Button variant={'ghost'} size={'icon-xs'}>
								<InfoIcon />
							</Button>
						</PopoverTrigger>
						<PopoverContent>此处仅展示自当前时间向前倒推 168 小时的结果</PopoverContent>
					</Popover>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-5">
					{overviewLoading && (
						<div className="flex justify-center items-center h-[60px]">
							<div className="flex flex-col items-center gap-2">
								<Spinner />
								<span className="text-sm text-muted-foreground">指标加载中</span>
							</div>
						</div>
					)}
					{!overviewLoading && overviewData && (
						<div className="grid grid-cols-2 justify-center lg:flex lg:justify-start items-center gap-3 lg:gap-10">
							<OverviewMetric
								title="游玩玩家数"
								popoverContent={
									<div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
										{overviewData.uniquePlayers.map(player => (
											<div key={player} className="flex items-center gap-2">
												<img
													src={mchead(player, 25)}
													alt={player}
													className="w-5 h-5"
												/>
												<span>{player}</span>
											</div>
										))}
									</div>
								}
							>
								{overviewData.uniquePlayers.length}
							</OverviewMetric>
							<OverviewMetric title="总在线时长">
								{overviewData.totalHours.toFixed(1)}h
							</OverviewMetric>
							<OverviewMetric title="最高同时在线">
								{overviewData.maxConcurrentPlayers}
							</OverviewMetric>
							<OverviewMetric
								title="利用率"
								popoverContent={
									<p>
										在过去的 168 个小时内，服务器共运转了{' '}
										{overviewData.serverOnlineHours.toFixed(1)}h，其中{' '}
										{overviewData.totalHours.toFixed(1)}h 有玩家在线
									</p>
								}
							>
								{(
									(overviewData.totalHours * 100) /
									overviewData.serverOnlineHours
								).toFixed(1)}
								%
							</OverviewMetric>
						</div>
					)}
					<div className="relative h-[300px] border-dashed border-neutral-200 py-3 border rounded-lg">
						{loading && (
							<div className="flex justify-center items-center h-[300px]">
								<div className="flex flex-col items-center gap-2">
									<Spinner />
									<span className="text-sm text-muted-foreground">
										图表加载中
									</span>
								</div>
							</div>
						)}
						{!loading && (
							<>
								<div className="absolute z-10 top-5 right-5">
									<Select
										value={timeRange}
										onValueChange={(value: TimeRange) => setTimeRange(value)}
									>
										<SelectTrigger className="w-[120px] bg-white">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="1h">1 小时</SelectItem>
											<SelectItem value="6h">6 小时</SelectItem>
											<SelectItem value="1d">1 天</SelectItem>
											<SelectItem value="1w">1 周</SelectItem>
										</SelectContent>
									</Select>
								</div>
								{historyData.length === 0 ? (
									<div className="text-center h-full text-muted-foreground flex items-center justify-center">
										这段时间没有玩家在线
									</div>
								) : (
									<div ref={chartRef} className="w-full h-full" />
								)}
							</>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
