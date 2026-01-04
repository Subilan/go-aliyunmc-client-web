import type { DialogControl } from '@/components/dialogs/type';
import Wrapper from '@/components/dialogs/Wrapper';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { req } from '@/lib/req';
import { useState } from 'react';
import { toast } from 'sonner';

export default function StopServerDialog(props: DialogControl) {
	const [stopServerLoading, setStopServerLoading] = useState(false);

	return (
		<Wrapper
			open={props.open}
			setOpen={props.setOpen}
			title="关闭服务器"
			actions={
				<Button
					disabled={stopServerLoading}
					onClick={async () => {
						setStopServerLoading(true);
						const { data, error } = await req('/server/exec?commandType=stop_server', 'get');
						setStopServerLoading(false);

						if (error !== null) {
							toast.error('关闭服务器失败：' + error);
							return;
						}

						if (data.error !== null) {
							toast.error('无法关闭服务器：' + data.error);
						} else {
							toast.success('已请求关闭服务器');
							props.setOpen(false);
						}
					}}
					variant={'destructive'}
				>
					关闭服务器 {stopServerLoading && <Spinner />}
				</Button>
			}
		>
			<p>确定要关闭服务器吗？</p>
		</Wrapper>
	);
}
