export const MANGA_STATUS = {
	COMPLETED: 'Hoàn thành',
	ONGOING: 'Còn tiếp',
	ONHOLD: 'Tạm dừng',
};

export const MANGA_STATUS_TONE = {
	COMPLETED: 'green',
	ONGOING: 'blue',
	ONHOLD: 'red',
};

export const TRANS_GROUP_STATUS = {
	APPROVED: 'Đang hoạt động',
	DELETED: 'Đã xoá',
};

export const JOIN_REQUEST_STATUS = {
	PENDING: 'Chờ duyệt',
	APPROVED: 'Đã duyệt',
	REJECTED: 'Từ chối',
};

export const JOIN_REQUEST_TONE = {
	PENDING: 'amber',
	APPROVED: 'green',
	REJECTED: 'red',
};

// Lưu ý: backend dùng literal sai chính tả "REJECTD".
export const CREATION_REQUEST_STATUS = {
	PENDING: 'Chờ duyệt',
	APPROVED: 'Đã duyệt',
	REJECTD: 'Từ chối',
};

export const CREATION_REQUEST_TONE = {
	PENDING: 'amber',
	APPROVED: 'green',
	REJECTD: 'red',
};

export const mangaStatusLabel = (status) => MANGA_STATUS[status] ?? status;
export const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString('vi-VN') : '');
export const formatDateTime = (iso) => (iso ? new Date(iso).toLocaleString('vi-VN') : '');
