import type { InstanceStatus } from "@/types/Instance";

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

export type InstanceStatus = 'Pending' | 'Starting' | 'Running' | 'Stopping' | 'Stopped' | 'UnableToGet';
export const InstanceStatusWord: Record<InstanceStatus, string> = {
	Pending: '准备中',
	Starting: '启动中',
	Running: '运行中',
	Stopping: '关闭中',
	Stopped: '已关闭',
	UnableToGet: '同步失败'
};export const InstanceStatusColor: Record<InstanceStatus, string> = {
	Pending: 'before:bg-amber-500',
	Starting: 'before:bg-amber-500',
	Running: 'before:bg-green-500',
	Stopping: 'before:bg-amber-500',
	Stopped: 'before:bg-red-500',
	UnableToGet: 'before:bg-red-500'
};

