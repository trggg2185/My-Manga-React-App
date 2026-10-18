import { fieldClass } from './Input';

export default function Select({ label, options = [], className = '', ...props }) {
	return (
		<label className="block">
			{label && <span className="mb-1.5 block text-sm text-neutral-400">{label}</span>}
			<select className={`${fieldClass} ${className}`} {...props}>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</label>
	);
}
