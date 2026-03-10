import { AlertCircleIcon } from 'lucide-react';

export default function ErrorBoundary(props: any) {
	return (
		<div className="h-dvh w-dvw flex items-center justify-center">
			<div className="flex flex-col gap-2 items-center">
				<div className="text-xl flex items-center gap-2">
					<AlertCircleIcon /> 无法进入控制台
				</div>
				<p>后端服务暂时不可用</p>
			</div>
		</div>
	);
}
