// Cache slug -> manga id, tránh gọi lại API khi đã biết id.
// Không import gì để tránh vòng lặp với các module API.
const mangaIds = new Map();

export const rememberMangas = (list) => {
	for (const manga of list ?? []) {
		if (manga?.slug && manga?.id) mangaIds.set(manga.slug, manga.id);
	}
};

export const getCachedMangaId = (slug) => mangaIds.get(slug);
