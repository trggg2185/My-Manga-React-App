import { createContext, useCallback, useContext, useState } from 'react';
import { authApi } from '../../api';
import { useAuth } from '../../auth/useAuth';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';

const AuthModalContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components -- hook đi kèm provider
export function useAuthModal() {
	const ctx = useContext(AuthModalContext);
	if (!ctx) throw new Error('useAuthModal phải dùng bên trong <AuthModalProvider>');
	return ctx;
}

function LoginForm({ onDone, onSwitch }) {
	const { login } = useAuth();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState(null);
	const [submitting, setSubmitting] = useState(false);

	const submit = async (e) => {
		e.preventDefault();
		if (!username || !password) return;

		setSubmitting(true);
		setError(null);
		try {
			await login({ username, password });
			onDone();
		} catch (err) {
			setError(err);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form onSubmit={submit} className="space-y-4">
			<Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
			<Input
				type="password"
				placeholder="Password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
			/>

			{error && (
				<p className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-300">
					{error.code ? `Lỗi (${error.code}): ` : ''}
					{error.message}
				</p>
			)}

			<Button type="submit" className="w-full" disabled={submitting}>
				{submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
			</Button>

			<p className="text-center text-sm text-neutral-500">
				Chưa có tài khoản?{' '}
				<button
					type="button"
					onClick={onSwitch}
					className="text-white transition-colors duration-200 hover:underline"
				>
					Đăng ký
				</button>
			</p>
		</form>
	);
}

function RegisterForm({ onSwitch }) {
	const [form, setForm] = useState({ username: '', password: '', email: '' });
	const [error, setError] = useState(null);
	const [submitting, setSubmitting] = useState(false);

	const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

	const submit = async (e) => {
		e.preventDefault();
		setSubmitting(true);
		setError(null);
		try {
			await authApi.register(form);
			onSwitch(); // đăng ký xong chuyển sang tab đăng nhập
		} catch (err) {
			setError(err);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form onSubmit={submit} className="space-y-4">
			<Input name="username" placeholder="Username" value={form.username} onChange={handleChange} />
			<Input
				name="password"
				type="password"
				placeholder="Password"
				value={form.password}
				onChange={handleChange}
			/>
			<Input
				name="email"
				placeholder="Email (tuỳ chọn)"
				value={form.email}
				onChange={handleChange}
			/>

			{error && (
				<p className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-300">
					{error.code ? `Lỗi (${error.code}): ` : ''}
					{error.message}
				</p>
			)}

			<Button type="submit" className="w-full" disabled={submitting}>
				{submitting ? 'Đang tạo tài khoản...' : 'Đăng ký'}
			</Button>

			<p className="text-center text-sm text-neutral-500">
				Đã có tài khoản?{' '}
				<button
					type="button"
					onClick={onSwitch}
					className="text-white transition-colors duration-200 hover:underline"
				>
					Đăng nhập
				</button>
			</p>
		</form>
	);
}

export function AuthModalProvider({ children }) {
	const [mode, setMode] = useState(null); // 'login' | 'register' | null

	const openAuthModal = useCallback((next = 'login') => setMode(next), []);
	const closeAuthModal = useCallback(() => setMode(null), []);

	return (
		<AuthModalContext.Provider value={{ openAuthModal, closeAuthModal }}>
			{children}
			{mode && (
				<Modal
					title={mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
					onClose={closeAuthModal}
				>
					{mode === 'login' ? (
						<LoginForm onDone={closeAuthModal} onSwitch={() => setMode('register')} />
					) : (
						<RegisterForm onSwitch={() => setMode('login')} />
					)}
				</Modal>
			)}
		</AuthModalContext.Provider>
	);
}
