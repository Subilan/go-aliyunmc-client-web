import { req } from '@/lib/req';
import type { CommandExecOverview } from '@/types/CommandExec';

export async function fetchCommandExecOverview() {
	const { data, error } = await req<CommandExecOverview>(`/server/exec-overview`, 'get');

	return error === null ? data : undefined;
}
