const VARIANTS = {
	primary: 'bg-white text-ink-950 hover:bg-neutral-200',
	ghost: 'border border-white/15 text-neutral-200 hover:border-white/30 hover:bg-white/5',
	danger: 'border border-red-500/30 text-red-300 hover:bg-red-500/10',
};

export default function Button({ variant = 'primary', className = '', type = 'button', ...props }) {
	return (
		<button
			type={type}
			className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant] ?? VARIANTS.primary} ${className}`}
			{...props}
		/>
	);
}
