import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import MangaDetailPage from './pages/MangaDetailPage.jsx';
import ChapterReaderPage from './pages/ChapterReaderPage.jsx';
import GroupsPage from './pages/GroupsPage.jsx';
import GroupDetailPage from './pages/GroupDetailPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import MyJoinRequestsPage from './pages/MyJoinRequestsPage.jsx';
import MyMangaPage from './pages/manage/MyMangaPage.jsx';
import MangaEditorPage from './pages/manage/MangaEditorPage.jsx';
import ManageMangaPage from './pages/manage/ManageMangaPage.jsx';
import ChapterEditorPage from './pages/manage/ChapterEditorPage.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import UsersPage from './pages/admin/UsersPage.jsx';
import RolesPage from './pages/admin/RolesPage.jsx';
import PermissionsPage from './pages/admin/PermissionsPage.jsx';
import AdminCategoriesPage from './pages/admin/CategoriesPage.jsx';
import AdminMangaPage from './pages/admin/MangaPage.jsx';
import AdminGroupsPage from './pages/admin/GroupsPage.jsx';
import CreationRequestsPage from './pages/admin/CreationRequestsPage.jsx';
import ProtectedRoute from './auth/ProtectedRoute.jsx';

function App() {
	return (
		<Routes>
			<Route element={<AppLayout />}>
				{/* Công khai */}
				<Route index element={<HomePage />} />
				<Route path="mangas/:id" element={<MangaDetailPage />} />
				<Route path="mangas/:mangaId/chapters/:chapterId" element={<ChapterReaderPage />} />
				<Route path="groups" element={<GroupsPage />} />
				<Route path="groups/:id" element={<GroupDetailPage />} />

				{/* Cần đăng nhập */}
				<Route element={<ProtectedRoute />}>
					<Route path="profile" element={<ProfilePage />} />
					<Route path="my/join-requests" element={<MyJoinRequestsPage />} />
				</Route>

				{/* Translator / Leader */}
				<Route element={<ProtectedRoute roles={['TRANSLATOR', 'ADMIN']} />}>
					<Route path="manage" element={<MyMangaPage />} />
					<Route path="manage/mangas/new" element={<MangaEditorPage />} />
					<Route path="manage/mangas/:mangaId" element={<MangaEditorPage />} />
					<Route path="manage/mangas/:mangaId/chapters" element={<ManageMangaPage />} />
					<Route path="manage/mangas/:mangaId/chapters/new" element={<ChapterEditorPage />} />
				</Route>

				{/* Admin */}
				<Route element={<ProtectedRoute roles={['ADMIN']} />}>
					<Route path="admin" element={<AdminLayout />}>
						<Route index element={<AdminDashboardPage />} />
						<Route path="users" element={<UsersPage />} />
						<Route path="roles" element={<RolesPage />} />
						<Route path="permissions" element={<PermissionsPage />} />
						<Route path="categories" element={<AdminCategoriesPage />} />
						<Route path="mangas" element={<AdminMangaPage />} />
						<Route path="groups" element={<AdminGroupsPage />} />
						<Route path="creation-requests" element={<CreationRequestsPage />} />
					</Route>
				</Route>

				<Route path="*" element={<Navigate to="/" replace />} />
			</Route>
		</Routes>
	);
}

export default App;
