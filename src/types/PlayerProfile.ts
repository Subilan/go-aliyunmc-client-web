export interface PlayerProfile {
	uuid: string;
	gameName: string;
    essentials: PlayerProfileEssentials;
    stats: PlayerProfileStats;
    playTime: PlayerProfilePlaytime;
}

export interface PlayerProfileEssentials {
	timestamps: {
		jail: number;
		lastheal: number;
		lastteleport: number;
		login: number;
		logout: number;
		mute: number;
		onlinejail: number;
	};
	logoutLocation: EssentialsLocation;
	loginLocation: EssentialsLocation;
}

export interface EssentialsLocation {
	world: string;
	worldName: string;
	x: number;
	y: number;
	z: number;
	yaw: number;
	pitch: number;
}

export const PlayerProfileStatsKeys = [
	'minecraft:broken',
	'minecraft:crafted',
	'minecraft:custom',
	'minecraft:dropped',
	'minecraft:killed',
	'minecraft:killed_by',
	'minecraft:mined',
	'minecraft:picked_up',
	'minecraft:used'
] as const;

export type PlayerProfileStatKey = (typeof PlayerProfileStatsKeys)[number];

export type PlayerProfileStats = Partial<Record<PlayerProfileStatKey, {[key: string]: number}>>;

export interface PlayerProfilePlaytime {
	uuid: string;
	playTime: number;
	lastSeen: number;
	firstJoin: number;
}
