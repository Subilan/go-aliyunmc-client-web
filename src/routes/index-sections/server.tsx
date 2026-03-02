import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Item, ItemActions, ItemDescription, ItemTitle } from '@/components/ui/item';
import { Spinner } from '@/components/ui/spinner';
import { req } from '@/lib/req';
import times from '@/lib/times';
import { copy } from '@/lib/utils';
import { CopyIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import PlayerOnlineHistoryCard from './components/PlayerOnlineHistoryCard';

export type OssListItem = {
	name: string;
	size: number;
	lastModified: string;
};

async function listBackups() {
	const { data, error } = await req<OssListItem[]>(
		'/oss/list?target=backups&trimPrefix=1',
		'get'
	);
	return error === null ? data : [];
}

export default function IndexServerSection() {
	const [backupInfoLoading, setBackupInfoLoading] = useState(false);
	const [backupInfo, setBackupInfo] = useState<OssListItem[]>([]);

	const initialize = useCallback(async () => {
		setBackupInfoLoading(true);
		const loadedBackupInfo = await listBackups();
		setBackupInfoLoading(false);
		setBackupInfo(loadedBackupInfo);
	}, []);

	useEffect(() => {
		initialize();
	}, []);

	return (
		<>
			<div className="flex flex-col gap-5">
				<PlayerOnlineHistoryCard />
				<Card>
					<CardHeader>
						<CardTitle>备份文件</CardTitle>
						<CardDescription>
							共 {backupInfo.length} 个备份，总计{' '}
							{(
								backupInfo.reduce((a, x) => a + x.size, 0) /
								1024 /
								1024 /
								1024
							).toFixed(1)}{' '}
							GB
						</CardDescription>
					</CardHeader>
					<CardContent>
						{backupInfoLoading ? (
							<Spinner />
						) : (
							<div className="flex flex-col gap-3">
								{backupInfo.length
									? backupInfo
											.sort(
												(a, b) =>
													+new Date(b.lastModified) -
													+new Date(a.lastModified)
											)
											.map((info, i) => (
												<Item key={info.name} variant={'outline'}>
													<ItemTitle>
														{i === 0 && (
															<Badge variant={'secondary'}>
																最新
															</Badge>
														)}
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
																	times.formatDatetime(
																		info.lastModified
																	)
																)
															}
														>
															<CopyIcon /> 复制
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
