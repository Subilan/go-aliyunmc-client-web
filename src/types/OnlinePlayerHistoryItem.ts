export interface OnlinePlayerHistoryItem {
    playerCount: number; // 该时刻玩家总数
    players: string[]; // 该时刻在线玩家名称数组
    createdAt: string; // 记录的时刻，符合RFC3339
}