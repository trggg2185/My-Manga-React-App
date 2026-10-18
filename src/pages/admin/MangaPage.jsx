import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mangaApi } from '../../api';
import { useFetch } from '../../hooks/useFetch';
import { MANGA_STATUS, MANGA_STATUS_TONE, mangaStatusLabel, formatDate } from '../../utils/format';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';

const FILTERS = ['', ...Object.keys(MANGA_STATUS)];

function AdminMangaPage() {
	const [status, setStatus] = useState('');
	const { data, error, loading, reload } = useFetch(
		() => mangaApi.adminList({ status: status || undefined, size: 50, sortBy: 'createdAt' }),
		[status],
	);

	const chipClass = (active) =>
		`rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-200 ${
			active
				? 'border-white/40 bg-white text-ink-950'
				: 'border-white/10 text-neutral-400 hover:border-white/25 hover:text-white'
		}`;

	return (
		<div>
			<div className="mb-6 flex flex-wrap gap-2">
				{FILTERS.map((value) => (
					<button
						key={value || 'all'}
						type="button"
						className={chipClass(status === value)}
						onClick={() => setStatus(value)}
					>
						{value ? mangaStatusLabel(value) : 'Tất cả'}
					</button>
				))}
			</div>

			{loading ? (
				<Loading />
			) : error ? (
				<ErrorMessage error={error} onRetry={reload} />
			) : data?.content?.length === 0 ? (
				<EmptyState>Không có truyện.</EmptyState>
			) : (
				<ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-ink-900">
					{data.content.map((manga) => (
						<li key={manga.id} className="flex items-center justify-between gap-3 px-4 py-3">
							<Link
								to={`/mangas/${manga.id}`}
								className="text-sm text-neutral-200 transition-colors duration-200 hover:text-white"
							>
								{manga.name}
							</Link>
							<span className="flex items-center gap-3">
								<span className="hidden text-xs text-neutral-600 sm:block">
									{formatDate(manga.createdAt)}
								</span>
								<Badge tone={MANGA_STATUS_TONE[manga.status]}>{mangaStatusLabel(manga.status)}</Badge>
							</span>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

export default AdminMangaPage;
