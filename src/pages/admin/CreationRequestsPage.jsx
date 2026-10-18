import { useState } from 'react';
import { creationRequestApi } from '../../api';
import { useFetch } from '../../hooks/useFetch';
import { useMutation } from '../../hooks/useMutation';
import { CREATION_REQUEST_STATUS, CREATION_REQUEST_TONE } from '../../utils/format';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

const FILTERS = ['', ...Object.keys(CREATION_REQUEST_STATUS)];

function CreationRequestsPage() {
	const [status, setStatus] = useState('');
	const mutation = useMutation();

	const { data, error, loading, reload } = useFetch(
		() =>
			creationRequestApi.adminList({
				status: status || undefined,
				size: 50,
				sortBy: 'createdAt',
			}),
		[status],
	);

	const handleRequest = (requestId, action) => {
		const run = action === 'approve' ? creationRequestApi.approve : creationRequestApi.reject;
		mutation.run(async () => {
			await run(requestId);
			reload();
		}, action === 'approve' ? 'Đã duyệt yêu cầu.' : 'Đã từ chối yêu cầu.');
	};

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
						{value ? CREATION_REQUEST_STATUS[value] : 'Tất cả'}
					</button>
				))}
			</div>

			{mutation.error && (
				<p className="mb-4 text-sm text-red-400">
					Lỗi ({mutation.error.code}): {mutation.error.message}
				</p>
			)}
			{mutation.message && <p className="mb-4 text-sm text-emerald-400">{mutation.message}</p>}

			{loading ? (
				<Loading />
			) : error ? (
				<ErrorMessage error={error} onRetry={reload} />
			) : data?.content?.length === 0 ? (
				<EmptyState>Không có yêu cầu.</EmptyState>
			) : (
				<ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-ink-900">
					{data.content.map((request) => (
						<li key={request.id} className="flex items-center justify-between gap-3 px-4 py-3">
							<span className="flex flex-wrap items-center gap-3 text-sm text-neutral-200">
								{request.groupName}
								<span className="text-xs text-neutral-500">
									{request.creatorName ? `bởi ${request.creatorName}` : ''}
								</span>
								<Badge tone={CREATION_REQUEST_TONE[request.status]}>
									{CREATION_REQUEST_STATUS[request.status]}
								</Badge>
							</span>
							{request.status === 'PENDING' && (
								<span className="flex gap-2">
									<Button onClick={() => handleRequest(request.id, 'approve')}>Duyệt</Button>
									<Button variant="ghost" onClick={() => handleRequest(request.id, 'reject')}>
										Từ chối
									</Button>
								</span>
							)}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

export default CreationRequestsPage;
