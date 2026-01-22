import { Button } from '@/components/ui/button';
import type { DialogControl } from '@/components/dialogs/type';
import Wrapper from '@/components/dialogs/Wrapper';
import { req } from '@/lib/req';
import { toast } from 'sonner';

export default function CreateAndDeployDialog(props: DialogControl) {
	return (
		<Wrapper
			open={props.open}
			setOpen={props.setOpen}
			title="一键创建实例"
			actions={
				<>
					<Button
						onClick={async () => {
							const {error} = await req('/instance/create-and-deploy', 'get');
                            
                            if (error !== null) {
                                toast.error('发起任务失败')
                                return;
                            }

                            toast.success('已请求任务')
							props.setOpen(false); // Close dialog after confirmation
						}}
					>
						确认
					</Button>
				</>
			}
		>
			<p>是否确认要开始一键创建实例？此过程大约需要 5 分钟完成。</p>
		</Wrapper>
	);
}