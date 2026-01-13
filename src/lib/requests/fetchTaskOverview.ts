import { req } from '@/lib/req';
import type { TaskOverview } from '@/types/Task';

export async function fetchTaskOverview() {
	const { data, error } = await req<TaskOverview>('/task/overview', 'get');

	return error === null ? data : undefined;
}
