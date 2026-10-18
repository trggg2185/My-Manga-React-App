import { createContext, useCallback, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { storage } from '../utils/storage';
import { getRoles } from '../utils/jwt';

// eslint-disable-next-line react-refresh/only-export-components -- context dùng chung với provider cho gọn
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [token, setToken] = useState(() => storage.getAccessToken());

	const login = useCallback(async (credentials) => {
		const data = await authService.login(credentials);
		setToken(data.token);
		return data;
	}, []);

	const logout = useCallback(async () => {
		await authService.logout();
		setToken(null);
	}, []);

	const roles = useMemo(() => getRoles(token), [token]);

	const value = useMemo(
		() => ({
			token,
			roles,
			isAuthenticated: Boolean(token),
			hasRole: (...names) => names.some((name) => roles.includes(name)),
			login,
			logout,
		}),
		[token, roles, login, logout],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
