import { authApi } from '../api/authApi';
import { storage } from '../utils/storage';

export const authService = {
	async login({ username, password }) {
		const data = await authApi.login({ username, password }); // { authenticated, token }
		storage.setAccessToken(data.token);
		return data;
	},

	async logout() {
		const token = storage.getAccessToken();
		try {
			if (token) await authApi.logout({ token });
		} finally {
			storage.clearAccessToken();
		}
	},

	async refresh() {
		const token = storage.getAccessToken();
		if (!token) return null;
		const data = await authApi.refresh({ token }); // { authenticated, token }
		storage.setAccessToken(data.token);
		return data;
	},
};
