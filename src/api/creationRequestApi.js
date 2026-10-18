import axiosClient from './axiosClient';
import { ENDPOINTS } from './endpoints';

export const creationRequestApi = {
	create: (payload) => axiosClient.post(ENDPOINTS.creationRequests.create, payload),
	adminList: (params) => axiosClient.get(ENDPOINTS.creationRequests.adminList, { params }),
	approve: (requestId) => axiosClient.patch(ENDPOINTS.creationRequests.approve(requestId)),
	reject: (requestId) => axiosClient.patch(ENDPOINTS.creationRequests.reject(requestId)),
};
