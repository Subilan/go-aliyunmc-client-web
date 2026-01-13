import { req } from '@/lib/req';
import type { InstanceStatus } from '@/types/Instance';


export async function fetchActiveInstanceStatus() {
	const { data, error } = await req<InstanceStatus>('/instance/status', 'get');

	return error === null ? data : undefined;
}
