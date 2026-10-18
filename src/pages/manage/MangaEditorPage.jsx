import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryApi, mangaApi } from '../../api';
import { useFetch } from '../../hooks/useFetch';
import { useMutation } from '../../hooks/useMutation';
import { MANGA_STATUS } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import ImageUploadField from '../../components/common/ImageUploadField';

const STATUS_OPTIONS = Object.entries(MANGA_STATUS).map(([value, label]) => ({ value, label }));

function MangaEditorPage() {
	const { mangaId } = useParams();
	const navigate = useNavigate();
	const isEdit = Boolean(mangaId);

	const { data: categories } = useFetch(() => categoryApi.list(), []);
	const { data: manga, loading, error } = useFetch(
		() => (isEdit ? mangaApi.get(mangaId) : Promise.resolve(null)),
		[mangaId],
	);

	const [form, setForm] = useState({
		name: '',
		authorsName: '',
		coverImageUrl: '',
		status: 'ONGOING',
		description: '',
		categoryIds: [],
	});
	const mutation = useMutation();

	useEffect(() => {
		if (!manga) return;
		// eslint-disable-next-line react-hooks/set-state-in-effect -- nạp dữ liệu server vào form một lần
		setForm({
			name: manga.name ?? '',
			authorsName: manga.authorsName ?? '',
			coverImageUrl: manga.coverImageUrl ?? '',
			status: manga.status ?? 'ONGOING',
			description: manga.description ?? '',
			categoryIds: manga.categories?.map((category) => category.id) ?? [],
		});
	}, [manga]);

	if (isEdit && loading) return <Loading />;
	if (isEdit && error) return <ErrorMessage error={error} />;

	const toggleCategory = (id) =>
		setForm((f) => ({
			...f,
			categoryIds: f.categoryIds.includes(id)
				? f.categoryIds.filter((value) => value !== id)
				: [...f.categoryIds, id],
		}));

	const submit = (e) => {
		e.preventDefault();
		mutation.run(async () => {
			const payload = { ...form };
			// ảnh bìa rỗng thì bỏ field (create: không có bìa; update: giữ nguyên bìa cũ)
			if (!payload.coverImageUrl) delete payload.coverImageUrl;
			if (isEdit) await mangaApi.update(mangaId, payload);
			else await mangaApi.create(payload);
			navigate('/manage');
		});
	};

	return (
		<section className="animate-fade-up">
			<PageHeader title={isEdit ? 'Sửa truyện' : 'Tạo truyện mới'} />

			<form onSubmit={submit} className="max-w-2xl space-y-4 rounded-2xl border border-white/10 bg-ink-900 p-6">
				<Input
					label="Tên truyện"
					value={form.name}
					onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
				/>
				<Input
					label="Tác giả"
					value={form.authorsName}
					onChange={(e) => setForm((f) => ({ ...f, authorsName: e.target.value }))}
				/>
				<ImageUploadField
					value={form.coverImageUrl}
					onChange={(url) => setForm((f) => ({ ...f, coverImageUrl: url }))}
				/>
				<Select
					label="Tình trạng"
					options={STATUS_OPTIONS}
					value={form.status}
					onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
				/>

				<div>
					<span className="mb-1.5 block text-sm text-neutral-400">Thể loại</span>
					<div className="flex flex-wrap gap-2">
						{categories?.map((category) => {
							const active = form.categoryIds.includes(category.id);
							return (
								<button
									key={category.id}
									type="button"
									onClick={() => toggleCategory(category.id)}
									className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-200 ${
										active
											? 'border-white/40 bg-white text-ink-950'
											: 'border-white/10 text-neutral-400 hover:border-white/25 hover:text-white'
									}`}
								>
									{category.name}
								</button>
							);
						})}
					</div>
				</div>

				<Textarea
					label="Mô tả (tối đa 500 ký tự)"
					maxLength={500}
					value={form.description}
					onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
				/>

				{mutation.error && (
					<p className="text-sm text-red-400">
						Lỗi ({mutation.error.code}): {mutation.error.message}
					</p>
				)}

				<Button type="submit" disabled={mutation.loading}>
					{mutation.loading ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo truyện'}
				</Button>
			</form>
		</section>
	);
}

export default MangaEditorPage;
