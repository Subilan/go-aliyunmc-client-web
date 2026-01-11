import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import { useMemo, useState, type ReactNode, type SetStateAction } from 'react';

export type WrappedTableProps<T extends Record<string, any>> = {
	data: T[];
	keys: (keyof T)[];
	getKey: (row: T) => string;
	header: Partial<{ [props in keyof T]: string }>;
	render: Partial<{ [props in keyof T]: (row: T) => ReactNode }>;
	pageSize: number;
	setPageSize: React.Dispatch<SetStateAction<number>>;
	page: number;
	setPage: React.Dispatch<SetStateAction<number>>;
	pageCount: number;
};

export default function WrappedTable<T extends Record<string, any>>({ data, keys, getKey, page, setPage, setPageSize, pageCount, header, render }: WrappedTableProps<T>) {
	const [jumpto, setJumpto] = useState('1');
	const jumptoNumber = useMemo(() => Number(jumpto), [jumpto]);
	const [popover, setPopover] = useState(false);

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						{keys
							.map(k => header[k])
							.map(h => (
								<TableHead key={h}>{h}</TableHead>
							))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.map(d => (
						<TableRow key={getKey(d)}>
							{keys.map(k => (
								<TableCell key={getKey(d)+k.toString()}>{render[k] ? render[k](d) : d[k]}</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<Select defaultValue="10" onValueChange={v => setPageSize(Number(v))}>
						<SelectTrigger>
							<SelectValue placeholder="每页显示"></SelectValue>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="10">10 条</SelectItem>
							<SelectItem value="15">15 条</SelectItem>
							<SelectItem value="20">20 条</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="flex items-center gap-2">
					<Button disabled={page === 1} onClick={() => setPage(p => p - 1)} variant={'ghost'} size={'icon-sm'}>
						<ArrowLeftIcon />
					</Button>
					<div>
						<span className="text-lg">{page}</span>
						<span className="text-neutral-500">/{pageCount}</span>
					</div>
					<Button disabled={page === pageCount} onClick={() => setPage(p => p + 1)} variant={'ghost'} size={'icon-sm'}>
						<ArrowRightIcon />
					</Button>
				</div>
				<Popover open={popover} onOpenChange={setPopover}>
					<PopoverTrigger asChild>
						<Button variant={'outline'}>跳转到</Button>
					</PopoverTrigger>
					<PopoverContent className="w-50">
						<form
							onSubmit={e => {
								e.preventDefault();
								setPage(jumptoNumber);
								setPopover(false);
							}}
							className="flex items-center gap-2"
						>
							<Input max={pageCount} min={1} value={jumpto} onChange={v => setJumpto(v.target.value)} type="number" />
							<Button disabled={!(jumptoNumber >= 1 && jumptoNumber <= pageCount)}>GO</Button>
						</form>
					</PopoverContent>
				</Popover>
			</div>
		</>
	);
}
