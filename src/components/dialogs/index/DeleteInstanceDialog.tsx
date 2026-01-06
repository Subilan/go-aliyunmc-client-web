import { Button } from '@/components/ui/button';
import type { DialogControl } from '@/components/dialogs/type';
import { useState } from 'react';
import { req } from '@/lib/req';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import Wrapper from '@/components/dialogs/Wrapper';
import { FieldGroup, FieldSet, FieldContent, FieldTitle, FieldLabel, FieldDescription, Field } from '@/components/ui/field';
import { RadioGroupItem, RadioGroup } from '@/components/ui/radio-group';

export default function DeleteInstanceDialog(props: DialogControl) {
	const [deleteMode, setDeleteMode] = useState<'safe' | 'force'>('safe');
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
								const { error } = await req(`/instance?${deleteMode === 'force' ? 'force=1' : 'archiveAndForce=1'}`, 'DELETE');
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
				<p>确认要删除实例吗？此操作不可撤销。请选择删除的方式。</p>
				<FieldGroup>
					<FieldSet>
						<RadioGroup value={deleteMode} onValueChange={v => setDeleteMode(v as 'safe' | 'force')}>
							<FieldLabel htmlFor="safeDelete">
								<Field orientation="horizontal">
									<FieldContent>
										<FieldTitle>安全删除</FieldTitle>
										<FieldDescription>关闭服务器并归档数据后，删除实例。</FieldDescription>
									</FieldContent>
									<RadioGroupItem value="safe" id="safeDelete" />
								</Field>
							</FieldLabel>
							<FieldLabel htmlFor="forceDelete">
								<Field orientation="horizontal">
									<FieldContent>
										<FieldTitle>强制删除</FieldTitle>
										<FieldDescription>忽略服务器状态，执行断电操作并删除实例。请谨慎选择。</FieldDescription>
									</FieldContent>
									<RadioGroupItem value="force" id="forceDelete" />
								</Field>
							</FieldLabel>
						</RadioGroup>
					</FieldSet>
				</FieldGroup>
			</Wrapper>
		</>
	);
}
