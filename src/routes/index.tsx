import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPayloadContext } from '@/contexts/UserPayloadContext';
import { RootRoute } from '@/root';
import { createRoute } from '@tanstack/react-router';
import { useContext } from 'react';
import times from '@/lib/times';
import DataListKv from '@/components/data-list-kv';
import { ArrowDownUpIcon, CopyIcon, CpuIcon, DownloadIcon, MemoryStickIcon, NetworkIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export const IndexRoute = createRoute({
	path: '/',
	component: Index,
	getParentRoute: () => RootRoute
});

export default function Index() {
	const userPayload = useContext(UserPayloadContext);

	return (
		<>
			<div className="max-w-175 mx-auto my-16">
				<div className="flex flex-col gap-5">
					<h1 className="text-3xl">Hello, {userPayload.username}</h1>
					<section>
						<Card>
							<CardHeader className="flex gap-2 items-center">
								<CardTitle>实例</CardTitle>
								<div className="flex-1"></div>
								<Button disabled>创建实例</Button>
							</CardHeader>
							<CardContent>
								<span className="mb-2 font-normal before:block flex items-center gap-2 before:bg-green-500 before:rounded-full before:h-1.25 before:w-1.25">运行中</span>
								<div className="flex gap-3 mb-2">
									<div className="font-bold text-3xl">192.168.0.1</div>
									<Button variant={'outline'}>
										复制 <CopyIcon />
									</Button>
								</div>
								<div className="flex gap-2 items-center">
									<MemoryStickIcon size={16} /> 16GB
									<Separator orientation="vertical" />
									<CpuIcon size={16} /> Intel Xeon
									<Separator orientation="vertical" />
									<ArrowDownUpIcon size={16}/> 100Mbps
								</div>
								<Separator className="my-5" />
								<DataListKv
									grid
									data={{
										'实例 ID': { content: 'i-wz90z79xr0e1yuexv0k7', copy: true },
										实例型号: 'ecs.c7.large',
										'地域/可用区': 'cn-shenzhen-c',
										创建时间: { content: times.formatDateAgo('2025-12-02 11:03:03'), detail: '2025-12-02 11:03:03' }
									}}
								/>
							</CardContent>
						</Card>
					</section>
					<section>
						
					</section>
				</div>
			</div>
		</>
	);
}
