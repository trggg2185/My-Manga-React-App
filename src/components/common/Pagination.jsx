// page: 0-based (giống tham số gửi lên API). currentPage hiển thị là 1-based.
export default function Pagination({ page, totalPages, onChange }) {
	if (!totalPages || totalPages <= 1) return null;

	const buttonClass =
		'rounded-lg border border-white/15 px-4 py-2 text-sm text-neutral-200 transition-colors duration-200 hover:border-white/30 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/15 disabled:hover:bg-transparent';

	return (
		<div className="mt-10 flex items-center justify-center gap-4">
			<button
				type="button"
				className={buttonClass}
				disabled={page <= 0}
				onClick={() => onChange(page - 1)}
			>
				Trước
			</button>
			<span className="text-sm text-neutral-400">
				Trang <span className="text-white">{page + 1}</span> / {totalPages}
			</span>
			<button
				type="button"
				className={buttonClass}
				disabled={page + 1 >= totalPages}
				onClick={() => onChange(page + 1)}
			>
				Sau
			</button>
		</div>
	);
}
