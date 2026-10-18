import axiosClient from './axiosClient';
import { ENDPOINTS } from './endpoints';

export const mangaApi = {
	list: (params) => axiosClient.get(ENDPOINTS.manga.list, { params }),
	get: (id) => axiosClient.get(ENDPOINTS.manga.detail(id)),
	listByGroup: (groupId, params) =>
		axiosClient.get(ENDPOINTS.manga.byGroup(groupId), { params }),
	create: (payload) => axiosClient.post(ENDPOINTS.manga.create, payload),
	update: (mangaId, payload) => axiosClient.patch(ENDPOINTS.manga.update(mangaId), payload),
	// group rời khỏi manga
	leaveGroup: (groupId, mangaId) =>
		axiosClient.delete(ENDPOINTS.manga.leaveGroup(groupId, mangaId)),
	removeGroup: (mangaId, groupId) =>
		axiosClient.delete(ENDPOINTS.manga.removeGroup(mangaId, groupId)),
	adminList: (params) => axiosClient.get(ENDPOINTS.manga.adminList, { params }),
};
