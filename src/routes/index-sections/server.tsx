import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Item, ItemActions, ItemDescription, ItemTitle } from '@/components/ui/item';
import { Spinner } from '@/components/ui/spinner';
import { req } from '@/lib/req';
import times from '@/lib/times';
import { copy } from '@/lib/utils';
import type { CommandExec } from '@/types/CommandExec';
import { useCallback, useEffect, useState } from 'react';

async function fetchServerBackups() {
	const { data, error } = await req<CommandExec[]>('/server/backups', 'get');

	return error === null ? data : [];
}

export default function IndexServerSection() {
	const [backupInfoLoading, setBackupInfoLoading] = useState(false);
	const [backupInfo, setBackupInfo] = useState<CommandExec[]>([]);

	const initialize = useCallback(async () => {
		setBackupInfoLoading(true);
		const data = await fetchServerBackups();
		setBackupInfoLoading(false);
		setBackupInfo(data);
	}, []);

	useEffect(() => {
		initialize();
	}, []);

	return (
		<>
			<div className="flex flex-col gap-3">
				<Card>
					<CardHeader>
						<CardTitle>备份记录</CardTitle>
					</CardHeader>
					<CardContent>
						{backupInfoLoading ? (
							<Spinner />
						) : (
							<div className="flex flex-col gap-3">
								{backupInfo.length
									? backupInfo.map(info => (
											<Item key={info.id} variant={'outline'}>
												<ItemTitle>
													{times.formatDatetime(info.createdAt)}
												</ItemTitle>
												<ItemDescription>
													{info.auto ? '自动备份' : `由 ${info.by} 发起`}
												</ItemDescription>
												<div className='flex-1'/>
												<ItemActions>
													<Button
														variant={'ghost'}
														size={'xs'}
														onClick={() =>
															copy(
																times.formatDatetime(info.createdAt)
															)
														}
													>
														复制时间
													</Button>
												</ItemActions>
											</Item>
										))
									: '暂无备份'}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</>
	);
}
