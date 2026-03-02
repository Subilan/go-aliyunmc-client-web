import { useState } from 'react';

export default function useStateWithLoading<T>(initialValue: T) {
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState(initialValue);
	return {
		loading,
		setLoading,
		data,
		setData
	};
}
