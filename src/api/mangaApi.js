import axiosClient from './axiosClient';
import { ENDPOINTS } from './endpoints';

export const mangaApi = {
	list: (params) => axiosClient.get(ENDPOINTS.manga.list, { params }),
	get: (id) => axiosClient.get(ENDPOINTS.manga.detail(id)),
	// Chi tiết dành cho leader để sửa truyện (GET /mangas/{mangaId}/management).
	getManagement: (mangaId) => axiosClient.get(ENDPOINTS.manga.management(mangaId)),
	listByGroup: (groupId, params) =>
		axiosClient.get(ENDPOINTS.manga.byGroup(groupId), { params }),
	create: (payload) => axiosClient.post(ENDPOINTS.manga.create, payload),
	update: (mangaId, payload) => axiosClient.patch(ENDPOINTS.manga.update(mangaId), payload),
	// group rời khỏi manga (manga vẫn còn)
	leaveManga: (mangaId, groupId) =>
		axiosClient.delete(ENDPOINTS.manga.leaveManga(mangaId, groupId)),
	// xoá hẳn manga (leader nhóm hoặc admin)
	deleteManga: (groupId, mangaId) =>
		axiosClient.delete(ENDPOINTS.manga.deleteManga(groupId, mangaId)),
	adminList: (params) => axiosClient.get(ENDPOINTS.manga.adminList, { params }),
};
