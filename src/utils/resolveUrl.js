import { mangaApi } from '../api';
import { getCachedMangaId } from './slugCache';

// URL hiển thị slug (vẫn nhận id cũ); backend nhận cả UUID và slug.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function resolveMangaId(slugOrId) {
	if (!slugOrId) return null;
	if (UUID.test(slugOrId)) return slugOrId;

	const cached = getCachedMangaId(slugOrId);
	if (cached) return cached;

	const manga = await mangaApi.get(slugOrId);
	return manga?.id ?? null;
}
