import { useCallback, useState } from 'react';

/** Bọc một hành động async (POST/PATCH/DELETE) + trạng thái loading/error/thông báo. */
export function useMutation() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [message, setMessage] = useState(null);

	const run = useCallback(async (action, successMessage) => {
		setLoading(true);
		setError(null);
		setMessage(null);
		try {
			const result = await action();
			if (successMessage) setMessage(successMessage);
			return result;
		} catch (err) {
			setError(err);
			throw err;
		} finally {
			setLoading(false);
		}
	}, []);

	return { run, loading, error, message, setMessage };
}
