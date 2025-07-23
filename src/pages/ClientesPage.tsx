import Header from "@/components/Header";
import Clientes from "./Clientes";
import ErrorBoundary from "@/components/ErrorBoundary";

const ClientesPage = () => {
  return (
    <div className="min-h-screen bg-gradient-elegant">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <ErrorBoundary fallback={
          <div className="p-4 border border-amber-500 rounded-md bg-amber-50 text-amber-700">
            <h2 className="text-lg font-semibold">Problema ao carregar o filtro de cidades</h2>
            <p>Tente recarregar a página ou contate o suporte se o problema persistir.</p>
          </div>
        }>
          <Clientes />
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default ClientesPage;