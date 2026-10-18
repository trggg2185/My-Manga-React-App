import { useState } from 'react';
import { Link } from 'react-router-dom';
import { groupApi, userApi } from '../api';
import { useFetch } from '../hooks/useFetch';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useAuth } from '../auth/useAuth';
import { useAuthModal } from '../components/auth/AuthModalProvider';
import { TRANS_GROUP_STATUS } from '../utils/format';
import GroupCard from '../components/group/GroupCard';
import CreateGroupModal from '../components/group/CreateGroupModal';
import Pagination from '../components/common/Pagination';
import PageHeader from '../components/common/PageHeader';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';

function MyGroupSection() {
	const { isAuthenticated } = useAuth();
	const { openAuthModal } = useAuthModal();
	const { data: me } = useCurrentUser();
	const groupId = me?.transGroupId;
	const [createOpen, setCreateOpen] = useState(false);

	const { data: myGroup } = useFetch(
		() => (groupId ? groupApi.get(groupId) : Promise.resolve(null)),
		[groupId],
	);

	// GET /users/me/creation-requests — chỉ cần khi user chưa thuộc nhóm nào
	const { data: myRequests, reload: reloadRequests } = useFetch(
		() =>
			isAuthenticated && !groupId
				? userApi.getMyCreationRequests({ status: 'PENDING', page: 0, size: 1, sortBy: 'createdAt' })
				: Promise.resolve(null),
		[isAuthenticated, groupId],
	);

	const pending = (myRequests?.content?.length ?? 0) > 0;

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

	if (myGroup) {
		return (
			<Link
				to={`/groups/${myGroup.id}`}
				className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-ink-900 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25"
			>
				<div className="flex items-center gap-4">
					<span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-lg font-bold text-white/60">
						{myGroup.name?.charAt(0)?.toUpperCase()}
					</span>
					<div>
						<p className="font-semibold text-neutral-100 group-hover:text-white">{myGroup.name}</p>
						<p className="text-xs text-neutral-500">
							@{myGroup.slug} · {myGroup.members?.length ?? 0} thành viên
						</p>
					</div>
				</div>
				<Badge tone={myGroup.status === 'APPROVED' ? 'green' : 'red'}>
					{TRANS_GROUP_STATUS[myGroup.status]}
				</Badge>
			</Link>
		);
	}

	if (pending) {
		const request = myRequests.content[0];
		return (
			<div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
				<p className="font-medium text-amber-300">
					Yêu cầu tạo nhóm &ldquo;{request.groupName}&rdquo; đang chờ duyệt
				</p>
				<p className="mt-1 text-sm text-neutral-500">
					Admin sẽ xem xét yêu cầu của bạn. Bạn sẽ là leader khi được duyệt.
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
						reloadRequests();
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
