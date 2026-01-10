import { LS_KEY_USER_LOGIN_TOKEN } from '@/consts';

export async function isAuthenticated() {
	const { error } = await req('/auth/ping', 'GET');

	return error === null;
}

export async function req<T = any>(path: string, method: RequestInit['method'], body?: Record<string, any>): Promise<{ error: string; data: null; } | { error: null; data: T; }> {
	const token = localStorage.getItem(LS_KEY_USER_LOGIN_TOKEN)?.slice(1, -1); // 移除添加的双引号
	const result = await fetch('http://127.0.0.1:33791' + path, {
		method,
		body: body ? JSON.stringify(body) : undefined,
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': body ? 'application/json' : ''
		}
	});

	const json = await result.json();

	if (result.status > 201) {
		if (json?.details) {
			return {
				error: json.details,
				data: null
			};
		}

		return {
			error: result.statusText,
			data: null
		};
	} else {
		return {
			data: json.data,
			error: null
		};
	}
}
