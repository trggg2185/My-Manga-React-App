import { groupApi } from '../api';
import { useAuth } from '../auth/useAuth';
import { useFetch } from './useFetch';

/**
 * GET /users/me/transgroups — nhóm của user hiện tại.
 * data = { transGroup?, status: 'LEADER'|'MEMBER'|'PENDING_REQUEST'|'NONE' }
 * transGroup chỉ có khi status là LEADER hoặc MEMBER.
 */
export function useMyGroup() {
	const { isAuthenticated } = useAuth();
	return useFetch(
		() => (isAuthenticated ? groupApi.getMine() : Promise.resolve(null)),
		[isAuthenticated],
	);
}
