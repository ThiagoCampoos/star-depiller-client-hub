import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { TimePicker } from "@/components/ui/time-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { createDateWithTimeZone, formatDateForDB } from "@/lib/date-config";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Combobox } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

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

// Interface corrigida para corresponder aos dados do Supabase
interface SessaoData {
  id: string;
  cliente_id: string;
  data_sessao: string;
  areas_tratamento: string;
  observacoes?: string;
  clinica: string;
  valor_sessao: number;
  profissional_responsavel: string;
  protocolo_utilizado: string;
  eh_reavaliacao: boolean;
  created_at: string;
  clientes?: {
    id: string;
    nome: string;
  };
}

// Interface para Ficha de Avaliação
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
  concordancia_tratamento: boolean;
  termos_explicados: boolean;
  responsavel_legal: string | null;
  data_consentimento: string | null;
  created_at: string;
}

// Lista de partes do corpo disponíveis para depilação
const PARTES_CORPO = [
  { id: "bracos", label: "Braços" },
  { id: "costas", label: "Costas" },
  { id: "pernas", label: "Pernas" },
  { id: "barriga", label: "Barriga" },
  { id: "virilha", label: "Virilha" },
  { id: "axilas", label: "Axilas" },
  { id: "rosto", label: "Rosto" },
  { id: "pes", label: "Pés" },
  { id: "maos", label: "Mãos" },
  { id: "peito", label: "Peito" },
  { id: "outras", label: "Outras" },
];

