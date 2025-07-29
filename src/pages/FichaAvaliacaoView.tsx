import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Edit } from "lucide-react";

interface FichaAvaliacao {
  id: string;
  cliente_id: string;
  fototipo: string | null;
  caracteristica_pelo_cor: string | null;
  caracteristica_pelo_espessura: string | null;
  ja_fez_laser: boolean;
  sessoes_laser_anteriores: number | null;
  medicamento_continuo: boolean;
  qual_medicamento_continuo: string | null;
  usa_acido: boolean;
  qual_acido: string | null;
  tem_alergia: boolean;
  qual_alergia: string | null;
  doenca_pele: boolean;
  doenca_autoimune: boolean;
  usa_suplementacao: boolean;
  qual_suplementacao: string | null;
  disfuncao_hormonal: boolean;
  qual_disfuncao_hormonal: string | null;
  reposicao_hormonal: boolean;
  qual_reposicao_hormonal: string | null;
  medicamento_cabelo_unha: boolean;
  qual_medicamento_cabelo_unha: string | null;
  gestante: boolean;
  amamentando: boolean;
  usa_protetor_solar: boolean;
  medicamento_fotossensibilizante: boolean;
  observacoes: string | null;
  protocolo: string | null;
  concordancia_tratamento: boolean;
  termos_explicados: boolean;
  responsavel_legal: string | null;
  data_consentimento: string | null;
  created_at: string;
}

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
}

