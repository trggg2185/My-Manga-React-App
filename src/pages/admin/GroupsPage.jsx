import { useState } from 'react';
import { Link } from 'react-router-dom';
import { groupApi } from '../../api';
import { useFetch } from '../../hooks/useFetch';
import { TRANS_GROUP_STATUS } from '../../utils/format';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';

const FILTERS = ['', ...Object.keys(TRANS_GROUP_STATUS)];

function AdminGroupsPage() {
	const [status, setStatus] = useState('');
	const { data, error, loading, reload } = useFetch(
		() => groupApi.adminList({ status: status || undefined, size: 50, sortBy: 'createdAt' }),
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
						{value ? TRANS_GROUP_STATUS[value] : 'Tất cả'}
					</button>
				))}
			</div>

			{loading ? (
				<Loading />
			) : error ? (
				<ErrorMessage error={error} onRetry={reload} />
			) : data?.content?.length === 0 ? (
				<EmptyState>Không có nhóm dịch.</EmptyState>
			) : (
				<ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-ink-900">
					{data.content.map((group) => (
						<li key={group.id} className="flex items-center justify-between px-4 py-3">
							<Link
								to={`/groups/${group.slug ?? group.id}`}
								className="text-sm text-neutral-200 transition-colors duration-200 hover:text-white"
							>
								{group.name}
							</Link>
							<span className="flex items-center gap-3">
								<span className="hidden text-xs text-neutral-600 sm:block">@{group.slug}</span>
								{status && <Badge>{TRANS_GROUP_STATUS[status]}</Badge>}
							</span>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

export default AdminGroupsPage;
