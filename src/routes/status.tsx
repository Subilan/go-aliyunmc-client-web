import InstanceInfoDialog from '@/components/dialogs/status/InstanceInfoDialog';
import PlayersDialog from '@/components/dialogs/status/PlayersDialog';
import ServerInfoDialog from '@/components/dialogs/status/ServerInfoDialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { fetchActiveInstanceStatus } from '@/lib/requests/fetchActiveInstanceStatus';
import { fetchActiveOrLatestInstance } from '@/lib/requests/fetchActiveOrLatestInstance';
import { fetchServerInfo } from '@/lib/requests/fetchServerInfo';
import times from '@/lib/times';
import { cn } from '@/lib/utils';
import { RootRoute } from '@/root';
import { InstanceStatusColor, InstanceStatusWord } from '@/types/Instance';
import useSimpleStream from '@/useSimpleStream';
import { createRoute } from '@tanstack/react-router';
import { CogIcon, CopyIcon, ServerIcon, UsersIcon } from 'lucide-react';
import { useState } from 'react';

export const StatusRoute = createRoute({
	path: '/status',
	getParentRoute: () => RootRoute,
	component: Status,
	async loader() {
		return {
			instance: await fetchActiveOrLatestInstance(),
			instanceStatus: await fetchActiveInstanceStatus(),
			server: await fetchServerInfo()
		};
	}
});

export default function Status() {
	const loaded = StatusRoute.useLoaderData();
	const { instance, ...stream } = useSimpleStream({
		onlinePlayers: loaded.server?.running ? loaded.server.onlinePlayers : [],
		isSeverRunning: loaded.server?.running,
		instanceStatus: loaded.instanceStatus,
		instance: loaded.instance
	});

	const [instanceInfoDialog, setInstanceInfoDialog] = useState(false);
	const [serverInfoDialog, setServerInfoDialog] = useState(false);
	const [playersDialog, setPlayersDialog] = useState(false);

	return (
		<>
			<InstanceInfoDialog open={instanceInfoDialog} setOpen={setInstanceInfoDialog} instance={instance} />
			<ServerInfoDialog open={serverInfoDialog} setOpen={setServerInfoDialog} instance={instance} server={{ ...loaded.server!, running: stream.isServerRunning }} />
			<PlayersDialog open={playersDialog} setOpen={setPlayersDialog} instance={instance} players={stream.onlinePlayers} />
			<div className="h-dvh w-dvw flex items-center justify-center">
				<div className="w-100">
					<div className="flex flex-col gap-5">
						<div className="flex flex-col items-center gap-3">
							<div className="flex items-center gap-2">
								<span className={cn('font-normal before:block flex items-center gap-2 before:rounded-full before:h-1.25 before:w-1.25', InstanceStatusColor[stream.instanceStatus])}>{InstanceStatusWord[stream.instanceStatus]}</span>
								{stream.isServerRunning && (
									<>
										<Separator orientation="vertical" />
										<span>{stream.onlinePlayerCount}/20</span>
									</>
								)}
							</div>
							<div className="text-3xl">{instance === undefined || instance.deletedAt !== null ? '暂无实例' : instance.ip ? instance.ip : '等待分配 IP...'}</div>
							{instance && instance.deletedAt !== null && <div className="text-sm text-neutral-500">最近释放于 {times.formatDateAgo(instance.deletedAt)} </div>}
							{instance?.deletedAt === null && instance.ip && (
								<Button size={'sm'}>
									<CopyIcon />
									复制 IP 地址
								</Button>
							)}
						</div>
					</div>
				</div>
			</div>
			<div className="flex items-center justify-center gap-3 fixed bottom-8 w-dvw">
				<Button onClick={() => setInstanceInfoDialog(true)} size={'sm'} variant={'outline'}>
					<CogIcon /> 实例配置
				</Button>
				<Button onClick={() => setServerInfoDialog(true)} size={'sm'} variant={'outline'}>
					<ServerIcon /> 服务器信息
				</Button>
				<Button size={'sm'} variant={'outline'}>
					<UsersIcon /> 玩家列表
				</Button>
			</div>
		</>
	);
}
