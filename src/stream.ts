import { fetchEventSource } from '@microsoft/fetch-event-source';
import toast from 'react-hot-toast';
import z from 'zod';

const ReceivedEventRaw = z.object({
	type: z.literal([0, 1, 2]),
	is_error: z.boolean(),
	content: z.string()
});

const InstanceEvent = z.object({
	type: z.literal(['notify', 'active_status_update', 'active_ip_update', 'created']),
	data: z.any()
});

export type ReceivedEventRawT = z.infer<typeof ReceivedEventRaw>;
export type InstanceEventT = z.infer<typeof InstanceEvent>;
export const EventTypeDeployment = 0;
export const EventTypeServer = 1;
export const EventTypeInstance = 2;

export type StreamHookDictionary = {
	onInstance?: (event: InstanceEventT) => void;
	onDeployment?: (output: string) => void;
};

export class StreamManager {
	private hooks: StreamHookDictionary = {};
	private abortController: AbortController;

	constructor() {
		this.abortController = new AbortController();
	}

	setHook<T extends keyof StreamHookDictionary>(key: T, value: StreamHookDictionary[T]) {
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

		fetchEventSource('http://127.0.0.1:33791/stream', {
			headers: {
				Authorization: `Bearer ${userToken}`
			},
			signal: this.abortController.signal,
			async onopen() {
				console.log('stream opened');
			},
			onmessage(ev) {
				if (ev.data.trim().length === 0) return;

				const { success, data } = ReceivedEventRaw.safeParse(JSON.parse(ev.data));

				console.log(data)

				if (!success) {
					console.warn('cannot parse incoming stream data', ev.data);
					return;
				}

				switch (data.type) {
					case EventTypeDeployment: {
						hooks.onDeployment?.(data.content);
						break;
					}
					case EventTypeServer: {
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