const FichaAvaliacaoView = () => {
  const { clienteId } = useParams<{ clienteId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ficha, setFicha] = useState<FichaAvaliacao | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clienteId) {
      fetchCliente(clienteId);
      fetchFichaAvaliacao(clienteId);
    }
  }, [clienteId]);

  const fetchCliente = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome, telefone')
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
    }
  };

  const fetchFichaAvaliacao = async (clienteId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('fichas_avaliacao')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Código para "No rows returned"
          // Não há ficha de avaliação para este cliente
          setFicha(null);
        } else {
          throw error;
        }
      } else {
        setFicha(data);
      }
    } catch (error: any) {
      console.error("Erro ao buscar ficha de avaliação:", error);
      toast({
        title: "Erro ao carregar ficha de avaliação",
        description: error.message || "Não foi possível carregar os dados da ficha de avaliação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-elegant">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="min-h-screen bg-gradient-elegant">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <Card className="bg-gradient-elegant border-primary/20">
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground text-lg">Cliente não encontrado.</p>
                <Button 
                  onClick={() => navigate('/clientes')}
                  className="mt-4 bg-gradient-primary text-primary-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar para Clientes
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (!ficha) {
    return (
      <div className="min-h-screen bg-gradient-elegant">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-foreground">Ficha de Avaliação</h1>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/clientes/${clienteId}`)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </div>
            </div>
            <Card className="bg-gradient-elegant border-primary/20">
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground text-lg">Este cliente ainda não possui uma ficha de avaliação.</p>
                <Button 
                  onClick={() => navigate(`/clientes/${clienteId}/ficha-avaliacao/criar`)}
                  className="mt-4 bg-gradient-primary text-primary-foreground"
                >
                  Criar Ficha de Avaliação
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-elegant">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-foreground">Ficha de Avaliação</h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/clientes/${clienteId}`)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Button
                onClick={() => navigate(`/clientes/${clienteId}/ficha-avaliacao/editar`)}
                className="bg-gradient-primary text-primary-foreground"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </div>
          </div>
          
          <Card className="bg-gradient-elegant border-primary/20 mb-6">
            <CardHeader>
              <CardTitle>Características Físicas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Fototipo</h3>
                  <p className="text-foreground">{ficha.fototipo || 'Não informado'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Cor do Pelo</h3>
                  <p className="text-foreground">{ficha.caracteristica_pelo_cor || 'Não informado'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Espessura do Pelo</h3>
                  <p className="text-foreground">{ficha.caracteristica_pelo_espessura || 'Não informado'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-elegant border-primary/20 mb-6">
            <CardHeader>
              <CardTitle>Experiência com Laser</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Já fez laser antes?</h3>
                  <p className="text-foreground">{ficha.ja_fez_laser ? 'Sim' : 'Não'}</p>
                </div>
                {ficha.ja_fez_laser && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Quantas sessões já fez?</h3>
                    <p className="text-foreground">{ficha.sessoes_laser_anteriores || 'Não informado'}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-elegant border-primary/20 mb-6">
            <CardHeader>
              <CardTitle>Condições de Saúde</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Toma medicamento contínuo?</h3>
                  <p className="text-foreground">{ficha.medicamento_continuo ? 'Sim' : 'Não'}</p>
                  {ficha.medicamento_continuo && ficha.qual_medicamento_continuo && (
                    <p className="text-sm text-muted-foreground mt-1">Qual: {ficha.qual_medicamento_continuo}</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Usa ácido?</h3>
                  <p className="text-foreground">{ficha.usa_acido ? 'Sim' : 'Não'}</p>
                  {ficha.usa_acido && ficha.qual_acido && (
                    <p className="text-sm text-muted-foreground mt-1">Qual: {ficha.qual_acido}</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Tem alergia?</h3>
                  <p className="text-foreground">{ficha.tem_alergia ? 'Sim' : 'Não'}</p>
                  {ficha.tem_alergia && ficha.qual_alergia && (
                    <p className="text-sm text-muted-foreground mt-1">Qual: {ficha.qual_alergia}</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Doença de pele?</h3>
                  <p className="text-foreground">{ficha.doenca_pele ? 'Sim' : 'Não'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Doença autoimune?</h3>
                  <p className="text-foreground">{ficha.doenca_autoimune ? 'Sim' : 'Não'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Usa suplementação?</h3>
                  <p className="text-foreground">{ficha.usa_suplementacao ? 'Sim' : 'Não'}</p>
                  {ficha.usa_suplementacao && ficha.qual_suplementacao && (
                    <p className="text-sm text-muted-foreground mt-1">Qual: {ficha.qual_suplementacao}</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Disfunção hormonal?</h3>
                  <p className="text-foreground">{ficha.disfuncao_hormonal ? 'Sim' : 'Não'}</p>
                  {ficha.disfuncao_hormonal && ficha.qual_disfuncao_hormonal && (
                    <p className="text-sm text-muted-foreground mt-1">Qual: {ficha.qual_disfuncao_hormonal}</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Reposição hormonal?</h3>
                  <p className="text-foreground">{ficha.reposicao_hormonal ? 'Sim' : 'Não'}</p>
                  {ficha.reposicao_hormonal && ficha.qual_reposicao_hormonal && (
                    <p className="text-sm text-muted-foreground mt-1">Qual: {ficha.qual_reposicao_hormonal}</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Medicamento para cabelo/unha?</h3>
                  <p className="text-foreground">{ficha.medicamento_cabelo_unha ? 'Sim' : 'Não'}</p>
                  {ficha.medicamento_cabelo_unha && ficha.qual_medicamento_cabelo_unha && (
                    <p className="text-sm text-muted-foreground mt-1">Qual: {ficha.qual_medicamento_cabelo_unha}</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Gestante?</h3>
                  <p className="text-foreground">{ficha.gestante ? 'Sim' : 'Não'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Amamentando?</h3>
                  <p className="text-foreground">{ficha.amamentando ? 'Sim' : 'Não'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Usa protetor solar?</h3>
                  <p className="text-foreground">{ficha.usa_protetor_solar ? 'Sim' : 'Não'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Medicamento fotossensibilizante?</h3>
                  <p className="text-foreground">{ficha.medicamento_fotossensibilizante ? 'Sim' : 'Não'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Adicionando a seção de Protocolo */}
          {ficha.protocolo && (
            <Card className="bg-gradient-elegant border-primary/20 mb-6">
              <CardHeader>
                <CardTitle>Protocolo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-line">{ficha.protocolo}</p>
              </CardContent>
            </Card>
          )}
          
          {ficha.observacoes && (
            <Card className="bg-gradient-elegant border-primary/20 mb-6">
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-line">{ficha.observacoes}</p>
              </CardContent>
            </Card>
          )}
          
          <Card className="bg-gradient-elegant border-primary/20 mb-6">
            <CardHeader>
              <CardTitle>Consentimento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Concordância com o tratamento</h3>
                  <p className="text-foreground">{ficha.concordancia_tratamento ? 'Sim' : 'Não'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Termos explicados</h3>
                  <p className="text-foreground">{ficha.termos_explicados ? 'Sim' : 'Não'}</p>
                </div>
                {ficha.responsavel_legal && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Responsável legal</h3>
                    <p className="text-foreground">{ficha.responsavel_legal}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Data do consentimento</h3>
                  <p className="text-foreground">{ficha.data_consentimento ? formatDate(ficha.data_consentimento) : 'Não informado'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default FichaAvaliacaoView;