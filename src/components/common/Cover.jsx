// Ảnh bìa dùng chung; chưa có ảnh thì hiện chữ cái đầu làm placeholder.
export default function Cover({ src, name, className = '', textClass = 'text-5xl' }) {
	return (
		<div
			className={`flex items-center justify-center overflow-hidden bg-gradient-to-br from-ink-800 to-ink-950 ${className}`}
		>
			{src ? (
				<img src={src} alt={name ?? 'cover'} loading="lazy" className="h-full w-full object-cover" />
			) : (
				<span className={`font-black text-white/10 ${textClass}`}>
					{name?.charAt(0)?.toUpperCase() ?? ''}
				</span>
			)}
		</div>
	);
}
