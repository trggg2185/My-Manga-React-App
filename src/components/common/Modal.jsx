import { useEffect } from 'react';

// Modal dùng chung: đóng khi bấm nền mờ, nút X, hoặc phím Esc.
export default function Modal({ title, onClose, children, maxWidth = 'max-w-md' }) {
	useEffect(() => {
		const onKeyDown = (event) => {
			if (event.key === 'Escape') onClose();
		};
		document.addEventListener('keydown', onKeyDown);
		return () => document.removeEventListener('keydown', onKeyDown);
	}, [onClose]);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
			<div
				role="dialog"
				aria-modal="true"
				className={`animate-fade-up relative w-full ${maxWidth} rounded-2xl border border-white/10 bg-ink-900 p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)]`}
			>
				<div className="mb-5 flex items-center justify-between">
					<h2 className="text-lg font-semibold text-white">{title}</h2>
					<button
						type="button"
						onClick={onClose}
						aria-label="Đóng"
						className="rounded-lg px-2 py-1 text-neutral-400 transition-colors duration-200 hover:bg-white/5 hover:text-white"
					>
						✕
					</button>
				</div>
				{children}
			</div>
		</div>
	);
}
