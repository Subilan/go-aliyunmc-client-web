export type Transaction = {
	amount: number;
	balance: number;
	time: string; // ISO date string
	flow: string;
	type: string;
	remarks?: 'ECS' | 'OSS' | 'YUNDISK' | 'CDT_INTERNET_PUBLIC_CN' | null;
	billingCycle: string;
};

export const ProductTypeColor = {
	ECS: 'bg-blue-100 text-blue-600',
	OSS: 'bg-yellow-100 text-yellow-600',
	YUNDISK: 'bg-gray-100 text-gray-600',
	CDT_INTERNET_PUBLIC_CN: 'bg-orange-100 text-orange-600'
};

export const ProductTypeWord = {
	ECS: '云服务器',
	OSS: '对象存储',
	YUNDISK: '云盘',
	CDT_INTERNET_PUBLIC_CN: '公网流量'
};

