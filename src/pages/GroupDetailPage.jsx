import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { groupApi, joinRequestApi } from '../api';
import { useFetch } from '../hooks/useFetch';
import { useMutation } from '../hooks/useMutation';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useAuth } from '../auth/useAuth';
import { JOIN_REQUEST_STATUS, JOIN_REQUEST_TONE } from '../utils/format';
import PageHeader from '../components/common/PageHeader';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Textarea from '../components/common/Textarea';
import ImageUploadField from '../components/common/ImageUploadField';

function GroupDetailPage() {
	const { id } = useParams();
	const { isAuthenticated } = useAuth();
	const { data: me } = useCurrentUser();
	const [editing, setEditing] = useState(false);
	const [form, setForm] = useState({ name: '', coverImageUrl: '', description: '' });

	const { data: group, error, loading, reload } = useFetch(() => groupApi.get(id), [id]);

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

	const startEditing = () => {
		setForm({ name: group.name ?? '', coverImageUrl: group.coverImageUrl ?? '', description: group.description ?? '' });
		setEditing(true);
	};

	const submitEdit = (e) => {
		e.preventDefault();
		groupMutation.run(async () => {
			const payload = { ...form };
			// ảnh bìa rỗng thì bỏ field để giữ nguyên bìa cũ
			if (!payload.coverImageUrl) delete payload.coverImageUrl;
			await groupApi.update(id, payload);
			setEditing(false);
			reload();
		}, 'Đã cập nhật nhóm.');
	};

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

	return (
		<section className="animate-fade-up">
			<PageHeader
				title={group.name}
				subtitle={`@${group.slug}`}
				actions={
					isLeader ? (
						<Button variant="ghost" onClick={startEditing}>
							Chỉnh sửa
						</Button>
					) : isAuthenticated && !isMember && !me?.transGroupId ? (
						<Button onClick={handleJoin} disabled={joinMutation.loading}>
							Xin tham gia
						</Button>
					) : null
				}
			/>

			{joinMutation.message && <p className="mb-4 text-sm text-emerald-400">{joinMutation.message}</p>}
			{joinMutation.error && (
				<p className="mb-4 text-sm text-red-400">
					Lỗi ({joinMutation.error.code}): {joinMutation.error.message}
				</p>
			)}
			{groupMutation.error && (
				<p className="mb-4 text-sm text-red-400">
					Lỗi ({groupMutation.error.code}): {groupMutation.error.message}
				</p>
			)}

			{editing && (
				<form onSubmit={submitEdit} className="mb-6 space-y-4 rounded-2xl border border-white/10 bg-ink-900 p-5">
					<Input
						label="Tên nhóm"
						value={form.name}
						onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
					/>
					<ImageUploadField
						value={form.coverImageUrl}
						onChange={(url) => setForm((f) => ({ ...f, coverImageUrl: url }))}
					/>
					<Textarea
						label="Mô tả"
						value={form.description}
						onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
					/>
					<div className="flex gap-2">
						<Button type="submit" disabled={groupMutation.loading}>
							{groupMutation.loading ? 'Đang lưu...' : 'Lưu'}
						</Button>
						<Button variant="ghost" onClick={() => setEditing(false)}>
							Huỷ
						</Button>
					</div>
				</form>
			)}

			{group.description && (
				<p className="mb-8 whitespace-pre-line text-sm leading-relaxed text-neutral-400">
					{group.description}
				</p>
			)}

			<section className="mb-10">
				<h2 className="mb-3 text-lg font-semibold text-white">Thành viên ({group.members?.length ?? 0})</h2>
				{group.members?.length === 0 ? (
					<EmptyState>Nhóm chưa có thành viên.</EmptyState>
				) : (
					<ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-ink-900">
						{group.members?.map((member) => (
							<li key={member.id} className="flex items-center justify-between px-4 py-3">
								<span className="flex items-center gap-3 text-sm text-neutral-200">
									{member.username}
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
			</section>

			<section className="mb-10">
				<h2 className="mb-3 text-lg font-semibold text-white">Truyện đang dịch</h2>
				{group.translatedMangas?.length === 0 ? (
					<EmptyState>Nhóm chưa dịch truyện nào.</EmptyState>
				) : (
					<div className="flex flex-wrap gap-2">
						{group.translatedMangas?.map((manga) => (
							<Link
								key={manga.id}
								to={`/mangas/${manga.id}`}
								className="rounded-lg border border-white/10 bg-ink-900 px-3 py-1.5 text-sm text-neutral-300 transition-colors duration-200 hover:border-white/30 hover:text-white"
							>
								{manga.name}
							</Link>
						))}
					</div>
				)}
			</section>

			{isLeader && (
				<section>
					<h2 className="mb-3 text-lg font-semibold text-white">Yêu cầu tham gia (chờ duyệt)</h2>
					{requestMutation.message && (
						<p className="mb-3 text-sm text-emerald-400">{requestMutation.message}</p>
					)}
					{!joinRequests || joinRequests.length === 0 ? (
						<EmptyState>Không có yêu cầu nào.</EmptyState>
					) : (
						<ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-ink-900">
							{joinRequests.map((request) => (
								<li
									key={request.id}
									className="flex items-center justify-between gap-3 px-4 py-3"
								>
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
