import { req } from '@/lib/req';
import type { Instance } from '@/types/Instance';


export async function fetchActiveOrLatestInstance() {
	const { data, error } = await req<Instance>('/instance/active-or-latest', 'GET');

	return error === null ? data : undefined;
}
