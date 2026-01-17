import { fetchActiveOrLatestInstance } from '../lib/requests/fetchActiveOrLatestInstance';
import { fetchServerInfo } from '../lib/requests/fetchServerInfo';
import type { Instance, InstanceStatus } from '@/types/Instance';
import type { ServerInfo } from '@/types/ServerInfo';
import type { TaskStatus } from '@/types/Task';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { StreamManager } from '@/stream';
import { useLocalStorage } from '@uidotdev/usehooks';
import { LS_KEY_USER_LOGIN_TOKEN } from '@/consts';
import useBgRefresher from '@/hooks/useBgRefresher';
import { fetchActiveInstanceStatus } from '@/lib/requests/fetchActiveInstanceStatus';
import { fetchActiveDeploymentTaskStatus } from '@/lib/requests/fetchActiveDeploymentTaskStatus';

export type UseStreamReturn = ReturnType<typeof useStream>;

export function useStream(
	defaults: Partial<{
		instance: Instance;
		instanceStatus: InstanceStatus;
		activeDeploymentTaskStatus: TaskStatus;
		serverInfo: ServerInfo;
	}>
) {
	const [instance, setInstance] = useState<Instance | undefined>(defaults.instance);
	const [instanceStatus, setInstanceStatus] = useState<InstanceStatus | undefined>(
		defaults.instanceStatus
	);
	const [activeDeploymentTaskStatus, setActiveDeploymentTaskStatus] = useState<
		TaskStatus | undefined
	>(defaults.activeDeploymentTaskStatus);
	const [serverInfo, setServerInfo] = useState<ServerInfo | undefined>(defaults.serverInfo);
	const isServerRunning = useMemo(() => serverInfo?.running === true, [serverInfo]);
	const [serverOnlineCount, setServerOnlineCount] = useState(
		defaults.serverInfo?.running ? defaults.serverInfo?.data?.players.online || 0 : 0
	);
	const [serverOnlinePlayers, setServerOnlinePlayers] = useState<string[]>(
		defaults.serverInfo?.running ? defaults.serverInfo.onlinePlayers || [] : []
	);
	const deployedInstanceRunning = useMemo(
		() => instanceStatus === 'Running' && instance?.deletedAt === null && instance.deployed,
		[instance, instanceStatus]
	);
	const [deployInstanceOutput, setDeployInstanceOutput] = useState('');
	const [deployInstanceLatestOutput, setDeployInstanceLatestOutput] = useState('');
	const [userLoginToken] = useLocalStorage<string>(LS_KEY_USER_LOGIN_TOKEN, '');
	const [streamManager] = useState(new StreamManager());

	useBgRefresher(async () => {
		const result = {
			instance: await fetchActiveOrLatestInstance(),
			instanceStatus: await fetchActiveInstanceStatus(),
			activeDeploymentTaskStatus: await fetchActiveDeploymentTaskStatus(),
			serverInfo: await fetchServerInfo()
		};

		setInstance(result.instance);
		setInstanceStatus(result.instanceStatus);
		setActiveDeploymentTaskStatus(result.activeDeploymentTaskStatus);
		setServerInfo(result.serverInfo);
	});

	useEffect(() => {
		console.log('initializing stream');
		streamManager.listen(userLoginToken);
		streamManager.setHook('onInstance', async event => {
			// console.log('onInstance', event);
			switch (event.type) {
				case 'active_status_update': {
					setInstanceStatus(event.data);
					break;
				}

				case 'active_ip_update': {
					setInstance(inst => {
						if (!inst) return inst;
						return {
							...inst,
							ip: event.data
						};
					});
					break;
				}

				case 'deployment_task_status_update': {
					setActiveDeploymentTaskStatus(event.data);
					if (event.data !== 'running') {
						streamManager.clearLastEventId();
					}
					if (event.data === 'success') {
						toast.success('实例部署成功');
						setInstance(inst => {
							if (!inst) return inst;
							return {
								...inst,
								deployed: true
							};
						});
					}
					break;
				}

				case 'created': {
					setInstance(event.data);
					break;
				}

				case 'notify': {
					switch (event.data) {
						case 'instance_deleted': {
							const fetched = await fetchActiveOrLatestInstance();
							setInstance(fetched);
							streamManager.clearLastEventId();
							break;
						}
					}
					break;
				}

				case 'create_and_deploy_failed': {
					toast.error('一键创建失败：' + event.data);
					break;
				}

				case 'create_and_deploy_step': {
					toast.info('状态更新：' + event.data);
					break;
				}
			}
		});

		streamManager.setHook('onDeployment', event => {
			setDeployInstanceOutput(state => state + event);
			setDeployInstanceLatestOutput(event);
		});

		streamManager.setHook('onServer', event => {
			console.log('on server', event);
			switch (event.type) {
				case 'notify': {
					if (event.data === 'running') {
						toast.success('服务器已开启');
						setServerInfo(info => ({ ...info!, running: true }));
						fetchServerInfo().then(info => setServerInfo(info));
					}

					if (event.data === 'closed') {
						toast.info('服务器已关闭');
						setServerInfo(info => ({ ...info!, running: false }));
						setServerOnlineCount(0);
						setServerOnlinePlayers([]);
					}
					break;
				}

				case 'online_count_update': {
					setServerOnlineCount(event.data);
					break;
				}

				case 'online_players_update': {
					const array = JSON.parse(event.data);

					if (!Array.isArray(array)) {
						console.warn('invalid online player update data');
						break;
					}

					setServerOnlinePlayers(array);

					break;
				}
			}
		});

		return () => {
			console.log('aborting stream');
			streamManager.abort();
		};
	}, []);

	return {
		streamManager,
		instance,
		instanceStatus,
		activeDeploymentTaskStatus,
		setActiveDeploymentTaskStatus,
		serverInfo,
		isServerRunning,
		serverOnlineCount,
		serverOnlinePlayers,
		deployedInstanceRunning,
		deployInstanceOutput,
		deployInstanceLatestOutput
	};
}
