import { authApi } from '../api/authApi';

export const authService = {
	login: (credential) => authApi.loginSocial(credential),
	logout: () => authApi.logout(),
};
