import CenterCardPage from '@/components/center-card-page';

export default function ErrorBoundary(props: any) {
	return (
		<CenterCardPage title='无法加载'>
			<p>这可能是因为后端服务崩溃或者其它更为严重的原因，详细信息可参考控制台的输出。</p>
			<p className="text-neutral-500">请联系系统维护者以解决问题。</p>
			<details>
				<summary>报错信息</summary>
				{JSON.stringify(props)}
			</details>
		</CenterCardPage>
	);
}
