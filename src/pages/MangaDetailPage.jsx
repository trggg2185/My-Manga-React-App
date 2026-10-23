import { Link, useParams } from 'react-router-dom';
import { chapterApi, ApiError, mangaApi } from '../api';
import { useFetch } from '../hooks/useFetch';
import { MANGA_STATUS_TONE, mangaStatusLabel, formatDate } from '../utils/format';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import Badge from '../components/common/Badge';
import Cover from '../components/common/Cover';
import EmptyState from '../components/common/EmptyState';

function MangaDetailPage() {
	const { slug } = useParams();

	const { data, error, loading, reload } = useFetch(
		async () => {
			const manga = await mangaApi.get(slug);
			if (!manga) throw new ApiError('404', 'Không tìm thấy truyện.');
			const chapters = await chapterApi.listByManga(manga.id, {
				page: 0,
				size: 100,
				sortBy: 'chapterIndex',
			});
			return { manga, chapters: chapters?.content ?? [] };
		},
		[slug],
	);

	if (loading) return <Loading label="Đang tải truyện..." />;
	if (error) return <ErrorMessage error={error} onRetry={reload} />;

	const { manga, chapters } = data ?? {};
	if (!manga) return null;

	return (
		<article className="animate-fade-up">
			<div className="flex flex-col gap-6 sm:flex-row">
				<Cover
					src={manga.coverImageUrl}
					name={manga.name}
					className="aspect-[3/4] w-full rounded-2xl border border-white/10 sm:w-56 sm:shrink-0"
					textClass="text-6xl"
				/>

				<div className="flex-1">
					<h1 className="text-2xl font-bold text-white sm:text-3xl">{manga.name}</h1>

					<div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
						<Badge tone={MANGA_STATUS_TONE[manga.status]}>{mangaStatusLabel(manga.status)}</Badge>
						{manga.authorsName && <span className="text-neutral-500">Tác giả: {manga.authorsName}</span>}
					</div>

					<div className="mt-4 flex flex-wrap gap-1.5">
						{manga.categories?.map((category) => (
							<span
								key={category.id}
								className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-neutral-400"
							>
								{category.name}
							</span>
						))}
					</div>

					{manga.description && (
						<p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-neutral-400">
							{manga.description}
						</p>
					)}
				</div>
			</div>

			{manga.transGroups?.length > 0 && (
				<section className="mt-8">
					<h2 className="mb-3 text-lg font-semibold text-white">Nhóm dịch</h2>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{manga.transGroups.map((group) => (
							<Link
								key={group.id}
								to={`/groups/${group.slug ?? group.id}`}
								className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-ink-900 p-4 transition-colors duration-200 hover:border-white/25 hover:bg-white/5"
							>
								<Cover
									src={group.avatar}
									name={group.name}
									className="h-11 w-11 shrink-0 rounded-xl"
									textClass="text-lg"
								/>
								<div className="min-w-0">
									<p className="truncate text-sm font-semibold text-neutral-100 group-hover:text-white">
										{group.name}
									</p>
									<p className="truncate text-xs text-neutral-500">@{group.slug}</p>
								</div>
							</Link>
						))}
					</div>
				</section>
			)}

			<section className="mt-10">
				<h2 className="mb-4 text-lg font-semibold text-white">Danh sách chương</h2>

				{chapters.length === 0 ? (
					<EmptyState>Truyện chưa có chương nào.</EmptyState>
				) : (
					<div className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-ink-900">
						{chapters.map((chapter) => (
							<Link
								key={chapter.id}
								to={`/mangas/${manga.slug ?? slug}/chapters/${chapter.chapterIndex}`}
								className="flex items-center justify-between px-4 py-3 transition-colors duration-200 hover:bg-white/5"
							>
								<span className="text-sm text-neutral-200">
									Chương {chapter.chapterIndex}
									{chapter.title ? ` — ${chapter.title}` : ''}
								</span>
								<span className="text-xs text-neutral-500">
									{chapter.views} lượt xem · {formatDate(chapter.updatedAt)}
								</span>
							</Link>
						))}
					</div>
				)}
			</section>
		</article>
	);
}

export default MangaDetailPage;
