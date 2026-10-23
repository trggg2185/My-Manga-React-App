import { Link, useParams } from 'react-router-dom';
import { userApi } from '../api';
import { useFetch } from '../hooks/useFetch';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { formatDate } from '../utils/format';
import PageHeader from '../components/common/PageHeader';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import Cover from '../components/common/Cover';

const isUrl = (value) => /^https?:\/\//i.test(value ?? '');

function Contact({ label, value }) {
	if (isUrl(value)) {
		return (
			<a
				href={value}
				target="_blank"
				rel="noreferrer"
				className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-neutral-300 transition-colors duration-200 hover:border-white/25 hover:text-white"
			>
				{label} ↗
			</a>
		);
	}

	return (
		<span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-neutral-400">
			{label}: <span className="text-neutral-200">{value}</span>
		</span>
	);
}

function UserProfilePage() {
	const { username } = useParams();
	const { data: me } = useCurrentUser();
	const { data: user, error, loading, reload } = useFetch(
		() => userApi.getProfile(username),
		[username],
	);

	if (loading) return <Loading label="Đang tải trang cá nhân..." />;
	if (error) return <ErrorMessage error={error} onRetry={reload} />;
	if (!user) {
		return <ErrorMessage error={{ code: '4101', message: 'Người dùng không tồn tại!' }} />;
	}

	const isSelf = me?.username?.toLowerCase() === user.username?.toLowerCase();
	const group = user.transGroup;
	const displayName = user.displayName?.trim() || user.username;

	return (
		<article className="animate-fade-up">
			<PageHeader
				title="Trang cá nhân"
				actions={
					isSelf && (
						<Link to="/profile">
							<Button variant="ghost">Chỉnh sửa hồ sơ</Button>
						</Link>
					)
				}
			/>

			<section className="rounded-2xl border border-white/10 bg-ink-900 p-6">
				<div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
					<Avatar src={user.avatar} name={displayName} size={96} />
					<div className="min-w-0">
						<h2 className="text-2xl font-bold text-white">{displayName}</h2>
						{displayName !== user.username && (
							<p className="mt-1 text-sm text-neutral-500">@{user.username}</p>
						)}
						<p className="mt-1 text-sm text-neutral-500">
							Tham gia {formatDate(user.createdAt)}
						</p>
					</div>
				</div>

				{user.bio && (
					<p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-neutral-300">
						{user.bio}
					</p>
				)}

				{(user.facebook || user.discord) && (
					<div className="mt-5 flex flex-wrap gap-2">
						{user.facebook && <Contact label="Facebook" value={user.facebook} />}
						{user.discord && <Contact label="Discord" value={user.discord} />}
					</div>
				)}
			</section>

			<section className="mt-6">
				<h2 className="mb-3 text-lg font-semibold text-white">Nhóm dịch</h2>
				{group ? (
					<Link
						to={`/groups/${group.slug ?? group.id}`}
						className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-ink-900 p-4 transition-colors duration-200 hover:border-white/25 hover:bg-white/5"
					>
						<Cover
							src={group.avatar}
							name={group.name}
							className="h-12 w-12 shrink-0 rounded-xl"
							textClass="text-lg"
						/>
						<div className="min-w-0">
							<p className="truncate text-sm font-semibold text-neutral-100 group-hover:text-white">
								{group.name}
							</p>
							<p className="truncate text-xs text-neutral-500">@{group.slug}</p>
						</div>
					</Link>
				) : (
					<p className="rounded-2xl border border-white/10 bg-ink-900 p-4 text-sm text-neutral-500">
						Chưa tham gia nhóm dịch nào.
					</p>
				)}
			</section>
		</article>
	);
}

export default UserProfilePage;
