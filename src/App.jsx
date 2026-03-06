import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CatalogProvider } from './context/CatalogContext';
import Home from './pages/public/Home';
import BookingForm from './components/form/BookingForm';
import AuthContainer from './components/auth/AuthContainer';
import Profile from "./pages/private/Profile";
import EditProfile from './pages/private/client/EditProfile';
import NotFound from './pages/public/NotFound';
import CatalogPage from './pages/catalog/CatalogPage';
import ServiceDetailPage from './pages/catalog/ServiceDetailPage';
import ServiceMastersPage from './pages/catalog/ServiceMastersPage';
import CategoryProvidersPage from './pages/catalog/CategoryProvidersPage';
import TimeSlotsPage from './pages/catalog/TimeSlotsPage';
import ProviderProfile from './pages/public/ProviderProfile';
import SalonsMapPage from './pages/public/SalonsMapPage';
import LoadingFallback from './components/LoadingFallback';

// Lazy load для тяжёлых компонентов
const AdminPanel = lazy(() => import('./pages/private/admin/AdminPanel'));
const AdminCatalogPage = lazy(() => import('./pages/private/admin/AdminCatalogPage'));
const ServiceManagementPage = lazy(() => import('./pages/private/admin/ServiceManagementPage'));
const AdminAuthContainer = lazy(() => import('./pages/public/admin/AdminAuthContainer'));
const AdminProtectedRoute = lazy(() => import('./components/admin/AdminProtectedRoute'));


function App() {
  return (
    <AuthProvider>
      <CatalogProvider>
        <BrowserRouter>
          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/catalog/:id" element={<ServiceDetailPage />} />
              <Route path="/catalog/services/manage" element={
                <Suspense fallback={<LoadingFallback />}>
                  <ServiceManagementPage />
                </Suspense>
              } />
              <Route path="/catalog/service/:serviceId/masters" element={<ServiceMastersPage />} />
              <Route path="/catalog/category/:categoryId/providers" element={<CategoryProvidersPage />} />
              <Route path="/catalog/provider/:providerId/timeslots" element={<TimeSlotsPage />} />
              <Route path="/provider/:providerId" element={<ProviderProfile />} />
              <Route path="/admin/catalog" element={
                <Suspense fallback={<LoadingFallback />}>
                  <AdminCatalogPage />
                </Suspense>
              } />
              <Route path="/auth" element={<AuthContainer />} />
              <Route path="/admin/auth" element={
                <Suspense fallback={<LoadingFallback />}>
                  <AdminAuthContainer />
                </Suspense>
              } />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path='/booking' element={<BookingForm/>}/>
              <Route path="/salons-map" element={<SalonsMapPage />} />
              {/* <Route path='/chat' element={<Chat/>} /> */}

              {/* Защищенные маршруты админ-панели */}
              <Route path="/admin/*" element={
                <Suspense fallback={<LoadingFallback />}>
                  <AdminProtectedRoute>
                    <AdminPanel />
                  </AdminProtectedRoute>
                </Suspense>
              } />

              <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
      </CatalogProvider>
    </AuthProvider>
  );
}

export default App;