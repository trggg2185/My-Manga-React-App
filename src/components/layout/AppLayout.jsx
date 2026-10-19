import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useAuthModal } from '../auth/AuthModalProvider';
import Avatar from '../common/Avatar';

const navLinkClass = ({ isActive }) =>
	`rounded-lg px-3 py-2 text-sm transition-colors duration-200 ${
		isActive ? 'bg-white/10 text-white' : 'text-neutral-400 hover:bg-white/5 hover:text-white'
	}`;

const menuItemClass =
	'block w-full rounded-lg px-3 py-2 text-left text-sm text-neutral-300 transition-colors duration-200 hover:bg-white/5 hover:text-white';

function AccountMenu() {
	const { logout } = useAuth();
	const { data: me } = useCurrentUser();
	const [open, setOpen] = useState(false);
	const menuRef = useRef(null);

	// Đóng menu khi click ra ngoài
	useEffect(() => {
		if (!open) return;
		const handleClick = (event) => {
			if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false);
		};
		document.addEventListener('mousedown', handleClick);
		return () => document.removeEventListener('mousedown', handleClick);
	}, [open]);

	return (
		<div className="relative" ref={menuRef}>
			<button
				type="button"
				onClick={() => setOpen((value) => !value)}
				className="rounded-full transition-transform duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
				aria-label="Menu tài khoản"
				aria-haspopup="menu"
				aria-expanded={open}
			>
				<Avatar src={me?.avatar} name={me?.username} />
			</button>

			{open && (
				<div
					role="menu"
					className="animate-fade-up absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-ink-900 p-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)]"
				>
					<Link to="/profile" className={menuItemClass} onClick={() => setOpen(false)}>
						Chỉnh sửa thông tin cá nhân
					</Link>
					<button
						type="button"
						className={`${menuItemClass} text-red-300 hover:bg-red-500/10`}
						onClick={() => {
							setOpen(false);
							logout();
						}}
					>
						Đăng xuất
					</button>
				</div>
			)}
		</div>
	);
}

function AppLayout() {
	const { isAuthenticated, hasRole } = useAuth();
	const { openAuthModal } = useAuthModal();

	return (
		<div className="flex min-h-screen flex-col">
			<header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/80 backdrop-blur-md">
				<div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
					<Link to="/" className="shrink-0 text-lg font-black tracking-tight text-white">
						MANGA<span className="text-neutral-500">APP</span>
					</Link>

					<nav className="flex items-center gap-1 overflow-x-auto">
						<NavLink to="/" className={navLinkClass} end>
							Trang chủ
						</NavLink>
						<NavLink to="/groups" className={navLinkClass}>
							Nhóm dịch
						</NavLink>
						{hasRole('ADMIN') && (
							<NavLink to="/admin" className={navLinkClass}>
								Quản trị
							</NavLink>
						)}
					</nav>

					<div className="ml-auto flex items-center gap-2">
						{isAuthenticated ? (
							<AccountMenu />
						) : (
							<>
								<button
									type="button"
									onClick={() => openAuthModal('login')}
									className="rounded-lg px-3 py-2 text-sm text-neutral-400 transition-colors duration-200 hover:bg-white/5 hover:text-white"
								>
									Đăng nhập
								</button>
								<button
									type="button"
									onClick={() => openAuthModal('register')}
									className="rounded-lg bg-white px-3.5 py-2 text-sm font-medium text-ink-950 transition-colors duration-200 hover:bg-neutral-200"
								>
									Đăng ký
								</button>
							</>
						)}
					</div>
				</div>
			</header>

			<main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
				<Outlet />
			</main>

			<footer className="border-t border-white/10 py-6">
				<p className="mx-auto max-w-6xl px-4 text-center text-xs text-neutral-600">
					Manga App — nền tảng đọc truyện và nhóm dịch.
				</p>
			</footer>
		</div>
	);
}

export default AppLayout;
