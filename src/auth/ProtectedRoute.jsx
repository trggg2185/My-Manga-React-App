import { Outlet } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useAuthModal } from '../components/auth/AuthModalProvider';
import Button from '../components/common/Button';

// Yêu cầu đăng nhập; tuỳ chọn yêu cầu role (roles = ['ADMIN', ...]).
export default function ProtectedRoute({ roles }) {
	const { isAuthenticated, hasRole } = useAuth();
	const { openAuthModal } = useAuthModal();

	if (!isAuthenticated) {
		return (
			<div className="py-20 text-center">
				<p className="text-neutral-400">Bạn cần đăng nhập để tiếp tục.</p>
				<Button className="mt-4" onClick={() => openAuthModal('login')}>
					Đăng nhập
				</Button>
			</div>
		);
	}

	if (roles?.length && !hasRole(...roles)) {
		return <p className="py-20 text-center text-neutral-400">Bạn không có quyền truy cập trang này.</p>;
	}

	return <Outlet />;
}
