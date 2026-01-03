import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserPayloadContext } from '@/contexts/UserPayloadContext';
import { RootRoute, router } from '@/root';
import { createRoute, redirect } from '@tanstack/react-router';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import times from '@/lib/times';
import DataListKv from '@/components/data-list-kv';
import { CopyIcon, InfoIcon, RefreshCwIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { isAuthenticated, req } from '@/lib/req';
import { cn } from '@/lib/utils';
import { Item, ItemContent, ItemMedia, ItemTitle, ItemDescription, ItemActions } from '@/components/ui/item';
import { StreamManagerContext } from '@/contexts/StreamManagerContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert';
import toast from 'react-hot-toast';

export const IndexRoute = createRoute({
	path: '/',
	component: Index,
	getParentRoute: () => RootRoute,
	async beforeLoad() {
		if (!(await isAuthenticated())) {
			throw redirect({ to: '/lor' });
		}
	},
	loader() {
		return fetchActiveOrLatestInstanceAndStatus();
	}
});

async function fetchActiveOrLatestInstanceAndStatus() {
	let { data: activeOrLatestInstance, error } = await req('/active-or-latest-instance', 'GET');

	if (error !== null) {
		return { instance: {}, instanceStatus: '' };
	}

	return { instance: activeOrLatestInstance?.instance, instanceStatus: activeOrLatestInstance?.status.instanceStatus };
}

export type InstanceStatus = '__created__' | 'Pending' | 'Starting' | 'Running' | 'Stopping' | 'Stopped' | 'unable_to_get';

const instanceStatusColor: Record<InstanceStatus, string> = {
	__created__: 'before:bg-gray-500',
	Pending: 'before:bg-amber-500',
	Starting: 'before:bg-amber-500',
	Running: 'before:bg-green-500',
	Stopping: 'before:bg-amber-500',
	Stopped: 'before:bg-red-500',
	unable_to_get: 'before:bg-red-500'
};

const instanceStatusText: Record<InstanceStatus, string> = {
	__created__: '已创建',
	Pending: '准备中',
	Starting: '启动中',
	Running: '运行中',
	Stopping: '关闭中',
	Stopped: '已关闭',
	unable_to_get: '同步失败'
};

type InstanceTypeAndTradePrice = {
	instanceType: string;
	cpuCoreCount: number;
	memorySize: number;
	tradePrice: number;
};

export default function Index() {
	const userPayload = useContext(UserPayloadContext);

	useEffect(() => {
		if (!userPayload.valid && userPayload.loaded) {
			router.navigate({ to: '/lor' });
		}
	}, [userPayload]);

	const loaded = IndexRoute.useLoaderData();

	const [instance, setInstance] = useState(loaded.instance);
	const [instanceStatus, setInstanceStatus] = useState(loaded.instanceStatus);

	const currentInstanceStatusColor = useMemo(() => (instance.deletedAt ? 'before:bg-gray-500' : instanceStatusColor[instanceStatus as InstanceStatus] || 'before:bg-gray-500'), [instance, instanceStatus]);
	const currentInstanceStatusText = useMemo(() => (instance.deletedAt ? '未创建' : instanceStatusText[instanceStatus as InstanceStatus] || '未知状态'), [instanceStatus]);

	const streamManager = useContext(StreamManagerContext);

	useEffect(() => {
		streamManager.setHook('onInstance', async event => {
			console.log('onInstance', event);
			switch (event.type) {
				case 'active_status_update': {
					setInstanceStatus(event.data);
					break;
				}

				case 'active_ip_update': {
					setInstance({ ...instance, ip: event.data });
					break;
				}

				case 'created': {
					setInstance(event.data);
					break;
				}

				case 'notify': {
					switch (event.data) {
						case 'instance_deleted': {
							const fetched = await fetchActiveOrLatestInstanceAndStatus();
							setInstance(fetched.instance);
							break;
						}
					}
				}
			}
		});

		return () => streamManager.rmHook('onInstance');
	}, [instance]);

	const [bestInstanceTypeLoading, setBestInstanceTypeLoading] = useState(false);
	const [bestInstanceType, setBestInstanceType] = useState<InstanceTypeAndTradePrice>();
	const [bestInstanceTypeError, setBestInstanceTypeError] = useState<string | null>(null);

	const [createInstanceDialog, setCreateInstanceDialog] = useState(false);
	const [createInstanceLoading, setCreateInstanceLoading] = useState(false);

	const refreshBestInstanceType = useCallback(async () => {
		setBestInstanceTypeLoading(true);
		req<{ zoneId: string; typesAndTradePrice: InstanceTypeAndTradePrice[] }[]>('/instance-types-and-charge?minimumMemorySize=8&maximumMemorySize=16&minimumCpuCoreCount=1&maximumCpuCoreCount=8&cpuArchitecture=X86&zoneId=cn-shenzhen-c&sortBy=tradePrice&sortOrder=asc', 'GET').then(({ data, error }) => {
			setBestInstanceTypeLoading(false);

			if (error !== null) {
				setBestInstanceTypeError(error);
				return;
			}

			const best = data[0].typesAndTradePrice.filter(x => x.memorySize > 8 && !/^ecs\.(e|s6|xn4|n4|mn4|e4|t|d).*$/.test(x.instanceType) && x.tradePrice < 0.6)[0];

			if (best === undefined) {
				setBestInstanceTypeError('没有符合要求的实例');
				return;
			}

			setBestInstanceType(best);
		});
	}, []);

	useEffect(() => {
		if (createInstanceDialog && bestInstanceType === undefined) {
			refreshBestInstanceType();
		}
	}, [createInstanceDialog]);

	return (
		userPayload.valid && (
			<>
				<Dialog open={createInstanceDialog} onOpenChange={setCreateInstanceDialog}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>创建实例</DialogTitle>
							<DialogDescription aria-describedby={undefined} className="hidden"></DialogDescription>
						</DialogHeader>
						<div className="flex flex-col gap-3">
							<p>确认要开始创建吗？</p>
							<p>创建实例后，系统将尝试自动分配 IP 地址并开启实例。</p>
							<Alert variant={bestInstanceTypeError ? 'destructive' : 'default'}>
								{bestInstanceTypeError ? (
									<>
										<AlertTitle>无法找到实例</AlertTitle>
										<AlertDescription>错误：{bestInstanceTypeError}</AlertDescription>
									</>
								) : (
									<>
										<AlertTitle>{bestInstanceTypeLoading ? '寻找最优实例中...' : bestInstanceType?.instanceType}</AlertTitle>
										<AlertDescription>
											{bestInstanceTypeLoading ? (
												'可能需要至多 1 分钟，请耐心等待'
											) : (
												<div className="flex items-center gap-2">
													cn-shenzhen-c <Separator orientation="vertical" /> {bestInstanceType?.cpuCoreCount} vCPU <Separator orientation="vertical" /> {bestInstanceType?.memorySize} GiB <Separator orientation="vertical" /> ¥{bestInstanceType?.tradePrice.toFixed(2)}/h
												</div>
											)}
										</AlertDescription>
										<AlertAction>
											<Button disabled={bestInstanceTypeLoading} onClick={refreshBestInstanceType} variant={'outline'} size={'icon-xs'}>
												<RefreshCwIcon size={5} />
											</Button>
										</AlertAction>
									</>
								)}
							</Alert>
						</div>
						<DialogFooter>
							<Button
								onClick={async () => {
									setCreateInstanceLoading(true);
									const { error } = await req('/instance', 'POST', {
										zoneId: 'cn-shenzhen-c',
										instanceType: bestInstanceType?.instanceType,
										vswitchId: 'vsw-wz995l4az1ab9awbe6wwz'
									});
									setCreateInstanceLoading(false);

									if (error !== null) {
										toast.error('创建失败：' + error);
										return;
									}

									toast.success('创建成功');
									setCreateInstanceDialog(false);
								}}
								disabled={createInstanceLoading || bestInstanceTypeLoading || bestInstanceTypeError !== null}
							>
								{bestInstanceTypeLoading ? '请等待' : <>确认创建 {createInstanceLoading && <Spinner />}</>}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
				<div className="max-w-175 mx-auto my-16">
					<div className="flex flex-col gap-5">
						<h1 className="text-3xl">Hello, {userPayload.username}</h1>
						{instance.deletedAt !== null && (
							<Item variant={'outline'}>
								<ItemMedia>
									<InfoIcon size={16} />
								</ItemMedia>
								<ItemContent>
									<ItemTitle>无实例</ItemTitle>
									<ItemDescription>当前没有正在运行的实例。要快速开始游戏，请单击「创建实例」。</ItemDescription>
								</ItemContent>
								<ItemActions>
									<Button onClick={() => setCreateInstanceDialog(true)}>创建实例</Button>
								</ItemActions>
							</Item>
						)}
						{instance.deletedAt === null && (
							<section>
								<Card className="relative">
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
												'地域/可用区': instance.regionId,
												创建时间: { content: times.formatDateAgo(instance.createdAt), detail: instance.createdAt }
											}}
										/>
									</CardContent>
								</Card>
							</section>
						)}
						<section></section>
					</div>
				</div>
			</>
		)
	);
}
