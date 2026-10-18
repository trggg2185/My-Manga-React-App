import axiosClient from './axiosClient';
import { ENDPOINTS } from './endpoints';

export const roleApi = {
	listRoles: () => axiosClient.get(ENDPOINTS.admin.roles),
	createRole: (payload) => axiosClient.post(ENDPOINTS.admin.roles, payload),
	removeRole: (id) => axiosClient.delete(ENDPOINTS.admin.role(id)),
	listPermissions: () => axiosClient.get(ENDPOINTS.admin.permissions),
	createPermission: (payload) => axiosClient.post(ENDPOINTS.admin.permissions, payload),
	removePermission: (id) => axiosClient.delete(ENDPOINTS.admin.permission(id)),
};
