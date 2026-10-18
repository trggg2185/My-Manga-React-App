import { useCallback, useEffect, useState } from 'react';

/**
 * Fetch dữ liệu kèm trạng thái loading/error/reload — dùng chung cho mọi trang.
 * @param {() => Promise<any>} fetcher
 * @param {Array} deps
 */
export function useFetch(fetcher, deps = []) {
	const [data, setData] = useState(null);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);
	const [reloadKey, setReloadKey] = useState(0);

	const reload = useCallback(() => setReloadKey((k) => k + 1), []);

	useEffect(() => {
		let active = true;
		/* eslint-disable react-hooks/set-state-in-effect -- hook dùng chung: cố tình reset trạng thái trước mỗi lần fetch */
		setLoading(true);
		setError(null);
		/* eslint-enable react-hooks/set-state-in-effect */

		fetcher()
			.then((result) => active && setData(result))
			.catch((err) => active && setError(err))
			.finally(() => active && setLoading(false));

		return () => {
			active = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [...deps, reloadKey]);

	return { data, error, loading, reload };
}
