import { Link } from 'react-router-dom';
import { mangaApi } from '../../api';
import { useFetch } from '../../hooks/useFetch';
import { useMutation } from '../../hooks/useMutation';
import { useMyGroup } from '../../hooks/useMyGroup';
import { MANGA_STATUS_TONE, mangaStatusLabel, formatDate } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

function MyMangaPage() {
	const { data: mine, loading: groupLoading, error: groupError } = useMyGroup();
	const group = mine?.transGroup;
	const isLeader = mine?.status === 'LEADER';
	const groupId = group?.id;

	const { data, error, loading, reload } = useFetch(
		() =>
			groupId
				? mangaApi.listByGroup(groupId, { page: 0, size: 100, sortBy: 'createdAt' })
				: Promise.resolve(null),
		[groupId],
	);

	const mutation = useMutation();

	if (groupLoading || loading) return <Loading label="Đang tải..." />;
	if (groupError) return <ErrorMessage error={groupError} />;
	if (error) return <ErrorMessage error={error} onRetry={reload} />;

	if (!group) {
		return (
			<section>
				<PageHeader title="Quản lý truyện" />
				<EmptyState>
					Bạn chưa là leader của nhóm dịch nào. Hãy tạo nhóm ở trang Nhóm dịch.
				</EmptyState>
			</section>
		);
	}

	const handleDelete = (mangaId) => {
		if (!window.confirm('Xoá truyện này? Hành động không thể hoàn tác.')) return;
		mutation.run(async () => {
			await mangaApi.deleteManga(groupId, mangaId);
			reload();
		}, 'Đã xoá truyện.');
	};

	return (
		<section className="animate-fade-up">
			<PageHeader
				title="Quản lý truyện"
				subtitle={`${group.name} · ${data?.totalElements ?? 0} truyện`}
				actions={
					isLeader && (
						<Link to="/manage/mangas/new">
							<Button>+ Thêm truyện</Button>
						</Link>
					)
				}
			/>

			{mutation.error && (
				<p className="mb-4 text-sm text-red-400">
					Lỗi ({mutation.error.code}): {mutation.error.message}
				</p>
			)}
			{mutation.message && <p className="mb-4 text-sm text-emerald-400">{mutation.message}</p>}

			{data?.content?.length === 0 ? (
				<EmptyState>Nhóm bạn chưa có truyện nào.</EmptyState>
			) : (
				<ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-ink-900">
					{data?.content?.map((manga) => (
						<li key={manga.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
							<span className="flex items-center gap-3 text-sm text-neutral-200">
								{isLeader ? (
									<Link
										to={`/manage/mangas/${manga.slug ?? manga.id}`}
										className="transition-colors duration-200 hover:text-white"
									>
										{manga.name}
									</Link>
								) : (
									manga.name
								)}
								<Badge tone={MANGA_STATUS_TONE[manga.status]}>{mangaStatusLabel(manga.status)}</Badge>
							</span>
							<span className="flex items-center gap-2">
								<span className="hidden text-xs text-neutral-600 sm:block">
									{formatDate(manga.createdAt)}
								</span>
								{isLeader && (
									<Link to={`/manage/mangas/${manga.slug ?? manga.id}`}>
										<Button variant="ghost">Sửa</Button>
									</Link>
								)}
								<Link to={`/manage/mangas/${manga.slug ?? manga.id}/chapters`}>
									<Button variant="ghost">Chương</Button>
								</Link>
								{isLeader && (
									<Button
										variant="danger"
										onClick={() => handleDelete(manga.id)}
										disabled={mutation.loading}
									>
										Xoá
									</Button>
								)}
							</span>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}

export default MyMangaPage;
