import { req } from '@/lib/req';
import type { JoinedCommandExec } from '@/types/CommandExec';
import type { WithTotal } from '@/types/WithTotal';

export async function fetchCommandExecs(page: number, pageSize: number) {
	const { data, error } = await req<WithTotal<JoinedCommandExec>>(`/server/exec/s?page=${page}&pageSize=${pageSize}`, 'get');

	return error === null ? data : { data: [], total: 0 };
}
