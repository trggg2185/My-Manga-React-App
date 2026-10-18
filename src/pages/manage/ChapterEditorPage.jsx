import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { chapterApi, uploadApi } from '../../api';
import { useMutation } from '../../hooks/useMutation';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

function ChapterEditorPage() {
	const { mangaId } = useParams();
	const navigate = useNavigate();
	const [chapterIndex, setChapterIndex] = useState('');
	const [title, setTitle] = useState('');
	const [files, setFiles] = useState([]);
	const mutation = useMutation();

	const submit = (e) => {
		e.preventDefault();
		mutation.run(async () => {
			// Bước 1: upload ảnh theo đúng thứ tự trang -> nhận public URL.
			const pageUrls = await uploadApi.uploadMulti(files);
			// Bước 2: tạo chương với các URL vừa upload.
			await chapterApi.create(mangaId, {
				chapterIndex: Number(chapterIndex),
				title,
				pageUrls,
			});
			navigate(`/manage/mangas/${mangaId}`);
		});
	};

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
					onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
				/>
				{files.length > 0 && (
					<p className="text-xs text-neutral-500">Đã chọn {files.length} ảnh.</p>
				)}

				{mutation.error && (
					<p className="text-sm text-red-400">
						Lỗi ({mutation.error.code}): {mutation.error.message}
					</p>
				)}

				<Button type="submit" disabled={mutation.loading || files.length === 0}>
					{mutation.loading ? 'Đang tải lên...' : 'Tạo chương'}
				</Button>
				<p className="text-xs text-neutral-600">
					Lưu ý: upload nhiều ảnh giới hạn 3 lần/giờ, mỗi ảnh tối đa 5MB.
				</p>
			</form>
		</section>
	);
}

export default ChapterEditorPage;
