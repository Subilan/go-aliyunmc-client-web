import { LS_KEY_USER_LOGIN_TOKEN } from '@/consts';
import { type UserPayload, UserPayloadContext } from '@/contexts/UserPayloadContext';
import { useLocalStorage } from '@uidotdev/usehooks';
import { isAuthenticated, req } from '@/lib/req';
import { IndexRoute } from '@/routes';
import { LoginRoute } from '@/routes/lor';
import { createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import { useContext, useEffect, useState } from 'react';
import { PreviewRoute } from '@/routes/preview';
import ErrorPage from '@/error';
import { ErrorBoundary } from 'react-error-boundary';
import { StreamManagerContext } from '@/contexts/StreamManagerContext';
import { Toaster } from '@/components/ui/sonner';

export const RootRoute = createRootRoute({
	errorComponent: ErrorPage
});

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
}

const routeTree = RootRoute.addChildren([IndexRoute, LoginRoute, PreviewRoute]);

export const router = createRouter({ routeTree });

const EmptyUnloadedUserPayload = {
	username: '',
	user_id: 0,
	valid: false,
	loaded: false
};

const EmptyLoadedUserPayload = {
	username: '',
	user_id: 0,
	valid: false,
	loaded: true
};

async function checkAndFetchUserPayload() {
	if (!(await isAuthenticated())) {
		return EmptyLoadedUserPayload;
	}

	const { data: payload, error } = await req('/auth/payload', 'GET');

	if (error !== null) {
		console.warn('获取用户凭据失败');
		console.warn(error);
		return EmptyLoadedUserPayload;
	}

	return { ...payload, valid: true, loaded: true };
}

export function Root() {
	const [userPayload, setUserPayload] = useState<UserPayload>(EmptyUnloadedUserPayload);

	const [userLoginToken] = useLocalStorage<string>(LS_KEY_USER_LOGIN_TOKEN, '');

	useEffect(() => {
		checkAndFetchUserPayload().then(payload => setUserPayload(payload));
	}, [userLoginToken]);

	useEffect(() => {
		console.log('user payload updated: ', userPayload);
	}, [userPayload]);

	const streamManager = useContext(StreamManagerContext);

	useEffect(() => {
		streamManager.listen(userLoginToken);
		return () => streamManager.abort();
	}, [userLoginToken]);

	return (
		<ErrorBoundary FallbackComponent={ErrorPage}>
			<Toaster position="top-center" duration={2000} />
			<UserPayloadContext.Provider value={userPayload}>
				<RouterProvider router={router} />
			</UserPayloadContext.Provider>
		</ErrorBoundary>
	);
}

export default Root;
