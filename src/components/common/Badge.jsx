const TONES = {
	neutral: 'border-white/15 bg-white/5 text-neutral-300',
	// Nền đặc nhưng hơi trong để vẫn thấy ảnh bìa phía sau.
	green: 'border-emerald-300/40 bg-emerald-400/85 text-emerald-950',
	blue: 'border-sky-300/40 bg-sky-400/85 text-sky-950',
	sky: 'border-sky-500/20 bg-sky-500/15 text-sky-300',
	amber: 'border-amber-500/20 bg-amber-500/15 text-amber-300',
	red: 'border-red-400/40 bg-red-600/85 text-white',
};

export default function Badge({ tone = 'neutral', children }) {
	return (
		<span
			className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONES[tone] ?? TONES.neutral}`}
		>
			{children}
		</span>
	);
}
