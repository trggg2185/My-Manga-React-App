import { Link } from 'react-router-dom';

const CARDS = [
	{ to: '/admin/users', title: 'Người dùng', desc: 'Tạo, xem, xoá tài khoản.' },
	{ to: '/admin/roles', title: 'Vai trò & quyền', desc: 'Vai trò và permission.' },
	{ to: '/admin/categories', title: 'Thể loại', desc: 'Tạo, sửa, xoá thể loại.' },
	{ to: '/admin/mangas', title: 'Truyện', desc: 'Xem truyện theo tình trạng.' },
	{ to: '/admin/groups', title: 'Nhóm dịch', desc: 'Xem nhóm theo trạng thái.' },
	{ to: '/admin/creation-requests', title: 'Yêu cầu tạo nhóm', desc: 'Duyệt / từ chối.' },
];

function AdminDashboardPage() {
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{CARDS.map((card) => (
				<Link
					key={card.to}
					to={card.to}
					className="animate-fade-up rounded-2xl border border-white/10 bg-ink-900 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/25"
				>
					<h3 className="font-semibold text-white">{card.title}</h3>
					<p className="mt-1 text-sm text-neutral-500">{card.desc}</p>
				</Link>
			))}
		</div>
	);
}

export default AdminDashboardPage;
