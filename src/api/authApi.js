import axiosClient from './axiosClient';
import { ENDPOINTS } from './endpoints';

// Tất cả hàm trả về `result` của ApiResponse (đã bóc ở interceptor).
export const authApi = {
	// Google vừa đăng nhập vừa tự tạo tài khoản; `credential` là Google ID token.
	loginSocial: (credential) =>
		axiosClient.post(ENDPOINTS.auth.social('google'), { credential }, { skipAuth: true }),
	// Không body: backend đọc refresh cookie + access token trong header.
	logout: () => axiosClient.post(ENDPOINTS.auth.logout),
	introspect: (token) =>
		axiosClient.post(ENDPOINTS.auth.introspect, { token }, { skipAuth: true }),
};
