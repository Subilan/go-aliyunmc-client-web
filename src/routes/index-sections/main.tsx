import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { UserPayloadContext } from '@/contexts/UserPayloadContext';
import { useContext, useEffect, useMemo, useState, type SetStateAction } from 'react';
import times from '@/lib/times';
import DataListKv from '@/components/data-list-kv';
import { CopyIcon, InfoIcon, MoreHorizontalIcon, RouteOffIcon, ServerOffIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Item, ItemContent, ItemMedia, ItemTitle, ItemDescription, ItemActions } from '@/components/ui/item';
import { StreamManagerContext } from '@/contexts/StreamManagerContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import CreateInstanceDialog from '@/components/dialogs/index/CreateInstanceDialog';
import DeleteInstanceDialog from '@/components/dialogs/index/DeleteInstanceDialog';
import DeployInstanceDialog from '@/components/dialogs/index/DeployInstanceDialog';
import CreateAndDeployDialog from '@/components/dialogs/index/CreateAndDeployDialog';
import { Spinner } from '@/components/ui/spinner';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import StartOrStopServerDialog from '@/components/dialogs/index/StartOrStopServerDialog';
import BackupOrArchiveDialog from '@/components/dialogs/index/BackupOrArchiveDialog';
import mchead from '@/lib/mchead';
import type { ServerInfo } from '@/types/ServerInfo';
import type { Instance, InstanceStatus } from '@/types/Instance';
import OptDropdownMenuItem from '@/components/optional-dropdown-menu-item';
import { toast } from 'sonner';
import OptTooltip from '@/components/optional-tooltip';
import type { TaskStatus } from '@/types/Task';
import { fetchActiveOrLatestInstance, fetchServerInfo, IndexRoute } from '@/routes';
import DetailDialog from '@/components/dialogs/index/DetailDialog';

const instanceStatusColor: Record<InstanceStatus, string> = {
	Pending: 'before:bg-amber-500',
	Starting: 'before:bg-amber-500',
	Running: 'before:bg-green-500',
	Stopping: 'before:bg-amber-500',
	Stopped: 'before:bg-red-500',
	UnableToGet: 'before:bg-red-500'
};

const instanceStatusText: Record<InstanceStatus, string> = {
	Pending: '准备中',
	Starting: '启动中',
	Running: '运行中',
	Stopping: '关闭中',
	Stopped: '已关闭',
	UnableToGet: '同步失败'
};

