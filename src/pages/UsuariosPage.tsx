import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  user_id: string;
  nome: string;
  email: string;
  tipo_usuario: 'admin' | 'funcionario';
  ativo: boolean;
  created_at: string;
}

const UsuariosPage = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    tipo_usuario: 'funcionario' as 'admin' | 'funcionario'
  });
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar usuários:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar usuários",
          variant: "destructive",
        });
      } else {
        setUsers(data as UserProfile[] || []);
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!formData.nome || !formData.email || !formData.senha) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Verificar se o usuário atual é admin
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Não autorizado');
      }
      
      const { data: adminProfile } = await supabase
        .from('user_profiles')
        .select('tipo_usuario')
        .eq('user_id', user.id)
        .single();
      
      if (!adminProfile || adminProfile.tipo_usuario !== 'admin') {
        throw new Error('Acesso negado - apenas administradores podem criar usuários');
      }

      // Criar usuário usando signUp
      const { error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.senha,
        options: {
          data: {
            nome: formData.nome,
            tipo_usuario: formData.tipo_usuario
          }
        }
      });

      if (authError) {
        throw new Error(authError.message);
      }

      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso.",
      });
      setDialogOpen(false);
      setFormData({ nome: '', email: '', senha: '', tipo_usuario: 'funcionario' });
      fetchUsers();
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro ao criar usuário",
        description: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !formData.nome || !formData.email) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('user_profiles')
        .update({
          nome: formData.nome,
          email: formData.email,
          tipo_usuario: formData.tipo_usuario,
        })
        .eq('id', editingUser.id);

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao atualizar usuário",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Usuário atualizado com sucesso",
        });
        setDialogOpen(false);
        setEditingUser(null);
        setFormData({ nome: '', email: '', senha: '', tipo_usuario: 'funcionario' });
        fetchUsers();
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: UserProfile) => {
    setEditingUser(user);
    setFormData({
      nome: user.nome,
      email: user.email,
      senha: '',
      tipo_usuario: user.tipo_usuario
    });
    setDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="bg-gradient-elegant border-primary/20">
          <CardContent className="text-center py-12">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              Acesso negado. Apenas administradores podem gerenciar usuários.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Usuários</h1>
          <p className="text-muted-foreground">Administre os usuários do sistema</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingUser(null);
                setFormData({ nome: '', email: '', senha: '', tipo_usuario: 'funcionario' });
              }}
              className="bg-gradient-primary text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Editar Usuário' : 'Criar Novo Usuário'}
              </DialogTitle>
              <DialogDescription>
                {editingUser 
                  ? 'Edite as informações do usuário selecionado.'
                  : 'Preencha os dados para criar um novo usuário no sistema.'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome do usuário"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
              
              {!editingUser && (
                <div className="space-y-2">
                  <Label htmlFor="senha">Senha</Label>
                  <Input
                    id="senha"
                    type="password"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    placeholder="Senha temporária"
                    minLength={6}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Usuário</Label>
                <Select 
                  value={formData.tipo_usuario} 
                  onValueChange={(value: 'admin' | 'funcionario') => 
                    setFormData({ ...formData, tipo_usuario: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="funcionario">Funcionário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={editingUser ? handleUpdateUser : handleCreateUser}>
                {editingUser ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card key={user.id} className="bg-gradient-elegant border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {user.tipo_usuario === 'admin' ? (
                    <Shield className="w-5 h-5 text-primary" />
                  ) : (
                    <User className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span>{user.nome}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(user)}
                    className="h-8 w-8"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                📧 {user.email}
              </p>
              
              <div className="flex items-center gap-2">
                <Badge 
                  variant={user.tipo_usuario === 'admin' ? "default" : "secondary"}
                  className={user.tipo_usuario === 'admin' ? "bg-primary text-primary-foreground" : ""}
                >
                  {user.tipo_usuario === 'admin' ? 'Administrador' : 'Funcionário'}
                </Badge>
                <Badge 
                  variant={user.ativo ? "default" : "destructive"}
                  className={user.ativo ? "bg-green-600 text-white" : ""}
                >
                  {user.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Criado em: {formatDate(user.created_at)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <Card className="bg-gradient-elegant border-primary/20">
          <CardContent className="text-center py-12">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              Nenhum usuário encontrado
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UsuariosPage;