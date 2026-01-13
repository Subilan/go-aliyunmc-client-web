import { req } from '@/lib/req';
import type { JoinedTask } from '@/types/Task';

export async function fetchTasks(page: number, pageSize: number) {
	const { data, error } = await req<JoinedTask[]>(`/task/s?page=${page}&pageSize=${pageSize}`, 'get');

	return error === null ? data : [];
}
