import axiosClient, { multipart } from './axiosClient';
import { ENDPOINTS } from './endpoints';
import { toFormData } from '../utils/formData';

export const userApi = {
	/* --- public profile --- */
	getProfile: (username) => axiosClient.get(ENDPOINTS.users.profile(username)),

	/* --- current user --- */
	getMe: () => axiosClient.get(ENDPOINTS.users.me),
	updateMe: ({ displayName, facebook, discord, bio, avatar }) =>
		axiosClient.patch(
			ENDPOINTS.users.me,
			toFormData({ displayName, facebook, discord, bio, avatar }),
			multipart(),
		),
	changePassword: (payload) => axiosClient.patch(ENDPOINTS.users.mePassword, payload),
	getMyJoinRequests: (params) => axiosClient.get(ENDPOINTS.users.meJoinRequests, { params }),
	getMyCreationRequests: (params) =>
		axiosClient.get(ENDPOINTS.users.meCreationRequests, { params }),

	/* --- admin --- */
	list: (params) => axiosClient.get(ENDPOINTS.admin.users, { params }),
	get: (id) => axiosClient.get(ENDPOINTS.admin.user(id)),
	create: (payload) => axiosClient.post(ENDPOINTS.admin.users, payload),
	update: (id, fields) =>
		axiosClient.patch(ENDPOINTS.admin.user(id), toFormData(fields), multipart()),
	remove: (id) => axiosClient.delete(ENDPOINTS.admin.user(id)),
};
