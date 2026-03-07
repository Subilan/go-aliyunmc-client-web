import { req } from '@/lib/req';
import type { PlayTimeOverview } from '@/types/PlayTimeOverview';

export async function fetchPlayTimeOverview() {
	const { data, error } = await req<PlayTimeOverview>('/server/play-time-overview', 'get');

	return error === null ? data : null;
}
