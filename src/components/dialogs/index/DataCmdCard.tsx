import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import WrappedTable from "@/components/wrapped-table";
import { fetchCommandExecOverview } from "@/lib/requests/fetchCommandExecOverview";
import { fetchCommandExecs } from "@/lib/requests/fetchCommandExecs";
import times from "@/lib/times";
import { useTableNavigation } from "@/routes/index-sections/data";
import { CommandExecStatusColor, CommandExecStatusWord, CommandExecTypeWord, type CommandExecOverview, type JoinedCommandExec } from "@/types/CommandExec";
import { InfoIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function DataCmdCard() {
	const [cmds, setCommandExecs] = useState<JoinedCommandExec[]>([]);
	const [cmdTotal, setCommandExecsTotal] = useState(0);
	const [cmdOverview, setCommandExecOverview] = useState<CommandExecOverview>();
	const [cmdLoading, setCommandExecsLoading] = useState(false);
	const cmdNav = useTableNavigation();
	const cmdPageCount = useMemo(() => Math.ceil(cmdTotal / cmdNav.pageSize), [cmdNav.pageSize, cmdTotal]);

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
		fetchCommandExecs(cmdNav.page, cmdNav.pageSize).then(result => {
			setCommandExecs(result.data);
			setCommandExecsTotal(result.total);
		});
	}, [cmdNav.page, cmdNav.pageSize]);

	useEffect(() => {
		loadCommandExecs();
	}, []);

	return (
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
	);
}
