import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { userApi } from '../api';
import { useAuth } from '../auth/useAuth';

// Store dùng chung: mọi component gọi useCurrentUser nhận cùng dữ liệu,
// nhờ vậy avatar trên header đổi ngay sau khi cập nhật hồ sơ.
let state = { data: null, error: null, loading: true };
let inFlight = null;
const listeners = new Set();

function emit(next) {
	state = { ...state, ...next };
	listeners.forEach((listener) => listener());
}

function subscribe(listener) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

function fetchMe() {
	if (inFlight) return inFlight;
	emit({ loading: true, error: null });
	inFlight = userApi
		.getMe()
		.then((data) => {
			emit({ data });
			return data;
		})
		.catch((error) => {
			emit({ error });
			throw error;
		})
		.finally(() => {
			inFlight = null;
			emit({ loading: false });
		});
	return inFlight;
}

/** GET /users/me — thông tin user hiện tại, dùng chung cho header và các trang. */
export function useCurrentUser() {
	const { isAuthenticated } = useAuth();
	const snapshot = useSyncExternalStore(subscribe, () => state);

	useEffect(() => {
		if (isAuthenticated) fetchMe().catch(() => {});
		else emit({ data: null, error: null, loading: false });
	}, [isAuthenticated]);

	const reload = useCallback(() => fetchMe().catch(() => {}), []);

	return {
		data: isAuthenticated ? snapshot.data : null,
		error: isAuthenticated ? snapshot.error : null,
		loading: isAuthenticated && snapshot.loading,
		reload,
	};
}
