import { LS_KEY_LAST_EVENT_ID } from '@/consts';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { toast } from 'sonner';
import z from 'zod';

const ReceivedEventRaw = z.object({
	type: z.literal([0, 1, 2, 3, 4]),
	is_error: z.boolean(),
	content: z.string()
});

const InstanceEvent = z.object({
	type: z.literal(['notify', 'active_status_update', 'active_ip_update', 'created', 'deployment_task_status_update', 'create_and_deploy_failed', 'create_and_deploy_step']),
	data: z.any()
});

const ServerEvent = z.object({
	type: z.literal(['notify', 'online_count_update', 'online_players_update']),
	data: z.any()
});

const ErrorEvent = z.object({
	details: z.string()
});

const SyncEvent = z.object({
	syncType: z.literal(['clear_last_event_id'])
});

export type ReceivedEventRawT = z.infer<typeof ReceivedEventRaw>;
export type InstanceEventT = z.infer<typeof InstanceEvent>;
export type ServerEventT = z.infer<typeof ServerEvent>;
export const EventTypeDeployment = 0;
export const EventTypeServer = 1;
export const EventTypeInstance = 2;
export const EventTypeError = 3;
export const EventTypeSync = 4;

export type StreamHookDictionary = {
	onInstance?: (event: InstanceEventT) => void;
	onDeployment?: (output: string) => void;
	onServer?: (event: ServerEventT) => void;
};

export class StreamManager {
	private hooks: StreamHookDictionary = {};
	private abortController: AbortController;
	private lastEventId: string = '';
	private deploymentBuffer: string[] = [];

	constructor() {
		this.abortController = new AbortController();
		this.lastEventId = localStorage.getItem(LS_KEY_LAST_EVENT_ID) || '';
	}

	clearDeploymentBuffer() {
		this.deploymentBuffer = [];
	}

	clearLastEventId() {
		this.lastEventId = '';
		localStorage.removeItem(LS_KEY_LAST_EVENT_ID);
	}

	setHook<T extends keyof StreamHookDictionary>(key: T, value: StreamHookDictionary[T], addendum: boolean = true) {
		if (key === 'onDeployment' && value && addendum) {
			for (const item of this.deploymentBuffer) {
				value(item as any);
			}
		}

		this.hooks[key] = value;
	}

	rmHook(key: keyof StreamHookDictionary) {
		this.hooks[key] = undefined;
	}

	abort() {
		this.abortController.abort();
	}

	listen(userToken: string) {
		if (userToken === '') {
			console.warn('userToken not provided, skip listening');
			return;
		}

		const hooks = this.hooks;
		const setLastEventId = (id: string) => {
			this.lastEventId = id;
			localStorage.setItem(LS_KEY_LAST_EVENT_ID, id);
		};
		const pushBuffer = (msg: string) => {
			this.deploymentBuffer.push(msg);
		};

		fetchEventSource('http://127.0.0.1:33791/stream', {
			headers: {
				Authorization: `Bearer ${userToken}`,
				'Last-Event-Id': this.lastEventId
			},
			signal: this.abortController.signal,
			async onopen() {
				console.log('stream opened');
			},
			onmessage(ev) {
				if (ev.data.trim().length === 0) return;

				const { success, data } = ReceivedEventRaw.safeParse(JSON.parse(ev.data));

				console.log('received raw', data);

				if (!success) {
					console.warn('cannot parse incoming stream data', ev.data);
					return;
				}

				switch (data.type) {
					case EventTypeDeployment: {
						setLastEventId(ev.id);
						pushBuffer(data.content);
						hooks.onDeployment?.(data.content);
						break;
					}
					case EventTypeServer: {
						const result = ServerEvent.safeParse(JSON.parse(data.content));

						if (!result.success) {
							console.warn('cannot parse instance event', data.content);
							return;
						}

						hooks.onServer?.(result.data);
						break;
					}
					case EventTypeInstance: {
						const result = InstanceEvent.safeParse(JSON.parse(data.content));

						if (!result.success) {
							console.warn('cannot parse instance event', data.content);
							return;
						}

						hooks.onInstance?.(result.data);
						break;
					}
					case EventTypeError: {
						const result = ErrorEvent.safeParse(JSON.parse(data.content));

						if (!result.success) {
							console.warn('cannot parse error event', data.content);
							return;
						}

						toast.error(result.data.details);
						break;
					}
					case EventTypeSync: {
						const result = SyncEvent.safeParse(JSON.parse(data.content));

						if (!result.success) {
							console.warn('cannot parse sync event', data.content);
							return;
						}

						switch (result.data.syncType) {
							case 'clear_last_event_id': {
								setLastEventId('');
								break;
							}
						}
						break;
					}
				}
			},
			onerror(err) {
				toast.error(err);
			},
			onclose() {
				console.log('stream closed');
			}
		});
	}
}
