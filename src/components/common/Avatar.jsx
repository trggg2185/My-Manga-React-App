import { useState } from 'react';

// Hiển thị ảnh đại diện; nếu ảnh lỗi hoặc chưa có thì dùng chữ cái đầu của tên.
export default function Avatar({ src, name, size = 36, className = '' }) {
	const [failedSrc, setFailedSrc] = useState(null);
	const style = { width: size, height: size };

	if (src && failedSrc !== src) {
		return (
			<img
				src={src}
				alt={name ?? 'avatar'}
				style={style}
				referrerPolicy="no-referrer"
				onError={() => setFailedSrc(src)}
				className={`shrink-0 rounded-full border border-white/15 object-cover ${className}`}
			/>
		);
	}

	return (
		<span
			style={style}
			className={`flex shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-sm font-semibold text-white ${className}`}
		>
			{name?.charAt(0)?.toUpperCase() ?? '?'}
		</span>
	);
}
