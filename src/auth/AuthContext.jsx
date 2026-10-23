import {
	createContext,
	useCallback,
	useEffect,
	useMemo,
	useState,
	useSyncExternalStore,
} from 'react';
import { authService } from '../services/authService';
import {
	clearSession,
	getAccessToken,
	refreshSession,
	setSession,
	subscribeSession,
} from './session';
import { getRoles } from '../utils/jwt';

// eslint-disable-next-line react-refresh/only-export-components -- context dùng chung với provider cho gọn
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const token = useSyncExternalStore(subscribeSession, getAccessToken, () => null);
	const [initializing, setInitializing] = useState(true);

	// Khôi phục phiên từ refresh cookie khi mở app.
	useEffect(() => {
		let cancelled = false;
		refreshSession()
			.catch(() => {})
			.finally(() => {
				if (!cancelled) setInitializing(false);
			});
		return () => {
			cancelled = true;
		};
	}, []);

	const login = useCallback(async (credential) => {
		const data = await authService.login(credential);
		setSession(data);
		return data;
	}, []);

	const logout = useCallback(async () => {
		try {
			await authService.logout();
		} catch {
			// Mất mạng vẫn đăng xuất phía client; cookie sẽ hết hạn ở lần refresh sau.
		} finally {
			clearSession();
		}
	}, []);

	const roles = useMemo(() => getRoles(token), [token]);

	const value = useMemo(
		() => ({
			token,
			roles,
			initializing,
			isAuthenticated: Boolean(token),
			hasRole: (...names) => names.some((name) => roles.includes(name)),
			login,
			logout,
		}),
		[token, roles, initializing, login, logout],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
