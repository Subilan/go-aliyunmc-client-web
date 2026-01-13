import { req } from '@/lib/req';


export async function fetchActiveDeploymentTaskStatus() {
	const { data, error } = await req('/task?type=instance_deployment', 'get');

	return error === null ? data.status : undefined;
}
