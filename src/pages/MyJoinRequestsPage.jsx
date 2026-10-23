import { useState } from 'react';
import { joinRequestApi, userApi } from '../api';
import { useFetch } from '../hooks/useFetch';
import {
	JOIN_REQUEST_STATUS,
	JOIN_REQUEST_TONE,
	CREATION_REQUEST_STATUS,
	CREATION_REQUEST_TONE,
	formatDate,
} from '../utils/format';
import PageHeader from '../components/common/PageHeader';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';

const JOIN_FILTERS = ['', 'PENDING', 'APPROVED', 'REJECTED'];
const CREATION_FILTERS = ['', 'PENDING', 'APPROVED', 'REJECTD'];

const chipClass = (active) =>
	`rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-200 ${
		active
			? 'border-white/40 bg-white text-ink-950'
			: 'border-white/10 text-neutral-400 hover:border-white/25 hover:text-white'
	}`;

function JoinRequestsSection() {
	const [status, setStatus] = useState('');
	const { data, error, loading, reload } = useFetch(
		() => joinRequestApi.listMine(status ? { status } : {}),
		[status],
	);

	return (
		<section className="mb-10">
			<h2 className="mb-3 text-lg font-semibold text-white">Yêu cầu tham gia nhóm</h2>

			<div className="mb-4 flex flex-wrap gap-2">
				{JOIN_FILTERS.map((value) => (
					<button
						key={value || 'all'}
						type="button"
						className={chipClass(status === value)}
						onClick={() => setStatus(value)}
					>
						{value ? JOIN_REQUEST_STATUS[value] : 'Tất cả'}
					</button>
				))}
			</div>

			{loading ? (
				<Loading />
			) : error ? (
				<ErrorMessage error={error} onRetry={reload} />
			) : data?.length === 0 ? (
				<EmptyState>Bạn chưa gửi yêu cầu tham gia nhóm nào.</EmptyState>
			) : (
				<ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-ink-900">
					{data.map((request) => (
						<li key={request.id} className="flex items-center justify-between px-4 py-3">
							<span className="text-sm text-neutral-200">{request.transGroup?.name ?? '—'}</span>
							<Badge tone={JOIN_REQUEST_TONE[request.status]}>
								{JOIN_REQUEST_STATUS[request.status]}
							</Badge>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}

function CreationRequestsSection() {
	const [status, setStatus] = useState('');
	const { data, error, loading, reload } = useFetch(
		() =>
			userApi.getMyCreationRequests({
				status: status || undefined,
				page: 0,
				size: 20,
				sortBy: 'createdAt',
			}),
		[status],
	);

	return (
		<section>
			<h2 className="mb-3 text-lg font-semibold text-white">Yêu cầu tạo nhóm dịch</h2>

			<div className="mb-4 flex flex-wrap gap-2">
				{CREATION_FILTERS.map((value) => (
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

			{loading ? (
				<Loading />
			) : error ? (
				<ErrorMessage error={error} onRetry={reload} />
			) : data?.content?.length === 0 ? (
				<EmptyState>Bạn chưa gửi yêu cầu tạo nhóm nào.</EmptyState>
			) : (
				<ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-ink-900">
					{data.content.map((request) => (
						<li key={request.id} className="flex items-center justify-between gap-3 px-4 py-3">
							<span className="flex items-center gap-3 text-sm text-neutral-200">
								{request.groupName}
								<span className="hidden text-xs text-neutral-600 sm:block">
									{formatDate(request.updatedAt)}
								</span>
							</span>
							<Badge tone={CREATION_REQUEST_TONE[request.status]}>
								{CREATION_REQUEST_STATUS[request.status]}
							</Badge>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}

function MyJoinRequestsPage() {
	return (
		<div>
			<PageHeader title="Yêu cầu của tôi" />
			<JoinRequestsSection />
			<CreationRequestsSection />
		</div>
	);
}

export default MyJoinRequestsPage;
