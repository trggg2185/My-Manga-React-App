export default function ErrorMessage({ error, onRetry }) {
	if (!error) return null;

	return (
		<div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-8 text-center animate-fade-up">
			<p className="text-red-300">
				{error.code ? `Lỗi (${error.code}): ` : ''}
				{error.message}
			</p>
			{onRetry && (
				<button
					type="button"
					onClick={onRetry}
					className="mt-4 rounded-lg border border-white/15 px-4 py-2 text-sm text-neutral-200 transition-colors duration-200 hover:border-white/30 hover:bg-white/5"
				>
					Thử lại
				</button>
			)}
		</div>
	);
}
