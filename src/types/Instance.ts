export type Instance = {
	instanceId: string;
	instanceType: string;
	regionId: string;
	zoneId: string;
	deletedAt: string | null;
	createdAt: string;
	deployed: boolean;
	ip: string | null;
};

export type InstanceStatus = 'Pending' | 'Starting' | 'Running' | 'Stopping' | 'Stopped' | 'unable_to_get';
