import { fieldClass } from './Input';

export default function Textarea({ label, className = '', rows = 4, ...props }) {
	return (
		<label className="block">
			{label && <span className="mb-1.5 block text-sm text-neutral-400">{label}</span>}
			<textarea rows={rows} className={`${fieldClass} ${className}`} {...props} />
		</label>
	);
}
