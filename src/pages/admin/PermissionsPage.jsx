import { useState } from 'react';
import { roleApi } from '../../api';
import { useFetch } from '../../hooks/useFetch';
import { useMutation } from '../../hooks/useMutation';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

// Lưu ý: PermissionResponse không trả về `id` nên chưa thể gọi DELETE /admin/permissions/{id}.
function PermissionsPage() {
	const [form, setForm] = useState({ name: '', description: '' });
	const mutation = useMutation();

	const { data: permissions, error, loading, reload } = useFetch(
		() => roleApi.listPermissions(),
		[],
	);

	const submit = (e) => {
		e.preventDefault();
		mutation.run(async () => {
			await roleApi.createPermission(form);
			setForm({ name: '', description: '' });
			reload();
		}, 'Đã tạo quyền.');
	};

	return (
		<div className="grid gap-6 lg:grid-cols-2">
			<form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/10 bg-ink-900 p-6">
				<h2 className="text-lg font-semibold text-white">Tạo quyền</h2>
				<Input
					label="Tên quyền"
					value={form.name}
					onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
				/>
				<Input
					label="Mô tả"
					value={form.description}
					onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
				/>

				{mutation.error && (
					<p className="text-sm text-red-400">
						Lỗi ({mutation.error.code}): {mutation.error.message}
					</p>
				)}
				{mutation.message && <p className="text-sm text-emerald-400">{mutation.message}</p>}

				<Button type="submit" disabled={mutation.loading}>
					{mutation.loading ? 'Đang tạo...' : 'Tạo quyền'}
				</Button>
			</form>

			<div>
				<h2 className="mb-3 text-lg font-semibold text-white">Danh sách quyền</h2>
				{loading ? (
					<Loading />
				) : error ? (
					<ErrorMessage error={error} onRetry={reload} />
				) : permissions?.length === 0 ? (
					<EmptyState>Chưa có quyền.</EmptyState>
				) : (
					<ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-ink-900">
						{permissions?.map((permission) => (
							<li key={permission.name} className="px-4 py-3">
								<p className="text-sm font-medium text-neutral-100">{permission.name}</p>
								<p className="mt-1 text-xs text-neutral-500">
									{permission.description || 'Không có mô tả'}
								</p>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}

export default PermissionsPage;
