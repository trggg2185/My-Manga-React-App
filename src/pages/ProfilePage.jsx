import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userApi } from '../api';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useMutation } from '../hooks/useMutation';
import { formatDateTime } from '../utils/format';
import PageHeader from '../components/common/PageHeader';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Textarea from '../components/common/Textarea';
import Avatar from '../components/common/Avatar';

function ProfilePage() {
	const { data: me, error, loading, reload } = useCurrentUser();
	const [form, setForm] = useState({ email: '', facebook: '', discord: '', bio: '', avatar: null });
	const [password, setPassword] = useState({ oldPassword: '', newPassword: '' });
	const [avatarPreview, setAvatarPreview] = useState(null);

	const profileMutation = useMutation();
	const passwordMutation = useMutation();

	// Thu hồi object URL khi đổi ảnh preview hoặc rời trang.
	useEffect(
		() => () => {
			if (avatarPreview) URL.revokeObjectURL(avatarPreview);
		},
		[avatarPreview],
	);

	useEffect(() => {
		if (!me) return;
		// eslint-disable-next-line react-hooks/set-state-in-effect -- nạp dữ liệu server vào form một lần
		setForm({
			email: me.email ?? '',
			facebook: me.facebook ?? '',
			discord: me.discord ?? '',
			bio: me.bio ?? '',
			avatar: null,
		});
	}, [me]);

	if (loading) return <Loading label="Đang tải hồ sơ..." />;
	if (error) return <ErrorMessage error={error} onRetry={reload} />;

	const handleAvatarChange = (e) => {
		const file = e.target.files?.[0] ?? null;
		setForm((f) => ({ ...f, avatar: file }));
		setAvatarPreview(file ? URL.createObjectURL(file) : null);
	};

	const submitProfile = (e) => {
		e.preventDefault();
		// Không có field nào khác dữ liệu gốc và không chọn avatar mới -> không gọi API.
		const unchanged =
			!form.avatar &&
			form.email === (me?.email ?? '') &&
			form.facebook === (me?.facebook ?? '') &&
			form.discord === (me?.discord ?? '') &&
			form.bio === (me?.bio ?? '');
		if (unchanged) {
			profileMutation.setMessage('Không có thay đổi nào.');
			return;
		}
		profileMutation.run(async () => {
			await userApi.updateMe(form);
			setAvatarPreview(null);
			reload();
		}, 'Đã lưu hồ sơ.');
	};

	const submitPassword = (e) => {
		e.preventDefault();
		passwordMutation.run(async () => {
			await userApi.changePassword(password);
			setPassword({ oldPassword: '', newPassword: '' });
		}, 'Đã đổi mật khẩu.');
	};

	return (
		<section className="animate-fade-up">
			<PageHeader
				title="Hồ sơ của tôi"
				subtitle={me ? `@${me.username}` : ''}
				actions={
					<Link to="/my/join-requests">
						<Button variant="ghost">Yêu cầu của tôi</Button>
					</Link>
				}
			/>

			<div className="grid gap-6 lg:grid-cols-2">
				<form onSubmit={submitProfile} className="space-y-4 rounded-2xl border border-white/10 bg-ink-900 p-6">
					<h2 className="text-lg font-semibold text-white">Thông tin</h2>

					<Input
						label="Email"
						value={form.email}
						onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
					/>
					<Input
						label="Facebook"
						value={form.facebook}
						onChange={(e) => setForm((f) => ({ ...f, facebook: e.target.value }))}
					/>
					<Input
						label="Discord"
						value={form.discord}
						onChange={(e) => setForm((f) => ({ ...f, discord: e.target.value }))}
					/>
					<Textarea
						label="Giới thiệu (tối đa 300 ký tự)"
						maxLength={300}
						value={form.bio}
						onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
					/>
					<div>
						<span className="mb-1.5 block text-sm text-neutral-400">Avatar</span>
						<div className="flex items-center gap-4">
							<Avatar src={avatarPreview || me?.avatar} name={me?.username} size={72} />
							<div>
								<label className="inline-block cursor-pointer rounded-lg border border-white/15 px-3.5 py-2 text-sm text-neutral-200 transition-colors duration-200 hover:border-white/30 hover:bg-white/5">
									{avatarPreview ? 'Chọn ảnh khác' : 'Chọn ảnh'}
									<input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
								</label>
								<p className="mt-1 text-xs text-neutral-600">
									{avatarPreview ? 'Xem trước ảnh mới — lưu để áp dụng.' : 'PNG/JPG, tối đa 5MB.'}
								</p>
							</div>
						</div>
					</div>

					{profileMutation.error && (
						<p className="text-sm text-red-400">
							Lỗi ({profileMutation.error.code}): {profileMutation.error.message}
						</p>
					)}
					{profileMutation.message && <p className="text-sm text-emerald-400">{profileMutation.message}</p>}

					<Button type="submit" disabled={profileMutation.loading}>
						{profileMutation.loading ? 'Đang lưu...' : 'Lưu thay đổi'}
					</Button>

					{me?.createdAt && (
						<p className="text-xs text-neutral-600">Tham gia ngày {formatDateTime(me.createdAt)}</p>
					)}
				</form>

				<form onSubmit={submitPassword} className="space-y-4 rounded-2xl border border-white/10 bg-ink-900 p-6">
					<h2 className="text-lg font-semibold text-white">Đổi mật khẩu</h2>

					<Input
						label="Mật khẩu cũ"
						type="password"
						value={password.oldPassword}
						onChange={(e) => setPassword((p) => ({ ...p, oldPassword: e.target.value }))}
					/>
					<Input
						label="Mật khẩu mới"
						type="password"
						value={password.newPassword}
						onChange={(e) => setPassword((p) => ({ ...p, newPassword: e.target.value }))}
					/>

					{passwordMutation.error && (
						<p className="text-sm text-red-400">
							Lỗi ({passwordMutation.error.code}): {passwordMutation.error.message}
						</p>
					)}
					{passwordMutation.message && (
						<p className="text-sm text-emerald-400">{passwordMutation.message}</p>
					)}

					<Button type="submit" disabled={passwordMutation.loading}>
						{passwordMutation.loading ? 'Đang đổi...' : 'Đổi mật khẩu'}
					</Button>
					<p className="text-xs text-neutral-600">Giới hạn 5 lần / 15 phút.</p>
				</form>
			</div>
		</section>
	);
}

export default ProfilePage;
