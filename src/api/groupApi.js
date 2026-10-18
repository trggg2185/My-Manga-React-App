import axiosClient from './axiosClient';
import { ENDPOINTS } from './endpoints';

export const groupApi = {
	list: (params) => axiosClient.get(ENDPOINTS.transGroups.list, { params }),
	get: (id) => axiosClient.get(ENDPOINTS.transGroups.detail(id)),
	update: (id, payload) => axiosClient.patch(ENDPOINTS.transGroups.update(id), payload),
	remove: (id) => axiosClient.delete(ENDPOINTS.transGroups.remove(id)),
	kickMember: (groupId, userId) =>
		axiosClient.delete(ENDPOINTS.transGroups.kickMember(groupId, userId)),
	adminList: (params) => axiosClient.get(ENDPOINTS.transGroups.adminList, { params }),
};
