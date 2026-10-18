import axiosClient, { multipart } from './axiosClient';
import { ENDPOINTS } from './endpoints';

// Trả về public URL (string) / mảng URL theo đúng thứ tự gửi lên.
export const uploadApi = {
	upload: (file) => {
		const form = new FormData();
		form.append('file', file);
		return axiosClient.post(ENDPOINTS.files.upload, form, multipart());
	},
	uploadMulti: (files) => {
		const form = new FormData();
		files.forEach((file) => form.append('files', file));
		return axiosClient.post(ENDPOINTS.files.uploadMulti, form, multipart());
	},
};
