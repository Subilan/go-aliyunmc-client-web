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
import { ServerOffIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const dirNameMappings: Record<string, string> = {
	'/home/mc/server/archive': '总存档',
	'/home/mc/server/archive/world': '主世界',
	'/home/mc/server/archive/world_nether': '下界',
	'/home/mc/server/archive/world_the_end': '末地'
};

function DetailEmpty() {
	return (
		<Empty className='border'>
			<EmptyMedia>
				<ServerOffIcon />
			</EmptyMedia>
			<EmptyHeader>
				<EmptyTitle>暂无信息</EmptyTitle>
				<EmptyDescription>没有可以提供此信息的实例</EmptyDescription>
			</EmptyHeader>
		</Empty>
	);
}

export default function DetailDialog(props: DialogControl & { deployedInstanceRunning: boolean }) {
	const [backupInfo, setBackupInfo] = useState<CommandExec[]>([]);
	const [backupInfoLoading, setBackupInfoLoading] = useState(false);
	const [screenfetch, setScreenfetch] = useState('');
	const [screenfetchLoading, setScreenfetchLoading] = useState(false);
	const [sizes, setSizes] = useState<{ dir: string; size: string }[]>([]);
	const [sizesLoading, setSizesLoading] = useState(false);
	const [screenfetchAvail, setScreenfetchAvail] = useState(props.deployedInstanceRunning);
	const [sizesAvail, setSizesAvail] = useState(props.deployedInstanceRunning);
	const [refreshedAt, setRefreshedAt] = useState('');

	useEffect(() => {
		setScreenfetchAvail(props.deployedInstanceRunning);
		setSizesAvail(props.deployedInstanceRunning);

		if (props.deployedInstanceRunning) {
			setScreenfetchLoading(true);
			setSizesLoading(true);

			req<string>('/server/query?queryType=screenfetch', 'get')
				.then(({ data, error }) => {
					if (error !== null) {
						toast.error('无法获取信息：' + error);
						return;
					}

					setScreenfetch(data.trimEnd());
					setRefreshedAt(times.formatDatetime(new Date()));
				})
				.finally(() => setScreenfetchLoading(false));

			req<string>('/server/query?queryType=get_server_sizes', 'get')
				.then(({ data, error }) => {
					if (error !== null) {
						toast.error('无法获取信息：' + error);
						return;
					}

					setSizes(
						data
							.trimEnd()
							.split('\n')
							.map(x => {
								const pair = x.split('\t');
								return { size: pair[0], dir: pair[1] };
							})
					);
				})
				.finally(() => setSizesLoading(false));
		}
	}, [props.deployedInstanceRunning]);

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
				<TabsList className='mb-2'>
					<TabsTrigger value="configuration">游戏配置</TabsTrigger>
					<TabsTrigger value="backupInfo">存档备份情况</TabsTrigger>
					<TabsTrigger value="players">周目玩家</TabsTrigger>
					<TabsTrigger value="screenfetch">实例概况</TabsTrigger>
					<TabsTrigger value="sizes">存档大小</TabsTrigger>
				</TabsList>
				<TabsContent value="configuration">
					<DataListKv
						grid
						border
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
											<ItemDescription>{info.auto ? '自动备份' : `由 ${info.by} 发起`}</ItemDescription>
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
				<TabsContent value="screenfetch">
					{screenfetchAvail ? (
						screenfetchLoading ? (
							<Spinner />
						) : (
							<pre className="whitespace-pre-wrap border border-neutral-200 rounded-lg p-3">
								<code className="w-full block">{screenfetch}</code>
							</pre>
						)
					) : (
						<DetailEmpty />
					)}
				</TabsContent>
				<TabsContent value="sizes">
					{sizesAvail ? (
						sizesLoading ? (
							<Spinner />
						) : (
							<div className="flex flex-col gap-3">
								{sizes.map(size => (
									<Item key={size.dir} variant={'outline'}>
										{Object.keys(dirNameMappings).includes(size.dir) ? (
											<>
												<ItemTitle>{dirNameMappings[size.dir]}</ItemTitle>
												<ItemDescription>{size.dir}</ItemDescription>
											</>
										) : (
											<ItemTitle>{size.dir}</ItemTitle>
										)}
										<div className="flex-1" />
										<div>{size.size}</div>
									</Item>
								))}
							</div>
						)
					) : (
						<DetailEmpty />
					)}
				</TabsContent>
			</Tabs>
		</Wrapper>
	);
}
