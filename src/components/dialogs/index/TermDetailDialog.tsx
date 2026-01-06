import DataListKv from '@/components/data-list-kv';
import type { DialogControl } from '@/components/dialogs/type';
import Wrapper from '@/components/dialogs/Wrapper';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import mchead from '@/lib/mchead';
import { req } from '@/lib/req';
import times from '@/lib/times';
import type { CommandExec } from '@/types/CommandExec';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function TermDetailDialog(props: DialogControl) {
	const [backupInfo, setBackupInfo] = useState<CommandExec[]>([]);
	const [backupInfoLoading, setBackupInfoLoading] = useState(false);
	const [refreshedAt, setRefreshedAt] = useState('');

	useEffect(() => {
		setBackupInfoLoading(true);

		req<CommandExec[]>('/server/backups', 'get')
			.then(({ data, error }) => {
				if (error !== null) {
					toast.error('无法获取信息：' + error);
					return;
				}
				setBackupInfo(data);
				setRefreshedAt(times.formatDatetime(new Date()));
			})
			.finally(() => setBackupInfoLoading(false));
	}, []);

	return (
		<Wrapper open={props.open} setOpen={props.setOpen} title="周目信息" className="max-w-175!">
			{refreshedAt.length > 0 && <p>数据更新于 {refreshedAt}</p>}
			<Tabs defaultValue="configuration">
				<TabsList>
					<TabsTrigger value="configuration">游戏配置</TabsTrigger>
					<TabsTrigger value="backupInfo">存档备份情况</TabsTrigger>
					<TabsTrigger value="players">周目玩家</TabsTrigger>
				</TabsList>
				<TabsContent value="configuration">
					<DataListKv
						grid
						border
						className="mt-2"
						data={{
							'Java 版本': 'Zulu 21',
							游戏版本: '1.21.1',
							服务端: 'Paper',
							难度: 'Hard',
							白名单: true,
							正版验证: true
						}}
					/>
				</TabsContent>
				<TabsContent value="backupInfo">
					{backupInfoLoading ? (
						<Spinner />
					) : (
						<div className="flex flex-col gap-3">
							{backupInfo.length
								? backupInfo.map(info => (
										<Item key={info.id} variant={'outline'}>
											<ItemTitle>{times.formatDatetime(info.createdAt)}</ItemTitle>
											<ItemDescription>{info.auto ? '自动备份' : `由 ${info.id} 发起`}</ItemDescription>
										</Item>
								  ))
								: '暂无备份'}
						</div>
					)}
				</TabsContent>
				<TabsContent value="players">
					<p>此处列出了加入过此周目的所有玩家。</p>
					<div className="flex flex-col gap-3 mt-3">
						{['Constant137', 'Subilan'].map(player => (
							<Item variant={'outline'} key={player}>
								<ItemMedia>
									<img draggable="false" src={mchead(player)} className="h-[40px] w-[40px]" />
								</ItemMedia>
								<ItemContent>
									<ItemTitle>{player}</ItemTitle>
									<ItemDescription>Op · 13h</ItemDescription>
								</ItemContent>
							</Item>
						))}
					</div>
				</TabsContent>
			</Tabs>
		</Wrapper>
	);
}
