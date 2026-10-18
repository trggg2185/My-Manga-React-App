import axios from 'axios';
import { storage } from '../utils/storage';
import { ENDPOINTS } from './endpoints';

// Lỗi API đã chuẩn hoá: dùng `code` (không phải HTTP status) để xử lý riêng.
export class ApiError extends Error {
	constructor(code, message) {
		super(message || 'Đã có lỗi xảy ra!');
		this.name = 'ApiError';
		this.code = code || '9001';
	}
}

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/mymangaapp';

const axiosClient = axios.create({
	baseURL,
	headers: { 'Content-Type': 'application/json' },
	timeout: 20000,
});

// Config cho request multipart (axios tự thêm boundary trong browser).
export const multipart = () => ({ headers: { 'Content-Type': 'multipart/form-data' } });

/* ---------- REQUEST: gắn Bearer token ---------- */
axiosClient.interceptors.request.use((config) => {
	const token = storage.getAccessToken();
	if (token && !config.skipAuth) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

/* ---------- RESPONSE: bóc ApiResponse<T>, chỉ trả về `result` ---------- */
let isRefreshing = false;
let pendingQueue = [];

axiosClient.interceptors.response.use(
	(response) => {
		const body = response.data;
		if (body && typeof body === 'object' && 'code' in body) {
			if (body.code !== '0000') throw new ApiError(body.code, body.message);
			return body.result; // void (result bị lược bỏ) => undefined
		}
		return body;
	},
	async (error) => {
		const { response, config } = error;
		if (!response) throw new ApiError('NETWORK', 'Lỗi kết nối mạng!');

		const body = response.data || {};
		const code = body.code || String(response.status);
		const originalRequest = config;

		/* --- 401/1001: thử refresh token 1 lần rồi gửi lại request --- */
		const isAuthEntry =
			config.url !== ENDPOINTS.auth.refresh && config.url !== ENDPOINTS.auth.login;
		if (response.status === 401 && !originalRequest._retry && isAuthEntry) {
			if (isRefreshing) {
				// Đợi request refresh đang chạy xong rồi gửi lại
				return new Promise((resolve, reject) => {
					pendingQueue.push({ resolve, reject, config: originalRequest });
				});
			}

			originalRequest._retry = true;
			isRefreshing = true;

			try {
				const token = storage.getAccessToken();
				const res = await axios.post(`${baseURL}${ENDPOINTS.auth.refresh}`, { token });
				const newToken = res.data?.result?.token;
				if (!newToken) throw new Error('Missing refreshed token');

				storage.setAccessToken(newToken);
				pendingQueue.forEach((p) => {
					p.config.headers.Authorization = `Bearer ${newToken}`;
					p.resolve(axiosClient(p.config));
				});
				pendingQueue = [];

				originalRequest.headers.Authorization = `Bearer ${newToken}`;
				return axiosClient(originalRequest);
			} catch {
				pendingQueue.forEach((p) => p.reject(new ApiError('1001', 'Phiên đăng nhập đã hết hạn!')));
				pendingQueue = [];
				storage.clearAccessToken();
				if (window.location.pathname !== '/login') window.location.href = '/login';
				throw new ApiError('1001', 'Phiên đăng nhập đã hết hạn!');
			} finally {
				isRefreshing = false;
			}
		}

		throw new ApiError(code, body.message);
	},
);

export default axiosClient;
