import { userApi } from '../api';
import { useAuth } from '../auth/useAuth';
import { useFetch } from './useFetch';

/** GET /users/me — thông tin user hiện tại (id, transGroupId...). Chỉ fetch khi đã đăng nhập. */
export function useCurrentUser() {
	const { isAuthenticated } = useAuth();
	return useFetch(() => (isAuthenticated ? userApi.getMe() : Promise.resolve(null)), [isAuthenticated]);
}
