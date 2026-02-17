import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CatalogProvider } from './context/CatalogContext';
import Home from './pages/public/Home';
import BookingForm from './components/form/BookingForm';
import AuthContainer from './components/auth/AuthContainer';
import Chat from './components/Chat';
import Profile from "./pages/private/Profile";
import EditProfile from './pages/private/Client/EditProfile';
import NotFound from './pages//public/NotFound';
import CatalogPage from './pages/catalog/CatalogPage';
import ServiceDetailPage from './pages/catalog/ServiceDetailPage';
import ServiceManagementPage from './pages/catalog/ServiceManagementPage';
import AdminCatalogPage from './pages/private/Admin/AdminCatalogPage';
import ServiceMastersPage from './pages/catalog/ServiceMastersPage';
import CategoryProvidersPage from './pages/catalog/CategoryProvidersPage';
import TimeSlotsPage from './pages/catalog/TimeSlotsPage';
import AdminPanel from './pages/private/Admin/AdminPanel';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';
import AdminAuthContainer from './pages/public/admin/AdminAuthContainer';
import ProviderProfile from './pages/public/ProviderProfile';


function App() {
  return (
    <AuthProvider>
      <CatalogProvider>
        <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/catalog/:id" element={<ServiceDetailPage />} />
              <Route path="/catalog/services/manage" element={<ServiceManagementPage />} />
              <Route path="/catalog/service/:serviceId/masters" element={<ServiceMastersPage />} />
              <Route path="/catalog/category/:categoryId/providers" element={<CategoryProvidersPage />} />
              <Route path="/catalog/provider/:providerId/timeslots" element={<TimeSlotsPage />} />
              <Route path="/provider/:providerId" element={<ProviderProfile />} />
              <Route path="/admin/catalog" element={<AdminCatalogPage />} />
              <Route path="/auth" element={<AuthContainer />} />
              <Route path="/admin/auth" element={<AdminAuthContainer />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path='/booking' element={<BookingForm/>}/>
              <Route path='/chat' element={<Chat/>} />

              {/* Защищенные маршруты админ-панели */}
              <Route path="/admin/*" element={
                <AdminProtectedRoute>
                  <AdminPanel />
                </AdminProtectedRoute>
              } />

              <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
      </CatalogProvider>
    </AuthProvider>
  );
}

export default App;