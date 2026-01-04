import type { DialogControl } from '@/components/dialogs/type';
import Wrapper from '@/components/dialogs/Wrapper';
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { req } from '@/lib/req';
import times from '@/lib/times';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type QueryResult = {
	error: string | null;
	output: string;
};

const dirNameMappings: Record<string, string> = {
	'/home/mc/server/archive': '总存档',
	'/home/mc/server/archive/world': '主世界',
	'/home/mc/server/archive/world_nether': '下界',
	'/home/mc/server/archive/world_the_end': '末地'
};

export default function InstanceDetailDialog(props: DialogControl) {
	const [screenfetch, setScreenfetch] = useState('');
	const [screenfetchLoading, setScreenfetchLoading] = useState(false);
	const [sizes, setSizes] = useState<{ dir: string; size: string }[]>([]);
	const [sizesLoading, setSizesLoading] = useState(false);
	const [refreshedAt, setRefreshedAt] = useState('');

	useEffect(() => {
		setScreenfetchLoading(true);
		setSizesLoading(true);

		req<QueryResult>('/server/query?queryType=screenfetch', 'get')
			.then(({ data, error }) => {
				if (error !== null) {
					toast.error('无法获取信息：' + error);
					return;
				}

				if (data.error) {
					toast.error('获取信息失败：' + data.error);
					return;
				}

				setScreenfetch(data.output.trimEnd());
				setRefreshedAt(times.formatDatetime(new Date()));
			})
			.finally(() => setScreenfetchLoading(false));

		req<QueryResult>('/server/query?queryType=sizes', 'get')
			.then(({ data, error }) => {
				if (error !== null) {
					toast.error('无法获取信息：' + error);
					return;
				}

				if (data.error) {
					toast.error('获取信息失败：' + data.error);
					return;
				}

				setSizes(
					data.output
						.trimEnd()
						.split('\n')
						.map(x => {
							const pair = x.split('\t');
							return { size: pair[0], dir: pair[1] };
						})
				);
			})
			.finally(() => setSizesLoading(false));
	}, []);

	return (
		<Wrapper open={props.open} setOpen={props.setOpen} title="实例详情" className="max-w-175!">
			{refreshedAt.length > 0 && <p>数据更新于 {refreshedAt}</p>}
			<Tabs defaultValue="screenfetch">
				<TabsList>
					<TabsTrigger value="screenfetch">Screenfetch</TabsTrigger>
					<TabsTrigger value="sizes">存档大小</TabsTrigger>
				</TabsList>
				<TabsContent value="screenfetch">
					{screenfetchLoading ? (
						<Spinner />
					) : (
						<pre className="whitespace-pre-wrap border border-neutral-200 rounded-lg p-3">
							<code className="w-full block">{screenfetch}</code>
						</pre>
					)}
				</TabsContent>
				<TabsContent value="sizes">
					{sizesLoading ? (
						<Spinner />
					) : (
						<div className="flex flex-col gap-3">
							{sizes.map(size => (
								<Item key={size.dir} variant={'outline'}>
									{Object.keys(dirNameMappings).includes(size.dir) ? (
										<>
											<ItemTitle>{dirNameMappings[size.dir]}</ItemTitle>
											<ItemDescription>{size.dir}</ItemDescription>
										</>
									) : (
										<ItemTitle>{size.dir}</ItemTitle>
									)}
									<div className="flex-1" />
									<div>{size.size}</div>
								</Item>
							))}
						</div>
					)}
				</TabsContent>
			</Tabs>
		</Wrapper>
	);
}
