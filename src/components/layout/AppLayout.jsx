import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useAuthModal } from "../auth/AuthModalProvider";
import Avatar from "../common/Avatar";

const navLinkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm transition-colors duration-200 ${
        isActive
            ? "bg-white/10 text-white"
            : "text-neutral-400 hover:bg-white/5 hover:text-white"
    }`;

const menuItemClass =
    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-neutral-300 transition-colors duration-200 hover:bg-white/5 hover:text-white";

function AccountMenu() {
    const { logout } = useAuth();
    const { data: me, error } = useCurrentUser();
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    // Đóng menu khi click ra ngoài
    useEffect(() => {
        if (!open) return;
        const handleClick = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target))
                setOpen(false);
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
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
                {!me && !error ? (
                    <span
                        aria-hidden="true"
                        className="block h-9 w-9 animate-pulse rounded-full bg-white/10"
                    />
                ) : (
                    <Avatar src={me?.avatar} name={me?.displayName || me?.username} />
                )}
            </button>

            {open && (
                <div
                    role="menu"
                    className="animate-fade-up absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-ink-900 p-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)]"
                >
                    {me && (
                        <div className="border-b border-white/10 px-3 pb-2.5 pt-2">
                            <p className="truncate text-sm font-semibold text-white">
                                {me.displayName || me.username}
                            </p>
                            <p className="truncate text-xs text-neutral-500">@{me.username}</p>
                        </div>
                    )}
                    <Link
                        to="/profile"
                        className={menuItemClass}
                        onClick={() => setOpen(false)}
                    >
                        Chỉnh sửa thông tin cá nhân
                    </Link>
                    {me?.username && (
                        <Link
                            to={`/users/${me.username}`}
                            className={menuItemClass}
                            onClick={() => setOpen(false)}
                        >
                            Trang cá nhân
                        </Link>
                    )}
                    <button
                        type="button"
                        className={`${menuItemClass} text-red-300 hover:bg-red-500/10`}
                        onClick={() => {
                            setOpen(false);
                            logout();
                        }}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.8}
                            className="h-4 w-4 shrink-0"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M10 17l5-5-5-5M15 12H3"
                            />
                        </svg>
                        Đăng xuất
                    </button>
                </div>
            )}
        </div>
    );
}

function AppLayout() {
    const { isAuthenticated, hasRole, initializing } = useAuth();
    const { openAuthModal } = useAuthModal();

    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
                    <Link
                        to="/"
                        className="shrink-0 text-lg font-black tracking-tight text-white"
                    >
                        MANGA<span className="text-neutral-500">APP</span>
                    </Link>

                    <nav className="flex items-center gap-1 overflow-x-auto">
                        <NavLink to="/" className={navLinkClass} end>
                            Trang chủ
                        </NavLink>
                        <NavLink to="/groups" className={navLinkClass}>
                            Nhóm dịch
                        </NavLink>
                        {hasRole("ADMIN") && (
                            <NavLink to="/admin" className={navLinkClass}>
                                Quản trị
                            </NavLink>
                        )}
                    </nav>

                    <div className="ml-auto flex items-center gap-2">
                        {initializing ? (
                            <span
                                aria-hidden="true"
                                className="h-9 w-24 animate-pulse rounded-lg bg-white/5"
                            />
                        ) : isAuthenticated ? (
                            <AccountMenu />
                        ) : (
                            <button
                                type="button"
                                onClick={openAuthModal}
                                className="rounded-lg bg-white px-3.5 py-2 text-sm font-medium text-ink-950 transition-colors duration-200 hover:bg-neutral-200"
                            >
                                Đăng nhập
                            </button>
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
