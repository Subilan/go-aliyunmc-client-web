import { req } from '@/lib/req';
import type { BssOverview } from '@/types/BssOverview';

export async function fetchBssOverview() {
	const { data, error } = await req<BssOverview>(`/bss/overview`, 'get');

	return error === null ? data : undefined;
}
