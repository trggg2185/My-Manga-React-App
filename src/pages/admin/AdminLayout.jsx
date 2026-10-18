import { NavLink, Outlet } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';

const LINKS = [
	{ to: '/admin', label: 'Tổng quan', end: true },
	{ to: '/admin/users', label: 'Người dùng' },
	{ to: '/admin/roles', label: 'Vai trò' },
	{ to: '/admin/permissions', label: 'Quyền' },
	{ to: '/admin/categories', label: 'Thể loại' },
	{ to: '/admin/mangas', label: 'Truyện' },
	{ to: '/admin/groups', label: 'Nhóm dịch' },
	{ to: '/admin/creation-requests', label: 'Yêu cầu tạo nhóm' },
];

const linkClass = ({ isActive }) =>
	`whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors duration-200 ${
		isActive ? 'bg-white/10 text-white' : 'text-neutral-400 hover:bg-white/5 hover:text-white'
	}`;

function AdminLayout() {
	return (
		<section>
			<PageHeader title="Bảng điều khiển" subtitle="Quản trị người dùng, nội dung và nhóm dịch." />

			<nav className="mb-8 flex gap-1 overflow-x-auto border-b border-white/10 pb-2">
				{LINKS.map((link) => (
					<NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
						{link.label}
					</NavLink>
				))}
			</nav>

			<Outlet />
		</section>
	);
}

export default AdminLayout;
