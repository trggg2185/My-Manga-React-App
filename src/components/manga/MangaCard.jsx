import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MANGA_STATUS_TONE, mangaStatusLabel } from '../../utils/format';
import Badge from '../common/Badge';
import Cover from '../common/Cover';

// Bề rộng tooltip và khoảng cách tới thẻ.
const TIP_WIDTH = 288;
const TIP_GAP = 8;

export default function MangaCard({ manga, index = 0 }) {
	const [tip, setTip] = useState(null);
	const categories = manga.categories ?? [];
	// Backend trả field `transGroups`.
	const groups = manga.transGroups ?? [];

	// Chọn bên phải/trái theo khoảng trống còn lại để tooltip không tràn ra ngoài màn hình.
	const showTip = (e) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const spaceRight = window.innerWidth - rect.right - TIP_GAP * 2;
		const spaceLeft = rect.left - TIP_GAP * 2;
		setTip({
			open: true,
			side: spaceRight >= spaceLeft ? 'right' : 'left',
			align: rect.top > window.innerHeight / 2 ? 'bottom' : 'top',
			width: Math.max(200, Math.min(TIP_WIDTH, Math.max(spaceRight, spaceLeft))),
		});
	};

	// Giữ nguyên vị trí/bề rộng khi ẩn, nếu reset về null tooltip sẽ nhảy chỗ trong lúc fade.
	const hideTip = () => setTip((prev) => (prev ? { ...prev, open: false } : prev));

	const side = tip?.side === 'right' ? 'right' : 'left';
	const tipStyle = {
		width: tip?.width,
		top: tip?.align === 'bottom' ? undefined : 0,
		bottom: tip?.align === 'bottom' ? 0 : undefined,
		left: side === 'right' ? '100%' : undefined,
		right: side === 'left' ? '100%' : undefined,
		marginLeft: side === 'right' ? TIP_GAP : undefined,
		marginRight: side === 'left' ? TIP_GAP : undefined,
	};

	return (
		<div
			className="group relative z-0 animate-fade-up hover:z-10"
			style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
			onMouseEnter={showTip}
			onMouseLeave={hideTip}
		>
			<Link
				to={`/mangas/${manga.slug ?? manga.id}`}
				className="block overflow-hidden rounded-2xl border border-white/10 bg-ink-900 transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:shadow-[0_10px_40px_-10px_rgba(255,255,255,0.15)]"
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
				</div>
			</Link>

			{/* Tooltip khi hover: tên, thể loại, nhóm dịch, mô tả. Hiện bên phải/trái thẻ tuỳ khoảng trống. */}
			<div
				className={`pointer-events-none absolute z-20 rounded-xl border border-white/10 bg-ink-950/95 p-3 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.9)] backdrop-blur transition-all duration-200 ${
					tip?.open ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
				}`}
				style={tipStyle}
			>
				<p className="text-sm font-semibold text-white">{manga.name}</p>

				{categories.length > 0 && (
					<p className="mt-1 text-xs text-neutral-400">
						{categories.map((category) => category.name).join(', ')}
					</p>
				)}

				{groups.length > 0 && (
					<p className="mt-1 text-xs text-neutral-400">
						Nhóm dịch: {groups.map((group) => group.name).join(', ')}
					</p>
				)}

				{manga.description && (
					<p className="mt-2 line-clamp-4 text-xs leading-relaxed text-neutral-500">
						{manga.description}
					</p>
				)}
			</div>
		</div>
	);
}
