import DataListKv from '@/components/data-list-kv';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import WrappedTable from '@/components/wrapped-table';
import { req } from '@/lib/req';
import times from '@/lib/times';
import type { BssOverview } from '@/types/BssOverview';
import type { JoinedTask, TaskOverview } from '@/types/Task';
import type { Transaction } from '@/types/Transaction';
import { InfoIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

async function fetchTaskOverview() {
	const { data, error } = await req<TaskOverview>('/task/overview', 'get');

	return error === null ? data : undefined;
}

async function fetchTasks(page: number, pageSize: number) {
	const { data, error } = await req<JoinedTask[]>(`/task/s?page=${page}&pageSize=${pageSize}`, 'get');

	return error === null ? data : [];
}

function useTableNavigation() {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	return { page, setPage, pageSize, setPageSize };
}

async function fetchTransactions(page: number, pageSize: number) {
	const { data, error } = await req<{ transactions: Transaction[]; total: number }>(`/bss/transactions?page=${page}&pageSize=${pageSize}`, 'get');

	return error === null ? data : { transactions: [], total: 0 };
}

async function fetchBssOverview() {
	const { data, error } = await req<BssOverview>(`/bss/overview`, 'get');

	return error === null ? data : undefined;
}

const productTypeBadgeColors = {
	ECS: 'bg-blue-100 text-blue-600',
	OSS: 'bg-yellow-100 text-yellow-600',
	YUNDISK: 'bg-gray-100 text-gray-600',
	CDT_INTERNET_PUBLIC_CN: 'bg-orange-100 text-orange-600'
};

const productTypeNames = {
	ECS: '云服务器',
	OSS: '对象存储',
	YUNDISK: '云盘',
	CDT_INTERNET_PUBLIC_CN: '公网流量'
};

export default function IndexDataSection() {
	const [taskLoading, setTaskLoading] = useState(false);
	const [taskOverview, setTaskOverview] = useState<TaskOverview>();
	const [tasks, setTasks] = useState<JoinedTask[]>([]);
	const tasksNav = useTableNavigation();

	const taskTotal = useMemo(() => (taskOverview ? taskOverview.successCount + taskOverview.unsuccessCount : 0), [taskOverview]);
	const taskPageCount = useMemo(() => Math.ceil(taskTotal / tasksNav.pageSize), [taskTotal, tasksNav.pageSize]);

	const [bssLoading, setBssLoading] = useState(false);
	const [bssOverview, setBssOverview] = useState<BssOverview>();
	const [transactions, setTransactions] = useState<Transaction[]>();
	const bssNav = useTableNavigation();

	const [transactionTotal, setTransactionTotal] = useState(0);
	const transactionPageCount = useMemo(() => Math.ceil(transactionTotal / bssNav.pageSize), [transactionTotal, bssNav.pageSize]);

	const loadTask = useCallback(async () => {
		setTaskLoading(true);
		const overview = await fetchTaskOverview();
		const result = await fetchTasks(tasksNav.page, tasksNav.pageSize);
		setTaskLoading(false);

		if (overview) setTaskOverview(overview);
		setTasks(result);
	}, []);

	const loadBss = useCallback(async () => {
		setBssLoading(true);
		const overview = await fetchBssOverview();
		const result = await fetchTransactions(bssNav.page, bssNav.pageSize);
		setBssLoading(false);

		if (overview) setBssOverview(overview);
		setTransactions(result.transactions);
		setTransactionTotal(result.total);
	}, []);

	useEffect(() => {
		fetchTasks(tasksNav.page, tasksNav.pageSize).then(tasks => {
			setTasks(tasks);
		});
	}, [tasksNav.page, tasksNav.pageSize]);

	useEffect(() => {
		fetchTransactions(bssNav.page, bssNav.pageSize).then(result => {
			setTransactions(result.transactions);
			setTransactionTotal(result.total);
		});
	}, [bssNav.page, bssNav.pageSize]);

	useEffect(() => {
		loadTask();
		loadBss();
	}, []);

	return (
		<>
			<div className="flex flex-col gap-5">
				<section>
					<Card>
						<CardContent>
							{bssLoading ? (
								<Spinner />
							) : (
								<div className="flex flex-col gap-3">
									{bssOverview && (
										<div className="flex items-center gap-10">
											<div className="flex flex-col gap-2">
												<span>现金余额</span>
												<div className="text-2xl">¥{bssOverview.balance.toFixed(2)}</div>
											</div>
											<div className="flex flex-col gap-2">
												<span>总消费</span>
												<div className="text-2xl">
													¥{bssOverview.totalExpense.toFixed(2)}
													<Popover>
														<PopoverTrigger asChild>
															<Button variant={'ghost'} size={'icon-xs'}>
																<InfoIcon />
															</Button>
														</PopoverTrigger>
														<PopoverContent className="w-max">
															<DataListKv
																data={{
																	云服务器: `¥${bssOverview.ecsExpense.toFixed(2)}`,
																	公网流量: `¥${bssOverview.cdtExpense.toFixed(2)}`,
																	对象存储: `¥${bssOverview.ossExpense.toFixed(2)}`,
																	云盘: `¥${bssOverview.yunDiskExpense.toFixed(2)}`
																}}
															/>
														</PopoverContent>
													</Popover>
												</div>
											</div>
											<div className="flex flex-col gap-2">
												<span>最近充值</span>
												<div className="text-2xl">
													¥{bssOverview.latestPayment.toFixed(2)} <small className="text-neutral-500">（{times.formatDateAgo(bssOverview.latestPaymentTime)}）</small>
												</div>
											</div>
										</div>
									)}
									{transactions && (
										<WrappedTable
											data={transactions}
											getKey={t => (t.remarks || '') + t.time + t.amount.toString()}
											keys={['time', 'billingCycle', 'amount', 'balance', 'remarks']}
											header={{
												time: '时间',
												billingCycle: '账期',
												amount: '金额',
												balance: '余额',
												remarks: '服务类型'
											}}
											render={{
												time: t => times.formatDatetime(t.time),
												amount: t => (
													<span className={t.flow === 'Income' ? 'text-green-600' : 'text-red-600'}>
														{t.flow === 'Income' ? '+' : '-'}¥{t.amount}
													</span>
												),
												billingCycle: t => (t.billingCycle === '' ? '-' : t.billingCycle),
												balance: t => `¥${t.balance}`,
												remarks: t => {
													return t.remarks ? (
														<Badge
															className={(() => {
																return productTypeBadgeColors[t.remarks];
															})()}
														>
															{(() => {
																return productTypeNames[t.remarks];
															})()}
														</Badge>
													) : (
														'-'
													);
												}
											}}
											pageSize={bssNav.pageSize}
											setPageSize={bssNav.setPageSize}
											page={bssNav.page}
											setPage={bssNav.setPage}
											pageCount={transactionPageCount}
										/>
									)}
								</div>
							)}
						</CardContent>
					</Card>
				</section>
				<section>
					<Card>
						<CardContent>
							{taskLoading ? (
								<Spinner />
							) : (
								<div className="flex flex-col gap-3">
									{taskOverview && (
										<div className="flex items-center gap-10">
											<div className="flex flex-col gap-2">
												<span>任务总数</span>
												<div className="text-2xl">{taskTotal}</div>
											</div>
											<div className="flex flex-col gap-2">
												<span>成功总数</span>
												<div className="text-2xl">{taskOverview.successCount}</div>
											</div>
											<div className="flex flex-col gap-2">
												<span>失败总数</span>
												<div className="text-2xl">{taskOverview.unsuccessCount}</div>
											</div>
											<div className="flex flex-col gap-2">
												<span>最近执行</span>
												<div className="text-2xl">
													{times.formatDateAgo(taskOverview.latest.createdAt)}
													<small className="text-neutral-500">（由 {taskOverview.latest.username} 触发）</small>
												</div>
											</div>
										</div>
									)}
									<WrappedTable
										data={tasks}
										getKey={t => t.id}
										keys={['id', 'type', 'status', 'createdAt', 'updatedAt', 'username']}
										header={{
											id: 'UUID',
											type: '任务类型',
											status: '状态',
											createdAt: '创建时间',
											updatedAt: '结束时间',
											username: '发起者'
										}}
										render={{
											id: t => (
												<Tooltip>
													<TooltipTrigger>{t.id.slice(0, 6)}</TooltipTrigger>
													<TooltipContent>{t.id}</TooltipContent>
												</Tooltip>
											),
											type: t => <>{t.type === 'instance_deployment' && '实例部署'}</>,
											status: t => (
												<>
													{t.status === 'success' && <Badge className="bg-green-200 text-green-700">成功</Badge>}
													{t.status === 'failed' && <Badge variant={'destructive'}>失败</Badge>}
												</>
											),
											createdAt: t => times.formatDatetime(t.createdAt),
											updatedAt: t => (t.updatedAt ? times.formatDatetime(t.updatedAt) : '-')
										}}
										pageSize={tasksNav.pageSize}
										setPageSize={tasksNav.setPageSize}
										page={tasksNav.page}
										setPage={tasksNav.setPage}
										pageCount={taskPageCount}
									/>
								</div>
							)}
						</CardContent>
					</Card>
				</section>
			</div>
		</>
	);
}
