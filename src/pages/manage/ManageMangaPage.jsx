import { Link, useParams } from 'react-router-dom';
import { ApiError, chapterApi, mangaApi } from '../../api';
import { resolveMangaId } from '../../utils/resolveUrl';
import { useFetch } from '../../hooks/useFetch';
import { useMutation } from '../../hooks/useMutation';
import { formatDate } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';

function ManageMangaPage() {
	const { slug } = useParams();
	const mutation = useMutation();

	const { data, error, loading, reload } = useFetch(
		async () => {
			const mangaId = await resolveMangaId(slug);
			if (!mangaId) throw new ApiError('404', 'Không tìm thấy truyện.');
			const [manga, chapters] = await Promise.all([
				mangaApi.get(mangaId),
				chapterApi.listByManga(mangaId, { page: 0, size: 200, sortBy: 'chapterIndex' }),
			]);
			return { mangaId, manga, chapters: chapters?.content ?? [] };
		},
		[slug],
	);

	if (loading) return <Loading />;
	if (error) return <ErrorMessage error={error} onRetry={reload} />;

	const { mangaId, manga, chapters } = data ?? {};

	const handleDeleteChapter = (chapterId) => {
		if (!window.confirm('Xoá chương này?')) return;
		mutation.run(async () => {
			await chapterApi.remove(mangaId, chapterId);
			reload();
		}, 'Đã xoá chương.');
	};

	return (
		<section className="animate-fade-up">
			<Link to="/manage" className="mb-4 inline-block text-sm text-neutral-500 hover:text-white">
				← Quay lại quản lý truyện
			</Link>

			<PageHeader
				title="Quản lý chương"
				subtitle={manga?.name}
				actions={
					<Link to={`/manage/mangas/${slug}/chapters/new`}>
						<Button>+ Thêm chương</Button>
					</Link>
				}
			/>

			{mutation.error && (
				<p className="mb-4 text-sm text-red-400">
					Lỗi ({mutation.error.code}): {mutation.error.message}
				</p>
			)}
			{mutation.message && <p className="mb-4 text-sm text-emerald-400">{mutation.message}</p>}

			{chapters.length === 0 ? (
				<EmptyState>Truyện chưa có chương nào.</EmptyState>
			) : (
				<ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-ink-900">
					{chapters.map((chapter) => (
						<li key={chapter.id} className="flex items-center justify-between gap-3 px-4 py-3">
							<span className="text-sm text-neutral-200">
								Chương {chapter.chapterIndex}
								{chapter.title ? ` — ${chapter.title}` : ''}
							</span>
							<span className="flex items-center gap-3">
								<span className="hidden text-xs text-neutral-600 sm:block">
									{chapter.views} lượt xem · {formatDate(chapter.updatedAt)}
								</span>
								<Button variant="danger" onClick={() => handleDeleteChapter(chapter.id)}>
									Xoá
								</Button>
							</span>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}

export default ManageMangaPage;
