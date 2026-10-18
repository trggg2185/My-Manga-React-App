import { useState } from 'react';
import { userApi } from '../../api';
import { useFetch } from '../../hooks/useFetch';
import { useMutation } from '../../hooks/useMutation';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Pagination from '../../components/common/Pagination';

const ROLE_NAMES = ['USER', 'TRANSLATOR', 'ADMIN'];

function UsersPage() {
	const [page, setPage] = useState(0);
	const [showCreate, setShowCreate] = useState(false);
	const [form, setForm] = useState({ username: '', password: '', email: '', roles: [] });
	const mutation = useMutation();

	const { data, error, loading, reload } = useFetch(
		() => userApi.list({ page, size: 20, sortBy: 'createdAt' }),
		[page],
	);

	const toggleRole = (name) =>
		setForm((f) => ({
			...f,
			roles: f.roles.includes(name) ? f.roles.filter((r) => r !== name) : [...f.roles, name],
		}));

	const submit = (e) => {
		e.preventDefault();
		mutation.run(async () => {
			await userApi.create(form);
			setForm({ username: '', password: '', email: '', roles: [] });
			setShowCreate(false);
			reload();
		}, 'Đã tạo người dùng.');
	};

	const handleDelete = (id) => {
		if (!window.confirm('Xoá người dùng này?')) return;
		mutation.run(async () => {
			await userApi.remove(id);
			reload();
		}, 'Đã xoá người dùng.');
	};

	return (
		<div>
			<div className="mb-4 flex justify-end">
				<Button onClick={() => setShowCreate((v) => !v)}>
					{showCreate ? 'Đóng' : '+ Tạo người dùng'}
				</Button>
			</div>

			{showCreate && (
				<form onSubmit={submit} className="mb-6 grid gap-4 rounded-2xl border border-white/10 bg-ink-900 p-6 sm:grid-cols-2">
					<Input
						label="Username"
						value={form.username}
						onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
					/>
					<Input
						label="Password"
						type="password"
						value={form.password}
						onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
					/>
					<Input
						label="Email"
						value={form.email}
						onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
					/>
					<div className="flex flex-wrap items-end gap-2">
						{ROLE_NAMES.map((name) => (
							<button
								key={name}
								type="button"
								onClick={() => toggleRole(name)}
								className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-200 ${
									form.roles.includes(name)
										? 'border-white/40 bg-white text-ink-950'
										: 'border-white/10 text-neutral-400 hover:border-white/25 hover:text-white'
								}`}
							>
								{name}
							</button>
						))}
					</div>
					<div className="sm:col-span-2">
						<Button type="submit" disabled={mutation.loading}>
							{mutation.loading ? 'Đang tạo...' : 'Tạo'}
						</Button>
					</div>
				</form>
			)}

			{mutation.error && (
				<p className="mb-4 text-sm text-red-400">
					Lỗi ({mutation.error.code}): {mutation.error.message}
				</p>
			)}

			{loading ? (
				<Loading />
			) : error ? (
				<ErrorMessage error={error} onRetry={reload} />
			) : data?.content?.length === 0 ? (
				<EmptyState>Chưa có người dùng.</EmptyState>
			) : (
				<>
					<ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-ink-900">
						{data.content.map((user) => (
							<li key={user.id} className="flex items-center justify-between px-4 py-3">
								<span className="text-sm text-neutral-200">{user.username}</span>
								<Button variant="danger" onClick={() => handleDelete(user.id)}>
									Xoá
								</Button>
							</li>
						))}
					</ul>
					<Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
				</>
			)}
		</div>
	);
}

export default UsersPage;
