import axiosClient from './axiosClient';
import { ENDPOINTS } from './endpoints';

// Tạo chương: backend copy tối đa 150 ảnh tmp -> thư mục chính, có thể lâu hơn timeout 20s.
const CREATE_TIMEOUT = 5 * 60 * 1000;

export const chapterApi = {
	listByManga: (mangaId, params) =>
		axiosClient.get(ENDPOINTS.chapters.listByManga(mangaId), { params }),
	create: (mangaId, payload) =>
		axiosClient.post(ENDPOINTS.chapters.create(mangaId), payload, { timeout: CREATE_TIMEOUT }),
	remove: (mangaId, chapterId) =>
		axiosClient.delete(ENDPOINTS.chapters.remove(mangaId, chapterId)),
	// Đọc pages cũng ghi nhận 1 view (server-side, dedupe 30 phút).
	// Trả về toàn bộ pages của chapter (List<PageResponse>, sort pageNumber tăng dần).
	getPages: (chapterId, params) =>
		axiosClient.get(ENDPOINTS.chapters.pages(chapterId), { params }),
};
