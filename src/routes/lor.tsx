import { RootRoute } from '@/root';
import { createRoute, redirect } from '@tanstack/react-router';
import { useCallback, useState } from 'react';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from 'lucide-react';
import { isAuthenticated, req } from '@/lib/req';
import toast from 'react-hot-toast';
import { Spinner } from '@/components/ui/spinner';
import { LS_KEY_USER_LOGIN_TOKEN } from '@/consts';
import { useLocalStorage } from '@uidotdev/usehooks';

export const LoginRoute = createRoute({
	path: '/lor',
	component: Lor,
	getParentRoute: () => RootRoute,
	async beforeLoad() {
		if (await isAuthenticated()) {
			toast('你已经登录了', { icon: '😄' });
			throw redirect({ to: '/' });
		}
	}
});

const loginFormSchema = z.object({
	username: z.string(),
	password: z.string(),
	keepAlive: z.string().transform(v => {
		if (v === 'true') return true;
		if (v === 'false') return false;
		throw 'invalid input';
	})
});

type LoginFormPayload = z.infer<typeof loginFormSchema>;

const registerFormSchema = z
	.object({
		username: z
			.string()
			.regex(/^[A-Za-z0-9][A-Za-z0-9_]*$/, {
				error: '只能包含英文字母、数字或下划线，且不以下划线开头'
			})
			.min(4, {
				error: '至少 4 位'
			})
			.max(20, {
				error: '至多 20 位'
			}),
		password: z.string().min(6, {
			error: '至少 6 位'
		}),
		passwordConfirm: z.string().min(6, {
			error: '至少 6 位'
		})
	})
	.refine(data => data.password === data.passwordConfirm, {
		path: ['passwordConfirm'],
		error: '两次密码输入不一致'
	});

type RegisterFormPayload = z.infer<typeof registerFormSchema>;

export default function Lor() {
	const [lorType, setLorType] = useState<'login' | 'register'>('login');

	const [_, setUserLoginToken] = useLocalStorage(LS_KEY_USER_LOGIN_TOKEN);

	const loginForm = useForm<z.input<typeof loginFormSchema>, any, z.output<typeof loginFormSchema>>({
		resolver: zodResolver(loginFormSchema),
		defaultValues: {
			username: '',
			password: '',
			keepAlive: 'false'
		}
	});

	const registerForm = useForm<z.input<typeof registerFormSchema>, any, z.output<typeof registerFormSchema>>({
		resolver: zodResolver(registerFormSchema),
		defaultValues: {
			username: '',
			password: '',
			passwordConfirm: ''
		},
		mode: 'onBlur'
	});

	const [loginLoading, setLoginLoading] = useState(false);
	const onLoginFormSubmit = useCallback(async (values: LoginFormPayload) => {
		setLoginLoading(true);
		const { data: token, error } = await req('/auth/token', 'POST', {
			username: values.username,
			password: values.password,
			keepAlive: values.keepAlive
		});
		setLoginLoading(false);

		if (error !== null) {
			toast.error(error);
			return;
		}

		setUserLoginToken(token);
		toast.success('已登录');
	}, []);

	const [registerLoading, setRegisterLoading] = useState(false);
	const onRegisterFormSubmit = useCallback(async (values: RegisterFormPayload) => {
		setRegisterLoading(true);
		const { error } = await req('/user', 'POST', {
			username: values.username,
			password: values.password
		});
		setRegisterLoading(false);

		if (error !== null) {
			toast.error(error);
			return;
		}

		toast.success('已创建用户');
		setLorType('login');
	}, []);

	return (
		<>
			<div className="flex h-dvh w-dvw items-center justify-center">
				<Card className="w-sm">
					<CardHeader>
						<CardTitle>Player Web Client {lorType === 'login' ? 'Login' : 'Register'}</CardTitle>
						<CardDescription>玩家{lorType === 'login' ? '登录' : '注册'}</CardDescription>
					</CardHeader>
					<CardContent>
						<form style={{ display: lorType === 'register' ? 'none' : 'initial' }} onSubmit={loginForm.handleSubmit(onLoginFormSubmit)}>
							<FieldGroup>
								<Controller
									control={loginForm.control}
									name="username"
									render={({ field }) => (
										<Field>
											<FieldLabel htmlFor="loginUsername">用户名</FieldLabel>
											<Input autoComplete="off" id="loginUsername" placeholder="用户名" {...field} />
										</Field>
									)}
								/>
								<Controller
									control={loginForm.control}
									name="password"
									render={({ field }) => (
										<Field>
											<FieldLabel htmlFor="loginPassword">密码</FieldLabel>
											<Input autoComplete="off" id="loginPassword" placeholder="密码" type="password" {...field} />
										</Field>
									)}
								/>
								<Controller
									control={loginForm.control}
									name="keepAlive"
									render={({ field }) => (
										<Field>
											<div className="flex items-start gap-3">
												<Checkbox id="loginKeepalive" onCheckedChange={v => field.onChange(v ? 'true' : 'false')} />
												<div className="grid gap-2">
													<Label htmlFor="loginKeepalive">保持登录状态</Label>
												</div>
											</div>
										</Field>
									)}
								/>
							</FieldGroup>
							<div className="mt-7 flex justify-end gap-3">
								<Button type="button" variant={'secondary'} onClick={() => setLorType('register')}>
									创建账号
								</Button>
								<Button disabled={loginLoading}>登录 {loginLoading ? <Spinner /> : <ArrowRightIcon />}</Button>
							</div>
						</form>
						<form style={{ display: lorType === 'login' ? 'none' : 'initial' }} onSubmit={registerForm.handleSubmit(onRegisterFormSubmit)}>
							<FieldGroup>
								<Controller
									control={registerForm.control}
									name="username"
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor="registerUsername">用户名</FieldLabel>
											<Input autoComplete="off" id="registerUsername" placeholder="用户名" {...field} />
											{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
										</Field>
									)}
								/>
								<Controller
									control={registerForm.control}
									name="password"
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor="registerPassword">密码</FieldLabel>
											<Input autoComplete="off" id="registerPassword" placeholder="请使用高强度密码" type="password" {...field} />
											{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
										</Field>
									)}
								/>
								<Controller
									control={registerForm.control}
									name="passwordConfirm"
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor="registerPasswordConfirm">确认密码</FieldLabel>
											<Input autoComplete="off" id="registerPasswordConfirm" placeholder="再次输入密码" type="password" {...field} />
											{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
										</Field>
									)}
								/>
							</FieldGroup>
							<div className="mt-7 flex justify-end gap-3">
								<Button type="button" variant={'link'} onClick={() => setLorType('login')}>
									已有账号？
								</Button>
								<Button disabled={registerLoading}>{registerLoading && <Spinner />}创建账号</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</>
	);
}
