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
