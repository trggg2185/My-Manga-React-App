import axiosClient from './axiosClient';
import { ENDPOINTS } from './endpoints';

export const joinRequestApi = {
	create: (groupId) => axiosClient.post(ENDPOINTS.joinRequests.create(groupId)),
	listMine: (params) => axiosClient.get(ENDPOINTS.joinRequests.listMine, { params }),
	listByGroup: (groupId, params) =>
		axiosClient.get(ENDPOINTS.joinRequests.listByGroup(groupId), { params }),
	approve: (groupId, requestId) =>
		axiosClient.patch(ENDPOINTS.joinRequests.approve(groupId, requestId)),
	reject: (groupId, requestId) =>
		axiosClient.patch(ENDPOINTS.joinRequests.reject(groupId, requestId)),
};
