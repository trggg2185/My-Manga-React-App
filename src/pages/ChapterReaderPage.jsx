import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError, chapterApi } from '../api';
import { resolveMangaId } from '../utils/resolveUrl';
import { useCurrentUser } from '../hooks/useCurrentUser';
import Avatar from '../components/common/Avatar';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

const BATCH_SIZE = 15; // số ảnh render mỗi lần cuộn
const FETCH_SIZE = 200; // chương tối đa 150 trang -> lấy hết trong 1 request
const byChapterIndex = (list) => [...list].sort((a, b) => a.chapterIndex - b.chapterIndex);
const isMobile = () => window.matchMedia('(max-width: 1023px)').matches;

function ChapterReaderPage() {
	const { slug, chapterIndex } = useParams();
	const { data: me } = useCurrentUser();
	const [pages, setPages] = useState([]); // toàn bộ trang của chương, sort tăng dần
	const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
	const [chapters, setChapters] = useState([]);
	const [status, setStatus] = useState('loading'); // loading | ready | error
	const [error, setError] = useState(null);
	const [open, setOpen] = useState(() =>
		typeof window === 'undefined' ? true : window.matchMedia('(min-width: 1024px)').matches,
	);
	const [pendingPage, setPendingPage] = useState(null);
	const requestRef = useRef(0);
	const sentinelRef = useRef(null);
	const pageRefs = useRef([]);

	const load = useCallback(async () => {
		const reqId = ++requestRef.current;
		setStatus('loading');
		setError(null);
		setPages([]);
		setVisibleCount(BATCH_SIZE);

		try {
			// URL dùng slug + chapterIndex; API vẫn cần manga id + chapter id.
			const mangaId = await resolveMangaId(slug);
			if (!mangaId) throw new ApiError('404', 'Không tìm thấy truyện.');

			const chapterList = await chapterApi.listByManga(mangaId, {
				page: 0,
				size: 200,
				sortBy: 'chapterIndex',
			});
			const list = byChapterIndex(chapterList?.content ?? []);
			const index = list.findIndex(
				(chapter) => String(chapter.chapterIndex) === String(chapterIndex),
			);
			if (index < 0) throw new ApiError('404', 'Không tìm thấy chương.');
			if (requestRef.current !== reqId) return;
			setChapters(list);

			// Backend trả hết pages trong 1 request (sort pageNumber tăng dần).
			const result = await chapterApi.getPages(list[index].id, {
				page: 0,
				size: FETCH_SIZE,
				sortBy: 'pageNumber',
			});
			if (requestRef.current !== reqId) return;

			const resultList = Array.isArray(result) ? result : (result?.content ?? []);
			setPages([...resultList].sort((a, b) => a.pageNumber - b.pageNumber));
			setStatus('ready');
		} catch (err) {
			if (requestRef.current !== reqId) return;
			setError(err);
			setStatus('error');
		}
	}, [slug, chapterIndex]);

	useEffect(() => {
		window.scrollTo(0, 0);
		// Reset pages khi đổi chương: setState đồng bộ trong effect là chủ ý.
		// eslint-disable-next-line react-hooks/set-state-in-effect
		load();
	}, [load]);

	// Lazy load phía client: cuộn gần cuối thì render thêm 1 lô ảnh.
	useEffect(() => {
		const node = sentinelRef.current;
		if (!node || visibleCount >= pages.length || typeof IntersectionObserver === 'undefined') return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					setVisibleCount((count) => Math.min(count + BATCH_SIZE, pages.length));
				}
			},
			{ rootMargin: '800px' },
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, [visibleCount, pages.length]);

	// Nhảy tới 1 trang: render đủ lô chứa trang đó, chờ ảnh phía trên tải xong
	// (chiều cao ảnh quyết định vị trí) rồi cuộn xuống.
	useEffect(() => {
		if (pendingPage == null) return;
		const target = pageRefs.current[pendingPage];
		if (!target) return;

		const nodes = pageRefs.current.slice(0, pendingPage + 1).filter(Boolean);
		if (nodes.length < pendingPage + 1) return;

		const finish = () => {
			target.scrollIntoView({ behavior: 'auto', block: 'start' });
			setPendingPage(null);
		};

		const pending = nodes.filter((node) => !node.complete);
		if (pending.length === 0) {
			finish();
			return;
		}

		let remaining = pending.length;
		const onDone = () => {
			remaining -= 1;
			if (remaining === 0) finish();
		};
		pending.forEach((node) => {
			node.addEventListener('load', onDone, { once: true });
			node.addEventListener('error', onDone, { once: true });
		});
		return () => {
			pending.forEach((node) => {
				node.removeEventListener('load', onDone);
				node.removeEventListener('error', onDone);
			});
		};
	}, [pendingPage, visibleCount]);

	const currentIndex = chapters.findIndex(
		(chapter) => String(chapter.chapterIndex) === String(chapterIndex),
	);
	const prev = currentIndex > 0 ? chapters[currentIndex - 1] : null;
	const next =
		currentIndex >= 0 && currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;
	const current = currentIndex >= 0 ? chapters[currentIndex] : null;

	const closeOnMobile = () => {
		if (isMobile()) setOpen(false);
	};

	const jumpToPage = (index) => {
		setVisibleCount((count) => Math.max(count, index + 1));
		setPendingPage(index);
		closeOnMobile();
	};

	if (status === 'loading') return <Loading label="Đang tải chương..." />;
	if (status === 'error') return <ErrorMessage error={error} onRetry={load} />;

	const navButtonClass =
		'rounded-lg border border-white/15 px-4 py-2 text-sm text-neutral-200 transition-colors duration-200 hover:border-white/30 hover:bg-white/5';
	const disabledClass = 'pointer-events-none opacity-40';
	const visiblePages = pages.slice(0, visibleCount);

	return (
		<div className="min-h-screen bg-ink-950">
			{/* Nội dung truyện: chừa chỗ bên phải khi tab mở để trang bị đẩy sang trái. */}
			<div className={`transition-[margin] duration-300 ${open ? 'lg:mr-80' : ''}`}>
				<div className="mx-auto w-full max-w-4xl px-2 py-3 sm:px-4">
					{pages.length === 0 ? (
						<p className="py-16 text-center text-neutral-500">Chương này chưa có ảnh.</p>
					) : (
						<div className="flex flex-col gap-1">
							{visiblePages.map((page, index) => (
								<img
									key={page.id}
									ref={(node) => {
										pageRefs.current[index] = node;
									}}
									src={page.imageUrl}
									alt={`Trang ${page.pageNumber}`}
									className="w-full rounded-md bg-ink-900"
								/>
							))}
						</div>
					)}

					<div ref={sentinelRef} className="h-1" />

					<div className="mx-auto mt-8 flex max-w-4xl justify-between gap-2 pb-6">
						<Link
							to={`/mangas/${slug}/chapters/${prev?.chapterIndex}`}
							onClick={closeOnMobile}
							className={`${navButtonClass} ${!prev ? disabledClass : ''}`}
						>
							← Chương trước
						</Link>
						<Link
							to={`/mangas/${slug}/chapters/${next?.chapterIndex}`}
							onClick={closeOnMobile}
							className={`${navButtonClass} ${!next ? disabledClass : ''}`}
						>
							Chương sau →
						</Link>
					</div>
				</div>
			</div>

			{/* Nền mờ khi tab mở trên mobile; bấm ra ngoài để đóng. */}
			{open && (
				<button
					type="button"
					onClick={() => setOpen(false)}
					aria-label="Đóng danh sách"
					className="fixed inset-0 z-30 bg-black/60 lg:hidden"
				/>
			)}

			{/* Tab bên phải: thông tin user, danh sách chương và danh sách trang. */}
			<aside
				aria-hidden={!open}
				inert={!open}
				className={`fixed inset-y-0 right-0 z-40 flex w-80 max-w-[85vw] flex-col border-l border-white/10 bg-ink-900 transition-transform duration-300 ${
					open ? 'translate-x-0' : 'translate-x-full'
				}`}
			>
				<div className="flex items-start justify-between gap-2 border-b border-white/10 p-4">
					<div className="min-w-0">
						<p className="text-xs text-neutral-500">Đang đọc</p>
						<p className="truncate text-sm font-semibold text-white">
							Chương {chapterIndex}
							{current?.title ? ` — ${current.title}` : ''}
						</p>
					</div>
					<button
						type="button"
						onClick={() => setOpen(false)}
						aria-label="Đóng danh sách"
						className="shrink-0 rounded-lg border border-white/15 px-2 py-1 text-sm text-neutral-300 transition-colors duration-200 hover:border-white/30 hover:text-white"
					>
						›
					</button>
				</div>

				<div className="flex-1 overflow-y-auto p-4">
					{me && (
						<Link
							to={`/users/${me.username}`}
							className="mb-5 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition-colors duration-200 hover:border-white/25 hover:bg-white/10"
						>
							<Avatar src={me.avatar} name={me.displayName || me.username} size={36} />
							<span className="min-w-0">
								<span className="block truncate text-sm font-medium text-white">
									{me.displayName || me.username}
								</span>
								<span className="block text-xs text-neutral-500">Trang cá nhân</span>
							</span>
						</Link>
					)}

					<section>
						<h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
							Danh sách chương ({chapters.length})
						</h2>
						<ul className="space-y-1">
							{chapters.map((chapter) => {
								const active = String(chapter.chapterIndex) === String(chapterIndex);
								return (
									<li key={chapter.id}>
										<Link
											to={`/mangas/${slug}/chapters/${chapter.chapterIndex}`}
											onClick={closeOnMobile}
											className={`block truncate rounded-lg px-3 py-1.5 text-sm transition-colors duration-200 ${
												active
													? 'bg-white/10 text-white'
													: 'text-neutral-400 hover:bg-white/5 hover:text-white'
											}`}
										>
											Chương {chapter.chapterIndex}
											{chapter.title ? ` — ${chapter.title}` : ''}
										</Link>
									</li>
								);
							})}
						</ul>
					</section>

					<section className="mt-5">
						<h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
							Trang ({pages.length})
						</h2>
						<div className="grid grid-cols-6 gap-1.5">
							{pages.map((page, index) => (
								<button
									key={page.id}
									type="button"
									onClick={() => jumpToPage(index)}
									className="rounded-md border border-white/10 bg-white/5 py-1.5 text-xs text-neutral-300 transition-colors duration-200 hover:border-white/30 hover:bg-white/10 hover:text-white"
								>
									{page.pageNumber}
								</button>
							))}
						</div>
					</section>

					<Link
						to={`/mangas/${slug}`}
						className="mt-6 block text-center text-sm text-neutral-500 transition-colors duration-200 hover:text-white"
					>
						← Về trang truyện
					</Link>
				</div>
			</aside>

			{/* Nút mở tab khi tab đang đóng. */}
			<button
				type="button"
				onClick={() => setOpen(true)}
				aria-label="Mở danh sách chương và trang"
				aria-hidden={open}
				tabIndex={open ? -1 : 0}
				className={`fixed right-0 top-1/2 z-30 -translate-y-1/2 rounded-l-xl border border-r-0 border-white/15 bg-ink-900 px-2 py-4 text-neutral-300 transition-all duration-300 hover:bg-ink-800 hover:text-white ${
					open ? 'pointer-events-none translate-x-full opacity-0' : 'translate-x-0 opacity-100'
				}`}
			>
				<span className="block [writing-mode:vertical-rl] text-[11px] tracking-wider">
					Danh sách
				</span>
			</button>
		</div>
	);
}

export default ChapterReaderPage;
