import { useEffect, useState } from "react";
import { Search, Plus, Edit, Eye, Phone, Calendar, MapPin, Filter, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useToast } from "@/hooks/use-toast";

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  cidade: string | null;
  rg_cpf: string | null;
  data_nascimento: string | null;
  idade: number | null;
  created_at: string | null;
}

// Remova ou comente esta linha
// Mova esta função para dentro do componente Clientes, antes do return
// Por exemplo, após a função limparFiltros ou antes do bloco if (loading)
const Clientes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [dataFilter, setDataFilter] = useState<string>("");
  const [cidadeFilter, setCidadeFilter] = useState<string>("todas");

  useEffect(() => {
    fetchClientes();
  }, []);
  const [cidadesDisponiveis, setCidadesDisponiveis] = useState<string[]>([]);

  useEffect(() => {
    if (searchTerm.trim() === "" && (!dataFilter) && (cidadeFilter === "" || cidadeFilter === "todas")) {
      setFilteredClientes(clientes);
    } else {
      filtrarClientes();
    }
  }, [searchTerm, dataFilter, cidadeFilter, clientes]);

  // Extrair cidades únicas para o filtro
  useEffect(() => {
    if (clientes.length > 0) {
      const cidades = clientes
        .map(cliente => cliente.cidade)
        .filter((cidade): cidade is string => cidade !== null && cidade !== undefined && cidade.trim() !== '')
        .filter((cidade, index, self) => self.indexOf(cidade) === index)
        .sort();
      setCidadesDisponiveis(cidades);
    }
  }, [clientes]);

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

  const filtrarClientes = () => {
    let clientesFiltrados = [...clientes];
    
    // Filtrar por termo de busca
    if (searchTerm.trim() !== "") {
      const termo = searchTerm.toLowerCase();
      clientesFiltrados = clientesFiltrados.filter(cliente => 
        cliente.nome.toLowerCase().includes(termo) ||
        cliente.telefone.includes(termo) ||
        (cliente.rg_cpf && cliente.rg_cpf.toLowerCase().includes(termo))
      );
    }
    
    // Filtrar por cidade
    if (cidadeFilter && cidadeFilter !== "todas") {
      clientesFiltrados = clientesFiltrados.filter(cliente => 
        cliente.cidade === cidadeFilter
      );
    }
    
    // Filtrar por data de cadastro
    if (dataFilter) {
      const dataFiltro = new Date(dataFilter);
      dataFiltro.setHours(0, 0, 0, 0);
      
      clientesFiltrados = clientesFiltrados.filter(cliente => {
        if (!cliente.created_at) return false;
        
        const dataCliente = new Date(cliente.created_at);
        dataCliente.setHours(0, 0, 0, 0);
        
        return dataCliente.getTime() === dataFiltro.getTime();
      });
    }
    
    setFilteredClientes(clientesFiltrados);
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
          idade: null,
          created_at: item.created_at
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

  const limparFiltros = () => {
    setDataFilter("");
    setCidadeFilter("todas");
  };

  // Adicione a função handleDelete aqui
  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      const { error } = await supabase.from("clientes").delete().eq("id", id);
      if (error) {
        toast({
          title: "Erro ao excluir cliente",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Cliente excluído",
          description: "O cliente foi excluído com sucesso"
        });
        fetchClientes();
      }
    }
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
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Busque por nome, telefone ou RG/CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-4">
              {/* Filtro por Cidade */}
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="cidade-filter" className="mb-2 block">Filtrar por Cidade</Label>
                <ErrorBoundary>
                  <div translate="no">
                    <Select
                      value={cidadeFilter}
                      onValueChange={setCidadeFilter}
                    >
                      <SelectTrigger id="cidade-filter" className="w-full">
                        <SelectValue placeholder="Selecione uma cidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">Todas as cidades</SelectItem>
                        {cidadesDisponiveis.map((cidade) => (
                          <SelectItem key={cidade} value={cidade}>
                            {cidade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </ErrorBoundary>
              </div>
              
              {/* Filtro por Data de Cadastro */}
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="data-filter" className="mb-2 block">Filtrar por Data de Cadastro</Label>
                <Input
                  id="data-filter"
                  type="date"
                  value={dataFilter}
                  onChange={(e) => setDataFilter(e.target.value)}
                  className="w-full"
                />
              </div>
              
              {/* Botão para limpar filtros */}
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={limparFiltros}
                  className="mb-0.5"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClientes.map((cliente) => (
          <Card key={cliente.id} className="bg-gradient-elegant border-primary/20 hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center justify-between">
                <span>{cliente.nome}</span>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => navigate(`/clientes/${cliente.id}`)}
                    className="h-8 w-8"
                    title="Visualizar Cliente"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => navigate(`/clientes/${cliente.id}/editar`)}
                    className="h-8 w-8"
                    title="Editar Cliente"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(cliente.id)}
                    className="h-8 w-8 text-red-500 hover:text-red-700"
                    title="Excluir Cliente"
                  >
                    <Trash2 className="w-4 h-4" />
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
              
              {cliente.created_at && (
                <p className="text-sm text-muted-foreground">
                  📅 Cadastrado em: {formatDate(cliente.created_at)}
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
              {searchTerm || cidadeFilter || dataFilter ? 'Nenhum cliente encontrado com esses critérios.' : 'Nenhum cliente cadastrado ainda.'}
            </p>
            {!searchTerm && !cidadeFilter && !dataFilter && (
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