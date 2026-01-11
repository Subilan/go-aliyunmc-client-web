import DataListKv from '@/components/data-list-kv';
import type { DialogControl } from '@/components/dialogs/type';
import Wrapper from '@/components/dialogs/Wrapper';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import { LS_KEY_USER_LOGIN_TOKEN } from '@/consts';
import { UserPayloadContext, type UserPayload } from '@/contexts/UserPayloadContext';
import { req } from '@/lib/req';
import times from '@/lib/times';
import { router } from '@/root';
import type { User } from '@/types/User';
import { InfoIcon } from 'lucide-react';
import { useContext, useEffect, useMemo, useState } from 'react';

async function getSelf() {
	const { data, error } = await req<User>('/user', 'get');
	return error === null ? data : undefined;
}

function logout() {
	localStorage.removeItem(LS_KEY_USER_LOGIN_TOKEN);
	router.navigate({ to: '/lor' });
}

const adminPermissions = ['创建实例', '部署实例', '删除实例', '关闭服务器', '触发备份或归档'];
const defaultPermissions = ['一键创建', '开启服务器'];

function getRolePermissionDisplay(role: UserPayload['role']): Record<string, boolean> {
	let entries: [string, boolean][] = [];
	if (role === 'user') entries = adminPermissions.map(x => [x, false]).concat(defaultPermissions.map(x => [x, true])) as any;
	if (role === 'admin') entries = adminPermissions.concat(defaultPermissions).map(x => [x, true]);

	return Object.fromEntries(entries);
}

export default function ProfileDialog(props: DialogControl) {
	const [user, setUser] = useState<User>();
	const userPayload = useContext(UserPayloadContext);
	const [loading, setLoading] = useState(false);

	const permissionDisplay = useMemo(() => getRolePermissionDisplay(userPayload.role), [userPayload.role]);

	useEffect(() => {
		setLoading(true);
		getSelf()
			.then(data => {
				if (data) setUser(data);
			})
			.finally(() => setLoading(false));
	}, []);

	return (
		<Wrapper open={props.open} setOpen={props.setOpen} title="个人资料">
			{loading ? (
				<Spinner />
			) : (
				user && (
					<div className="flex flex-col gap-5">
						<div className="flex flex-col gap-2">
							<div className="font-bold">用户名</div>
							<p>{user.username}</p>
						</div>
						<div className="flex flex-col gap-2">
							<div className="font-bold">注册时间</div>
							<p>{times.formatDatetime(user.createdAt)}</p>
						</div>
						<div className="flex flex-col gap-2">
							<div className="font-bold">权限组</div>
							<p>
								{user.role === 'user' && '普通用户'} {user.role === 'admin' && '超级用户'}
								<Popover>
									<PopoverTrigger asChild>
										<Button variant={'ghost'} size={'icon-xs'}>
											<InfoIcon size={12} />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-[200px]">
										<p>{user.role === 'user' ? '普通用户' : '超级用户'}可以做什么？</p>
										<DataListKv data={permissionDisplay} />
									</PopoverContent>
								</Popover>
							</p>
						</div>
						<div className="flex flex-col gap-2">
							<div className="font-bold">操作</div>
							<div className="flex gap-2">
								<Popover>
									<PopoverTrigger asChild>
										<Button variant={'outline'}>退出登录</Button>
									</PopoverTrigger>
									<PopoverContent className="max-w-[200px]">
										<p>确定要退出登录吗？</p>
										<div className="flex justify-end">
											<Button onClick={logout} variant={'outline'} size={'sm'}>
												确定
											</Button>
										</div>
									</PopoverContent>
								</Popover>
							</div>
						</div>
					</div>
				)
			)}
		</Wrapper>
	);
}
