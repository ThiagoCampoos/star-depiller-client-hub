import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Edit, ArrowLeft, Phone, MapPin, Calendar } from "lucide-react";

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  cidade: string | null;
  rg_cpf: string | null;
  data_nascimento: string | null;
  idade: number | null;
  sexo: string | null;
  profissao: string | null;
  endereco: string | null;
  numero: string | null;
  bairro: string | null;
  cep: string | null;
  created_at: string | null;
}

const ClienteView = () => {
  const { clienteId } = useParams<{ clienteId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clienteId) {
      fetchCliente(clienteId);
    }
  }, [clienteId]);

  const fetchCliente = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setCliente(data);
      }
    } catch (error: any) {
      console.error("Erro ao buscar cliente:", error);
      toast({
        title: "Erro ao buscar cliente",
        description: error.message || "Ocorreu um erro ao buscar os dados do cliente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (dataString: string | null) => {
    if (!dataString) return "Não informada";
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  const formatarTelefone = (telefone: string) => {
    // Formatar telefone como (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    if (!telefone) return "";
    if (telefone.length === 11) {
      return `(${telefone.slice(0, 2)}) ${telefone.slice(2, 7)}-${telefone.slice(7)}`;
    } else if (telefone.length === 10) {
      return `(${telefone.slice(0, 2)}) ${telefone.slice(2, 6)}-${telefone.slice(6)}`;
    }
    return telefone;
  };

  return (
    <div className="min-h-screen bg-gradient-elegant">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Button 
            variant="outline" 
            className="mb-4" 
            onClick={() => navigate('/clientes')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Clientes
          </Button>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : cliente ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-foreground">{cliente.nome}</h1>
                <Button onClick={() => navigate(`/clientes/${cliente.id}/editar`)}>
                  <Edit className="mr-2 h-4 w-4" /> Editar
                </Button>
              </div>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-muted-foreground">Telefone</h3>
                      <p className="flex items-center mt-1">
                        <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                        {formatarTelefone(cliente.telefone)}
                      </p>
                    </div>
                    
                    {cliente.cidade && (
                      <div>
                        <h3 className="font-medium text-muted-foreground">Cidade</h3>
                        <p className="flex items-center mt-1">
                          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                          {cliente.cidade}
                        </p>
                      </div>
                    )}
                    
                    {cliente.data_nascimento && (
                      <div>
                        <h3 className="font-medium text-muted-foreground">Data de Nascimento</h3>
                        <p className="flex items-center mt-1">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          {formatarData(cliente.data_nascimento)}
                          {cliente.idade && ` (${cliente.idade} anos)`}
                        </p>
                      </div>
                    )}
                    
                    {cliente.rg_cpf && (
                      <div>
                        <h3 className="font-medium text-muted-foreground">RG/CPF</h3>
                        <p className="mt-1">{cliente.rg_cpf}</p>
                      </div>
                    )}
                    
                    {cliente.profissao && (
                      <div>
                        <h3 className="font-medium text-muted-foreground">Profissão</h3>
                        <p className="mt-1">{cliente.profissao}</p>
                      </div>
                    )}
                    
                    {cliente.sexo && (
                      <div>
                        <h3 className="font-medium text-muted-foreground">Sexo</h3>
                        <p className="mt-1">{cliente.sexo}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {(cliente.endereco || cliente.bairro || cliente.cidade || cliente.cep) && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Endereço</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cliente.endereco && (
                        <div>
                          <h3 className="font-medium text-muted-foreground">Logradouro</h3>
                          <p className="mt-1">
                            {cliente.endereco}
                            {cliente.numero && `, ${cliente.numero}`}
                          </p>
                        </div>
                      )}
                      
                      {cliente.bairro && (
                        <div>
                          <h3 className="font-medium text-muted-foreground">Bairro</h3>
                          <p className="mt-1">{cliente.bairro}</p>
                        </div>
                      )}
                      
                      {cliente.cidade && (
                        <div>
                          <h3 className="font-medium text-muted-foreground">Cidade</h3>
                          <p className="mt-1">{cliente.cidade}</p>
                        </div>
                      )}
                      
                      {cliente.cep && (
                        <div>
                          <h3 className="font-medium text-muted-foreground">CEP</h3>
                          <p className="mt-1">{cliente.cep}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="flex space-x-4">
                <Button 
                  onClick={() => navigate(`/clientes/${cliente.id}/ficha-avaliacao`)}
                  className="w-full md:w-auto"
                >
                  Ver Ficha de Avaliação
                </Button>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="py-10">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2">Cliente não encontrado</h2>
                  <p className="text-muted-foreground mb-4">O cliente solicitado não foi encontrado ou não existe.</p>
                  <Button onClick={() => navigate('/clientes')}>Voltar para lista de clientes</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClienteView;