import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPayloadContext } from '@/contexts/UserPayloadContext';
import { useContext, useMemo, useState, type SetStateAction } from 'react';
import times from '@/lib/times';
import DataListKv from '@/components/data-list-kv';
import { CopyIcon, InfoIcon, MoreHorizontalIcon, RouteOffIcon, ServerOffIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn, copy } from '@/lib/utils';
import {
	Item,
	ItemContent,
	ItemMedia,
	ItemTitle,
	ItemDescription,
	ItemActions
} from '@/components/ui/item';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import CreateInstanceDialog from '@/components/dialogs/index/CreateInstanceDialog';
import DeleteInstanceDialog from '@/components/dialogs/index/DeleteInstanceDialog';
import DeployInstanceDialog from '@/components/dialogs/index/DeployInstanceDialog';
import CreateAndDeployDialog from '@/components/dialogs/index/CreateAndDeployDialog';
import { Spinner } from '@/components/ui/spinner';
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle
} from '@/components/ui/empty';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import StartOrStopServerDialog from '@/components/dialogs/index/StartOrStopServerDialog';
import BackupOrArchiveDialog from '@/components/dialogs/index/BackupOrArchiveDialog';
import mchead from '@/lib/mchead';
import OptDropdownMenuItem from '@/components/optional-dropdown-menu-item';
import OptTooltip from '@/components/optional-tooltip';
import DetailDialog from '@/components/dialogs/index/DetailDialog';
import type { UseStreamReturn } from '@/hooks/useStream';
import { InstanceStatusColor, InstanceStatusWord } from '@/types/Instance';
import { UserRoleAdmin } from '@/types/User';
import MapDialog from '@/components/dialogs/index/MapDialog';

