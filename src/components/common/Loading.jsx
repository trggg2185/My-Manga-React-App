export default function Loading({ label = 'Đang tải...', className = '' }) {
	return (
		<div className={`flex items-center justify-center gap-3 py-20 text-neutral-400 ${className}`}>
			<span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
			<span className="text-sm">{label}</span>
		</div>
	);
}