const formSchema = z.object({
  cliente_id: z.string().min(1, "Selecione um cliente"),
  clinica: z.string().min(1, "Selecione uma clínica"),
  areas_tratamento: z.array(z.string()).min(1, "Selecione pelo menos uma área para tratamento"),
  valor_sessao: z.number().min(0.01, "Informe o valor da sessão"),
  data_sessao: z.date({
    required_error: "Selecione uma data",
  }),
  horario_sessao: z.string().min(1, "Selecione um horário"),
  profissional_responsavel: z.string().min(1, "Informe o profissional responsável"),
  protocolo_utilizado: z.string().min(1, "Informe o protocolo utilizado"),
  observacoes: z.string().optional(),
  eh_reavaliacao: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

const AgendaPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [sessoes, setSessoes] = useState<SessaoData[]>([]);
  const [selectedSessao, setSelectedSessao] = useState<SessaoData | null>(null);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [selectedFicha, setSelectedFicha] = useState<FichaAvaliacao | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Estados para os filtros
  const [filtroClinica, setFiltroClinica] = useState<string>("todas");
  const [filtroData, setFiltroData] = useState<Date | undefined>(undefined);
  const [clinicas, setClinicas] = useState<string[]>([]);
  const navigate = useNavigate();

  // Função formatDate modificada para ajustar o fuso horário
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const adjustedDate = new Date(date.getTime() + (3 * 60 * 60 * 1000));
    return `${adjustedDate.toLocaleDateString('pt-BR')} ${adjustedDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Nova função para formatar apenas datas (sem horário)
  const formatDateOnly = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cliente_id: "",
      clinica: "",
      areas_tratamento: [],
      valor_sessao: 0,
      data_sessao: undefined,
      horario_sessao: "",
      profissional_responsavel: "",
      protocolo_utilizado: "",
      observacoes: "",
      eh_reavaliacao: false,
    },
  });

  useEffect(() => {
    if (isEditing && selectedSessao) {
      form.reset({
        cliente_id: selectedSessao.cliente_id,
        clinica: selectedSessao.clinica,
        areas_tratamento: selectedSessao.areas_tratamento.split(',').map(s => s.trim()),
        valor_sessao: selectedSessao.valor_sessao,
        profissional_responsavel: selectedSessao.profissional_responsavel,
        protocolo_utilizado: selectedSessao.protocolo_utilizado,
        observacoes: selectedSessao.observacoes || "",
        eh_reavaliacao: selectedSessao.eh_reavaliacao,
      });
    }
  }, [isEditing, selectedSessao, form]);

  const handleUpdateSessao = async (values: FormValues) => {
    if (!selectedSessao) return;

    setLoading(true);
    try {
      const sessaoData = {
        ...values,
        areas_tratamento: values.areas_tratamento.join(", "),
        valor_sessao: Number(values.valor_sessao),
      };

      const { error } = await supabase
        .from("sessoes")
        .update({
          ...sessaoData,
          data_sessao: formatDateForDB(createDateWithTimeZone(sessaoData.data_sessao, sessaoData.horario_sessao))
        })
        .eq("id", selectedSessao.id);

      if (error) throw error;

      toast.success("Sessão atualizada com sucesso!");
      setIsEditing(false);
      setIsModalOpen(false);
      fetchSessoes();
    } catch (error: any) {
      toast.error("Erro ao atualizar sessão", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar clientes
  const fetchClientes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("nome");

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      toast.error("Erro ao carregar clientes");
    }
  }, []);

  // Função para buscar clínicas disponíveis
  const fetchClinicas = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("sessoes")
        .select("clinica")
        .order("clinica");

      if (error) throw error;
      
      // Extrair clínicas únicas
      const clinicasUnicas = [...new Set(data?.map(item => item.clinica).filter(Boolean))];
      setClinicas(clinicasUnicas);
    } catch (error) {
      console.error("Erro ao buscar clínicas:", error);
    }
  }, []);

  // Função para buscar sessões com filtros - CORRIGIDA
  const fetchSessoes = useCallback(async () => {
    try {
      let query = supabase
        .from("sessoes")
        .select(`
          *,
          clientes (
            id,
            nome
          )
        `)
        .order("data_sessao", { ascending: true });

      // Aplicar filtro de clínica se selecionado
      if (filtroClinica && filtroClinica !== "todas") {
        query = query.eq("clinica", filtroClinica);
      }

      // Aplicar filtro de data se selecionado
      if (filtroData) {
        const data = new Date(filtroData);
        data.setHours(0, 0, 0, 0);
        
        const dataFormatada = data.toISOString().split('T')[0];
        const dataInicio = `${dataFormatada} 00:00:00`;
        const dataFim = `${dataFormatada} 23:59:59`;
        
        query = query.gte('data_sessao', dataInicio).lte('data_sessao', dataFim);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      console.log("Sessões retornadas após filtro:", data?.length || 0);
      setSessoes(data || []);
    } catch (error) {
      console.error("Erro ao buscar sessões:", error);
      toast.error("Erro ao carregar sessões");
    }
  }, [filtroClinica, filtroData]);

  // Função para buscar dados do cliente
  const fetchCliente = async (id: string) => {
    try {
      setLoadingModal(true);
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', id)
        .single();
  
      if (error) throw error;
      setSelectedCliente(data);
      return data;
    } catch (error) {
      console.error("Erro ao buscar cliente:", error);
      toast.error("Erro ao carregar dados do cliente");
      return null;
    }
  };

  // Função para buscar ficha de avaliação - CORRIGIDA
  const fetchFichaAvaliacao = async (clienteId: string) => {
    try {
      const { data, error } = await supabase
        .from('fichas_avaliacao')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error("Erro do Supabase ao buscar ficha:", error);
        throw error;
      }

      console.log("Dados brutos da ficha retornados pelo Supabase:", data);
      const ficha = data?.[0] || null;
      return ficha;

    } catch (error: any) {
      console.error("Erro ao buscar ficha de avaliação:", error);
      toast.error("Erro ao carregar ficha de avaliação");
      return null;
    } finally {
      setLoadingModal(false);
    }
  };
  
  // Função para abrir o modal com os detalhes da sessão e do cliente
  const openSessaoModal = async (sessao: SessaoData, editMode = false) => {
    console.log("Abrindo modal para sessão:", sessao);
    setSelectedSessao(sessao);
    setIsModalOpen(true);
    setIsEditing(editMode); // Define o modo de edição
    
    console.log("Buscando cliente com ID:", sessao.cliente_id);
    const cliente = await fetchCliente(sessao.cliente_id);
    console.log("Cliente encontrado:", cliente);
    if (cliente) {
      console.log("Iniciando busca de ficha para cliente ID:", cliente.id);
      const fichaData = await fetchFichaAvaliacao(cliente.id);
      setSelectedFicha(fichaData);
      console.log("Ficha retornada pela função:", fichaData);
    }
  };

  // useEffect principal - executa apenas na montagem do componente
  useEffect(() => {
    fetchClientes();
    fetchClinicas();
    fetchSessoes(); // Carrega as sessões inicialmente
  }, [fetchClientes, fetchClinicas, fetchSessoes]);

  // useEffect separado para reagir às mudanças dos filtros
  useEffect(() => {
    fetchSessoes();
  }, [filtroClinica, filtroData, fetchSessoes]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      console.log("Valores do formulário:", values);
      
      const dataHorario = createDateWithTimeZone(values.data_sessao, values.horario_sessao);
      
      console.log("Data e horário combinados:", {
        data: values.data_sessao,
        horario: values.horario_sessao,
        dataHorario: dataHorario.toISOString(),
        horaLocal: dataHorario.getHours(),
        minutoLocal: dataHorario.getMinutes()
      });

      if (!values.cliente_id) {
        throw new Error('ID do cliente não fornecido');
      }

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout ao conectar com o Supabase')), 10000);
      });

      const formattedDate = formatDateForDB(dataHorario);
      
      console.log("Data formatada para o Supabase:", formattedDate);

      const insertPromise = supabase
        .from('sessoes')
        .insert({
          cliente_id: values.cliente_id,
          clinica: values.clinica,
          areas_tratamento: values.areas_tratamento.join(', '),
          valor_sessao: values.valor_sessao,
          data_sessao: formattedDate,
          profissional_responsavel: values.profissional_responsavel,
          protocolo_utilizado: values.protocolo_utilizado,
          observacoes: values.observacoes,
          eh_reavaliacao: values.eh_reavaliacao,
        });
      
      console.log("Dados a serem enviados para o Supabase:", {
        data_sessao: formattedDate,
        horario_original: values.horario_sessao
      });

      const { error } = await Promise.race([insertPromise, timeoutPromise]) as any;

      if (error) throw error;

      toast.success('Sessão agendada com sucesso!');
      
      setLoading(false);
      
      setTimeout(() => {
        form.reset();
        setShowForm(false);
        setTimeout(() => {
          fetchSessoes();
        }, 200);
      }, 100);
      
      return;
    } catch (error) {
      console.error('Erro ao agendar sessão:', error);
      toast.error(`Erro ao agendar sessão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-elegant">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Agenda</h1>
              <p className="text-muted-foreground">Gerencie agendamentos e sessões</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="mr-2 h-4 w-4" />
              {showForm ? "Cancelar" : "Novo Agendamento"}
            </Button>
          </div>

          {showForm ? (
            <Card className="bg-gradient-elegant border-primary/20">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  Novo Agendamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="cliente_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cliente</FormLabel>
                            <FormControl>
                              <Combobox
                                options={clientes.map(cliente => ({
                                  value: cliente.id,
                                  label: cliente.nome,
                                }))}
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder="Selecione um cliente..."
                                emptyMessage="Nenhum cliente encontrado."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="clinica"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Clínica</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione uma clínica" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Star Depiller - Buritizal">Star Depiller - Buritizal</SelectItem>
                                <SelectItem value="Star Depiller - Prata">Star Depiller - Prata</SelectItem>
                                <SelectItem value="Star Depiller - Iturama">Star Depiller - Iturama</SelectItem>
                                <SelectItem value="Star Depiller - SSP">Star Depiller - SSP</SelectItem>
                                <SelectItem value="Star Depiller - Carneirinho">Star Depiller - Carneirinho</SelectItem>
                                <SelectItem value="Star Depiller - Paranaíba">Star Depiller - Paranaíba</SelectItem>
                                <SelectItem value="Star Depiller - Santa Vitória">Star Depiller - Santa Vitória</SelectItem>
                                <SelectItem value="Star Depiller - Campina Verde">Star Depiller - Campina Verde</SelectItem>
                                <SelectItem value="Star Depiller - Rio Preto">Star Depiller - Rio Preto</SelectItem>
                                <SelectItem value="Star Depiller - Bady Bassitt">Star Depiller - Bady Bassitt</SelectItem>
                                <SelectItem value="Star Depiller - Olímpia">Star Depiller - Olímpia</SelectItem>
                                <SelectItem value="Star Depiller - Três Lagoas">Star Depiller - Três Lagoas</SelectItem>
                                <SelectItem value="Star Depiller - Mirassol">Star Depiller - Mirassol</SelectItem>
                                <SelectItem value="Star Depiller - Santa Fé">Star Depiller - Santa Fé</SelectItem>
                                <SelectItem value="Star Depiller - Votuporanga">Star Depiller - Votuporanga</SelectItem>
                                <SelectItem value="Star Depiller - Frutal">Star Depiller - Frutal</SelectItem>
                                <SelectItem value="Star Depiller - Planura">Star Depiller - Planura</SelectItem>
                                <SelectItem value="Star Depiller - Guará">Star Depiller - Guará</SelectItem>
                                <SelectItem value="Star Depiller - São Joaquim da Barra">Star Depiller - São Joaquim da Barra</SelectItem>
                                <SelectItem value="Star Depiller - Jeriquara">Star Depiller - Jeriquara</SelectItem>
                                <SelectItem value="Star Depiller - Uberaba">Star Depiller - Uberaba</SelectItem>
                                <SelectItem value="Star Depiller - Pereira Barreto">Star Depiller - Pereira Barreto</SelectItem>
                                <SelectItem value="Star Depiller - Batatais">Star Depiller - Batatais</SelectItem>
                                <SelectItem value="Star Depiller - Ribeirão Preto">Star Depiller - Ribeirão Preto</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="areas_tratamento"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel className="text-base">Áreas para Tratamento</FormLabel>
                            <FormDescription>
                              Selecione as áreas que serão tratadas na sessão.
                            </FormDescription>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {PARTES_CORPO.map((item) => (
                              <FormField
                                key={item.id}
                                control={form.control}
                                name="areas_tratamento"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={item.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(item.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, item.id])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== item.id
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal">
                                        {item.label}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="valor_sessao"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor da Sessão (R$)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0,00"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="data_sessao"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Data da Sessão</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP", { locale: ptBR })
                                    ) : (
                                      <span>Escolha uma data</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date("1900-01-01")}
                                  initialFocus
                                  locale={ptBR}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="horario_sessao"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Horário da Sessão</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    <span>{field.value}</span>
                                  ) : (
                                    <span>Selecione um horário</span>
                                  )}
                                  <Clock className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <TimePicker
                                value={field.value}
                                onChange={field.onChange}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="profissional_responsavel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Profissional Responsável</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome do profissional" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="protocolo_utilizado"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Protocolo Utilizado</FormLabel>
                            <FormControl>
                              <Input placeholder="Protocolo do tratamento" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="observacoes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observações</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Observações adicionais sobre a sessão..."
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="eh_reavaliacao"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Esta é uma sessão de reavaliação
                            </FormLabel>
                            <FormDescription>
                              Marque esta opção se esta sessão é uma reavaliação do tratamento.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowForm(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4"></div>
                            Agendando...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Agendar Sessão
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Filtros */}
              <Card className="bg-gradient-elegant border-primary/20">
                <CardHeader>
                  <CardTitle className="text-foreground">Filtros</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Clínica
                      </label>
                      <Select value={filtroClinica} onValueChange={setFiltroClinica}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma clínica" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todas">Todas as clínicas</SelectItem>
                          {clinicas.map((clinica) => (
                            <SelectItem key={clinica} value={clinica}>
                              {clinica}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Data
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !filtroData && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filtroData ? format(filtroData, "PPP", { locale: ptBR }) : "Selecione uma data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={filtroData}
                            onSelect={setFiltroData}
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      {filtroData && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFiltroData(undefined)}
                          className="mt-2 text-xs"
                        >
                          Limpar filtro de data
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de Sessões */}
              <Card className="bg-gradient-elegant border-primary/20">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    Sessões Agendadas ({sessoes.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sessoes.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Nenhuma sessão encontrada.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sessoes.map((sessao) => (
                        <div key={sessao.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50">
                          <div className="flex-grow">
                            <p className="font-medium text-foreground">{sessao.clientes?.nome}</p>
                            <p className="text-sm text-muted-foreground">{sessao.areas_tratamento}</p>
                          </div>
                          <div className="text-right mr-4">
                            <p className="text-sm font-medium text-foreground">{formatDate(sessao.data_sessao)}</p>
                            <p className="text-xs text-muted-foreground">{sessao.clinica}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => openSessaoModal(sessao, false)}>
                              Ver Detalhes
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => openSessaoModal(sessao, true)}>
                              Editar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Detalhes da Sessão */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Sessão' : 'Detalhes da Sessão'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Altere as informações da sessão abaixo.' : 'Informações completas sobre a sessão e o cliente'}
            </DialogDescription>
          </DialogHeader>

          {isEditing ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleUpdateSessao)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                </div>
                <FormField
                  control={form.control}
                  name="valor_sessao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor da Sessão (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0,00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="protocolo_utilizado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protocolo Utilizado</FormLabel>
                      <FormControl>
                        <Input placeholder="Protocolo do tratamento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="areas_tratamento"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Áreas para Tratamento</FormLabel>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {PARTES_CORPO.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="areas_tratamento"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, item.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {item.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="observacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Observações adicionais sobre a sessão..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          ) : loadingModal ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Informações da Sessão */}
              {selectedSessao && (
                <Card>
                  <CardHeader>
                    <CardTitle>Informações da Sessão</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Data e Horário</h3>
                        <p className="text-foreground">{formatDate(selectedSessao.data_sessao)}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Clínica</h3>
                        <p className="text-foreground">{selectedSessao.clinica}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Áreas de Tratamento</h3>
                        <p className="text-foreground">{selectedSessao.areas_tratamento}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Valor da Sessão</h3>
                        <p className="text-foreground">R$ {selectedSessao.valor_sessao?.toFixed(2)}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Profissional Responsável</h3>
                        <p className="text-foreground">{selectedSessao.profissional_responsavel}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Protocolo Utilizado</h3>
                        <p className="text-foreground">{selectedSessao.protocolo_utilizado}</p>
                      </div>
                      {selectedSessao.observacoes && (
                        <div className="md:col-span-2">
                          <h3 className="text-sm font-medium text-muted-foreground">Observações</h3>
                          <p className="text-foreground">{selectedSessao.observacoes}</p>
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Tipo de Sessão</h3>
                        <p className="text-foreground">{selectedSessao.eh_reavaliacao ? 'Reavaliação' : 'Sessão Regular'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Informações do Cliente */}
              {selectedCliente && (
                <Card>
                  <CardHeader>
                    <CardTitle>Informações do Cliente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Nome</h3>
                        <p className="text-foreground">{selectedCliente.nome}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Telefone</h3>
                        <p className="text-foreground">{selectedCliente.telefone}</p>
                      </div>
                      {selectedCliente.data_nascimento && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Data de Nascimento</h3>
                          <p className="text-foreground">{formatDateOnly(selectedCliente.data_nascimento)}</p>
                        </div>
                      )}
                      {selectedCliente.idade !== null && selectedCliente.idade !== undefined && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Idade</h3>
                          <p className="text-foreground">{selectedCliente.idade} anos</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/clientes/${selectedCliente.id}`)}
                      >
                        Ver Perfil Completo
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/clientes/${selectedCliente.id}/ficha-avaliacao`)}
                      >
                        Ver Ficha de Avaliação
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Ficha de Avaliação (se disponível) */}
              {selectedFicha && (
                <Card>
                  <CardHeader>
                    <CardTitle>Resumo da Ficha de Avaliação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Fototipo</h3>
                        <p className="text-foreground">{selectedFicha.fototipo || 'Não informado'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Já fez laser antes?</h3>
                        <p className="text-foreground">{selectedFicha.ja_fez_laser ? 'Sim' : 'Não'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Medicamento contínuo</h3>
                        <p className="text-foreground">{selectedFicha.medicamento_continuo ? 'Sim' : 'Não'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Tem alergia</h3>
                        <p className="text-foreground">{selectedFicha.tem_alergia ? 'Sim' : 'Não'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
        <DialogFooter>
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button type="submit" onClick={form.handleSubmit(handleUpdateSessao)} disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Fechar
            </Button>
          )}
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default AgendaPage;