import axiosClient, { multipart } from './axiosClient';
import { ENDPOINTS } from './endpoints';
import { rememberGroups } from '../utils/slugCache';

export const groupApi = {
	// Nhóm của user hiện tại + quan hệ: { transGroup?, status: LEADER|MEMBER|PENDING_REQUEST|NONE }.
	getMine: async () => {
		const data = await axiosClient.get(ENDPOINTS.transGroups.mine);
		rememberGroups([data?.transGroup]);
		return data;
	},
	list: async (params) => {
		const data = await axiosClient.get(ENDPOINTS.transGroups.list, { params });
		rememberGroups(data?.content);
		return data;
	},
	get: async (id) => {
		const group = await axiosClient.get(ENDPOINTS.transGroups.detail(id));
		rememberGroups([group]);
		return group;
	},
	// PATCH /transgroups/{id} là multipart (name, description, coverFile, avatarFile).
	update: (id, payload) =>
		axiosClient.patch(ENDPOINTS.transGroups.update(id), payload, multipart()),
	remove: (id) => axiosClient.delete(ENDPOINTS.transGroups.remove(id)),
	kickMember: (groupId, userId) =>
		axiosClient.delete(ENDPOINTS.transGroups.kickMember(groupId, userId)),
	adminList: async (params) => {
		const data = await axiosClient.get(ENDPOINTS.transGroups.adminList, { params });
		rememberGroups(data?.content);
		return data;
	},
};
