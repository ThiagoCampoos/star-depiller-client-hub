import { useEffect, useState } from "react";
import { Users, Calendar, Activity, TrendingUp } from "lucide-react";
import DashboardCard from "@/components/DashboardCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface EstatisticasGerais {
  total_clientes: number;
  total_tratamentos: number;
  tratamentos_ativos: number;
  sessoes_hoje: number;
  total_sessoes: number;
}

interface ProximasSessoes {
  sessao_id: string;
  cliente_nome: string;
  area_tratamento: string;
  data_sessao: string;
  profissional_responsavel: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<EstatisticasGerais | null>(null);
  const [proximasSessoes, setProximasSessoes] = useState<ProximasSessoes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar estatísticas gerais
      const { data: statsData, error: statsError } = await supabase
        .from('estatisticas_gerais')
        .select('*')
        .single();

      if (statsError) {
        console.error('Erro ao buscar estatísticas:', statsError);
      } else {
        setStats(statsData);
      }

      // Buscar próximas sessões
      const { data: sessoesData, error: sessoesError } = await supabase
        .rpc('proximas_sessoes', { dias_limite: 7 });

      if (sessoesError) {
        console.error('Erro ao buscar próximas sessões:', sessoesError);
      } else {
        setProximasSessoes(sessoesData || []);
      }
    } catch (error) {
      console.error('Erro geral:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
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
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do sistema Star Depiller</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={() => navigate('/agenda')}
            className="bg-gradient-primary text-primary-foreground"
          >
            Novo Agendamento
          </Button>
          <Button 
            onClick={() => navigate('/clientes/novo')}
            className="bg-gradient-primary text-primary-foreground"
          >
            Novo Cliente
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total de Clientes"
          value={stats?.total_clientes || 0}
          icon={Users}
          description="Clientes cadastrados"
        />
        <DashboardCard
          title="Tratamentos Ativos"
          value={stats?.tratamentos_ativos || 0}
          icon={Activity}
          description="Em andamento"
          trend="up"
        />
        <DashboardCard
          title="Sessões Hoje"
          value={stats?.sessoes_hoje || 0}
          icon={Calendar}
          description="Agendadas para hoje"
        />
        <DashboardCard
          title="Total de Sessões"
          value={stats?.total_sessoes || 0}
          icon={TrendingUp}
          description="Já realizadas"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-gradient-elegant border-primary/20">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Próximas Sessões
            </CardTitle>
          </CardHeader>
          <CardContent>
            {proximasSessoes.length > 0 ? (
              <div className="space-y-3">
                {proximasSessoes.slice(0, 5).map((sessao) => (
                  <div key={sessao.sessao_id} className="flex items-center justify-between p-3 bg-background rounded-md border border-primary/10">
                    <div>
                      <p className="font-medium text-foreground">{sessao.cliente_nome}</p>
                      <p className="text-sm text-muted-foreground">{sessao.area_tratamento}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary">{formatDate(sessao.data_sessao)}</p>
                      <p className="text-xs text-muted-foreground">{sessao.profissional_responsavel}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Nenhuma sessão agendada para os próximos 7 dias
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-elegant border-primary/20">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/clientes/novo')}
            >
              <Users className="w-4 h-4 mr-2" />
              Cadastrar Novo Cliente
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/clientes')}
            >
              <Users className="w-4 h-4 mr-2" />
              Ver Todos os Clientes
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/agenda')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Visualizar Agenda
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;