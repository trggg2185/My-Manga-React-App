import axiosClient from './axiosClient';
import { ENDPOINTS } from './endpoints';

// Tất cả hàm trả về `result` của ApiResponse (đã bóc ở interceptor).
export const authApi = {
	register: (payload) => axiosClient.post(ENDPOINTS.auth.register, payload, { skipAuth: true }),
	login: (payload) => axiosClient.post(ENDPOINTS.auth.login, payload, { skipAuth: true }),
	logout: (payload) => axiosClient.post(ENDPOINTS.auth.logout, payload),
	refresh: (payload) => axiosClient.post(ENDPOINTS.auth.refresh, payload, { skipAuth: true }),
	introspect: (payload) => axiosClient.post(ENDPOINTS.auth.introspect, payload, { skipAuth: true }),
};
