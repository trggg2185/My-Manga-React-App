import { Link, useNavigate, useParams } from 'react-router-dom';
import { chapterApi, mangaApi } from '../../api';
import { useFetch } from '../../hooks/useFetch';
import { useMutation } from '../../hooks/useMutation';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { formatDate } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';

function ManageMangaPage() {
	const { mangaId } = useParams();
	const navigate = useNavigate();
	const { data: me } = useCurrentUser();
	const mutation = useMutation();

	const { data, error, loading, reload } = useFetch(
		async () => {
			const [manga, chapters] = await Promise.all([
				mangaApi.get(mangaId),
				chapterApi.listByManga(mangaId, { page: 0, size: 200, sortBy: 'chapterIndex' }),
			]);
			return { manga, chapters: chapters?.content ?? [] };
		},
		[mangaId],
	);

	if (loading) return <Loading />;
	if (error) return <ErrorMessage error={error} onRetry={reload} />;

	const { manga, chapters } = data ?? {};

	const handleDeleteChapter = (chapterId) => {
		if (!window.confirm('Xoá chương này?')) return;
		mutation.run(async () => {
			await chapterApi.remove(mangaId, chapterId);
			reload();
		}, 'Đã xoá chương.');
	};

	const handleLeaveGroup = () => {
		if (!window.confirm('Cho nhóm bạn rời khỏi truyện này?')) return;
		mutation.run(async () => {
			await mangaApi.leaveGroup(me.transGroupId, mangaId);
			navigate('/manage');
		}, 'Đã rời khỏi truyện.');
	};

	return (
		<section className="animate-fade-up">
			<PageHeader
				title={manga?.name}
				subtitle="Quản lý chương"
				actions={
					<>
						<Link to={`/manage/mangas/${mangaId}/edit`}>
							<Button variant="ghost">Sửa truyện</Button>
						</Link>
						<Link to={`/manage/mangas/${mangaId}/chapters/new`}>
							<Button>+ Thêm chương</Button>
						</Link>
					</>
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

			{me?.transGroupId && (
				<div className="mt-10 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
					<p className="text-sm text-neutral-400">
						Cho nhóm của bạn rời khỏi truyện này (truyện phải còn ít nhất một nhóm khác).
					</p>
					<Button variant="danger" className="mt-3" onClick={handleLeaveGroup}>
						Rời khỏi truyện
					</Button>
				</div>
			)}
		</section>
	);
}

export default ManageMangaPage;
