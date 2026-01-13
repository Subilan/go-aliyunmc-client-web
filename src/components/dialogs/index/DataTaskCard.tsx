import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import WrappedTable from '@/components/wrapped-table';
import { fetchTaskOverview } from '@/lib/requests/fetchTaskOverview';
import { fetchTasks } from '@/lib/requests/fetchTasks';
import times from '@/lib/times';
import { useTableNavigation } from '@/components/wrapped-table';
import type { JoinedTask, TaskOverview } from '@/types/Task';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function DataTaskCard() {
	const [taskLoading, setTaskLoading] = useState(false);
	const [taskOverview, setTaskOverview] = useState<TaskOverview>();
	const [tasks, setTasks] = useState<JoinedTask[]>([]);
	const tasksNav = useTableNavigation();

	const taskTotal = useMemo(() => (taskOverview ? taskOverview.successCount + taskOverview.unsuccessCount : 0), [taskOverview]);
	const taskPageCount = useMemo(() => Math.ceil(taskTotal / tasksNav.pageSize), [taskTotal, tasksNav.pageSize]);

	const loadTask = useCallback(async () => {
		setTaskLoading(true);
		const overview = await fetchTaskOverview();
		const result = await fetchTasks(tasksNav.page, tasksNav.pageSize);
		setTaskLoading(false);

		if (overview) setTaskOverview(overview);
		setTasks(result);
	}, []);

	useEffect(() => {
		fetchTasks(tasksNav.page, tasksNav.pageSize).then(tasks => {
			setTasks(tasks);
		});
	}, [tasksNav.page, tasksNav.pageSize]);

	useEffect(() => {
		loadTask();
	}, []);
    
	return (
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
	);
}
