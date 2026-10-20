import { useRef, useState } from 'react';
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
	// Mỗi trang: { id, name, url, status } — url chỉ có sau khi upload tmp xong.
	const [pages, setPages] = useState([]);
	const [uploadError, setUploadError] = useState(null);
	const [uploading, setUploading] = useState(false);
	const nextId = useRef(1);
	const mutation = useMutation();

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
			url: null,
			status: 'uploading',
		}));
		setPages((prev) => [...prev, ...items]);
		setUploadError(null);
		setUploading(true);

		try {
			// Backend trả URL theo đúng thứ tự file gửi lên.
			const urls = await uploadApi.uploadMulti(files);
			const urlById = new Map(items.map((item, i) => [item.id, urls[i]]));
			setPages((prev) =>
				prev.map((page) =>
					urlById.has(page.id) ? { ...page, url: urlById.get(page.id), status: 'done' } : page,
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
		setPages((prev) => prev.filter((page) => page.id !== id));
		setUploadError(null);
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

			<form onSubmit={submit} className="max-w-xl space-y-4 rounded-2xl border border-white/10 bg-ink-900 p-6">
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
							Đã tải lên {uploaded.length}/{pages.length} ảnh{uploading ? ' — đang tải...' : ''}.
						</p>
						<ul className="max-h-56 space-y-1 overflow-y-auto rounded-xl border border-white/10 bg-ink-950 p-2 text-xs">
							{pages.map((page, index) => (
								<li key={page.id} className="flex items-center justify-between gap-3">
									<span className="truncate text-neutral-400">
										{index + 1}. {page.name}
									</span>
									<span className="flex shrink-0 items-center gap-2">
										<span
											className={
												page.status === 'done'
													? 'text-emerald-400'
													: page.status === 'error'
														? 'text-red-400'
														: 'text-amber-400'
											}
										>
											{page.status === 'done' ? 'xong' : page.status === 'error' ? 'lỗi' : 'đang tải...'}
										</span>
										<button
											type="button"
											onClick={() => removePage(page.id)}
											aria-label="Xoá ảnh"
											className="rounded px-1 text-neutral-500 transition-colors hover:text-red-400"
										>
											×
										</button>
									</span>
								</li>
							))}
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
