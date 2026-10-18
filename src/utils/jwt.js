// Giải mã JWT phía client để lấy `scope` (roles) và `exp`. Không xác thực chữ ký.
export function decodeToken(token) {
	if (!token) return null;
	try {
		const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
		const json = decodeURIComponent(
			atob(base64)
				.split('')
				.map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
				.join(''),
		);
		return JSON.parse(json);
	} catch {
		return null;
	}
}

// scope là chuỗi role cách nhau bằng dấu cách, ví dụ "USER TRANSLATOR".
export function getRoles(token) {
	const payload = decodeToken(token);
	return payload?.scope ? payload.scope.split(' ').filter(Boolean) : [];
}

// skewSeconds: coi như hết hạn sớm để kịp refresh.
export function isExpired(token, skewSeconds = 30) {
	const payload = decodeToken(token);
	if (!payload?.exp) return true;
	return payload.exp * 1000 - skewSeconds * 1000 <= Date.now();
}
