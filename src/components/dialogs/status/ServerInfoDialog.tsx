import DataListKv from '@/components/data-list-kv';
import NoInstance from '@/components/dialogs/status/NoInstance';
import type { DialogControl } from '@/components/dialogs/type';
import Wrapper from '@/components/dialogs/Wrapper';
import type { Instance } from '@/types/Instance';
import type { ServerInfo } from '@/types/ServerInfo';

export default function ServerInfoDialog({
	instance,
	server,
	...control
}: DialogControl & { instance: Instance | undefined; server: ServerInfo | undefined }) {
	return (
		<Wrapper {...control} title="服务器信息">
			{instance && instance.deletedAt === null && server ? (
				<DataListKv
					data={{
						状态: server.running ? '在线' : '离线',
						在线玩家: server && server.running ? server.onlinePlayers.length : 0,
						版本: server && server.running ? server.data.version.name.clean : '-'
					}}
				></DataListKv>
			) : (
				<NoInstance />
			)}
		</Wrapper>
	);
}
