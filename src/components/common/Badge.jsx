const TONES = {
	neutral: 'border-white/15 bg-white/5 text-neutral-300',
	green: 'border-emerald-500/20 bg-emerald-500/15 text-emerald-300',
	sky: 'border-sky-500/20 bg-sky-500/15 text-sky-300',
	amber: 'border-amber-500/20 bg-amber-500/15 text-amber-300',
	red: 'border-red-500/30 bg-red-500/10 text-red-300',
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
