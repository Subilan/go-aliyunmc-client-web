import type { DialogControl } from '@/components/dialogs/type';
import Wrapper from '@/components/dialogs/Wrapper';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { req } from '@/lib/req';
import times from '@/lib/times';
import { CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type CommandExec = {
	id: string;
	by: number;
	type: 'backup_worlds' | 'archive_server';
	createdAt: string;
	updatedAt: string;
	status: 'success' | 'error' | 'created';
};

type Empty = {
	_empty: true;
};

async function fetchLatestRecordOfType(type: 'backup' | 'archive') {
	const path = type === 'backup' ? '/server/latest-success-backup' : '/server/latest-success-archive';

	const { data, error } = await req<CommandExec & Empty>(path + '?ignoreEmptyRow=true', 'get');
	if (error !== null) {
		toast.error('无法获取备份记录：' + error);
		return;
	}

	if (data._empty === true) {
		return;
	}

	return data;
}

export default function BackupOrArchiveDialog(props: DialogControl & { type: 'backup' | 'archive' }) {
	const [latestRecord, setLatestRecord] = useState<CommandExec>();
	const [loading, setLoading] = useState(false);
	const [status, setStatus] = useState('');
	const [error, setError] = useState('');
	const typeVerb = useMemo(() => (props.type === 'backup' ? '备份' : '归档'), [props.type]);

	useEffect(() => {
		fetchLatestRecordOfType(props.type).then(data => setLatestRecord(data));
	}, [props.type]);

	return (
		<Wrapper
			open={props.open}
			setOpen={props.setOpen}
			title={`触发服务器${typeVerb}`}
			description={latestRecord && `最近${typeVerb}于 ${times.formatDateAgo(latestRecord.updatedAt)}`}
			actions={
				<>
					<Button
						disabled={loading}
						onClick={async () => {
							const commandType = props.type === 'backup' ? 'backup_worlds' : 'archive_server';
							setLoading(true);
							const { data, error } = await req('/server/exec?commandType=' + commandType, 'get');
							setLoading(false);

							if (error !== null) {
								toast.error('执行失败：' + error);
								return;
							}

							if (data.error !== null) {
								setStatus('error');
								setError(data.error);
							} else {
								const latest = await fetchLatestRecordOfType(props.type);
								setLatestRecord(latest);
								setStatus('success');
								setError('');
							}

							setTimeout(() => {
								setStatus('');
								setError('');
							}, 2000);
						}}
					>
						{loading ? '请稍等' : '执行' + typeVerb}
					</Button>
				</>
			}
		>
			{loading ? (
				<Alert>
					<Spinner />
					<AlertTitle>{typeVerb}中</AlertTitle>
					<AlertDescription>过程至多持续 1 分钟</AlertDescription>
				</Alert>
			) : status === '' ? (
				<p>要现在执行吗？过程可能持续至多 1 分钟。</p>
			) : (
				<Alert>
					{status === 'success' ? <CheckCircleIcon /> : <XCircleIcon />}
					<AlertTitle>
						{typeVerb}
						{status === 'success' ? '成功' : '失败'}
					</AlertTitle>
					<AlertDescription>{status === 'success' ? (props.type === 'backup' ? '存档已成功复制到 OSS' : '服务器内容已归档到 OSS') : error}</AlertDescription>
				</Alert>
			)}
		</Wrapper>
	);
}
