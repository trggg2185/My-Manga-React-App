import { groupApi, mangaApi } from '../api';
import { getCachedGroupId, getCachedMangaId, rememberGroups, rememberMangas } from './slugCache';

// URL hiển thị slug (vẫn nhận id cũ); các lời gọi API luôn dùng id.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function resolveMangaId(slugOrId) {
	if (!slugOrId) return null;
	if (UUID.test(slugOrId)) return slugOrId;

	const cached = getCachedMangaId(slugOrId);
	if (cached) return cached;

	// Backend chưa có endpoint tra theo slug -> tìm trong danh sách truyện.
	const data = await mangaApi.list({ page: 0, size: 500, sortBy: 'createdAt' });
	rememberMangas(data?.content);
	return getCachedMangaId(slugOrId) ?? null;
}

export async function resolveGroupId(slugOrId) {
	if (!slugOrId) return null;
	if (UUID.test(slugOrId)) return slugOrId;

	const cached = getCachedGroupId(slugOrId);
	if (cached) return cached;

	const data = await groupApi.list({ page: 0, size: 500, sortBy: 'createdAt' });
	rememberGroups(data?.content);
	return getCachedGroupId(slugOrId) ?? null;
}
