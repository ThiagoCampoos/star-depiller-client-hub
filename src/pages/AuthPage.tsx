import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import starDepillerIcon from "@/assets/star-depiller-icon.png";

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Erro no login",
        description: "Email ou senha incorretos. Verifique suas credenciais.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao sistema Star Depiller",
      });
      navigate("/");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-elegant flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src={starDepillerIcon} 
            alt="Star Depiller" 
            className="w-20 h-20 mx-auto rounded-full border-4 border-primary/30 mb-4"
          />
          <h1 className="text-3xl font-bold text-foreground mb-2">Star Depiller</h1>
          <p className="text-muted-foreground">Sistema de Gerenciamento de Clientes</p>
        </div>

        <Card className="bg-card border-primary/20 shadow-elegant">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">Acesso ao Sistema</CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar o sistema interno
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-primary text-primary-foreground"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
            
            <div className="mt-6 p-4 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground text-center mb-2">
                <strong>Acesso via painel Supabase</strong>
              </p>
              <p className="text-xs text-muted-foreground text-center">
                Use um email e senha cadastrados no seu projeto.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;