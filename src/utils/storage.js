// tương tác vs local storage

const ACCESS_TOKEN_KEY = "mma_access_token";

export const storage = {
	getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
	setAccessToken: (token) => localStorage.setItem(ACCESS_TOKEN_KEY, token),
	clearAccessToken: () => localStorage.removeItem(ACCESS_TOKEN_KEY),
};
