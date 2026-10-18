import axiosClient from './axiosClient';
import { ENDPOINTS } from './endpoints';

export const chapterApi = {
	listByManga: (mangaId, params) =>
		axiosClient.get(ENDPOINTS.chapters.listByManga(mangaId), { params }),
	create: (mangaId, payload) => axiosClient.post(ENDPOINTS.chapters.create(mangaId), payload),
	remove: (mangaId, chapterId) =>
		axiosClient.delete(ENDPOINTS.chapters.remove(mangaId, chapterId)),
	// Đọc pages cũng ghi nhận 1 view (server-side).
	getPages: (chapterId) => axiosClient.get(ENDPOINTS.chapters.pages(chapterId)),
};
