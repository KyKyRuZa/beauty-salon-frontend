import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CatalogProvider } from './context/CatalogContext';
import Home from './pages/public/Home';
import NotFound from './pages/public/NotFound';
import CatalogPage from './pages/catalog/CatalogPage';
import ServiceDetailPage from './pages/catalog/ServiceDetailPage';
import ServiceMastersPage from './pages/catalog/ServiceMastersPage';
import CategoryProvidersPage from './pages/catalog/CategoryProvidersPage';
import TimeSlotsPage from './pages/catalog/TimeSlotsPage';
import ProviderProfile from './pages/public/ProviderProfile';
import LoadingFallback from './components/LoadingFallback';

const AdminPanel = lazy(() => import('./pages/private/admin/AdminPanel'));
const AdminCatalogPage = lazy(() => import('./pages/private/admin/AdminCatalogPage'));
const ServiceManagementPage = lazy(() => import('./pages/private/admin/ServiceManagementPage'));
const AdminAuthContainer = lazy(() => import('./pages/public/admin/AdminAuthContainer'));
const AdminProtectedRoute = lazy(() => import('./components/admin/AdminProtectedRoute'));
const Profile = lazy(() => import('./pages/private/Profile'));
const EditProfile = lazy(() => import('./pages/private/client/EditProfile'));
const SalonsMapPage = lazy(() => import('./pages/public/SalonsMapPage'));
const AuthContainer = lazy(() => import('./components/auth/AuthContainer'));
const BookingForm = lazy(() => import('./components/form/BookingForm'));


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
              <Route path="/auth" element={
                <Suspense fallback={<LoadingFallback />}>
                  <AuthContainer />
                </Suspense>
              } />
              <Route path="/admin/auth" element={
                <Suspense fallback={<LoadingFallback />}>
                  <AdminAuthContainer />
                </Suspense>
              } />
              <Route path="/profile" element={
                <Suspense fallback={<LoadingFallback />}>
                  <Profile />
                </Suspense>
              } />
              <Route path="/profile/edit" element={
                <Suspense fallback={<LoadingFallback />}>
                  <EditProfile />
                </Suspense>
              } />
              <Route path='/booking' element={
                <Suspense fallback={<LoadingFallback />}>
                  <BookingForm/>
                </Suspense>
              }/>
              <Route path="/salons-map" element={
                <Suspense fallback={<LoadingFallback />}>
                  <SalonsMapPage />
                </Suspense>
              } />
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