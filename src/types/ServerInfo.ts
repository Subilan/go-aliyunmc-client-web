export type ServerInfo = {
	running: boolean;
	data?: {
		version: {
			name: {
				raw: string;
				clean: string;
				html: string;
			};
			protocol: number;
		};
		players: {
			max: number;
			online: number;
			sample: Array<{
				id: string;
				name: {
					raw: string;
					clean: string;
					html: string;
				};
			}>;
		};
		motd: {
			raw: string;
			clean: string;
			html: string;
		};
		favicon: any;
		srv_record: any;
		mods: any;
	};
	onlinePlayers: string[];
};
