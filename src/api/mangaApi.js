import axiosClient from './axiosClient';
import { ENDPOINTS } from './endpoints';
import { rememberMangas } from '../utils/slugCache';

export const mangaApi = {
	list: async (params) => {
		const data = await axiosClient.get(ENDPOINTS.manga.list, { params });
		rememberMangas(data?.content);
		return data;
	},
	// GET /mangas/{idOrSlug} — backend nhận cả UUID và slug.
	get: async (idOrSlug) => {
		const manga = await axiosClient.get(ENDPOINTS.manga.detail(idOrSlug));
		rememberMangas([manga]);
		return manga;
	},
	// Chi tiết dành cho leader để sửa truyện (GET /mangas/{mangaId}/management).
	getManagement: async (mangaId) => {
		const manga = await axiosClient.get(ENDPOINTS.manga.management(mangaId));
		rememberMangas([manga]);
		return manga;
	},
	listByGroup: async (groupId, params) => {
		const data = await axiosClient.get(ENDPOINTS.manga.byGroup(groupId), { params });
		rememberMangas(data?.content);
		return data;
	},
	create: (payload) => axiosClient.post(ENDPOINTS.manga.create, payload),
	update: (mangaId, payload) => axiosClient.patch(ENDPOINTS.manga.update(mangaId), payload),
	// group rời khỏi manga (manga vẫn còn)
	leaveManga: (mangaId, groupId) =>
		axiosClient.delete(ENDPOINTS.manga.leaveManga(mangaId, groupId)),
	// xoá hẳn manga (leader nhóm hoặc admin)
	deleteManga: (groupId, mangaId) =>
		axiosClient.delete(ENDPOINTS.manga.deleteManga(groupId, mangaId)),
	adminList: async (params) => {
		const data = await axiosClient.get(ENDPOINTS.manga.adminList, { params });
		rememberMangas(data?.content);
		return data;
	},
};
