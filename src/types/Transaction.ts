export type Transaction = {
	amount: number;
	balance: number;
	time: string; // ISO date string
	flow: string;
	type: string;
	remarks?: 'ECS' | 'OSS' | 'YUNDISK' | 'CDT_INTERNET_PUBLIC_CN' | null;
	billingCycle: string;
};
