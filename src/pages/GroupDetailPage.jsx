import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { groupApi, joinRequestApi } from '../api';
import { useFetch } from '../hooks/useFetch';
import { useMutation } from '../hooks/useMutation';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useMyGroup } from '../hooks/useMyGroup';
import { useAuth } from '../auth/useAuth';
import { JOIN_REQUEST_STATUS, JOIN_REQUEST_TONE } from '../utils/format';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Cover from '../components/common/Cover';
import Avatar from '../components/common/Avatar';
import MangaGrid from '../components/manga/MangaGrid';
import EditGroupModal from '../components/group/EditGroupModal';

function GroupDetailPage() {
	const { id } = useParams();
	const { isAuthenticated } = useAuth();
	const { data: me } = useCurrentUser();
	const { data: mine } = useMyGroup();
	const myGroupStatus = mine?.status;
	const [editing, setEditing] = useState(false);
	const [tab, setTab] = useState('mangas');

	// Chi tiết nhóm không có avatar -> ghép avatar từ danh sách nhóm (summary).
	const { data, error, loading, reload } = useFetch(async () => {
		const [group, list] = await Promise.all([
			groupApi.get(id),
			groupApi.list({ page: 0, size: 100, sortBy: 'createdAt' }).catch(() => null),
		]);
		const summary = (list?.content ?? []).find((item) => item.id === id);
		return { group, avatar: summary?.avatar ?? summary?.coverImageUrl ?? null };
	}, [id]);

	const group = data?.group;
	const avatar = data?.avatar;

	const isLeader = Boolean(me && group && me.id === group.leader?.id);
	const isMember = Boolean(me && group?.members?.some((member) => member.id === me.id));

	const { data: joinRequests, reload: reloadRequests } = useFetch(
		() => (isLeader ? joinRequestApi.listByGroup(id, { status: 'PENDING' }) : Promise.resolve([])),
		[id, isLeader],
	);

	const joinMutation = useMutation();
	const groupMutation = useMutation();
	const requestMutation = useMutation();

	if (loading) return <Loading label="Đang tải nhóm..." />;
	if (error) return <ErrorMessage error={error} onRetry={reload} />;
	if (!group) return null;

	// Leader luôn đứng đầu danh sách thành viên.
	const members = [];
	if (group.leader) members.push(group.leader);
	(group.members ?? []).forEach((member) => {
		if (member.id !== group.leader?.id) members.push(member);
	});

	const handleJoin = () => joinMutation.run(() => joinRequestApi.create(id), 'Đã gửi yêu cầu tham gia.');

	const handleKick = (memberId) =>
		groupMutation.run(async () => {
			await groupApi.kickMember(id, memberId);
			reload();
		}, 'Đã mời thành viên ra khỏi nhóm.');

	const handleRequest = (requestId, action) =>
		requestMutation.run(async () => {
			if (action === 'approve') await joinRequestApi.approve(id, requestId);
			else await joinRequestApi.reject(id, requestId);
			reloadRequests();
			reload();
		}, action === 'approve' ? 'Đã duyệt yêu cầu.' : 'Đã từ chối yêu cầu.');

	const tabs = [
		{ key: 'mangas', label: `Truyện tranh (${group.translatedMangas?.length ?? 0})` },
		{ key: 'members', label: `Thành viên (${members.length})` },
	];

	return (
		<section className="animate-fade-up">
			<div className="overflow-hidden rounded-2xl border border-white/10">
				<Cover
					src={group.coverImageUrl}
					name={group.name}
					className="aspect-[16/6] w-full"
					textClass="text-6xl"
				/>
			</div>

			<div className="mt-4 flex flex-wrap items-center gap-4">
				<Cover
					src={avatar}
					name={group.name}
					className="h-20 w-20 shrink-0 rounded-2xl border border-white/10"
					textClass="text-3xl"
				/>
				<div className="min-w-0 flex-1">
					<h1 className="text-2xl font-bold text-white">{group.name}</h1>
					<p className="text-sm text-neutral-500">@{group.slug}</p>
				</div>
				<div className="flex items-center gap-2">
					{isLeader && (
						<Button variant="ghost" onClick={() => setEditing(true)}>
							Chỉnh sửa
						</Button>
					)}
					{!isLeader && isAuthenticated && !isMember && myGroupStatus === 'NONE' && (
						<Button onClick={handleJoin} disabled={joinMutation.loading}>
							Xin tham gia
						</Button>
					)}
				</div>
			</div>

			{group.description && (
				<p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-neutral-400">
					{group.description}
				</p>
			)}

			{joinMutation.message && <p className="mt-4 text-sm text-emerald-400">{joinMutation.message}</p>}
			{joinMutation.error && (
				<p className="mt-4 text-sm text-red-400">
					Lỗi ({joinMutation.error.code}): {joinMutation.error.message}
				</p>
			)}
			{groupMutation.error && (
				<p className="mt-4 text-sm text-red-400">
					Lỗi ({groupMutation.error.code}): {groupMutation.error.message}
				</p>
			)}

			<div className="mt-8 flex gap-1 border-b border-white/10">
				{tabs.map((item) => (
					<button
						key={item.key}
						type="button"
						onClick={() => setTab(item.key)}
						className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
							tab === item.key
								? 'border-white text-white'
								: 'border-transparent text-neutral-500 hover:text-neutral-200'
						}`}
					>
						{item.label}
					</button>
				))}
			</div>

			<div className="mt-6">
				{tab === 'mangas' ? (
					<MangaGrid mangas={group.translatedMangas ?? []} />
				) : (
					<ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-ink-900">
						{members.map((member) => (
							<li key={member.id} className="flex items-center justify-between gap-3 px-4 py-3">
								<span className="flex items-center gap-3">
									<Avatar src={member.avatar} name={member.username} size={32} />
									<span className="text-sm text-neutral-200">{member.username}</span>
									{member.id === group.leader?.id && <Badge tone="sky">Leader</Badge>}
								</span>
								{isLeader && member.id !== group.leader?.id && (
									<Button variant="danger" onClick={() => handleKick(member.id)}>
										Kick
									</Button>
								)}
							</li>
						))}
					</ul>
				)}
			</div>

			{editing && (
				<EditGroupModal
					group={group}
					avatar={avatar}
					onClose={() => setEditing(false)}
					onSaved={() => {
						setEditing(false);
						reload();
					}}
				/>
			)}

			{isLeader && (
				<section className="mt-10">
					<h2 className="mb-3 text-lg font-semibold text-white">Yêu cầu tham gia (chờ duyệt)</h2>
					{requestMutation.message && (
						<p className="mb-3 text-sm text-emerald-400">{requestMutation.message}</p>
					)}
					{!joinRequests || joinRequests.length === 0 ? (
						<EmptyState>Không có yêu cầu nào.</EmptyState>
					) : (
						<ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-ink-900">
							{joinRequests.map((request) => (
								<li key={request.id} className="flex items-center justify-between gap-3 px-4 py-3">
									<span className="flex items-center gap-3 text-sm text-neutral-200">
										{request.username}
										<Badge tone={JOIN_REQUEST_TONE[request.status]}>
											{JOIN_REQUEST_STATUS[request.status]}
										</Badge>
									</span>
									<span className="flex gap-2">
										<Button onClick={() => handleRequest(request.id, 'approve')}>Duyệt</Button>
										<Button variant="ghost" onClick={() => handleRequest(request.id, 'reject')}>
											Từ chối
										</Button>
									</span>
								</li>
							))}
						</ul>
					)}
				</section>
			)}
		</section>
	);
}

export default GroupDetailPage;
