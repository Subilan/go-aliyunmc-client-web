import { useCallback, useEffect } from 'react';

export default function useBgRefresh(refresh: () => void | Promise<void>) {
	const cb = useCallback(
		(_: Event) => {
			if (document.visibilityState === 'visible') {
				console.log('triggered refresh')
				refresh();
			}
		},
		[refresh]
	);

	useEffect(() => {
		window.addEventListener('visibilitychange', cb);

		return () => window.removeEventListener('visibilitychange', cb);
	}, []);
}
