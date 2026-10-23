import { useEffect, useState } from 'react';
import { uploadApi } from '../../api';
import { useMutation } from '../../hooks/useMutation';

// Ảnh bìa là URL (không phải field multipart của manga/nhóm):
// chọn file -> POST /files/upload -> lấy URL -> onChange(url).
export default function ImageUploadField({ label = 'Ảnh bìa', value, onChange }) {
	const [preview, setPreview] = useState(null);
	const mutation = useMutation();

	// thu hồi object URL khi đổi ảnh / rời trang
	useEffect(
		() => () => {
			if (preview) URL.revokeObjectURL(preview);
		},
		[preview],
	);

	const handleChange = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setPreview(URL.createObjectURL(file));
		mutation.run(async () => {
			const url = await uploadApi.upload(file);
			onChange(url);
		});
	};

	const shown = preview || value;

	return (
		<div>
			<span className="mb-1.5 block text-sm text-neutral-400">{label}</span>
			<div className="flex items-center gap-4">
				<div className="flex h-60 w-40 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-ink-800">
					{shown ? (
						<img src={shown} alt="Ảnh bìa" className="h-full w-full object-cover" />
					) : (
						<span className="text-xs text-neutral-600">Trống</span>
					)}
				</div>
				<div>
					<label className="inline-block cursor-pointer rounded-lg border border-white/15 px-3.5 py-2 text-sm text-neutral-200 transition-colors duration-200 hover:border-white/30 hover:bg-white/5">
						{value ? 'Đổi ảnh' : 'Chọn ảnh'}
						<input type="file" accept="image/*" className="hidden" onChange={handleChange} />
					</label>
					<p className="mt-1 text-xs text-neutral-600">
						{mutation.loading ? 'Đang tải ảnh...' : 'PNG/JPG, tối đa 5MB.'}
					</p>
					{mutation.error && (
						<p className="text-xs text-red-400">
							Lỗi ({mutation.error.code}): {mutation.error.message}
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
