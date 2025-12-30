import { LS_KEY_USER_LOGIN_TOKEN } from '@/consts';
import { type UserPayload, UserPayloadContext } from '@/contexts/UserPayloadContext';
import { useLocalStorage } from '@uidotdev/usehooks';
import { isAuthenticated, req } from '@/lib/req';
import { IndexRoute } from '@/routes';
import { LoginRoute } from '@/routes/lor';
import { createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { PreviewRoute } from '@/routes/preview';

export const RootRoute = createRootRoute({});

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
}

const routeTree = RootRoute.addChildren([IndexRoute, LoginRoute, PreviewRoute]);

const router = createRouter({ routeTree });

export function Root() {
	const [userPayload, setUserPayload] = useState<UserPayload>({
		username: '',
		user_id: 0
	});

	const checkAndFetchUserPayload = useCallback(async () => {
		if (!(await isAuthenticated())) {
			return;
		}

		const { data: payload, error } = await req('/auth/get-payload', 'GET');

		if (error !== null) {
			console.warn('获取用户凭据失败');
			console.warn(error);
			return;
		}

		return payload;
	}, []);

	const [userLoginToken] = useLocalStorage(LS_KEY_USER_LOGIN_TOKEN);

	useEffect(() => {
		checkAndFetchUserPayload().then(payload => setUserPayload(payload));
	}, [userLoginToken]);

	useEffect(() => {
		console.log('user payload updated: ', userPayload);
	}, [userPayload]);

	return (
		<>
			<Toaster
				toastOptions={{
					style: {
						padding: '8px 13px'
					}
				}}
			/>
			<UserPayloadContext.Provider value={userPayload}>
				<RouterProvider router={router} />
			</UserPayloadContext.Provider>
		</>
	);
}

export default Root;
