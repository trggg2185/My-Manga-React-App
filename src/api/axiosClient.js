import axios from "axios";
import {
    clearSession,
    getAccessToken,
    refreshSession,
    requireLogin,
} from "../auth/session";

// Lỗi API đã chuẩn hoá: dùng `code` (không phải HTTP status) để xử lý riêng.
export class ApiError extends Error {
    constructor(code, message) {
        super(message || "Đã có lỗi xảy ra!");
        this.name = "ApiError";
        this.code = code || "9001";
    }
}

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/mymangaapp";

const axiosClient = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
    timeout: 20000,
    // Luôn gửi kèm cookie refresh HttpOnly.
    withCredentials: true,
});

// Config cho request multipart (axios tự thêm boundary trong browser).
export const multipart = () => ({ headers: { "Content-Type": "multipart/form-data" } });

/* ---------- REQUEST: gắn Bearer token ---------- */
axiosClient.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token && !config.skipAuth) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/* ---------- RESPONSE: bóc ApiResponse<T>, chỉ trả về `result` ---------- */
axiosClient.interceptors.response.use(
    (response) => {
        const body = response.data;
        if (body && typeof body === "object" && "code" in body) {
            if (body.code !== "0000") throw new ApiError(body.code, body.message);
            return body.result; // void (result bị lược bỏ) => undefined
        }
        return body;
    },
    async (error) => {
        const { response, config } = error;
        if (!response) throw new ApiError("NETWORK", "Lỗi kết nối mạng!");

        const body = response.data || {};
        const code = body.code || String(response.status);

        /* --- 401: refresh dùng chung, gửi lại request đúng 1 lần --- */
        if (response.status === 401 && !config.skipAuth) {
            if (config._retry) {
                clearSession();
                requireLogin();
                throw new ApiError(code, body.message);
            }

            config._retry = true;
            try {
                await refreshSession();
                return axiosClient(config);
            } catch {
                clearSession();
                requireLogin();
                throw new ApiError(code, body.message);
            }
        }

        throw new ApiError(code, body.message);
    },
);

export default axiosClient;