export default function IndexMainSection({
	serverDetailDialog,
	setServerDetailDialog,
	instance,
	instanceStatus,
	activeDeploymentTaskStatus,
	setActiveDeploymentTaskStatus,
	isServerRunning,
	serverOnlineCount,
	serverOnlinePlayers,
	deployInstanceOutput,
	deployInstanceLatestOutput,
	deployedInstanceRunning,
	streamManager
}: {
	serverDetailDialog: boolean;
	setServerDetailDialog: React.Dispatch<SetStateAction<boolean>>;
} & UseStreamReturn) {
	const userPayload = useContext(UserPayloadContext);

	const [createInstanceDialog, setCreateInstanceDialog] = useState(false);
	const [deleteInstanceDialog, setDeleteInstanceDialog] = useState(false);
	const [deployInstanceDialog, setDeployInstanceDialog] = useState(false);
	const [createAndDeployDialog, setCreateAndDeployDialog] = useState(false);

	const [startOrStopServerDialog, setStartOrStopServerDialog] = useState(false);
	const [backupOrArchiveDialog, setBackupOrArchiveDialog] = useState(false);
	const [mapDialog, setMapDialog] = useState(false);
	const [backupOrArchive, setBackupOrArchive] = useState<'backup' | 'archive'>('backup');
	const [startOrStop, setStartOrStop] = useState<'start' | 'stop'>('start');

	const currentInstanceStatusColor = useMemo(
		() =>
			instanceStatus === undefined
				? 'before:bg-gray-500'
				: instanceStatus
					? InstanceStatusColor[instanceStatus]
					: 'before:bg-gray-500',
		[instance, instanceStatus]
	);
	const currentInstanceStatusText = useMemo(
		() =>
			instanceStatus === undefined
				? '未创建'
				: instanceStatus
					? InstanceStatusWord[instanceStatus]
					: '未知状态',
		[instanceStatus]
	);
	const condDeployedInstanceRunning = useMemo(
		() => ({ cond: !deployedInstanceRunning, message: '无有效实例' }),
		[deployedInstanceRunning]
	);
	const condAdmin = useMemo(
		() => ({ cond: userPayload.role < UserRoleAdmin, message: '权限不足' }),
		[userPayload]
	);

	return (
		userPayload.valid && (
			<>
				<DetailDialog
					deployedInstanceRunning={deployedInstanceRunning}
					open={serverDetailDialog}
					setOpen={setServerDetailDialog}
				/>
				{deployedInstanceRunning && (
					<StartOrStopServerDialog
						type={startOrStop}
						open={startOrStopServerDialog}
						setOpen={setStartOrStopServerDialog}
					/>
				)}
				{deployedInstanceRunning && (
					<BackupOrArchiveDialog
						type={backupOrArchive}
						open={backupOrArchiveDialog}
						setOpen={setBackupOrArchiveDialog}
					/>
				)}
				{deployedInstanceRunning && isServerRunning && (
					<MapDialog open={mapDialog} setOpen={setMapDialog} ip={instance?.ip} />
				)}
				<CreateInstanceDialog
					open={createInstanceDialog}
					setOpen={setCreateInstanceDialog}
				/>
				<DeleteInstanceDialog
					deployedInstanceRunning={deployedInstanceRunning}
					open={deleteInstanceDialog}
					setOpen={setDeleteInstanceDialog}
				/>
				<DeployInstanceDialog
					streamManager={streamManager}
					latestOutput={deployInstanceLatestOutput}
					status={activeDeploymentTaskStatus}
					setStatus={setActiveDeploymentTaskStatus}
					output={deployInstanceOutput}
					open={deployInstanceDialog}
					setOpen={setDeployInstanceDialog}
				/>
				<CreateAndDeployDialog
					open={createAndDeployDialog}
					setOpen={setCreateAndDeployDialog}
				/>
				<div className="flex flex-col gap-5">
					{activeDeploymentTaskStatus === 'running' && (
						<Item variant={'outline'}>
							<ItemMedia>
								<Spinner />
							</ItemMedia>
							<ItemContent>
								<ItemTitle>有部署正在进行中</ItemTitle>
								<ItemDescription>
									正在安装基础软件、Java 并拉取服务器数据中。
								</ItemDescription>
							</ItemContent>
							<ItemActions>
								<Button onClick={() => setDeployInstanceDialog(true)}>
									查看状态
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
								<div className="flex items-center gap-3">
									<Button onClick={() => setCreateAndDeployDialog(true)}>
										一键创建
									</Button>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant={'outline'} size={'icon'}>
												<MoreHorizontalIcon />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent>
											<OptTooltip
												show={userPayload.role < UserRoleAdmin}
												content="权限不足"
											>
												<DropdownMenuItem
													disabled={userPayload.role < UserRoleAdmin}
													onClick={() => setCreateInstanceDialog(true)}
												>
													仅创建实例
												</DropdownMenuItem>
											</OptTooltip>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
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
												show={
													(activeDeploymentTaskStatus === undefined &&
														userPayload.role < UserRoleAdmin) ||
													deployedInstanceRunning
												}
												content={(() => {
													if (
														activeDeploymentTaskStatus === undefined &&
														userPayload.role < UserRoleAdmin
													)
														return '权限不足';
													if (deployedInstanceRunning)
														return '无有效实例';
													return '';
												})()}
											>
												<DropdownMenuItem
													disabled={
														(activeDeploymentTaskStatus === undefined &&
															userPayload.role < UserRoleAdmin) ||
														deployedInstanceRunning
													}
													onClick={() => setDeployInstanceDialog(true)}
												>
													{activeDeploymentTaskStatus === undefined
														? '触发部署'
														: '部署状态'}
												</DropdownMenuItem>
											</OptTooltip>
											<OptDropdownMenuItem
												conditions={[
													condAdmin,
													condDeployedInstanceRunning
												]}
												onClick={() => {
													setBackupOrArchive('backup');
													setBackupOrArchiveDialog(true);
												}}
											>
												触发服务器备份
											</OptDropdownMenuItem>
											<OptDropdownMenuItem
												conditions={[
													condAdmin,
													condDeployedInstanceRunning
												]}
												onClick={() => {
													setBackupOrArchive('archive');
													setBackupOrArchiveDialog(true);
												}}
											>
												触发服务器归档
											</OptDropdownMenuItem>
											<OptDropdownMenuItem
												conditions={[condAdmin]}
												onClick={() => setDeleteInstanceDialog(true)}
												variant="destructive"
											>
												删除实例
											</OptDropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>

								<CardContent>
									<span
										className={cn(
											'mb-2 font-normal before:block flex items-center gap-2 before:rounded-full before:h-1.25 before:w-1.25',
											currentInstanceStatusColor
										)}
									>
										{currentInstanceStatusText}
									</span>
									<div className="flex gap-3 mb-2">
										<div className="font-bold text-3xl">
											{instance.ip || '--'}
										</div>
										{instance.ip && (
											<Button
												onClick={() => instance.ip && copy(instance.ip)}
												variant={'outline'}
											>
												复制 <CopyIcon />
											</Button>
										)}
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
											创建时间: {
												content: times.formatDateAgo(instance.createdAt),
												detail: instance.createdAt
											}
										}}
									/>
								</CardContent>
							</Card>
						</section>
					)}
					{instance?.deletedAt === null && instance.deployed && (
						<section>
							<Card>
								<CardHeader className="flex gap-3 items-center">
									<CardTitle>服务器控制</CardTitle>
									<div className="flex-1"></div>
									<div className="flex gap-3 items-center">
										<span
											className={cn(
												'font-normal before:block flex items-center gap-2 before:rounded-full before:h-1.25 before:w-1.25',
												isServerRunning
													? 'before:bg-green-500'
													: 'before:bg-red-500'
											)}
										>
											{isServerRunning ? '在线' : '离线'}
										</span>
										{isServerRunning && (
											<>
												<Separator orientation="vertical" />
												<span>{serverOnlineCount}/20</span>
											</>
										)}
									</div>
								</CardHeader>
								<CardContent>
									<div className="flex flex-col gap-3">
										<div className="flex items-center gap-3">
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
													<Button
														onClick={() => setServerDetailDialog(true)}
														variant={'outline'}
													>
														服务器信息
													</Button>
													<Button
														onClick={() => setMapDialog(true)}
														variant={'outline'}
													>
														世界地图
													</Button>
													<OptTooltip
														show={userPayload.role < UserRoleAdmin}
														content="权限不足"
													>
														<Button
															onClick={() => {
																setStartOrStop('stop');
																setStartOrStopServerDialog(true);
															}}
															variant={'destructive'}
															disabled={
																userPayload.role < UserRoleAdmin
															}
														>
															关闭服务器
														</Button>
													</OptTooltip>
												</>
											)}
										</div>
										<Separator className="my-3" />
										<div className="flex flex-col gap-3">
											<p>玩家列表</p>
											{!isServerRunning && (
												<p className="text-neutral-500">
													<em>服务器不在线</em>
												</p>
											)}
											{isServerRunning && serverOnlineCount === 0 && (
												<p className="text-neutral-500">
													<em>暂无玩家在线</em>
												</p>
											)}
											{isServerRunning &&
												serverOnlineCount > 0 &&
												serverOnlinePlayers.length > 0 && (
													<div className="grid grid-cols-15">
														{serverOnlinePlayers.map(name => {
															return (
																<Tooltip key={name}>
																	<TooltipTrigger>
																		<img
																			draggable="false"
																			src={mchead(name)}
																			className="border-2 border-white"
																		/>
																	</TooltipTrigger>
																	<TooltipContent>
																		{name}
																	</TooltipContent>
																</Tooltip>
															);
														})}
													</div>
												)}
										</div>
									</div>
								</CardContent>
							</Card>
						</section>
					)}
				</div>
			</>
		)
	);
}
