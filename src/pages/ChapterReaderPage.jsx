import { Link, useParams } from 'react-router-dom';
import { chapterApi } from '../api';
import { useFetch } from '../hooks/useFetch';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

function ChapterReaderPage() {
	const { mangaId, chapterId } = useParams();

	const { data, error, loading, reload } = useFetch(
		async () => {
			const [pages, chapters] = await Promise.all([
				chapterApi.getPages(chapterId),
				chapterApi.listByManga(mangaId, { page: 0, size: 200, sortBy: 'chapterIndex' }),
			]);
			// sắp xếp tăng dần để biết chương trước/sau
			const list = [...(chapters?.content ?? [])].sort((a, b) => a.chapterIndex - b.chapterIndex);
			const index = list.findIndex((chapter) => chapter.id === chapterId);
			return {
				pages: [...(pages ?? [])].sort((a, b) => a.pageNumber - b.pageNumber),
				prev: index > 0 ? list[index - 1] : null,
				next: index >= 0 && index < list.length - 1 ? list[index + 1] : null,
			};
		},
		[mangaId, chapterId],
	);

	if (loading) return <Loading label="Đang tải chương..." />;
	if (error) return <ErrorMessage error={error} onRetry={reload} />;

	const { pages = [], prev, next } = data ?? {};

	const navButtonClass =
		'rounded-lg border border-white/15 px-4 py-2 text-sm text-neutral-200 transition-colors duration-200 hover:border-white/30 hover:bg-white/5';
	const disabledClass = 'pointer-events-none opacity-40';

	return (
		<div className="animate-fade-up">
			<div className="mb-4 flex items-center justify-between gap-3">
				<Link to={`/mangas/${mangaId}`} className={navButtonClass}>
					← Truyện
				</Link>
				<div className="flex gap-2">
					<Link
						to={`/mangas/${mangaId}/chapters/${prev?.id}`}
						className={`${navButtonClass} ${!prev ? disabledClass : ''}`}
					>
						Chương trước
					</Link>
					<Link
						to={`/mangas/${mangaId}/chapters/${next?.id}`}
						className={`${navButtonClass} ${!next ? disabledClass : ''}`}
					>
						Chương sau
					</Link>
				</div>
			</div>

			{pages.length === 0 ? (
				<p className="py-16 text-center text-neutral-500">Chương này chưa có ảnh.</p>
			) : (
				<div className="mx-auto flex max-w-3xl flex-col gap-1">
					{pages.map((page) => (
						<img
							key={page.id}
							src={page.imageUrl}
							alt={`Trang ${page.pageNumber}`}
							loading="lazy"
							className="w-full rounded-lg bg-ink-900"
						/>
					))}
				</div>
			)}

			<div className="mx-auto mt-8 flex max-w-3xl justify-between gap-2">
				<Link
					to={`/mangas/${mangaId}/chapters/${prev?.id}`}
					className={`${navButtonClass} ${!prev ? disabledClass : ''}`}
				>
					← Chương trước
				</Link>
				<Link
					to={`/mangas/${mangaId}/chapters/${next?.id}`}
					className={`${navButtonClass} ${!next ? disabledClass : ''}`}
				>
					Chương sau →
				</Link>
			</div>
		</div>
	);
}

export default ChapterReaderPage;
