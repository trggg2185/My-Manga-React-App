import { useState } from 'react';
import { Link } from 'react-router-dom';
import { groupApi } from '../api';
import { useFetch } from '../hooks/useFetch';
import { useMyGroup } from '../hooks/useMyGroup';
import { useAuth } from '../auth/useAuth';
import { useAuthModal } from '../components/auth/AuthModalProvider';
import GroupCard from '../components/group/GroupCard';
import CreateGroupModal from '../components/group/CreateGroupModal';
import Cover from '../components/common/Cover';
import Pagination from '../components/common/Pagination';
import PageHeader from '../components/common/PageHeader';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';

function MyGroupSection() {
	const { isAuthenticated } = useAuth();
	const { openAuthModal } = useAuthModal();
	const [createOpen, setCreateOpen] = useState(false);
	const { data: mine, error, loading, reload } = useMyGroup();

	if (!isAuthenticated) {
		return (
			<div className="rounded-2xl border border-white/10 bg-ink-900 p-6">
				<p className="text-sm text-neutral-400">Đăng nhập để tạo và quản lý nhóm dịch của bạn.</p>
				<Button className="mt-4" onClick={() => openAuthModal('login')}>
					Đăng nhập
				</Button>
			</div>
		);
	}

	if (loading) return <Loading label="Đang tải nhóm của bạn..." />;
	if (error) return <ErrorMessage error={error} />;

	const group = mine?.transGroup;

	if (group) {
		const isLeader = mine.status === 'LEADER';
		return (
			<div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-ink-900 p-6">
				<div className="flex items-center gap-4">
					<Cover
						src={group.avatar ?? group.coverImageUrl}
						name={group.name}
						className="h-12 w-12 shrink-0 rounded-xl"
						textClass="text-lg"
					/>
					<div>
						<p className="font-semibold text-neutral-100">{group.name}</p>
						<p className="text-xs text-neutral-500">
							@{group.slug} · {isLeader ? 'Leader' : 'Thành viên'}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Link to={`/groups/${group.id}`}>
						<Button variant="ghost">Xem nhóm</Button>
					</Link>
					<Link to="/manage">
						<Button>Quản lý</Button>
					</Link>
				</div>
			</div>
		);
	}

	if (mine?.status === 'PENDING_REQUEST') {
		return (
			<div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
				<p className="font-medium text-amber-300">Yêu cầu tạo/tham gia nhóm đang chờ duyệt</p>
				<p className="mt-1 text-sm text-neutral-500">
					Admin sẽ xem xét yêu cầu của bạn. Bạn sẽ là leader khi nhóm được duyệt.
				</p>
			</div>
		);
	}

	return (
		<div className="rounded-2xl border border-white/10 bg-ink-900 p-6">
			<p className="text-sm text-neutral-400">
				Bạn chưa thuộc nhóm dịch nào. Bạn có thể xin tham gia một nhóm hoặc tạo nhóm mới.
			</p>
			<Button className="mt-4" onClick={() => setCreateOpen(true)}>
				+ Tạo nhóm dịch
			</Button>

			{createOpen && (
				<CreateGroupModal
					onClose={() => setCreateOpen(false)}
					onCreated={() => {
						setCreateOpen(false);
						reload();
					}}
				/>
			)}
		</div>
	);
}

function GroupsPage() {
	const [page, setPage] = useState(0);
	const { data, error, loading, reload } = useFetch(
		() => groupApi.list({ page, size: 20, sortBy: 'createdAt' }),
		[page],
	);

	return (
		<section>
			<PageHeader title="Nhóm dịch" />

			<section className="mb-10">
				<h2 className="mb-3 text-lg font-semibold text-white">Nhóm dịch của bạn</h2>
				<MyGroupSection />
			</section>

			<section>
				<h2 className="mb-3 text-lg font-semibold text-white">Tất cả nhóm dịch</h2>
				{loading ? (
					<Loading label="Đang tải nhóm..." />
				) : error ? (
					<ErrorMessage error={error} onRetry={reload} />
				) : data?.content?.length === 0 ? (
					<EmptyState>Chưa có nhóm dịch nào.</EmptyState>
				) : (
					<>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{data.content.map((group, index) => (
								<GroupCard key={group.id} group={group} index={index} />
							))}
						</div>
						<Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
					</>
				)}
			</section>
		</section>
	);
}

export default GroupsPage;
