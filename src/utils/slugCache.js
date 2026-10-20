// Cache slug -> id, giúp đổi URL sang slug mà không phải tải lại danh sách.
// Không import gì để tránh vòng lặp với các module API.
const mangaIds = new Map();
const groupIds = new Map();

export const rememberMangas = (list) => {
	for (const manga of list ?? []) {
		if (manga?.slug && manga?.id) mangaIds.set(manga.slug, manga.id);
	}
};

export const rememberGroups = (list) => {
	for (const group of list ?? []) {
		if (group?.slug && group?.id) groupIds.set(group.slug, group.id);
	}
};

export const getCachedMangaId = (slug) => mangaIds.get(slug);
export const getCachedGroupId = (slug) => groupIds.get(slug);
