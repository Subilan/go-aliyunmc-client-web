import { req } from '@/lib/req';
import type { Instance } from '@/types/Instance';

export default async function fetchActiveInstance() {
	const { data, error } = await req<Instance>('/instance', 'get');

	return error === null ? data : undefined;
}
