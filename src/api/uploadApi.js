import axiosClient, { multipart } from './axiosClient';
import { ENDPOINTS } from './endpoints';

// Upload ảnh (optimize + đẩy lên R2) lâu hơn timeout mặc định 20s -> nới riêng cho upload.
const UPLOAD_TIMEOUT = 5 * 60 * 1000;

// Trả về public URL (string) / mảng URL theo đúng thứ tự gửi lên.
export const uploadApi = {
	upload: (file) => {
		const form = new FormData();
		form.append('file', file);
		return axiosClient.post(ENDPOINTS.files.upload, form, { ...multipart(), timeout: UPLOAD_TIMEOUT });
	},
	uploadMulti: (files) => {
		const form = new FormData();
		files.forEach((file) => form.append('files', file));
		return axiosClient.post(ENDPOINTS.files.uploadMulti, form, { ...multipart(), timeout: UPLOAD_TIMEOUT });
	},
};
