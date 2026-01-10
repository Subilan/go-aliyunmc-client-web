import type { DialogControl } from '@/components/dialogs/type';
import Wrapper from '@/components/dialogs/Wrapper';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import { LS_KEY_USER_LOGIN_TOKEN } from '@/consts';
import { UserPayloadContext } from '@/contexts/UserPayloadContext';
import { req } from '@/lib/req';
import times from '@/lib/times';
import { router } from '@/root';
import type { User } from '@/types/User';
import { useContext, useEffect, useState } from 'react';

async function getSelf() {
	const { data, error } = await req<User>('/user', 'get');
	return error === null ? data : undefined;
}

function logout() {
	localStorage.removeItem(LS_KEY_USER_LOGIN_TOKEN);
	router.navigate({ to: '/lor' });
}

export default function ProfileDialog(props: DialogControl) {
	const [user, setUser] = useState<User>();
	const userPayload = useContext(UserPayloadContext);
	const [loading, setLoading] = useState(false);

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
								{userPayload.role === 'user' && '普通用户'} {userPayload.role === 'admin' && '超级用户'}
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
