import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import { useAuth } from '../../auth/useAuth';
import Modal from '../common/Modal';

const AuthModalContext = createContext(null);
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCRIPT_SRC = 'https://accounts.google.com/gsi/client?hl=vi';

let scriptPromise;

function loadGoogleScript() {
	if (window.google?.accounts?.id) return Promise.resolve();
	if (!scriptPromise) {
		scriptPromise = new Promise((resolve, reject) => {
			const script = document.createElement('script');
			script.src = SCRIPT_SRC;
			script.async = true;
			script.defer = true;
			script.onload = resolve;
			script.onerror = () => {
				scriptPromise = null;
				reject(new Error('Không tải được Google Sign-In.'));
			};
			document.head.appendChild(script);
		});
	}
	return scriptPromise;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook đi kèm provider
export function useAuthModal() {
	const ctx = useContext(AuthModalContext);
	if (!ctx) throw new Error('useAuthModal phải dùng bên trong <AuthModalProvider>');
	return ctx;
}

function GoogleIcon({ className = '' }) {
	return (
		<svg viewBox="0 0 48 48" className={className} aria-hidden="true">
			<path
				fill="#FFC107"
				d="M43.611 20.083H42V20H24v8h11.303C33.65 32.657 29.223 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
			/>
			<path
				fill="#FF3D00"
				d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
			/>
			<path
				fill="#4CAF50"
				d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
			/>
			<path
				fill="#1976D2"
				d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
			/>
		</svg>
	);
}

function GoogleLogin({ onDone }) {
	const { login } = useAuth();
	const buttonRef = useRef(null);
	const [error, setError] = useState(null);
	const [submitting, setSubmitting] = useState(false);
	const [buttonReady, setButtonReady] = useState(false);
	// Vừa đủ trong modal trên màn hình nhỏ, tối đa 300px trên desktop.
	const [buttonWidth] = useState(() => Math.min(300, Math.max(200, window.innerWidth - 170)));

	useEffect(() => {
		if (!CLIENT_ID) return;
		let cancelled = false;

		loadGoogleScript()
			.then(() => {
				if (cancelled || !buttonRef.current) return;

				window.google.accounts.id.initialize({
					client_id: CLIENT_ID,
					// Không tự chọn/đề xuất tài khoản Google đã đăng nhập trước đó.
					auto_select: false,
					callback: async ({ credential }) => {
						setSubmitting(true);
						setError(null);
						try {
							await login(credential);
							onDone();
						} catch (err) {
							setError(err);
						} finally {
							setSubmitting(false);
						}
					},
				});

				// StrictMode chạy effect 2 lần -> xoá nút cũ trước khi render lại.
				buttonRef.current.innerHTML = '';
				window.google.accounts.id.renderButton(buttonRef.current, {
					type: 'standard',
					theme: 'filled_blue',
					size: 'large',
					shape: 'pill',
					text: 'signin_with',
					logo_alignment: 'left',
					width: buttonWidth,
				});
				setButtonReady(true);
			})
			.catch((err) => {
				if (!cancelled) {
					setError(err);
					setButtonReady(true);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [login, onDone, buttonWidth]);

	return (
		<div className="space-y-4">
			{CLIENT_ID ? (
				<div className="relative flex justify-center px-1 pt-1">
					<div
						aria-hidden="true"
						className="pointer-events-none absolute inset-x-10 top-1 h-10 rounded-full bg-sky-500/25 blur-2xl"
					/>
					<div
						className={`group relative rounded-full transition-opacity duration-200 focus-within:ring-2 focus-within:ring-sky-400/70 focus-within:ring-offset-2 focus-within:ring-offset-ink-900 ${
							buttonReady && !submitting ? '' : 'pointer-events-none opacity-60'
						}`}
						style={{ width: buttonWidth }}
					>
						<div className="flex h-10 w-full items-center justify-center gap-2.5 rounded-full bg-white text-sm font-medium text-ink-950 shadow-[0_6px_24px_-8px_rgba(56,189,248,0.6)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:bg-neutral-100">
							<GoogleIcon className="h-[18px] w-[18px]" />
							Đăng nhập với Google
						</div>
						{/* Nút GSI thật nằm trong suốt trên nút tuỳ chỉnh để mở luồng đăng nhập. */}
						<div
							ref={buttonRef}
							className="absolute inset-0 overflow-hidden rounded-full opacity-0 [&>div]:!h-10 [&>div]:!w-full [&_iframe]:!h-10 [&_iframe]:!w-full"
						/>
					</div>
				</div>
			) : (
				<p className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-amber-300">
					Thiếu cấu hình VITE_GOOGLE_CLIENT_ID trong file .env.
				</p>
			)}

			{submitting && (
				<p className="text-center text-xs text-neutral-400">Đang xác thực...</p>
			)}

			<p className="text-center text-xs text-neutral-500">
				Lần đăng nhập đầu tiên sẽ tự động tạo tài khoản. Không cần mật khẩu.
			</p>

			{error && (
				<p className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-300">
					{error.code ? `Lỗi (${error.code}): ` : ''}
					{error.message}
				</p>
			)}
		</div>
	);
}

export function AuthModalProvider({ children }) {
	const [open, setOpen] = useState(false);

	const openAuthModal = useCallback(() => setOpen(true), []);
	const closeAuthModal = useCallback(() => setOpen(false), []);

	// 401 không refresh được -> mở modal tại chỗ thay vì chuyển trang.
	useEffect(() => {
		const onRequired = () => setOpen(true);
		window.addEventListener('auth:required', onRequired);
		return () => window.removeEventListener('auth:required', onRequired);
	}, []);

	return (
		<AuthModalContext.Provider value={{ openAuthModal, closeAuthModal }}>
			{children}
			{open && (
				<Modal title="Đăng nhập" onClose={closeAuthModal}>
					<GoogleLogin onDone={closeAuthModal} />
				</Modal>
			)}
		</AuthModalContext.Provider>
	);
}
