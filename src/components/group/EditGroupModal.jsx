import { useEffect, useState } from 'react';
import { groupApi } from '../../api';
import { useMutation } from '../../hooks/useMutation';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Textarea from '../common/Textarea';

// Chọn file ảnh và giữ nguyên File để gửi multipart (backend nhận avatarFile/coverFile).
function ImageFileField({ label, file, current, boxClass = 'h-20 w-28', onChange }) {
	const [preview, setPreview] = useState(null);

	useEffect(
		() => () => {
			if (preview) URL.revokeObjectURL(preview);
		},
		[preview],
	);

	const pick = (event) => {
		const next = event.target.files?.[0];
		if (!next) return;
		setPreview(URL.createObjectURL(next));
		onChange(next);
	};

	const shown = preview || current;

	return (
		<div>
			<span className="mb-1.5 block text-sm text-neutral-400">{label}</span>
			<div className="flex items-center gap-4">
				<div
					className={`flex items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-ink-800 ${boxClass}`}
				>
					{shown ? (
						<img src={shown} alt={label} className="h-full w-full object-cover" />
					) : (
						<span className="text-xs text-neutral-600">Trống</span>
					)}
				</div>
				<label className="inline-block cursor-pointer rounded-lg border border-white/15 px-3.5 py-2 text-sm text-neutral-200 transition-colors duration-200 hover:border-white/30 hover:bg-white/5">
					{file ? 'Đổi ảnh' : 'Chọn ảnh'}
					<input type="file" accept="image/*" className="hidden" onChange={pick} />
				</label>
			</div>
		</div>
	);
}

export default function EditGroupModal({ group, avatar, onClose, onSaved }) {
	const [form, setForm] = useState({
		name: group.name ?? '',
		description: group.description ?? '',
		coverFile: null,
		avatarFile: null,
	});
	const mutation = useMutation();

	const submit = (event) => {
		event.preventDefault();
		// Trường trống thì bỏ khỏi request: backend validate name 5..50 ký tự nên chuỗi rỗng sẽ bị lỗi.
		const payload = new FormData();
		if (form.name.trim()) payload.append('name', form.name);
		if (form.description.trim()) payload.append('description', form.description);
		if (form.coverFile) payload.append('coverFile', form.coverFile);
		if (form.avatarFile) payload.append('avatarFile', form.avatarFile);

		// Không đổi field nào / mọi field đều trống -> không gọi API.
		const unchanged =
			!form.coverFile &&
			!form.avatarFile &&
			form.name === (group.name ?? '') &&
			form.description === (group.description ?? '');
		const hasField =
			payload.has('name') || payload.has('description') || payload.has('coverFile') || payload.has('avatarFile');
		if (unchanged || !hasField) {
			mutation.setMessage('Không có thay đổi nào.');
			return;
		}

		mutation.run(async () => {
			await groupApi.update(group.id, payload);
			onSaved();
		});
	};

	return (
		<Modal title="Chỉnh sửa thông tin nhóm" onClose={onClose} maxWidth="max-w-lg">
			<form onSubmit={submit} className="space-y-4">
				<Input
					label="Tên nhóm (5..50 ký tự)"
					value={form.name}
					onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
				/>
				<ImageFileField
					label="Ảnh bìa nhóm"
					current={group.coverImageUrl}
					file={form.coverFile}
					onChange={(file) => setForm((f) => ({ ...f, coverFile: file }))}
				/>
				<ImageFileField
					label="Avatar nhóm"
					current={avatar}
					file={form.avatarFile}
					boxClass="h-20 w-20"
					onChange={(file) => setForm((f) => ({ ...f, avatarFile: file }))}
				/>
				<Textarea
					label="Mô tả (tối đa 300 ký tự)"
					maxLength={300}
					value={form.description}
					onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
				/>

				{mutation.message && <p className="text-sm text-neutral-400">{mutation.message}</p>}
				{mutation.error && (
					<p className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-300">
						Lỗi ({mutation.error.code}): {mutation.error.message}
					</p>
				)}

				<div className="flex justify-end gap-2">
					<Button variant="ghost" onClick={onClose}>
						Huỷ
					</Button>
					<Button type="submit" disabled={mutation.loading}>
						{mutation.loading ? 'Đang lưu...' : 'Lưu'}
					</Button>
				</div>
			</form>
		</Modal>
	);
}
