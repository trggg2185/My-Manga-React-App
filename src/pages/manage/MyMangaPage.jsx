import { Link } from 'react-router-dom';
import { mangaApi } from '../../api';
import { useFetch } from '../../hooks/useFetch';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { MANGA_STATUS_TONE, mangaStatusLabel, formatDate } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

function MyMangaPage() {
	const { data: me, loading: meLoading } = useCurrentUser();
	const groupId = me?.transGroupId;

	const { data, error, loading, reload } = useFetch(
		() =>
			groupId
				? mangaApi.listByGroup(groupId, { page: 0, size: 100, sortBy: 'createdAt' })
				: Promise.resolve(null),
		[groupId],
	);

	if (meLoading || loading) return <Loading label="Đang tải..." />;
	if (error) return <ErrorMessage error={error} onRetry={reload} />;

	if (!groupId) {
		return (
			<section>
				<PageHeader title="Quản lý truyện" />
				<EmptyState>
					Bạn chưa thuộc nhóm dịch nào. Hãy xin tham gia hoặc đăng ký tạo nhóm.
				</EmptyState>
			</section>
		);
	}

	return (
		<section>
			<PageHeader
				title="Quản lý truyện"
				subtitle={`${data?.totalElements ?? 0} truyện của nhóm bạn`}
				actions={
					<Link to="/manage/mangas/new">
						<Button>+ Tạo truyện</Button>
					</Link>
				}
			/>

			{data?.content?.length === 0 ? (
				<EmptyState>Nhóm bạn chưa có truyện nào.</EmptyState>
			) : (
				<ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-ink-900">
					{data?.content?.map((manga) => (
						<li key={manga.id} className="flex items-center justify-between gap-3 px-4 py-3">
							<span className="flex items-center gap-3 text-sm text-neutral-200">
								{manga.name}
								<Badge tone={MANGA_STATUS_TONE[manga.status]}>{mangaStatusLabel(manga.status)}</Badge>
							</span>
							<span className="flex items-center gap-3">
								<span className="hidden text-xs text-neutral-600 sm:block">
									{formatDate(manga.createdAt)}
								</span>
								<Link to={`/manage/mangas/${manga.id}`}>
									<Button variant="ghost">Quản lý</Button>
								</Link>
							</span>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}

export default MyMangaPage;
