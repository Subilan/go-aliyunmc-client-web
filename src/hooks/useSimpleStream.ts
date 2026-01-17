import useBgRefresh from '@/hooks/useBgRefresher';
import { fetchActiveInstanceStatus } from '@/lib/requests/fetchActiveInstanceStatus';
import { fetchActiveOrLatestInstance } from '@/lib/requests/fetchActiveOrLatestInstance';
import { fetchServerInfo } from '@/lib/requests/fetchServerInfo';
import { SimpleStreamManager } from '@/stream';
import type { InstanceStatus, Instance } from '@/types/Instance';
import { useEffect, useState } from 'react';

export type UseSimpleStreamReturn = ReturnType<typeof useSimpleStream>;

export default function useSimpleStream(
	defaultValues?: Partial<{
		onlinePlayerCount: number;
		onlinePlayers: string[];
		isSeverRunning: boolean;
		instanceStatus: InstanceStatus;
		instance: Instance;
	}>
) {
	const [onlinePlayerCount, setOnlinePlayerCount] = useState(
		defaultValues?.onlinePlayerCount || 0
	);
	const [onlinePlayers, setOnlinePlayers] = useState<string[]>(
		defaultValues?.onlinePlayers || []
	);
	const [isServerRunning, setIsServerRunning] = useState(defaultValues?.isSeverRunning || false);
	const [instanceStatus, setInstanceStatus] = useState<InstanceStatus>(
		defaultValues?.instanceStatus || ''
	);
	const [instance, setInstance] = useState<Instance | undefined>(defaultValues?.instance);

	useBgRefresh(async () => {
		const result = {
			instance: await fetchActiveOrLatestInstance(),
			instanceStatus: await fetchActiveInstanceStatus(),
			server: await fetchServerInfo()
		};

		setOnlinePlayers(result.server?.onlinePlayers || []);
		setOnlinePlayerCount(result.server?.onlinePlayers ? result.server.onlinePlayers.length : 0);
		setInstanceStatus(result.instanceStatus || '');
		setInstance(result.instance);
		setIsServerRunning(result.server?.running || false);
	});

	useEffect(() => {
		const streamManager = new SimpleStreamManager();
		streamManager.listen(
			ie => {
				switch (ie.type) {
					case 'online_count_update': {
						setOnlinePlayerCount(ie.data);
						break;
					}

					case 'online_players_update': {
						const array = JSON.parse(ie.data);

						if (!Array.isArray(array)) {
							console.warn('invalid online player update data');
							break;
						}

						setOnlinePlayers(array);
						break;
					}

					case 'notify': {
						if (ie.data === 'running') setIsServerRunning(true);
						if (ie.data === 'closed') setIsServerRunning(false);
						break;
					}
				}
			},
			se => {
				switch (se.type) {
					case 'active_ip_update': {
						setInstance(inst => (inst ? { ...inst, ip: se.data } : undefined));
						break;
					}

					case 'active_status_update': {
						setInstanceStatus(se.data);
						break;
					}

					case 'created': {
						setInstance(se.data);
						break;
					}

					case 'notify': {
						if (se.data === 'instance_deleted') {
							setInstance(undefined);
						}
						break;
					}
				}
			}
		);

		return () => {
			streamManager.abort();
		};
	}, []);

	return {
		onlinePlayerCount,
		onlinePlayers,
		isServerRunning,
		instanceStatus,
		instance
	};
}
