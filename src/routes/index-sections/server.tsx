import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Item, ItemActions, ItemDescription, ItemTitle } from '@/components/ui/item';
import { Spinner } from '@/components/ui/spinner';
import { req } from '@/lib/req';
import times from '@/lib/times';
import { copy } from '@/lib/utils';
import { useCallback, useEffect, useState } from 'react';


export type OssListItem = {
	name: string;
	size: number;
	lastModified: string;
}

async function listBackups() {
	const { data, error } = await req<OssListItem[]>('/oss/list?target=backups&trimPrefix=1', 'get');
	return error === null ? data : [];
}

export default function IndexServerSection() {
	const [backupInfoLoading, setBackupInfoLoading] = useState(false);
	const [backupInfo, setBackupInfo] = useState<OssListItem[]>([]);

	const initialize = useCallback(async () => {
		setBackupInfoLoading(true);
		const data = await listBackups();
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
						<CardTitle>备份文件（{backupInfo.length}）</CardTitle>
					</CardHeader>
					<CardContent>
						{backupInfoLoading ? (
							<Spinner />
						) : (
							<div className="flex flex-col gap-3">
								{backupInfo.length
									? backupInfo.map(info => (
											<Item key={info.name} variant={'outline'}>
												<ItemTitle>
													{times.formatDatetime(info.lastModified)}
												</ItemTitle>
												<ItemDescription>
													{(info.size / 1024 / 1024).toFixed(1)} MB
												</ItemDescription>
												<div className="flex-1" />
												<ItemActions>
													<Button
														variant={'ghost'}
														size={'xs'}
														onClick={() =>
															copy(
																times.formatDatetime(info.lastModified)
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
