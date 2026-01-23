import DataListKv from '@/components/data-list-kv';
import type { DialogControl } from '@/components/dialogs/type';
import Wrapper from '@/components/dialogs/Wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import { LS_KEY_USER_LOGIN_TOKEN } from '@/consts';
import { UserPayloadContext, type UserPayload } from '@/contexts/UserPayloadContext';
import { req } from '@/lib/req';
import times, { formatDatetime } from '@/lib/times';
import { router } from '@/root';
import type { GameBound } from '@/types/GameBound';
import { UserRoleAdmin, UserRoleUser, type User } from '@/types/User';
import { CogIcon, InfoIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

async function getSelf() {
	const { data, error } = await req<User>('/user', 'get');
	return error === null ? data : undefined;
}

async function getSelfGameBound() {
	const { data, error } = await req<{ exists: boolean } & GameBound>('/user/game-bound', 'get');
	return error === null ? (data.exists ? data : undefined) : undefined;
}

function logout() {
	localStorage.removeItem(LS_KEY_USER_LOGIN_TOKEN);
	router.navigate({ to: '/lor' });
}

const adminPermissions = ['创建实例', '部署实例', '删除实例', '关闭服务器', '触发备份或归档'];
const defaultPermissions = ['一键创建', '开启服务器'];

function getRolePermissionDisplay(role: UserPayload['role']): Record<string, boolean> {
	let entries: [string, boolean][] = [];
	if (role === UserRoleUser)
		entries = adminPermissions
			.map(x => [x, false])
			.concat(defaultPermissions.map(x => [x, true])) as any;
	if (role === UserRoleAdmin)
		entries = adminPermissions.concat(defaultPermissions).map(x => [x, true]);

	return Object.fromEntries(entries);
}

export default function ProfileDialog(props: DialogControl) {
	const [user, setUser] = useState<User>();
	const [gameBound, setGameBound] = useState<GameBound>();
	const userPayload = useContext(UserPayloadContext);
	const [loading, setLoading] = useState(false);

	const permissionDisplay = useMemo(
		() => getRolePermissionDisplay(userPayload.role),
		[userPayload.role]
	);

	useEffect(() => {
		setLoading(true);
		Promise.all([
			getSelf().then(data => {
				if (data) setUser(data);
			}),
			getSelfGameBound().then(data => {
				if (data) setGameBound(data);
			})
		]).finally(() => setLoading(false));
	}, []);

	const [bindGameId, setBindGameId] = useState('');
	const [bindLoading, setBindLoading] = useState(false);
	const [bindPopover, setBindPopover] = useState(false);
	const [updateBindPopover, setUpdateBindPopover] = useState(false);
	const [deleteBindPopover, setDeleteBindPopover] = useState(false);
	const onBindSubmit = useCallback(async () => {
		setBindLoading(true);
		const { error } = await req('/user/game-bound', 'post', {
			gameId: bindGameId
		});
		setBindLoading(false);

		setBindPopover(false);

		if (error !== null) {
			toast.error('绑定失败：' + error);
			return;
		}

		setBindGameId('');
		toast.success('绑定成功');
		await refreshGameBound();
	}, [bindGameId]);

	const onBindUpdateSubmit = useCallback(async () => {
		setBindLoading(true);
		const { error } = await req('/user/game-bound', 'PATCH', {
			gameId: bindGameId
		});
		setBindLoading(false);
		setUpdateBindPopover(false);

		if (error !== null) {
			toast.error('无法修改：' + error);
			return;
		}

		setBindGameId('');
		toast.success('修改成功');
		await refreshGameBound();
	}, [bindGameId]);

	const refreshGameBound = useCallback(async () => {
		const data = await getSelfGameBound();
		setGameBound(data);
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
								{user.role === UserRoleUser && '普通用户'}{' '}
								{user.role === UserRoleAdmin && '超级用户'}
								<Popover>
									<PopoverTrigger asChild>
										<Button variant={'ghost'} size={'icon-xs'}>
											<InfoIcon size={12} />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-[200px]">
										<p>
											{user.role === UserRoleUser ? '普通用户' : '超级用户'}
											可以做什么？
										</p>
										<DataListKv data={permissionDisplay} />
									</PopoverContent>
								</Popover>
							</p>
						</div>
						<div className="flex flex-col gap-2">
							<div className="font-bold">游戏账号</div>
							<p>
								{gameBound === undefined && (
									<Popover open={bindPopover} onOpenChange={setBindPopover}>
										<PopoverTrigger asChild>
											<Button variant={'outline'}>立即绑定</Button>
										</PopoverTrigger>
										<PopoverContent>
											<p>请键入你的正版游戏名称，区分大小写。</p>
											<p className="text-red-800">
												提醒：请勿冒用不属于你的账号，查实直接封禁。如果你发现自己的账号已被占用，请及时向管理员反馈。
											</p>
											<form
												onSubmit={e => {
													e.preventDefault();
													onBindSubmit();
												}}
												className="flex items-center gap-3"
											>
												<Input
													value={bindGameId}
													onChange={e => setBindGameId(e.target.value)}
													placeholder="键入游戏名称"
												/>
												<Button type="submit" disabled={bindLoading}>
													绑定 {bindLoading && <Spinner />}
												</Button>
											</form>
										</PopoverContent>
									</Popover>
								)}
								{gameBound && (
									<>
										{gameBound.gameId}{' '}
										<Popover>
											<PopoverTrigger asChild>
												<Button variant={'ghost'} size={'icon-xs'}>
													<InfoIcon />
												</Button>
											</PopoverTrigger>
											<PopoverContent>
												<DataListKv
													data={{
														绑定时间: formatDatetime(
															gameBound.createdAt
														),
														更新时间: formatDatetime(
															gameBound.updatedAt
														),
														白名单: gameBound.whitelisted
													}}
												></DataListKv>
											</PopoverContent>
										</Popover>
										<Popover
											open={updateBindPopover}
											onOpenChange={setUpdateBindPopover}
										>
											<PopoverTrigger asChild>
												<Button variant={'ghost'} size={'icon-xs'}>
													<PencilIcon />
												</Button>
											</PopoverTrigger>
											<PopoverContent>
												<p>键入新的游戏名，更改绑定。</p>
												<form
													onSubmit={async e => {
														e.preventDefault();
														onBindUpdateSubmit();
													}}
													className="flex items-center gap-3"
												>
													<Input
														value={bindGameId}
														onChange={e =>
															setBindGameId(e.target.value)
														}
														placeholder="键入游戏名称"
													/>
													<Button type="submit" disabled={bindLoading}>
														更改 {bindLoading && <Spinner />}
													</Button>
												</form>
											</PopoverContent>
										</Popover>
										<Popover
											open={deleteBindPopover}
											onOpenChange={setDeleteBindPopover}
										>
											<PopoverTrigger asChild>
												<Button variant={'ghost'} size={'icon-xs'}>
													<TrashIcon />
												</Button>
											</PopoverTrigger>
											<PopoverContent>
												<p>
													确定要解除绑定该游戏名吗？一些需要白名单的操作将无法进行。
												</p>
												<Button
													variant={'destructive'}
													disabled={bindLoading}
													onClick={async () => {
														setBindLoading(true);
														const { error } = await req(
															'/user/game-bound',
															'delete'
														);
														setBindLoading(false);

														setDeleteBindPopover(false);

														if (error !== null) {
															toast.error('解绑失败：' + error);
															return;
														}

														toast.success('已解除绑定');
														await refreshGameBound();
													}}
												>
													解绑 {bindLoading && <Spinner />}
												</Button>
											</PopoverContent>
										</Popover>
									</>
								)}
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
											<Button
												onClick={logout}
												variant={'outline'}
												size={'sm'}
											>
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
