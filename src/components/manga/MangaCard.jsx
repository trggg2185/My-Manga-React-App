import { Link } from 'react-router-dom';
import { MANGA_STATUS_TONE, mangaStatusLabel } from '../../utils/format';
import Badge from '../common/Badge';
import Cover from '../common/Cover';

export default function MangaCard({ manga, index = 0 }) {
	return (
		<Link
			to={`/mangas/${manga.id}`}
			className="group animate-fade-up overflow-hidden rounded-2xl border border-white/10 bg-ink-900 transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:shadow-[0_10px_40px_-10px_rgba(255,255,255,0.15)]"
			style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
		>
			<div className="relative">
				<Cover
					src={manga.coverImageUrl}
					name={manga.name}
					className="aspect-[3/4] transition-transform duration-300 group-hover:scale-105"
				/>
				<span className="absolute left-3 top-3">
					<Badge tone={MANGA_STATUS_TONE[manga.status]}>{mangaStatusLabel(manga.status)}</Badge>
				</span>
			</div>

			<div className="p-3">
				<h3 className="line-clamp-2 text-sm font-semibold text-neutral-100 transition-colors duration-200 group-hover:text-white">
					{manga.name}
				</h3>
				<div className="mt-2 flex flex-wrap gap-1.5">
					{manga.categories?.slice(0, 2).map((category) => (
						<span
							key={category.id}
							className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-neutral-400"
						>
							{category.name}
						</span>
					))}
				</div>
			</div>
		</Link>
	);
}
