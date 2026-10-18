export const fieldClass =
	'w-full rounded-xl border border-white/10 bg-ink-900 px-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 outline-none transition-colors duration-200 focus:border-white/30 focus:bg-ink-800';

export default function Input({ label, className = '', ...props }) {
	return (
		<label className="block">
			{label && <span className="mb-1.5 block text-sm text-neutral-400">{label}</span>}
			<input className={`${fieldClass} ${className}`} {...props} />
		</label>
	);
}
