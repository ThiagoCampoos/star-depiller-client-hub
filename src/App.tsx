import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ClientesPage from "./pages/ClientesPage";
import AgendaPage from "./pages/AgendaPage";
import AuthPage from "./pages/AuthPage";
import UsuariosLayout from "./pages/UsuariosLayout";
import ClienteForm from "./pages/ClienteForm";
import ClienteView from "./pages/ClienteView";
import ClienteEdit from "./pages/ClienteEdit";
import FichaAvaliacaoForm from "./pages/FichaAvaliacaoForm";
import FichaAvaliacaoView from "./pages/FichaAvaliacaoView";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

// Componente para proteger rotas que precisam de autenticação
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-elegant flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/clientes" element={
              <ProtectedRoute>
                <ClientesPage />
              </ProtectedRoute>
            } />
            <Route path="/clientes/novo" element={
              <ProtectedRoute>
                <ClienteForm />
              </ProtectedRoute>
            } />
            <Route path="/clientes/:clienteId" element={
              <ProtectedRoute>
                <ClienteView />
              </ProtectedRoute>
            } />
            <Route path="/clientes/:clienteId/editar" element={
              <ProtectedRoute>
                <ClienteEdit />
              </ProtectedRoute>
            } />
            <Route path="/clientes/:clienteId/ficha-avaliacao" element={
              <ProtectedRoute>
                <FichaAvaliacaoView />
              </ProtectedRoute>
            } />
            <Route path="/clientes/:clienteId/ficha-avaliacao/criar" element={
              <ProtectedRoute>
                <FichaAvaliacaoForm />
              </ProtectedRoute>
            } />
            <Route path="/clientes/:clienteId/ficha-avaliacao/editar" element={
              <ProtectedRoute>
                <FichaAvaliacaoForm />
              </ProtectedRoute>
            } />
            {/* Rota da agenda com ErrorBoundary */}
            <Route path="/agenda" element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <AgendaPage />
                </ErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/usuarios" element={
              <ProtectedRoute>
                <UsuariosLayout />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
