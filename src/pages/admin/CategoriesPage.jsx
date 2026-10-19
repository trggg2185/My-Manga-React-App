import { useState } from 'react';
import { categoryApi } from '../../api';
import { useFetch } from '../../hooks/useFetch';
import { useMutation } from '../../hooks/useMutation';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

function CategoriesPage() {
	const [form, setForm] = useState({ name: '', description: '' });
	const [editing, setEditing] = useState(null);
	const mutation = useMutation();

	const { data: categories, error, loading, reload } = useFetch(() => categoryApi.list(), []);

	const submit = (e) => {
		e.preventDefault();
		// Sửa thể loại mà không đổi gì -> không gọi API.
		if (
			editing &&
			form.name === (editing.name ?? '') &&
			form.description === (editing.description ?? '')
		) {
			mutation.setMessage('Không có thay đổi nào.');
			return;
		}
		mutation.run(async () => {
			if (editing) await categoryApi.update(editing.id, form);
			else await categoryApi.create(form);
			setForm({ name: '', description: '' });
			setEditing(null);
			reload();
		}, editing ? 'Đã cập nhật thể loại.' : 'Đã tạo thể loại.');
	};

	const startEdit = (category) => {
		setEditing(category);
		setForm({ name: category.name ?? '', description: category.description ?? '' });
	};

	const handleDelete = (id) => {
		if (!window.confirm('Xoá thể loại này?')) return;
		mutation.run(async () => {
			await categoryApi.remove(id);
			reload();
		}, 'Đã xoá thể loại.');
	};

	return (
		<div className="grid gap-6 lg:grid-cols-2">
			<form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/10 bg-ink-900 p-6">
				<h2 className="text-lg font-semibold text-white">
					{editing ? `Sửa: ${editing.name}` : 'Tạo thể loại'}
				</h2>
				<Input
					label="Tên thể loại"
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

				<div className="flex gap-2">
					<Button type="submit" disabled={mutation.loading}>
						{mutation.loading ? 'Đang lưu...' : editing ? 'Lưu' : 'Tạo'}
					</Button>
					{editing && (
						<Button
							variant="ghost"
							onClick={() => {
								setEditing(null);
								setForm({ name: '', description: '' });
							}}
						>
							Huỷ
						</Button>
					)}
				</div>
			</form>

			<div>
				<h2 className="mb-3 text-lg font-semibold text-white">Danh sách thể loại</h2>
				{loading ? (
					<Loading />
				) : error ? (
					<ErrorMessage error={error} onRetry={reload} />
				) : categories?.length === 0 ? (
					<EmptyState>Chưa có thể loại.</EmptyState>
				) : (
					<ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-ink-900">
						{categories?.map((category) => (
							<li key={category.id} className="flex items-center justify-between gap-3 px-4 py-3">
								<span className="text-sm text-neutral-200">{category.name}</span>
								<span className="flex gap-2">
									<Button variant="ghost" onClick={() => startEdit(category)}>
										Sửa
									</Button>
									<Button variant="danger" onClick={() => handleDelete(category.id)}>
										Xoá
									</Button>
								</span>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}

export default CategoriesPage;
