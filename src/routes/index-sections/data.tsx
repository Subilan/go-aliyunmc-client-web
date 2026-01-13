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
import { type BssOverview } from '@/types/BssOverview';
import { ProductTypeWord } from "@/types/Transaction";
import { ProductTypeColor } from "@/types/Transaction";
import { type CommandExecOverview, CommandExecStatusWord, CommandExecStatusColor, CommandExecTypeWord, type JoinedCommandExec } from '@/types/CommandExec';
import type { JoinedTask, TaskOverview } from '@/types/Task';
import type { Transaction } from '@/types/Transaction';
import type { WithTotal } from '@/types/WithTotal';
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
	const { data, error } = await req<WithTotal<Transaction>>(`/bss/transactions?page=${page}&pageSize=${pageSize}`, 'get');

	return error === null ? data : { data: [], total: 0 };
}

async function fetchBssOverview() {
	const { data, error } = await req<BssOverview>(`/bss/overview`, 'get');

	return error === null ? data : undefined;
}

async function fetchCommandExecs(page: number, pageSize: number) {
	const { data, error } = await req<WithTotal<JoinedCommandExec>>(`/server/exec/s?page=${page}&pageSize=${pageSize}`, 'get');

	return error === null ? data : { data: [], total: 0 };
}

async function fetchCommandExecOverview() {
	const { data, error } = await req<CommandExecOverview>(`/server/exec-overview`, 'get');

	return error === null ? data : undefined;
}

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

	const [cmds, setCommandExecs] = useState<JoinedCommandExec[]>([]);
	const [cmdTotal, setCommandExecsTotal] = useState(0);
	const [cmdOverview, setCommandExecOverview] = useState<CommandExecOverview>();
	const [cmdLoading, setCommandExecsLoading] = useState(false);
	const cmdNav = useTableNavigation();
	const cmdPageCount = useMemo(() => Math.ceil(cmdTotal / cmdNav.pageSize), [cmdNav.pageSize, cmdTotal]);

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
		setTransactions(result.data);
		setTransactionTotal(result.total);
	}, []);

	const loadCommandExecs = useCallback(async () => {
		setCommandExecsLoading(true);
		const commandExecs = await fetchCommandExecs(cmdNav.page, cmdNav.pageSize);
		const commandExecOverview = await fetchCommandExecOverview();
		setCommandExecsLoading(false);

		if (commandExecOverview) setCommandExecOverview(commandExecOverview);
		setCommandExecs(commandExecs.data);
		setCommandExecsTotal(commandExecs.total);
	}, []);

	useEffect(() => {
		fetchTasks(tasksNav.page, tasksNav.pageSize).then(tasks => {
			setTasks(tasks);
		});
	}, [tasksNav.page, tasksNav.pageSize]);

	useEffect(() => {
		fetchTransactions(bssNav.page, bssNav.pageSize).then(result => {
			setTransactions(result.data);
			setTransactionTotal(result.total);
		});
	}, [bssNav.page, bssNav.pageSize]);

	useEffect(() => {
		fetchCommandExecs(cmdNav.page, cmdNav.pageSize).then(result => {
			setCommandExecs(result.data);
			setCommandExecsTotal(result.total);
		});
	}, [cmdNav.page, cmdNav.pageSize]);

	useEffect(() => {
		loadTask();
		loadBss();
		loadCommandExecs();
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
												<span>平均日消费</span>
												<div className="text-2xl">
													¥{bssOverview.expenseAverage.toFixed(2)}
													<Popover>
														<PopoverTrigger asChild>
															<Button variant={'ghost'} size={'icon-xs'}>
																<InfoIcon />
															</Button>
														</PopoverTrigger>
														<PopoverContent className="w-max">
															<p>从数据中统计的 {bssOverview.expenseDays} 个账单日平均结果</p>
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
																return ProductTypeColor[t.remarks];
															})()}
														>
															{(() => {
																return ProductTypeWord[t.remarks];
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
											{taskOverview.latest && (
												<div className="flex flex-col gap-2">
													<span>最近执行</span>
													<div className="text-2xl">
														{times.formatDateAgo(taskOverview.latest.createdAt)}
														<small className="text-neutral-500">（由 {taskOverview.latest.username} 触发）</small>
													</div>
												</div>
											)}
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
											updatedAt: '耗时',
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
											updatedAt: t => (t.updatedAt ? Math.abs(times.formatDuration(t.createdAt, t.updatedAt).asSeconds()) + 's' : '-')
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
				<section>
					<Card>
						<CardContent>
							{cmdLoading ? (
								<Spinner />
							) : (
								<div className="flex flex-col gap-3">
									{cmdOverview && (
										<div className="flex items-center gap-10">
											<div className="flex flex-col gap-2">
												<span>成功执行</span>
												<div className="text-2xl">{cmdOverview.successCount}</div>
											</div>
											<div className="flex flex-col gap-2">
												<span>失败执行</span>
												<div className="text-2xl">{cmdOverview.errorCount}</div>
											</div>
											{cmdOverview.latestCommandExec && (
												<div className="flex flex-col gap-2">
													<span>最近执行</span>
													<div className="text-2xl">
														{times.formatDateAgo(cmdOverview.latestCommandExec.createdAt)}
														<small className="text-neutral-500">{cmdOverview.latestCommandExec.auto ? '（自动执行）' : `（由 ${cmdOverview.latestCommandExec.username} 触发）`}</small>
													</div>
												</div>
											)}
										</div>
									)}
									<WrappedTable
										data={cmds}
										getKey={c => c.id}
										keys={['type', 'status', 'username', 'createdAt', 'updatedAt', 'comment']}
										header={{
											type: '指令',
											status: '状态',
											username: '执行者',
											createdAt: '开始时间',
											updatedAt: '耗时',
											comment: '备注'
										}}
										render={{
											type: c => CommandExecTypeWord[c.type],
											status: c => <Badge className={CommandExecStatusColor[c.status]}>{CommandExecStatusWord[c.status]}</Badge>,
											createdAt: c => times.formatDatetime(c.createdAt),
											updatedAt: c => Math.abs(times.formatDuration(c.createdAt, c.updatedAt).asSeconds()) + 's',
											comment: c =>
												c.comment && c.comment.length > 0 ? (
													<Popover>
														<PopoverTrigger asChild>
															<Button variant={'ghost'} size={'icon-xs'}>
																<InfoIcon />
															</Button>
														</PopoverTrigger>
														<PopoverContent>{c.comment}</PopoverContent>
													</Popover>
												) : (
													'-'
												),
											username: c => (c.auto ? '自动' : c.username)
										}}
										pageSize={cmdNav.pageSize}
										setPageSize={cmdNav.setPageSize}
										page={cmdNav.page}
										setPage={cmdNav.setPage}
										pageCount={cmdPageCount}
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
