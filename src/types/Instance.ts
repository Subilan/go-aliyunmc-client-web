export type Instance = {
	instanceId: string;
	instanceType: string;
	regionId: string;
	zoneId: string;
	deletedAt: string | null;
	createdAt: string;
	deployed: boolean;
	ip: string | null;
	vswitchId: string;
};

export type InstanceStatus = 'Pending' | 'Starting' | 'Running' | 'Stopping' | 'Stopped' | 'UnableToGet' | '';

export const InstanceStatusWord: Record<InstanceStatus, string> = {
	Pending: '准备中',
	Starting: '启动中',
	Running: '运行中',
	Stopping: '关闭中',
	Stopped: '已关闭',
	UnableToGet: '同步失败',
	'': '未创建'
};

export const InstanceStatusColor: Record<InstanceStatus, string> = {
	Pending: 'before:bg-amber-500',
	Starting: 'before:bg-amber-500',
	Running: 'before:bg-green-500',
	Stopping: 'before:bg-amber-500',
	Stopped: 'before:bg-red-500',
	UnableToGet: 'before:bg-red-500',
	'': 'before:bg-gray-500'
};

export const InstanceStatusBg: Record<InstanceStatus, string> = {
	Pending: 'bg-amber-200',
	Starting: 'bg-amber-200',
	Running: 'bg-green-200',
	Stopping: 'bg-amber-200',
	Stopped: 'bg-red-200',
	UnableToGet: 'bg-red-200',
	'': 'bg-gray-200'
};

export const InstanceStatusFg: Record<InstanceStatus, string> = {
	Pending: 'text-amber-600',
	Starting: 'text-amber-600',
	Running: 'text-green-600',
	Stopping: 'text-amber-600',
	Stopped: 'text-red-600',
	UnableToGet: 'text-red-600',
	'': 'text-gray-600'
};

