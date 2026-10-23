import axios from 'axios';
import { ENDPOINTS } from '../api/endpoints';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/mymangaapp';

// Access token chỉ giữ trong bộ nhớ; refresh token nằm trong cookie HttpOnly.
let accessToken = null;
let refreshTimer = null;
let refreshPromise = null;
const listeners = new Set();

const emit = () => listeners.forEach((listener) => listener());

function scheduleRefresh(expiresIn) {
	clearTimeout(refreshTimer);
	const seconds = Number(expiresIn);
	if (!accessToken || !Number.isFinite(seconds) || seconds <= 0) return;
	// Làm mới sớm 60s; token rất ngắn thì tối thiểu 10s để tránh vòng lặp.
	const delay = Math.max(10_000, seconds * 1000 - 60_000);
	refreshTimer = setTimeout(() => {
		refreshSession().catch(() => {});
	}, delay);
}

export const getAccessToken = () => accessToken;

export function subscribeSession(listener) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

export function setSession({ token, expiresIn } = {}) {
	accessToken = token ?? null;
	emit();
	scheduleRefresh(expiresIn);
}

export function clearSession() {
	accessToken = null;
	clearTimeout(refreshTimer);
	refreshTimer = null;
	emit();
}

// Gọi /auth/refresh bằng axios thô để không đi qua interceptor 401 (tránh vòng lặp).
// Không tự clearSession ở đây: nơi gọi quyết định có phải phiên hết hạn thật không.
export function refreshSession() {
	if (!refreshPromise) {
		refreshPromise = axios
			.post(`${baseURL}${ENDPOINTS.auth.refresh}`, null, { withCredentials: true })
			.then(({ data }) => {
				if (data?.code !== '0000' || !data.result?.token) {
					throw new Error(data?.message || 'Phiên đăng nhập đã hết hạn.');
				}
				setSession(data.result);
				return data.result.token;
			})
			.finally(() => {
				refreshPromise = null;
			});
	}
	return refreshPromise;
}

// Báo cho AuthModalProvider mở modal đăng nhập tại chỗ.
export function requireLogin() {
	window.dispatchEvent(new Event('auth:required'));
}
