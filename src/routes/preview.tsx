import DataListKv from '@/components/data-list-kv';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Separator } from '@/components/ui/separator';
import times from '@/lib/times';
import { RootRoute } from '@/root';
import { createRoute } from '@tanstack/react-router';
import { CopyIcon, MemoryStickIcon, CpuIcon, ArrowDownUpIcon, MoreHorizontalIcon } from 'lucide-react';

export const PreviewRoute = createRoute({
	path: '/__preview',
	component: Preview,
	getParentRoute: () => RootRoute
});

export default function Preview() {
	return (
		<div className="max-w-175 flex flex-col gap-3">
			<Card>
				<CardHeader className="flex gap-2 items-center">
					<CardTitle>实例</CardTitle>
					<div className="flex-1"></div>
					<Button disabled>创建实例</Button>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant={'secondary'} size={'icon'}>
								<MoreHorizontalIcon />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem disabled>开启</DropdownMenuItem>
							<DropdownMenuItem disabled>关闭</DropdownMenuItem>
							<DropdownMenuSub>
								<DropdownMenuSubTrigger>高级</DropdownMenuSubTrigger>
								<DropdownMenuSubContent>
									<DropdownMenuItem disabled>重新部署</DropdownMenuItem>
									<DropdownMenuItem disabled>触发服务器备份</DropdownMenuItem>
									<DropdownMenuItem disabled>触发服务器归档</DropdownMenuItem>
									<DropdownMenuItem disabled variant="destructive">
										保存并删除实例
									</DropdownMenuItem>
								</DropdownMenuSubContent>
							</DropdownMenuSub>
							<DropdownMenuItem disabled variant="destructive">
								强制删除
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
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
						<ArrowDownUpIcon size={16} /> 100Mbps
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
			<Card>
				<CardHeader className="flex gap-2 items-center">
					<CardTitle>实例</CardTitle>
					<div className="flex-1"></div>
					<Button>创建实例</Button>
				</CardHeader>
				<CardContent>
					<span className="mb-2 font-normal before:block flex items-center gap-2 before:bg-gray-500 before:rounded-full before:h-1.25 before:w-1.25">未创建</span>
					<div className="flex gap-3 mb-2">
						<div className="font-bold text-3xl">0.0.0.0</div>
						{/* <Button variant={'outline'}>
                                                    复制 <CopyIcon />
                                                </Button> */}
					</div>
					{/* <div className="flex gap-2 items-center">
                                                <MemoryStickIcon size={16} /> 16GB
                                                <Separator orientation="vertical" />
                                                <CpuIcon size={16} /> Intel Xeon
                                                <Separator orientation="vertical" />
                                                <ArrowDownUpIcon size={16}/> 100Mbps
                                            </div> */}
					<Separator className="my-5" />
					<DataListKv
						grid
						data={{
							最近释放于: { content: times.formatDateAgo('2025-12-02 11:03:03'), detail: '2025-12-02 11:03:03' },
							最近释放原因: '在线人数不足'
						}}
					/>
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="flex gap-2 items-center">
					<CardTitle>服务器</CardTitle>
					<div className="flex-1"></div>
					<span>在线人数：5/20</span>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-15">
						{new Array(17).fill(undefined).map(_ => {
							return <img draggable="false" className="border-2 border-white" alt="" src="https://mc-heads.net/avatar/5c94fc153e60447ab642431e8815f41d" />;
						})}
					</div>
					<Separator className="my-5" />
					<DataListKv
						grid
						data={{
							'Minecraft 版本': '1.21.1',
							服务端类型: 'Paper'
						}}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex gap-2 items-center">
					<CardTitle>服务器</CardTitle>
					<div className="flex-1"></div>
					<span>在线人数：0/20</span>
				</CardHeader>
				<CardContent>
					<Empty>
						<EmptyHeader>
							<EmptyMedia>
								<img draggable="false" src="/loong-speechless.jpg" />
							</EmptyMedia>
						</EmptyHeader>
						<EmptyTitle>无人在线</EmptyTitle>
						<EmptyDescription>一阵风把大家都吹走了</EmptyDescription>
					</Empty>
					<Separator className="my-5" />
					<DataListKv
						grid
						data={{
							'Minecraft 版本': '1.21.1',
							服务端类型: 'Paper'
						}}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
