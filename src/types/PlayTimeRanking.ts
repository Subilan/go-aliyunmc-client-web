export interface PlayTimeRankingItem {
	nickname: string;
	playTime: number;
	firstJoin: number;
	lastSeen: number;
}

export interface PlayTimeRankingResponse {
	items: PlayTimeRankingItem[];
	total: number;
}
