import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { chapterApi, uploadApi, ApiError } from '../../api';
import { resolveMangaId } from '../../utils/resolveUrl';
import { useMutation } from '../../hooks/useMutation';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

function ChapterEditorPage() {
	const { slug } = useParams();
	const navigate = useNavigate();
	const [chapterIndex, setChapterIndex] = useState('');
	const [title, setTitle] = useState('');
	// Mỗi trang: { id, name, size, preview, progress, url, status } — url chỉ có sau khi upload tmp xong.
	const [pages, setPages] = useState([]);
	const [uploadError, setUploadError] = useState(null);
	const [uploading, setUploading] = useState(false);
	const [dragIndex, setDragIndex] = useState(null);
	const nextId = useRef(1);
	const pagesRef = useRef([]);
	const mutation = useMutation();

	// Giữ ref mới nhất để thu hồi hết blob preview khi rời trang.
	useEffect(() => {
		pagesRef.current = pages;
	}, [pages]);
	useEffect(
		() => () => {
			pagesRef.current.forEach((page) => {
				if (page.preview) URL.revokeObjectURL(page.preview);
			});
		},
		[],
	);

	const uploaded = pages.filter((page) => page.status === 'done');
	const ready = pages.length > 0 && !uploading && uploaded.length === pages.length;

	// Chọn file là upload tmp ngay để theo dõi được tiến độ; submit chỉ gửi danh sách URL.
	const onPickFiles = async (e) => {
		const files = Array.from(e.target.files ?? []);
		e.target.value = ''; // cho phép chọn lại đúng file vừa bỏ
		if (files.length === 0) return;

		const items = files.map((file) => ({
			id: nextId.current++,
			name: file.name,
			size: file.size,
			preview: URL.createObjectURL(file),
			progress: 0,
			url: null,
			status: 'uploading',
		}));
		const totalBytes = items.reduce((sum, item) => sum + item.size, 0);
		setPages((prev) => [...prev, ...items]);
		setUploadError(null);
		setUploading(true);

		try {
			// Backend trả URL theo đúng thứ tự file gửi lên.
			const urls = await uploadApi.uploadMulti(files, (event) => {
				if (!totalBytes) return;
				// Chia tiến độ của cả request multipart theo kích thước từng file.
				const sent = event.total ? (event.loaded / event.total) * totalBytes : event.loaded;
				const progressById = new Map();
				let offset = 0;
				items.forEach((item) => {
					progressById.set(item.id, Math.min(1, Math.max(0, (sent - offset) / (item.size || 1))));
					offset += item.size;
				});
				setPages((prev) =>
					prev.map((page) =>
						progressById.has(page.id) ? { ...page, progress: progressById.get(page.id) } : page,
					),
				);
			});
			const urlById = new Map(items.map((item, i) => [item.id, urls[i]]));
			setPages((prev) =>
				prev.map((page) =>
					urlById.has(page.id)
						? { ...page, url: urlById.get(page.id), status: 'done', progress: 1 }
						: page,
				),
			);
		} catch (err) {
			const failedIds = new Set(items.map((item) => item.id));
			setPages((prev) =>
				prev.map((page) => (failedIds.has(page.id) ? { ...page, status: 'error' } : page)),
			);
			setUploadError(err);
		} finally {
			setUploading(false);
		}
	};

	// Bỏ 1 ảnh khỏi danh sách (cũng để thoát khỏi ảnh upload lỗi).
	const removePage = (id) => {
		const target = pages.find((page) => page.id === id);
		if (target?.preview) URL.revokeObjectURL(target.preview);
		setPages((prev) => prev.filter((page) => page.id !== id));
		setUploadError(null);
	};

	// Đổi thứ tự ảnh: thứ tự trong `pages` chính là thứ tự gửi lên khi tạo chương.
	const movePage = (from, to) => {
		if (from === to || to < 0 || to >= pages.length) return;
		setPages((prev) => {
			const next = [...prev];
			const [item] = next.splice(from, 1);
			next.splice(to, 0, item);
			return next;
		});
	};

	const submit = (e) => {
		e.preventDefault();
		mutation.run(async () => {
			const mangaId = await resolveMangaId(slug);
			if (!mangaId) throw new ApiError('404', 'Không tìm thấy truyện.');
			await chapterApi.create(mangaId, {
				chapterIndex: Number(chapterIndex),
				title,
				pageUrls: uploaded.map((page) => page.url),
			});
			navigate(`/manage/mangas/${slug}/chapters`);
		});
	};

	const error = uploadError ?? mutation.error;

	return (
		<section className="animate-fade-up">
			<PageHeader title="Thêm chương" subtitle="Ảnh được tải lên theo đúng thứ tự trang" />

			<form
				onSubmit={submit}
				className="mx-auto max-w-3xl space-y-4 rounded-2xl border border-white/10 bg-ink-900 p-6 sm:p-8"
			>
				<Input
					label="Số chương (không trùng trong cùng truyện)"
					type="number"
					min="1"
					value={chapterIndex}
					onChange={(e) => setChapterIndex(e.target.value)}
				/>
				<Input
					label="Tiêu đề (tuỳ chọn)"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
				/>
				<Input
					label="Ảnh các trang (nhiều file, tối đa 150)"
					type="file"
					accept="image/*"
					multiple
					disabled={pages.length >= 150}
					onChange={onPickFiles}
				/>

				{pages.length > 0 && (
					<div className="space-y-2">
						<p className="text-xs text-neutral-500">
							Đã tải lên {uploaded.length}/{pages.length} ảnh{uploading ? ' — đang tải...' : ''}. Kéo
							ảnh để đổi thứ tự.
						</p>
						<ul className="grid max-h-[32rem] grid-cols-3 gap-2 overflow-y-auto rounded-xl border border-white/10 bg-ink-950 p-2 sm:grid-cols-4 md:grid-cols-5">
							{pages.map((page, index) => {
								const percent = Math.round((page.progress ?? 0) * 100);
								const statusText =
									page.status === 'done'
										? 'Đã tải lên'
										: page.status === 'error'
											? 'Tải lỗi'
											: `Đang tải... ${percent}%`;
								const barColor =
									page.status === 'done'
										? 'bg-emerald-400'
										: page.status === 'error'
											? 'bg-red-400'
											: 'bg-amber-400';

								return (
									<li
										key={page.id}
										draggable
										onDragStart={(e) => {
											e.dataTransfer.effectAllowed = 'move';
											e.dataTransfer.setData('text/plain', String(index));
											setDragIndex(index);
										}}
										onDragOver={(e) => e.preventDefault()}
										onDrop={() => {
											if (dragIndex != null) movePage(dragIndex, index);
											setDragIndex(null);
										}}
										onDragEnd={() => setDragIndex(null)}
										className={`flex cursor-grab flex-col rounded-lg border p-1 transition-all duration-200 ${
											dragIndex === index
												? 'border-white/30 opacity-50'
												: 'border-transparent hover:border-white/10'
										}`}
									>
										<div className="relative">
											<img
												src={page.preview}
												alt={`Xem trước trang ${index + 1}`}
												draggable={false}
												className="aspect-[3/4] w-full rounded bg-ink-900 object-contain"
											/>
											<span className="absolute left-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-white">
												{index + 1}
											</span>
											<button
												type="button"
												onClick={() => removePage(page.id)}
												aria-label={`Xoá ảnh ${index + 1}`}
												className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-sm text-neutral-200 transition-colors duration-200 hover:bg-red-500/90 hover:text-white"
											>
												×
											</button>
										</div>
										<div
											role="progressbar"
											aria-valuemin={0}
											aria-valuemax={100}
											aria-valuenow={percent}
											aria-label={`Tiến độ tải ảnh ${index + 1}`}
											title={statusText}
											className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/10"
										>
											<div
												className={`h-full rounded-full transition-[width] duration-200 ${barColor}`}
												style={{ width: `${percent}%` }}
											/>
										</div>
									</li>
								);
							})}
						</ul>
					</div>
				)}

				{error && (
					<p className="text-sm text-red-400">
						Lỗi ({error.code}): {error.message}
					</p>
				)}

				<Button type="submit" disabled={mutation.loading || !ready || !chapterIndex}>
					{mutation.loading ? 'Đang tạo chương...' : 'Tạo chương'}
				</Button>
				<p className="text-xs text-neutral-600">
					Lưu ý: mỗi lần chọn ảnh là 1 lần upload (giới hạn 3 lần/giờ), mỗi ảnh tối đa 5MB.
				</p>
			</form>
		</section>
	);
}

export default ChapterEditorPage;
