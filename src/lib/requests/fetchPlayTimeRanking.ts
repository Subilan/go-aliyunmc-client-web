import { req } from '@/lib/req';
import type { PlayTimeRankingResponse } from '@/types/PlayTimeRanking';

export async function fetchPlayTimeRanking(
	page: number,
	pageSize: number,
	sortBy: string,
	sortOrder: string
) {
	const { data, error } = await req<PlayTimeRankingResponse>(
		`/server/play-time-ranking?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
		'get'
	);

	return error === null ? data : { items: [], total: 0 };
}
