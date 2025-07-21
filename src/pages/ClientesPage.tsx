import Header from "@/components/Header";
import Clientes from "./Clientes";

const ClientesPage = () => {
  return (
    <div className="min-h-screen bg-gradient-elegant">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Clientes />
      </main>
    </div>
  );
};

export default ClientesPage;