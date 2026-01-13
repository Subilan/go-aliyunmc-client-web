import { req } from '@/lib/req';
import type { ServerInfo } from '@/types/ServerInfo';


export async function fetchServerInfo() {
	const { data, error } = await req<ServerInfo>('/server/info', 'get');

	return error === null ? data : undefined;
}