export default function IndexMainSection({ serverDetailDialog, setServerDetailDialog }: { serverDetailDialog: boolean; setServerDetailDialog: React.Dispatch<SetStateAction<boolean>> }) {
	const userPayload = useContext(UserPayloadContext);

	const loaded = IndexRoute.useLoaderData();

	const [instance, setInstance] = useState<Instance | undefined>(loaded.instance);
	const [instanceStatus, setInstanceStatus] = useState<InstanceStatus | undefined>(loaded.instanceStatus);
	const [activeDeploymentTaskStatus, setActiveDeploymentTaskStatus] = useState<TaskStatus | undefined>(loaded.activeDeploymentTaskStatus);
	const [serverInfo, setServerInfo] = useState<ServerInfo | undefined>(loaded.serverInfo);
	const isServerRunning = useMemo(() => serverInfo?.running === true, [serverInfo]);
	const [serverOnlineCount, setServerOnlineCount] = useState(loaded.serverInfo?.running ? loaded.serverInfo?.data?.players.online : 0);
	const [serverOnlinePlayers, setServerOnlinePlayers] = useState<string[]>(loaded.serverInfo?.running ? loaded.serverInfo.onlinePlayers : []);

	const deployedInstanceRunning = useMemo(() => instanceStatus === 'Running' && instance?.deletedAt === null && instance.deployed, [instance, instanceStatus]);

	const currentInstanceStatusColor = useMemo(() => (instanceStatus === undefined ? 'before:bg-gray-500' : instanceStatus ? instanceStatusColor[instanceStatus] : 'before:bg-gray-500'), [instance, instanceStatus]);
	const currentInstanceStatusText = useMemo(() => (instanceStatus === undefined ? '未创建' : instanceStatus ? instanceStatusText[instanceStatus] : '未知状态'), [instanceStatus]);

	const streamManager = useContext(StreamManagerContext);

	const [createInstanceDialog, setCreateInstanceDialog] = useState(false);
	const [deleteInstanceDialog, setDeleteInstanceDialog] = useState(false);
	const [deployInstanceDialog, setDeployInstanceDialog] = useState(false);
	const [createAndDeployDialog, setCreateAndDeployDialog] = useState(false);
	const [deployInstanceOutput, setDeployInstanceOutput] = useState('');
	const [deployInstanceLatestOutput, setDeployInstanceLatestOutput] = useState('');

	useEffect(() => {
		streamManager.setHook('onInstance', async event => {
			console.log('onInstance', event);
			switch (event.type) {
				case 'active_status_update': {
					setInstanceStatus(event.data);
					break;
				}

				case 'active_ip_update': {
					setInstance(inst => {
						if (!inst) return inst;
						return {
							...inst,
							ip: event.data
						};
					});
					break;
				}

				case 'deployment_task_status_update': {
					setActiveDeploymentTaskStatus(event.data);
					if (event.data !== 'running') {
						streamManager.clearLastEventId();
					}
					if (event.data === 'success') {
						toast.success('实例部署成功');
						setInstance(inst => {
							if (!inst) return inst;
							return {
								...inst,
								deployed: true
							};
						});
					}
					break;
				}

				case 'created': {
					setInstance(event.data);
					break;
				}

				case 'notify': {
					switch (event.data) {
						case 'instance_deleted': {
							const fetched = await fetchActiveOrLatestInstance();
							setInstance(fetched!);
							streamManager.clearLastEventId();
							break;
						}
					}
					break;
				}

				case 'create_and_deploy_failed': {
					toast.error('一键创建失败：' + event.data);
					break;
				}

				case 'create_and_deploy_step': {
					toast.info('状态更新：' + event.data);
					break;
				}
			}
		});

		streamManager.setHook('onDeployment', event => {
			setDeployInstanceOutput(state => state + event);
			setDeployInstanceLatestOutput(event);
		});

		streamManager.setHook('onServer', event => {
			console.log('on server', event);
			switch (event.type) {
				case 'notify': {
					if (event.data === 'running') {
						toast.success('服务器已开启');
						// @ts-ignore
						setServerInfo(info => ({ ...info, running: true }));
						fetchServerInfo().then(info => setServerInfo(info));
					}

					if (event.data === 'closed') {
						toast.info('服务器已关闭');
						setServerInfo(info => ({ ...info, running: false }));
						setServerOnlineCount(0);
						setServerOnlinePlayers([]);
					}
					break;
				}

				case 'online_count_update': {
					setServerOnlineCount(event.data);
					break;
				}

				case 'online_players_update': {
					const array = JSON.parse(event.data);

					if (!Array.isArray(array)) {
						console.warn('invalid online player update data');
						break;
					}

					setServerOnlinePlayers(array);

					break;
				}
			}
		});

		return () => {
			streamManager.rmHook('onDeployment');
			streamManager.rmHook('onInstance');
		};
	}, []);

	const [startOrStopServerDialog, setStartOrStopServerDialog] = useState(false);
	const [backupOrArchiveDialog, setBackupOrArchiveDialog] = useState(false);
	const [backupOrArchive, setBackupOrArchive] = useState<'backup' | 'archive'>('backup');
	const [startOrStop, setStartOrStop] = useState<'start' | 'stop'>('start');

	const condDeployedInstanceRunning = useMemo(() => ({ cond: !deployedInstanceRunning, message: '无有效实例' }), [deployedInstanceRunning]);
	const condAdmin = useMemo(() => ({ cond: userPayload.role !== 'admin', message: '权限不足' }), [userPayload]);

	return (
		userPayload.valid && (
			<>
				<DetailDialog deployedInstanceRunning={deployedInstanceRunning} open={serverDetailDialog} setOpen={setServerDetailDialog} />
				{deployedInstanceRunning && <StartOrStopServerDialog type={startOrStop} open={startOrStopServerDialog} setOpen={setStartOrStopServerDialog} />}
				{deployedInstanceRunning && <BackupOrArchiveDialog type={backupOrArchive} open={backupOrArchiveDialog} setOpen={setBackupOrArchiveDialog} />}
				<CreateInstanceDialog open={createInstanceDialog} setOpen={setCreateInstanceDialog} />
				<DeleteInstanceDialog deployedInstanceRunning={deployedInstanceRunning} open={deleteInstanceDialog} setOpen={setDeleteInstanceDialog} />
				<DeployInstanceDialog latestOutput={deployInstanceLatestOutput} status={activeDeploymentTaskStatus} setStatus={setActiveDeploymentTaskStatus} output={deployInstanceOutput} open={deployInstanceDialog} setOpen={setDeployInstanceDialog} />
				<CreateAndDeployDialog open={createAndDeployDialog} setOpen={setCreateAndDeployDialog} />
				<div className="flex flex-col gap-5">
					{activeDeploymentTaskStatus === 'running' && (
						<Item variant={'outline'}>
							<ItemMedia>
								<Spinner />
							</ItemMedia>
							<ItemContent>
								<ItemTitle>有部署正在进行中</ItemTitle>
								<ItemDescription>正在安装基础软件、Java 并拉取服务器数据中。</ItemDescription>
							</ItemContent>
							<ItemActions>
								<Button onClick={() => setDeployInstanceDialog(true)}>查看状态</Button>
							</ItemActions>
						</Item>
					)}
					{(instance === undefined || instance.deletedAt !== null) && (
						<Item variant={'outline'}>
							<ItemMedia>
								<InfoIcon size={16} />
							</ItemMedia>
							<ItemContent>
								<ItemTitle>无实例</ItemTitle>
								<ItemDescription>当前没有正在运行的实例。要快速开始游戏，请单击「一键创建」。</ItemDescription>
							</ItemContent>
							<ItemActions>
								<Button variant={'outline'} onClick={() => setCreateAndDeployDialog(true)}>
									一键创建
								</Button>
							</ItemActions>
						</Item>
					)}
					{(instance === undefined || instance.deletedAt !== null) && (
						<Empty className="border">
							<EmptyMedia>
								<ServerOffIcon />
							</EmptyMedia>
							<EmptyHeader>
								<EmptyTitle>暂无实例</EmptyTitle>
							</EmptyHeader>
							<EmptyContent>
								<OptTooltip show={userPayload.role !== 'admin'} content="权限不足">
									<Button disabled={userPayload.role !== 'admin'} onClick={() => setCreateInstanceDialog(true)}>
										创建实例
									</Button>
								</OptTooltip>
							</EmptyContent>
						</Empty>
					)}
					{instance?.deletedAt === null && (
						<section>
							<Card className="relative">
								<div className="absolute top-6 right-6 flex items-center gap-3">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant={'secondary'} size={'icon'}>
												<MoreHorizontalIcon />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent>
											<OptTooltip
												show={(activeDeploymentTaskStatus === undefined && userPayload.role !== 'admin') || deployedInstanceRunning}
												content={(() => {
													if (activeDeploymentTaskStatus === undefined && userPayload.role !== 'admin') return '权限不足';
													if (deployedInstanceRunning) return '无有效实例';
													return '';
												})()}
											>
												<DropdownMenuItem disabled={(activeDeploymentTaskStatus === undefined && userPayload.role !== 'admin') || deployedInstanceRunning} onClick={() => setDeployInstanceDialog(true)}>
													{activeDeploymentTaskStatus === undefined ? '触发部署' : '部署状态'}
												</DropdownMenuItem>
											</OptTooltip>
											<OptDropdownMenuItem
												conditions={[condAdmin, condDeployedInstanceRunning]}
												onClick={() => {
													setBackupOrArchive('backup');
													setBackupOrArchiveDialog(true);
												}}
											>
												触发服务器备份
											</OptDropdownMenuItem>
											<OptDropdownMenuItem
												conditions={[condAdmin, condDeployedInstanceRunning]}
												onClick={() => {
													setBackupOrArchive('archive');
													setBackupOrArchiveDialog(true);
												}}
											>
												触发服务器归档
											</OptDropdownMenuItem>
											<OptDropdownMenuItem conditions={[condAdmin]} onClick={() => setDeleteInstanceDialog(true)} variant="destructive">
												删除实例
											</OptDropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>

								<CardContent>
									<span className={cn('mb-2 font-normal before:block flex items-center gap-2 before:rounded-full before:h-1.25 before:w-1.25', currentInstanceStatusColor)}>{currentInstanceStatusText}</span>
									<div className="flex gap-3 mb-2">
										<div className="font-bold text-3xl">{instance.ip || '--'}</div>
										<Button variant={'outline'}>
											复制 <CopyIcon />
										</Button>
									</div>
									{/* <div className="flex gap-2 items-center">
											<MemoryStickIcon size={16} /> 16GB
											<Separator orientation="vertical" />
											<CpuIcon size={16} /> Intel Xeon
											<Separator orientation="vertical" />
											<ArrowDownUpIcon size={16} /> 100Mbps
										</div> */}
									<Separator className="my-5" />
									<DataListKv
										grid
										data={{
											'实例 ID': { content: instance.instanceId, copy: true },
											实例型号: instance.instanceType,
											'地域/可用区': instance.zoneId,
											创建时间: { content: times.formatDateAgo(instance.createdAt), detail: instance.createdAt }
										}}
									/>
								</CardContent>
							</Card>
						</section>
					)}
					{instance?.deletedAt === null && instance.deployed && (
						<section>
							<Card>
								<CardHeader className="flex gap-2 items-start">
									<div className="flex gap-2 items-center">
										<span className={cn('font-normal before:block flex items-center gap-2 before:rounded-full before:h-1.25 before:w-1.25', isServerRunning ? 'before:bg-green-500' : 'before:bg-red-500')}>{isServerRunning ? '在线' : '离线'}</span>
										{isServerRunning && (
											<>
												<Separator orientation="vertical" />
												<span>{serverOnlineCount}/20</span>
											</>
										)}
									</div>
									<div className="flex-1"></div>
									{!isServerRunning && (
										<Button
											onClick={() => {
												setStartOrStop('start');
												setStartOrStopServerDialog(true);
											}}
										>
											开启服务器
										</Button>
									)}
									{isServerRunning && (
										<>
											<OptTooltip show={userPayload.role !== 'admin'} content="权限不足">
												<Button
													onClick={() => {
														setStartOrStop('stop');
														setStartOrStopServerDialog(true);
													}}
													variant={'destructive'}
													disabled={userPayload.role !== 'admin'}
												>
													关闭服务器
												</Button>
											</OptTooltip>
										</>
									)}
								</CardHeader>
								<CardContent>
									{serverOnlineCount === 0 && (
										<>
											{isServerRunning ? (
												<Empty>
													<EmptyHeader>
														<EmptyMedia>
															<img draggable="false" src="/loong-speechless.jpg" />
														</EmptyMedia>
													</EmptyHeader>
													<EmptyTitle>无人在线</EmptyTitle>
													<EmptyDescription>一阵风把大家都吹走了</EmptyDescription>
												</Empty>
											) : (
												<Empty>
													<EmptyHeader>
														<EmptyMedia>
															<RouteOffIcon />
														</EmptyMedia>
														<EmptyTitle>服务器离线</EmptyTitle>
													</EmptyHeader>
												</Empty>
											)}
										</>
									)}
									{serverOnlineCount > 0 && serverOnlinePlayers.length > 0 && (
										<div className="grid grid-cols-15">
											{serverOnlinePlayers.map(name => {
												return (
													<Tooltip key={name}>
														<TooltipTrigger>
															<img draggable="false" src={mchead(name)} className="border-2 border-white" />
														</TooltipTrigger>
														<TooltipContent>{name}</TooltipContent>
													</Tooltip>
												);
											})}
										</div>
									)}
								</CardContent>
							</Card>
						</section>
					)}
				</div>
			</>
		)
	);
}
