import { Link } from 'react-router-dom';
import Cover from '../common/Cover';

export default function GroupCard({ group, index = 0 }) {
	return (
		<Link
			to={`/groups/${group.slug ?? group.id}`}
			className="group animate-fade-up rounded-2xl border border-white/10 bg-ink-900 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:shadow-[0_10px_40px_-10px_rgba(255,255,255,0.15)]"
			style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
		>
			<div className="flex items-center gap-3">
				<Cover
					src={group.avatar ?? group.coverImageUrl}
					name={group.name}
					className="h-11 w-11 rounded-xl"
					textClass="text-lg"
				/>
				<div>
					<h3 className="text-sm font-semibold text-neutral-100 transition-colors duration-200 group-hover:text-white">
						{group.name}
					</h3>
					<p className="text-xs text-neutral-500">@{group.slug}</p>
				</div>
			</div>
		</Link>
	);
}
