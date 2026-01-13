import { req } from '@/lib/req';
import type { Transaction } from '@/types/Transaction';
import type { WithTotal } from '@/types/WithTotal';

export async function fetchTransactions(page: number, pageSize: number) {
	const { data, error } = await req<WithTotal<Transaction>>(`/bss/transactions?page=${page}&pageSize=${pageSize}`, 'get');

	return error === null ? data : { data: [], total: 0 };
}
