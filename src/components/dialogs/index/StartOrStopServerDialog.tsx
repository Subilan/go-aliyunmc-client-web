import type { DialogControl } from '@/components/dialogs/type';
import Wrapper from '@/components/dialogs/Wrapper';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { req } from '@/lib/req';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

export default function StartOrStopServerDialog(props: DialogControl & { type: 'start' | 'stop' }) {
	const [loading, setLoading] = useState(false);
	const typeWord = useMemo(() => (props.type === 'start' ? '开启' : '关闭'), [props.type]);

	return (
		<Wrapper
			open={props.open}
			setOpen={props.setOpen}
			title={`${typeWord}服务器`}
			actions={
				<Button
					disabled={loading}
					onClick={async () => {
						setLoading(true);
						const { error } = await req(`/server/exec?commandType=${props.type}_server`, 'get');
						setLoading(false);

						if (error !== null) {
							toast.error(typeWord + '服务器失败：' + error);
							return;
						}

						toast.success(`已请求${typeWord}服务器`);
						props.setOpen(false);
					}}
					variant={props.type === 'stop' ? 'destructive' : 'default'}
				>
					{typeWord}服务器 {loading && <Spinner />}
				</Button>
			}
		>
			<p>确定要{typeWord}服务器吗？</p>
		</Wrapper>
	);
}
