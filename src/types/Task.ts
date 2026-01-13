export type Task = {
	id: string;
	type: TaskType;
	status: TaskStatus;
	userId?: number;
	createdAt: string;
	updatedAt: string | null;
};

export type TaskOverview = {
	successCount: number;
	unsuccessCount: number;
	latest?: JoinedTask;
};

export type JoinedTask = Task & {
	username: string;
};

export type TaskType = 'instance_deployment';
export type TaskStatus = 'running' | 'success' | 'failed' | 'cancelled' | 'timed_out';
