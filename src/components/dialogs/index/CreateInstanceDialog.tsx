import { Alert, AlertTitle, AlertDescription, AlertAction } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { req } from '@/lib/req';
import { RefreshCwIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { DialogControl } from '@/components/dialogs/type';
import { Button } from '@/components/ui/button';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import Wrapper from '@/components/dialogs/Wrapper';

export type InstanceTypeAndTradePrice = {
	instanceType: string;
	cpuCoreCount: number;
	memorySize: number;
	tradePrice: number;
};

export default function CreateInstanceDialog(props: DialogControl) {
	const [bestInstanceTypeLoading, setBestInstanceTypeLoading] = useState(false);
	const [bestInstanceType, setBestInstanceType] = useState<InstanceTypeAndTradePrice>();
	const [bestInstanceTypeError, setBestInstanceTypeError] = useState<string | null>(null);

	const [createInstanceLoading, setCreateInstanceLoading] = useState(false);

	const refreshBestInstanceType = useCallback(async () => {
		setBestInstanceTypeLoading(true);
		req<{ zoneId: string; typesAndTradePrice: InstanceTypeAndTradePrice[] }[]>('/instance-types-and-charge?minimumMemorySize=8&maximumMemorySize=16&minimumCpuCoreCount=1&maximumCpuCoreCount=8&cpuArchitecture=X86&zoneId=cn-shenzhen-c&sortBy=tradePrice&sortOrder=asc', 'GET').then(({ data, error }) => {
			setBestInstanceTypeLoading(false);

			if (error !== null) {
				setBestInstanceTypeError(error);
				return;
			}

			const best = data[0].typesAndTradePrice.filter(x => x.memorySize > 8 && !/^ecs\.(e|s6|xn4|n4|mn4|e4|t|d).*$/.test(x.instanceType) && x.tradePrice < 0.6)[0];

			if (best === undefined) {
				setBestInstanceTypeError('没有符合要求的实例');
				return;
			}

			setBestInstanceType(best);
		});
	}, []);

	useEffect(() => {
		if (props.open && bestInstanceType === undefined) {
			refreshBestInstanceType();
		}
	}, [props.open]);

	return (
		<Wrapper
			open={props.open}
			setOpen={props.setOpen}
			title="创建实例"
			actions={
				<>
					<Button
						onClick={async () => {
							setCreateInstanceLoading(true);
							const { error } = await req('/instance', 'POST', {
								zoneId: 'cn-shenzhen-c',
								instanceType: bestInstanceType?.instanceType,
								vswitchId: 'vsw-wz995l4az1ab9awbe6wwz'
							});
							setCreateInstanceLoading(false);

							if (error !== null) {
								toast.error('创建失败：' + error);
								return;
							}

							toast.success('创建成功');
							props.setOpen(false);
						}}
						disabled={createInstanceLoading || bestInstanceTypeLoading || bestInstanceTypeError !== null}
					>
						{bestInstanceTypeLoading ? '请等待' : <>创建实例 {createInstanceLoading && <Spinner />}</>}
					</Button>
				</>
			}
		>
			<p>确认要开始创建吗？</p>
			<p>创建实例后，系统将尝试自动分配 IP 地址并开启实例。</p>
			<Alert variant={bestInstanceTypeError ? 'destructive' : 'default'}>
				{bestInstanceTypeError ? (
					<>
						<AlertTitle>无法找到实例</AlertTitle>
						<AlertDescription>错误：{bestInstanceTypeError}</AlertDescription>
					</>
				) : (
					<>
						<AlertTitle>{bestInstanceTypeLoading ? '寻找最优实例中...' : bestInstanceType?.instanceType}</AlertTitle>
						<AlertDescription>
							{bestInstanceTypeLoading ? (
								'可能需要至多 1 分钟，请耐心等待'
							) : (
								<div className="flex items-center gap-2">
									cn-shenzhen-c <Separator orientation="vertical" /> {bestInstanceType?.cpuCoreCount} vCPU <Separator orientation="vertical" /> {bestInstanceType?.memorySize} GiB <Separator orientation="vertical" /> ¥{bestInstanceType?.tradePrice.toFixed(2)}/h
								</div>
							)}
						</AlertDescription>
						<AlertAction>
							<Button disabled={bestInstanceTypeLoading} onClick={refreshBestInstanceType} variant={'outline'} size={'icon-xs'}>
								<RefreshCwIcon size={5} />
							</Button>
						</AlertAction>
					</>
				)}
			</Alert>
		</Wrapper>
	);
}
