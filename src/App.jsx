import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AppSettingsProvider } from '@/lib/AppSettings';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Layout from '@/components/Layout';
import Today from '@/pages/Today';
import Planner from '@/pages/Planner';
import Reflection from '@/pages/Reflection';
import LifeStudio from '@/pages/LifeStudio';
import FitnessStudio from '@/pages/studios/FitnessStudio';
import KitchenStudio from '@/pages/studios/KitchenStudio';
import HomeStudio from '@/pages/studios/HomeStudio';
import BeautyStudio from '@/pages/studios/BeautyStudio';
import HealthStudio from '@/pages/studios/HealthStudio';
import CreatorStudio from '@/pages/studios/CreatorStudio';
import BudgetStudio from '@/pages/studios/BudgetStudio';
import TTCStudio from '@/pages/studios/TTCStudio';
import CreativeNook from '@/pages/studios/CreativeNook';
import SettingsPage from '@/pages/Settings';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Today />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/reflection" element={<Reflection />} />
          <Route path="/life" element={<LifeStudio />} />
          <Route path="/life/fitness" element={<FitnessStudio />} />
          <Route path="/life/kitchen" element={<KitchenStudio />} />
          <Route path="/life/home" element={<HomeStudio />} />
          <Route path="/life/beauty" element={<BeautyStudio />} />
          <Route path="/life/health" element={<HealthStudio />} />
          <Route path="/life/creator" element={<CreatorStudio />} />
          <Route path="/life/budget" element={<BudgetStudio />} />
          <Route path="/life/ttc" element={<TTCStudio />} />
          <Route path="/life/creative" element={<CreativeNook />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <AppSettingsProvider>
        <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AppSettingsProvider>
    </AuthProvider>
  )
}

export default App