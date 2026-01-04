
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { DialogControl } from '@/components/dialogs/type';
import { useState } from 'react';
import { req } from '@/lib/req';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import Wrapper from '@/components/dialogs/Wrapper';

export default function DeleteInstanceDialog(props: DialogControl) {
	const [force, setForce] = useState(false);
	const [loading, setLoading] = useState(false);

	return (
		<>
			<Wrapper
				open={props.open}
				setOpen={props.setOpen}
				title="删除实例"
				actions={
					<>
						<Button
							disabled={loading}
							variant={'destructive'}
							onClick={async () => {
								setLoading(true);
								const { error } = await req(`/instance?force=${force ? 1 : 0}&forceStop=${force ? 1 : 0}`, 'DELETE');
								setLoading(false);

								if (error !== null) {
									toast.error('删除失败：' + error);
									return;
								}

								toast.success('已删除实例');
								props.setOpen(false);
							}}
						>
							确认删除 {loading && <Spinner />}
						</Button>
					</>
				}
			>
				<p>确认要删除实例吗？可能导致无法预料的后果和数据丢失。请只在必要的情况下执行。</p>
				<div className="flex items-start gap-3">
					<Checkbox id="forceDelete" defaultValue={'false'} onCheckedChange={v => setForce(!!v)} />
					<div className="grid gap-2">
						<Label htmlFor="forceDelete">强制删除</Label>
						<p className="text-muted-foreground text-sm">忽略实例运行情况，直接断电并删除。请谨慎使用。</p>
					</div>
				</div>
			</Wrapper>
		</>
	);
}
