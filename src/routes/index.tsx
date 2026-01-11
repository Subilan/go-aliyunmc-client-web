import DetailDialog from '@/components/dialogs/index/DetailDialog';
import ProfileDialog from '@/components/dialogs/index/ProfileDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPayloadContext } from '@/contexts/UserPayloadContext';
import { isAuthenticated, req } from '@/lib/req';
import { RootRoute, router } from '@/root';
import IndexDataSection from '@/routes/index-sections/data';
import IndexMainSection from '@/routes/index-sections/main';
import type { Instance, InstanceStatus } from '@/types/Instance';
import type { ServerInfo } from '@/types/ServerInfo';
import { createRoute, redirect } from '@tanstack/react-router';
import { useContext, useEffect, useState } from 'react';

export const IndexRoute = createRoute({
	path: '/',
	component: Index,
	getParentRoute: () => RootRoute,
	async beforeLoad() {
		if (!(await isAuthenticated())) {
			throw redirect({ to: '/lor' });
		}
	},
	async loader() {
		return {
			instance: await fetchActiveOrLatestInstance(),
			instanceStatus: await fetchActiveInstanceStatus(),
			activeDeploymentTaskStatus: await fetchActiveDeploymentTaskStatus(),
			serverInfo: await fetchServerInfo()
		};
	}
});

export async function fetchServerInfo() {
	const { data, error } = await req<ServerInfo>('/server/info', 'get');

	return error === null ? data : undefined;
}

export async function fetchActiveDeploymentTaskStatus() {
	const { data, error } = await req('/task?type=instance_deployment', 'get');

	return error === null ? data.status : undefined;
}

export async function fetchActiveOrLatestInstance() {
	const { data, error } = await req<Instance>('/instance', 'GET');

	return error === null ? data : undefined;
}

export async function fetchActiveInstanceStatus() {
	const { data, error } = await req<InstanceStatus>('/instance/status', 'get');

	return error === null ? data : undefined;
}

export default function Index() {
	const userPayload = useContext(UserPayloadContext);

	useEffect(() => {
		if (!userPayload.valid && userPayload.loaded) {
			router.navigate({ to: '/lor' });
		}
	}, [userPayload]);

	const [serverDetailDialog, setServerDetailDialog] = useState(false);
	const [profileDialog, setProfileDialog] = useState(false);

	const [tabValue, setTabValue] = useState('main');

	return (
		<>
			<ProfileDialog open={profileDialog} setOpen={setProfileDialog} />
			<div className="max-w-175 mx-auto my-16">
				<div className="flex flex-col gap-5">
					<div className="flex items-center gap-3">
						<h1 className="text-3xl">Hello, {userPayload.username}</h1>
						<div className="flex-1" />
						{tabValue === 'main' && (
							<Button variant={'outline'} onClick={() => setServerDetailDialog(true)}>
								周目信息
							</Button>
						)}
						<Button onClick={() => setProfileDialog(true)}>我的账号</Button>
					</div>
					<Tabs defaultValue="main" onValueChange={v => setTabValue(v)}>
						<TabsList className='mb-2'>
							<TabsTrigger value="main">服务器</TabsTrigger>
							<TabsTrigger value="analytics">统计信息</TabsTrigger>
						</TabsList>
						<TabsContent value="main">
							<IndexMainSection serverDetailDialog={serverDetailDialog} setServerDetailDialog={setServerDetailDialog} />
						</TabsContent>
						<TabsContent value="analytics">
							<IndexDataSection/>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</>
	);
}
