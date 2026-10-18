// PATCH /users/me và /admin/users/{id} dùng multipart/form-data.
// Lưu ý theo spec: field null/rỗng bị bỏ qua (không có cách "xoá" field).
export function toFormData(fields) {
	const form = new FormData();
	Object.entries(fields).forEach(([key, value]) => {
		if (value === undefined || value === null || value === '') return;
		form.append(key, value);
	});
	return form;
}
