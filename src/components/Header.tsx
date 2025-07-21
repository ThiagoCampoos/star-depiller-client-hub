import { Star, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import starDepillerIcon from "@/assets/star-depiller-icon.png";

const Header = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado do sistema",
    });
    navigate("/auth");
  };

  return (
    <header className="bg-gradient-secondary text-secondary-foreground shadow-elegant border-b border-primary/20">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src={starDepillerIcon} 
            alt="Star Depiller" 
            className="w-10 h-10 rounded-full border-2 border-primary/30"
          />
          <div>
            <h1 className="text-xl font-bold text-primary-glow">Star Depiller</h1>
            <p className="text-xs text-secondary-foreground/70">Sistema de Gerenciamento</p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="text-secondary-foreground hover:text-primary-glow"
          >
            Dashboard
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/clientes")}
            className="text-secondary-foreground hover:text-primary-glow"
          >
            Clientes
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/agenda")}
            className="text-secondary-foreground hover:text-primary-glow"
          >
            Agenda
          </Button>
        </nav>

        <div className="flex items-center space-x-2">
          <div className="hidden md:flex items-center space-x-2 text-sm text-secondary-foreground/70">
            <User className="w-4 h-4" />
            <span>{user?.email}</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
            className="text-secondary-foreground hover:text-primary-glow"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;