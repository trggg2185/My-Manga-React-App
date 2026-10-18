export default function PageHeader({ title, subtitle, actions }) {
	return (
		<div className="mb-8 flex flex-wrap items-end justify-between gap-4">
			<div>
				<h1 className="text-2xl font-bold text-white sm:text-3xl">{title}</h1>
				{subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
			</div>
			{actions && <div className="flex items-center gap-2">{actions}</div>}
		</div>
	);
}
