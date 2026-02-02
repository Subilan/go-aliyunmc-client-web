import DataListKv from '@/components/data-list-kv';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import WrappedTable from '@/components/wrapped-table';
import { fetchBssOverview } from '@/lib/requests/fetchBssOverview';
import { fetchTransactions } from '@/lib/requests/fetchTransactions';
import times from '@/lib/times';
import { useTableNavigation } from '@/components/wrapped-table';
import type { BssOverview } from '@/types/BssOverview';
import { type Transaction, ProductTypeColor, ProductTypeWord } from '@/types/Transaction';
import { InfoIcon } from 'lucide-react';
import { useState, useMemo, useCallback, useEffect } from 'react';

export default function DataBssCard() {
	const [bssLoading, setBssLoading] = useState(false);
	const [bssOverview, setBssOverview] = useState<BssOverview>();
	const [transactions, setTransactions] = useState<Transaction[]>();
	const bssNav = useTableNavigation();
	const [transactionTotal, setTransactionTotal] = useState(0);
	const transactionPageCount = useMemo(() => Math.ceil(transactionTotal / bssNav.pageSize), [transactionTotal, bssNav.pageSize]);

	const loadBss = useCallback(async () => {
		setBssLoading(true);
		const overview = await fetchBssOverview();
		const result = await fetchTransactions(bssNav.page, bssNav.pageSize);
		setBssLoading(false);

		if (overview) setBssOverview(overview);
		setTransactions(result.data);
		setTransactionTotal(result.total);
	}, []);

	useEffect(() => {
		fetchTransactions(bssNav.page, bssNav.pageSize).then(result => {
			setTransactions(result.data);
			setTransactionTotal(result.total);
		});
	}, [bssNav.page, bssNav.pageSize]);

	useEffect(() => {
		loadBss();
	}, []);

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					服务器经济
				</CardTitle>
			</CardHeader>
			<CardContent>
				{bssLoading ? (
					<Spinner />
				) : (
					<div className="flex flex-col gap-3">
						{bssOverview && (
							<div className="grid grid-cols-2 justify-center lg:flex lg:justify-start items-center gap-3 lg:gap-10">
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
										¥{bssOverview.latestPayment.toFixed(2)} <small className="hidden lg:inline-block text-neutral-500">（{times.formatDateAgo(bssOverview.latestPaymentTime)}）</small>
									</div>
								</div>
							</div>
						)}
						{transactions && (
							<WrappedTable
								data={transactions}
								getKey={t => (t.remarks || '') + t.time + t.balance + t.amount}
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
	);
}
