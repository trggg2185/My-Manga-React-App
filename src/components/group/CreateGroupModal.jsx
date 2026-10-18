import { useState } from 'react';
import { creationRequestApi } from '../../api';
import { useMutation } from '../../hooks/useMutation';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Textarea from '../common/Textarea';

export default function CreateGroupModal({ onClose, onCreated }) {
	const [form, setForm] = useState({ groupName: '', description: '' });
	const mutation = useMutation();

	const submit = (e) => {
		e.preventDefault();
		mutation.run(async () => {
			await creationRequestApi.create(form);
			onCreated();
		});
	};

	return (
		<Modal title="Tạo nhóm dịch" onClose={onClose}>
			<form onSubmit={submit} className="space-y-4">
				<Input
					label="Tên nhóm (5..50 ký tự)"
					value={form.groupName}
					onChange={(e) => setForm((f) => ({ ...f, groupName: e.target.value }))}
				/>
				<Textarea
					label="Mô tả (tối đa 300 ký tự)"
					maxLength={300}
					value={form.description}
					onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
				/>

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
						{mutation.loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
					</Button>
				</div>
			</form>
		</Modal>
	);
}
