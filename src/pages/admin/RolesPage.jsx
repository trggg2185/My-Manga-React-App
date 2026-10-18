import { useState } from 'react';
import { roleApi } from '../../api';
import { useFetch } from '../../hooks/useFetch';
import { useMutation } from '../../hooks/useMutation';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

// Lưu ý: RoleResponse không trả về `id` nên chưa thể gọi DELETE /admin/roles/{id}.
function RolesPage() {
	const [form, setForm] = useState({ name: '', description: '', permissions: [] });
	const mutation = useMutation();

	const { data: roles, error, loading, reload } = useFetch(() => roleApi.listRoles(), []);
	const { data: permissions } = useFetch(() => roleApi.listPermissions(), []);

	const togglePermission = (name) =>
		setForm((f) => ({
			...f,
			permissions: f.permissions.includes(name)
				? f.permissions.filter((p) => p !== name)
				: [...f.permissions, name],
		}));

	const submit = (e) => {
		e.preventDefault();
		mutation.run(async () => {
			await roleApi.createRole(form);
			setForm({ name: '', description: '', permissions: [] });
			reload();
		}, 'Đã tạo vai trò.');
	};

	return (
		<div className="grid gap-6 lg:grid-cols-2">
			<form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/10 bg-ink-900 p-6">
				<h2 className="text-lg font-semibold text-white">Tạo vai trò</h2>
				<Input
					label="Tên vai trò"
					value={form.name}
					onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
				/>
				<Input
					label="Mô tả"
					value={form.description}
					onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
				/>
				<div>
					<span className="mb-1.5 block text-sm text-neutral-400">Quyền</span>
					<div className="flex flex-wrap gap-2">
						{permissions?.map((permission) => {
							const active = form.permissions.includes(permission.name);
							return (
								<button
									key={permission.name}
									type="button"
									onClick={() => togglePermission(permission.name)}
									className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-200 ${
										active
											? 'border-white/40 bg-white text-ink-950'
											: 'border-white/10 text-neutral-400 hover:border-white/25 hover:text-white'
									}`}
								>
									{permission.name}
								</button>
							);
						})}
					</div>
				</div>

				{mutation.error && (
					<p className="text-sm text-red-400">
						Lỗi ({mutation.error.code}): {mutation.error.message}
					</p>
				)}
				{mutation.message && <p className="text-sm text-emerald-400">{mutation.message}</p>}

				<Button type="submit" disabled={mutation.loading || form.permissions.length === 0}>
					{mutation.loading ? 'Đang tạo...' : 'Tạo vai trò'}
				</Button>
			</form>

			<div>
				<h2 className="mb-3 text-lg font-semibold text-white">Danh sách vai trò</h2>
				{loading ? (
					<Loading />
				) : error ? (
					<ErrorMessage error={error} onRetry={reload} />
				) : roles?.length === 0 ? (
					<EmptyState>Chưa có vai trò.</EmptyState>
				) : (
					<ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-ink-900">
						{roles?.map((role) => (
							<li key={role.name} className="px-4 py-3">
								<p className="text-sm font-medium text-neutral-100">{role.name}</p>
								<p className="mt-1 text-xs text-neutral-500">
									{role.permissions?.map((p) => p.name).join(', ') || 'Không có quyền'}
								</p>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}

export default RolesPage;
