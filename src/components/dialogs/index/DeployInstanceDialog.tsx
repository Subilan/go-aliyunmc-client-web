import type { DialogControl } from '@/components/dialogs/type';
import Wrapper from '@/components/dialogs/Wrapper';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { UserPayloadContext } from '@/contexts/UserPayloadContext';
import { req } from '@/lib/req';
import type { StreamManager } from '@/stream';
import type { TaskStatus } from '@/types/Task';
import { UserRoleAdmin } from '@/types/User';
import { AlertCircleIcon, CheckIcon, XCircleIcon } from 'lucide-react';
import { useContext, type SetStateAction } from 'react';
import { toast } from 'sonner';

export default function DeployInstanceDialog({ output = '', latestOutput = '', ...props }: DialogControl & { status?: string; setStatus: React.Dispatch<SetStateAction<TaskStatus | undefined>>; output?: string; latestOutput?: string; streamManager: StreamManager }) {
	const userPayload = useContext(UserPayloadContext);

	return (
		<Wrapper
			className={props.status !== undefined ? 'max-w-175!' : ''}
			open={props.open}
			setOpen={props.setOpen}
			title="部署实例"
			actions={
				<>
					<Button
						disabled={props.status === 'running' || props.status === 'success' || userPayload.role < UserRoleAdmin}
						onClick={async () => {
							const { error } = await req('/instance/deploy', 'get');

							if (error !== null) {
								toast.error('触发部署任务失败：' + error);
								return;
							}

							toast.success('已触发部署任务');
							props.streamManager.clearDeploymentBuffer();
						}}
					>
						{props.status === undefined ? '开始部署' : props.status === 'running' ? '请稍等' : props.status === 'success' ? '已部署完毕' : '重新部署'}
					</Button>
				</>
			}
		>
			{props.status === undefined ? (
				<>
					<p>确认要开始部署吗？</p>
					<p>部署操作将安装必要的系统软件、Java 并拉取服务器存档。</p>
				</>
			) : (
				<>
					<Alert>
						{props.status === 'running' && <Spinner />}
						{props.status === 'failed' && <XCircleIcon />}
						{props.status === 'success' && <CheckIcon />}
						{props.status === 'timed_out' && <XCircleIcon />}
						{props.status === 'cancelled' && <AlertCircleIcon />}
						<AlertTitle>
							{props.status === 'running' && '部署进行中'}
							{props.status === 'failed' && '部署失败'}
							{props.status === 'success' && '部署成功'}
							{props.status === 'timed_out' && '部署超时'}
							{props.status === 'cancelled' && '已取消'}
						</AlertTitle>
						<AlertDescription>
							<div className="flex flex-col gap-3">
								{(props.status === 'running' || props.status === 'failed') && latestOutput}
								{props.status === 'success' && '此部署已成功完成'}
								<details>
									<summary className="cursor-pointer mb-2">完整输出</summary>
									<pre className="border border-neutral-200 rounded-md p-3 max-h-[200px] overflow-y-auto">
										<code className="whitespace-pre-line">{output}</code>
									</pre>
								</details>
							</div>
						</AlertDescription>
					</Alert>
				</>
			)}
		</Wrapper>
	);
}
