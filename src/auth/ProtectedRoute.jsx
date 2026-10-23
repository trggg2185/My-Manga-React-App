import { Outlet } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useAuthModal } from '../components/auth/AuthModalProvider';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';

// Yêu cầu đăng nhập; tuỳ chọn yêu cầu role (roles = ['ADMIN', ...]).
export default function ProtectedRoute({ roles }) {
	const { isAuthenticated, hasRole, initializing } = useAuth();
	const { openAuthModal } = useAuthModal();

	if (initializing) return <Loading label="Đang kiểm tra phiên đăng nhập..." />;

	if (!isAuthenticated) {
		return (
			<div className="py-20 text-center">
				<p className="text-neutral-400">Bạn cần đăng nhập để tiếp tục.</p>
				<Button className="mt-4" onClick={openAuthModal}>
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
