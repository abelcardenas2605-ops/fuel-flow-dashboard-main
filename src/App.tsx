import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Pages
import AuthPage from "./pages/AuthPage";
import ConsumerDashboard from "./pages/consumer/Dashboard";
import FuelPrices from "./pages/consumer/FuelPrices";
import Payment from "./pages/consumer/Payment";
import History from "./pages/consumer/History";
import Profile from "./pages/consumer/Profile";
import Notifications from "./pages/consumer/Notifications";
import AdminDashboard from "./pages/admin/Dashboard";
import CashRegisterPage from "./pages/admin/CashRegister";
import PaymentsManagement from "./pages/admin/Payments";
import UsersManagement from "./pages/admin/Users";
import FuelManagement from "./pages/admin/FuelManagement";
import Reports from "./pages/admin/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  // Properly destructure isLoading
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground animate-pulse">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Consumer Routes */}
      <Route path="/dashboard" element={<ConsumerDashboard />} />
      <Route path="/combustibles" element={<FuelPrices />} />
      <Route path="/pagar" element={<Payment />} />
      <Route path="/historial" element={<History />} />
      <Route path="/perfil" element={<Profile />} />
      <Route path="/notificaciones" element={<Notifications />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/caja" element={<CashRegisterPage />} />
      <Route path="/admin/pagos" element={<PaymentsManagement />} />
      <Route path="/admin/usuarios" element={<UsersManagement />} />
      <Route path="/admin/combustible" element={<FuelManagement />} />
      <Route path="/admin/reportes" element={<Reports />} />

      {/* Redirects */}
      <Route path="/" element={<Navigate to={user?.role === 'consumer' ? '/dashboard' : '/admin'} replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
