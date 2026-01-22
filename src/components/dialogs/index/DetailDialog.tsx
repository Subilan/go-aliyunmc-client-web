import DataListKv from '@/components/data-list-kv';
import type { DialogControl } from '@/components/dialogs/type';
import Wrapper from '@/components/dialogs/Wrapper';
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle
} from '@/components/ui/empty';
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import mchead from '@/lib/mchead';
import { req } from '@/lib/req';
import times from '@/lib/times';
import type { CommandExec } from '@/types/CommandExec';
import { ServerOffIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const dirNameMappings: Record<string, string> = {
	'/home/mc/server/archive': '总存档',
	'/home/mc/server/archive/world': '主世界',
	'/home/mc/server/archive/world_nether': '下界',
	'/home/mc/server/archive/world_the_end': '末地'
};

function DetailEmpty() {
	return (
		<Empty className="border">
			<EmptyMedia>
				<ServerOffIcon />
			</EmptyMedia>
			<EmptyHeader>
				<EmptyTitle>暂无信息</EmptyTitle>
				<EmptyDescription>没有可以提供此信息的实例</EmptyDescription>
			</EmptyHeader>
		</Empty>
	);
}

async function fetchServerBackups() {
	const { data, error } = await req<CommandExec[]>('/server/backups', 'get');

	return error === null ? data : undefined;
}

async function fetchServerQueryScreenfetch() {
	const { data, error } = await req<string>('/server/query?queryType=screenfetch', 'get');

	return error === null ? data.trimEnd() : undefined;
}

async function fetchServerQueryServerSizes() {
	const { data, error } = await req<string>('/server/query?queryType=get_server_sizes', 'get');

	return error === null
		? data
				.trimEnd()
				.split('\n')
				.map(x => {
					const pair = x.split('\t');
					return { size: pair[0], dir: pair[1] };
				})
		: undefined;
}

export type PublicServerProperties = {
	whiteList: boolean;
	viewDistance: number;
	simulationDistance: number;
	spawnProtection: number;
	onlineMode: boolean;
	difficulty: string;
	maxPlayers: number;
};

function hyphenToCamel(str: string) {
	return str.replace(/-([a-z])/g, (_, capture) => {
		return capture.toUpperCase();
	});
}

function parseServerProperties(raw: string): PublicServerProperties {
	const lines = raw.trimEnd().split('\n');

	return Object.fromEntries(
		lines
			.filter(x => x)
			.filter(x => !x.startsWith('#'))
			.map(x => {
				const entry = x.split('=').slice(0, 2) as [any, any];
				entry[0] = hyphenToCamel(entry[0]);
				if (entry[1].startsWith('"') && entry[1].endsWith('"')) {
					entry[1] = entry[1].slice(1, -1);
				} else if (/^\d+$/.test(entry[1])) {
					entry[1] = Number(entry[1]);
				} else if (entry[1] === 'true') {
					entry[1] = true;
				} else if (entry[1] === 'false') {
					entry[1] = false;
				}
				return entry;
			})
	);
}

async function fetchServerProperties() {
	const { data, error } = await req<string>(
		'/server/query?queryType=get_server_properties',
		'get'
	);

	return error === null ? parseServerProperties(data) : undefined;
}

type CachedPlayerItem = {
	name: string;
	uuid: string;
	isOp: boolean;
};

type OpItem = {
	uuid: string;
	name: string;
	level: number;
	bypassesPlayerLimit: boolean;
};

async function fetchCachedPlayers() {
	const { data, error } = await req<string>('/server/query?queryType=get_cached_players', 'get');

	return error === null
		? data === ''
			? []
			: (JSON.parse(data) as CachedPlayerItem[])
		: undefined;
}

async function fetchOps() {
	const { data, error } = await req<string>('/server/query?queryType=get_ops', 'get');

	return error === null ? (data === '' ? [] : (JSON.parse(data) as OpItem[])) : undefined;
}

export default function DetailDialog(props: DialogControl & { deployedInstanceRunning: boolean }) {
	const [backupInfo, setBackupInfo] = useState<CommandExec[]>([]);
	const [backupInfoLoading, setBackupInfoLoading] = useState(false);
	const [screenfetch, setScreenfetch] = useState('');
	const [screenfetchLoading, setScreenfetchLoading] = useState(false);
	const [sizes, setSizes] = useState<{ dir: string; size: string }[]>([]);
	const [sizesLoading, setSizesLoading] = useState(false);
	const [refreshedAt, setRefreshedAt] = useState('');
	const [serverProperties, setServerProperties] = useState<PublicServerProperties>();
	const [serverPropertiesLoading, setServerPropertiesLoading] = useState(false);
	const [cachedPlayers, setCachedPlayers] = useState<CachedPlayerItem[]>([]);
	const [cachedPlayersLoading, setCachedPlayersLoading] = useState(false);

	useEffect(() => {
		if (props.deployedInstanceRunning) {
			setScreenfetchLoading(true);
			setSizesLoading(true);
			setServerPropertiesLoading(true);

			Promise.all([
				fetchServerQueryScreenfetch()
					.then(data => {
						if (data) {
							setScreenfetch(data);
						}
					})
					.finally(() => setScreenfetchLoading(false)),
				fetchServerQueryServerSizes()
					.then(data => {
						if (data) {
							setSizes(data);
						}
					})
					.finally(() => setSizesLoading(false)),
				fetchServerProperties()
					.then(data => {
						if (data) {
							setServerProperties(data);
						}
					})
					.finally(() => setServerPropertiesLoading(false)),
				fetchOps()
					.then(data => {
						if (data) {
							const opNames = Object.fromEntries(
								data.map(x => [x.name, true])
							) as Record<string, true>;

							fetchCachedPlayers().then(players => {
								if (players) {
									for (const p of players) {
										p.isOp = opNames[p.name] || false;
									}
									setCachedPlayers(players);
								}
							});
						}
					})
					.finally(() => setCachedPlayersLoading(false))
			]).finally(() => setRefreshedAt(times.formatDatetime(new Date())));
		}
	}, [props.deployedInstanceRunning]);

	useEffect(() => {
		setBackupInfoLoading(true);
		fetchServerBackups()
			.then(data => {
				if (data) {
					setBackupInfo(data);
				}
			})
			.finally(() => setBackupInfoLoading(false));
	}, []);

	const tabs = useMemo(
		() => [
			{
				value: 'term',
				label: '周目介绍'
			},
			{
				value: 'properties',
				label: 'server.properties'
			},
			{
				value: 'backupInfo',
				label: '备份情况'
			},
			{
				value: 'players',
				label: (
					<>
						周目玩家
						{props.deployedInstanceRunning &&
							cachedPlayers &&
							` (${cachedPlayers.length})`}
					</>
				)
			},
			{
				value: 'screenfetch',
				label: 'Screenfetch'
			},
			{
				value: 'sizes',
				label: '存档大小'
			}
		],
		[props.deployedInstanceRunning, cachedPlayers]
	);

	const [tabValue, setTabValue] = useState('term');

	return (
		<Wrapper
			open={props.open}
			setOpen={props.setOpen}
			title="周目信息"
			className="lg:max-w-175"
		>
			{refreshedAt.length > 0 && <p>数据更新于 {refreshedAt}</p>}
			<Tabs value={tabValue} onValueChange={setTabValue}>
				<Select defaultValue={tabValue} onValueChange={value => setTabValue(value)}>
					<SelectTrigger className="max-w-45 mb-2 lg:hidden">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{tabs.map(t => (
							<SelectItem value={t.value} key={t.value}>
								{t.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<TabsList className="mb-2 hidden lg:block">
					{tabs.map(t => (
						<TabsTrigger value={t.value} key={t.value}>
							{t.label}
						</TabsTrigger>
					))}
				</TabsList>
				<TabsContent value="term">
					<p>暂无周目介绍。</p>
				</TabsContent>
				<TabsContent value="properties">
					{props.deployedInstanceRunning ? (
						serverPropertiesLoading ? (
							<Spinner />
						) : (
							serverProperties && (
								<DataListKv
									grid
									border
									data={{
										'Java 版本': 'Zulu 21',
										游戏版本: '1.21.11',
										服务端: 'Paper',
										难度: serverProperties.difficulty,
										白名单: serverProperties.whiteList,
										正版验证: serverProperties.onlineMode,
										出生点保护: serverProperties.spawnProtection,
										最大玩家: serverProperties.maxPlayers,
										模拟距离: serverProperties.simulationDistance,
										视距: serverProperties.viewDistance
									}}
								/>
							)
						)
					) : (
						<DetailEmpty />
					)}
				</TabsContent>
				<TabsContent value="backupInfo">
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
										</Item>
									))
								: '暂无备份'}
						</div>
					)}
				</TabsContent>
				<TabsContent value="players">
					<div className="flex flex-col gap-3">
						{props.deployedInstanceRunning ? (
							cachedPlayersLoading ? (
								<Spinner />
							) : (
								<>
									<p>此处列出了加入过此周目的所有玩家。</p>
									{cachedPlayers.map(player => (
										<Item variant={'outline'} key={player.uuid}>
											<ItemMedia>
												<img
													draggable="false"
													src={mchead(player.uuid)}
													className="h-[40px] w-[40px]"
												/>
											</ItemMedia>
											<ItemContent>
												<ItemTitle>{player.name}</ItemTitle>
												<ItemDescription>
													{player.isOp ? 'Op' : '普通玩家'}
												</ItemDescription>
											</ItemContent>
										</Item>
									))}
								</>
							)
						) : (
							<DetailEmpty />
						)}
					</div>
				</TabsContent>
				<TabsContent value="screenfetch">
					{props.deployedInstanceRunning ? (
						screenfetchLoading ? (
							<Spinner />
						) : (
							<pre className="whitespace-pre-wrap border border-neutral-200 rounded-lg p-3">
								<code className="w-full block">{screenfetch}</code>
							</pre>
						)
					) : (
						<DetailEmpty />
					)}
				</TabsContent>
				<TabsContent value="sizes">
					{props.deployedInstanceRunning ? (
						sizesLoading ? (
							<Spinner />
						) : (
							<div className="flex flex-col gap-3">
								{sizes.map(size => (
									<Item key={size.dir} variant={'outline'}>
										{Object.keys(dirNameMappings).includes(size.dir) ? (
											<>
												<ItemTitle>{dirNameMappings[size.dir]}</ItemTitle>
												<ItemDescription>{size.dir}</ItemDescription>
											</>
										) : (
											<ItemTitle>{size.dir}</ItemTitle>
										)}
										<div className="flex-1" />
										<div>{size.size}</div>
									</Item>
								))}
							</div>
						)
					) : (
						<DetailEmpty />
					)}
				</TabsContent>
			</Tabs>
		</Wrapper>
	);
}
