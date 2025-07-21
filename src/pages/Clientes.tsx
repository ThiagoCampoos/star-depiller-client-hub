import { useEffect, useState } from "react";
import { Search, Plus, Edit, Eye, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  cidade: string | null;
  rg_cpf: string | null;
  data_nascimento: string | null;
  idade: number | null;
}

const Clientes = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredClientes(clientes);
    } else {
      buscarClientes(searchTerm);
    }
  }, [searchTerm, clientes]);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nome');

      if (error) {
        console.error('Erro ao buscar clientes:', error);
      } else {
        setClientes(data || []);
        setFilteredClientes(data || []);
      }
    } catch (error) {
      console.error('Erro geral:', error);
    } finally {
      setLoading(false);
    }
  };

  const buscarClientes = async (termo: string) => {
    try {
      const { data, error } = await supabase
        .rpc('buscar_clientes', { termo_busca: termo });

      if (error) {
        console.error('Erro na busca:', error);
        setFilteredClientes([]);
      } else {
        // Mapear os dados da RPC para o formato Cliente completo
        const clientesMapeados = (data || []).map((item: any) => ({
          id: item.id,
          nome: item.nome,
          telefone: item.telefone,
          cidade: item.cidade,
          rg_cpf: item.rg_cpf,
          data_nascimento: null,
          idade: null
        }));
        setFilteredClientes(clientesMapeados);
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      setFilteredClientes([]);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatPhone = (phone: string) => {
    if (!phone) return '';
    return phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
  };

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
          <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground">Gerencie todos os clientes da Star Depiller</p>
        </div>
        <Button 
          onClick={() => navigate('/clientes/novo')}
          className="bg-gradient-primary text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <Card className="bg-gradient-elegant border-primary/20">
        <CardHeader>
          <CardTitle className="text-foreground">Buscar Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Busque por nome, telefone ou RG/CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClientes.map((cliente) => (
          <Card key={cliente.id} className="bg-gradient-elegant border-primary/20 hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center justify-between">
                <span>{cliente.nome}</span>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => navigate(`/clientes/${cliente.id}`)}
                    className="h-8 w-8"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => navigate(`/clientes/${cliente.id}/editar`)}
                    className="h-8 w-8"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{formatPhone(cliente.telefone)}</span>
              </div>
              
              {cliente.cidade && (
                <p className="text-sm text-muted-foreground">
                  📍 {cliente.cidade}
                </p>
              )}
              
              {cliente.data_nascimento && (
                <p className="text-sm text-muted-foreground">
                  🎂 {formatDate(cliente.data_nascimento)}
                  {cliente.idade && ` (${cliente.idade} anos)`}
                </p>
              )}
              
              {cliente.rg_cpf && (
                <p className="text-sm text-muted-foreground">
                  📄 {cliente.rg_cpf}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClientes.length === 0 && !loading && (
        <Card className="bg-gradient-elegant border-primary/20">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {searchTerm ? 'Nenhum cliente encontrado com esses critérios.' : 'Nenhum cliente cadastrado ainda.'}
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => navigate('/clientes/novo')}
                className="mt-4 bg-gradient-primary text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Primeiro Cliente
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Clientes;