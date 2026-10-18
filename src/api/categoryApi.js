import axiosClient from './axiosClient';
import { ENDPOINTS } from './endpoints';

export const categoryApi = {
	list: () => axiosClient.get(ENDPOINTS.categories.list),
	get: (id) => axiosClient.get(ENDPOINTS.categories.detail(id)),
	create: (payload) => axiosClient.post(ENDPOINTS.categories.adminList, payload),
	update: (id, payload) => axiosClient.patch(ENDPOINTS.categories.adminDetail(id), payload),
	remove: (id) => axiosClient.delete(ENDPOINTS.categories.adminDetail(id)),
};
