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

export type PreferredInstanceCharge = {
	zoneId: string;
	typeAndTradePrice: {
		instanceType: string;
		cpuCoreCount: number;
		memorySize: number;
		tradePrice: number;
	};
};

export default function CreateInstanceDialog(props: DialogControl) {
	const [bestInstanceTypeLoading, setBestInstanceTypeLoading] = useState(false);
	const [bestInstanceType, setBestInstanceType] = useState<PreferredInstanceCharge>();
	const [bestInstanceTypeError, setBestInstanceTypeError] = useState<string | null>(null);

	const [createInstanceLoading, setCreateInstanceLoading] = useState(false);

	useEffect(() => {
		refreshBestInstanceType();
	}, []);

	const refreshBestInstanceType = useCallback(() => {
		setBestInstanceTypeLoading(true);
		req<PreferredInstanceCharge>('/preferred-instance-charge', 'GET')
			.then(({ data, error }) => {
				if (error !== null) {
					setBestInstanceTypeError(error);
					return;
				}

				setBestInstanceType(data);
			})
			.finally(() => setBestInstanceTypeLoading(false));
	}, []);

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
							const { error } = await req('/create-preferred-instance?autoVSwitch=1', 'GET');
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
						<AlertAction>
							<Button variant={'outline'} size={'icon-xs'} onClick={refreshBestInstanceType}>
								<RefreshCwIcon />
							</Button>
						</AlertAction>
					</>
				) : (
					<>
						<AlertTitle>{bestInstanceTypeLoading ? '寻找最优实例中...' : bestInstanceType?.typeAndTradePrice.instanceType}</AlertTitle>
						<AlertDescription>
							{bestInstanceTypeLoading ? (
								'可能需要至多 1 分钟，请耐心等待'
							) : (
								<div className="flex items-center gap-2">
									{bestInstanceType?.zoneId} <Separator orientation="vertical" /> {bestInstanceType?.typeAndTradePrice.cpuCoreCount} vCPU <Separator orientation="vertical" /> {bestInstanceType?.typeAndTradePrice.memorySize} GiB <Separator orientation="vertical" /> ¥{bestInstanceType?.typeAndTradePrice.tradePrice.toFixed(2)}/h
								</div>
							)}
						</AlertDescription>
					</>
				)}
			</Alert>
		</Wrapper>
	);
}
