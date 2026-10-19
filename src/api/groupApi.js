import axiosClient, { multipart } from './axiosClient';
import { ENDPOINTS } from './endpoints';

export const groupApi = {
	// Nhóm của user hiện tại + quan hệ: { transGroup?, status: LEADER|MEMBER|PENDING_REQUEST|NONE }.
	getMine: () => axiosClient.get(ENDPOINTS.transGroups.mine),
	list: (params) => axiosClient.get(ENDPOINTS.transGroups.list, { params }),
	get: (id) => axiosClient.get(ENDPOINTS.transGroups.detail(id)),
	// PATCH /transgroups/{id} là multipart (name, description, coverFile, avatarFile).
	update: (id, payload) =>
		axiosClient.patch(ENDPOINTS.transGroups.update(id), payload, multipart()),
	remove: (id) => axiosClient.delete(ENDPOINTS.transGroups.remove(id)),
	kickMember: (groupId, userId) =>
		axiosClient.delete(ENDPOINTS.transGroups.kickMember(groupId, userId)),
	adminList: (params) => axiosClient.get(ENDPOINTS.transGroups.adminList, { params }),
};
