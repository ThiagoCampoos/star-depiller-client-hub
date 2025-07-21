import Header from "@/components/Header";
import UsuariosPage from "./UsuariosPage";

const UsuariosLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-elegant">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <UsuariosPage />
      </main>
    </div>
  );
};

export default UsuariosLayout;