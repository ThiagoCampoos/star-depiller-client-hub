import { useState, useEffect } from "react";
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

interface Cliente {
  id: string;
  nome: string;
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
  const [loading, setLoading] = useState(false);
  const [sessoes, setSessoes] = useState<any[]>([]); // Estado para armazenar as sessões
  const navigate = useNavigate();

  // Função formatDate
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cliente_id: "",
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
    fetchClientes();
    fetchSessoes(); // Chamada para buscar sessões
  }, []);

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("id, nome")
        .order("nome");

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      toast.error("Erro ao carregar clientes");
    }
  };

  // Adicionar a função fetchSessoes aqui
  const fetchSessoes = async () => {
    try {
      const { data, error } = await supabase
        .from("sessoes")
        .select("*, clientes(nome)")
        .order("data_sessao", { ascending: true });

      if (error) throw error;
      setSessoes(data || []);
    } catch (error) {
      console.error("Erro ao buscar sessões:", error);
      toast.error("Erro ao carregar sessões");
    }
  };

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      // Log dos valores do formulário para debug
      console.log("Valores do formulário:", values);
      
      // Combinar data e horário com verificação adicional
      let dataHorario = new Date(values.data_sessao);
      
      // Verificar se horario_sessao existe e está no formato correto
      if (values.horario_sessao && values.horario_sessao.includes(':')) {
        const [hours, minutes] = values.horario_sessao.split(':');
        // Verificar se hours e minutes são números válidos
        const hoursNum = parseInt(hours);
        const minutesNum = parseInt(minutes);
        
        if (!isNaN(hoursNum) && !isNaN(minutesNum)) {
          // Definir horas e minutos
          dataHorario.setHours(hoursNum);
          dataHorario.setMinutes(minutesNum);
          dataHorario.setSeconds(0); // Garantir que os segundos sejam zero
          
          console.log("Horário definido para:", {
            hoursNum,
            minutesNum,
            dataHorario: dataHorario.toISOString()
          });
        } else {
          console.error("Formato de horário inválido:", values.horario_sessao);
        }
      } else {
        console.error("Horário não fornecido ou em formato inválido:", values.horario_sessao);
      }

      // Verificar se o cliente_id existe
      if (!values.cliente_id) {
        throw new Error('ID do cliente não fornecido');
      }

      // Adicionar timeout para a operação
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout ao conectar com o Supabase')), 10000);
      });

      // Formatar a data para o formato que o Supabase espera
      // Usar formato YYYY-MM-DD HH:MM:SS para garantir que o horário seja preservado
      const formattedDate = `${dataHorario.getFullYear()}-${String(dataHorario.getMonth() + 1).padStart(2, '0')}-${String(dataHorario.getDate()).padStart(2, '0')} ${String(dataHorario.getHours()).padStart(2, '0')}:${String(dataHorario.getMinutes()).padStart(2, '0')}:00`;
      
      console.log("Data formatada para o Supabase:", formattedDate);

      // Executar a inserção com timeout
      const insertPromise = supabase
        .from('sessoes')
        .insert({
          cliente_id: values.cliente_id,
          areas_tratamento: values.areas_tratamento.join(', '), // Converter array para string
          valor_sessao: values.valor_sessao,
          data_sessao: formattedDate, // Usar o formato YYYY-MM-DD HH:MM:SS
          profissional_responsavel: values.profissional_responsavel,
          protocolo_utilizado: values.protocolo_utilizado,
          observacoes: values.observacoes,
          eh_reavaliacao: values.eh_reavaliacao,
        });
      
      // Log dos dados que serão enviados para o Supabase
      console.log("Dados a serem enviados para o Supabase:", {
        data_sessao: formattedDate,
        horario_original: values.horario_sessao
      });

      const { error } = await Promise.race([insertPromise, timeoutPromise]) as any;

      if (error) throw error;

      toast.success('Sessão agendada com sucesso!');
      
      // Desativar o loading primeiro para evitar problemas com o botão
      setLoading(false);
      
      // Usar um único setTimeout para todas as operações de limpeza
      // com um pequeno atraso para garantir que o React tenha tempo de processar
      setTimeout(() => {
        // Primeiro, resetar o formulário
        form.reset();
        
        // Depois, esconder o formulário
        setShowForm(false);
        
        // Por último, buscar as sessões atualizadas
        setTimeout(() => {
          fetchSessoes();
        }, 200);
      }, 100);
      
      // Importante: sair da função aqui para evitar que o finally seja executado
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
                                  label: cliente.nome
                                }))}
                                value={field.value || ""}
                                onValueChange={(value) => {
                                  field.onChange(value)
                                }}
                                placeholder="Selecione um cliente"
                                emptyMessage="Nenhum cliente encontrado."
                                searchPlaceholder="Pesquisar cliente..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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
                        name="areas_tratamento"
                        render={() => (
                          <FormItem className="col-span-1 md:col-span-2">
                            <div className="mb-4">
                              <FormLabel className="text-base">Áreas para Depilação</FormLabel>
                              <FormDescription>
                                Selecione uma ou mais áreas do corpo para o tratamento.
                              </FormDescription>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {PARTES_CORPO.map((parte) => (
                                <FormField
                                  key={parte.id}
                                  control={form.control}
                                  name="areas_tratamento"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={parte.id}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(parte.id)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...field.value, parte.id])
                                                : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== parte.id
                                                  )
                                                )
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="text-sm font-normal">
                                          {parte.label}
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
                        name="data_sessao"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Data</FormLabel>
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
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? (
                                      format(field.value, "PPP", { locale: ptBR })
                                    ) : (
                                      <span>Selecione uma data</span>
                                    )}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="horario_sessao"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Horário</FormLabel>
                            <TimePicker
                              date={form.watch("data_sessao")}
                              setDate={(date) => {
                                if (date) {
                                  try {
                                    // Formatar o horário como string HH:mm
                                    const timeString = format(date, "HH:mm");
                                    
                                    // Atualizar o campo horario_sessao no formulário
                                    field.onChange(timeString);
                                    
                                    // Log para debug
                                    console.log("AgendaPage - Horário atualizado:", {
                                      timeString,
                                      date: date.toISOString(),
                                      formValue: form.getValues("horario_sessao")
                                    });
                                    
                                    // Verificar se o valor foi atualizado após um pequeno delay
                                    setTimeout(() => {
                                      console.log("AgendaPage - Valor após delay:", form.getValues("horario_sessao"));
                                    }, 100);
                                  } catch (error) {
                                    console.error("Erro ao formatar horário:", error);
                                  }
                                }
                              }}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="profissional_responsavel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Profissional Responsável</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="observacoes"
                        render={({ field }) => (
                          <FormItem className="col-span-1 md:col-span-2">
                            <FormLabel>Observações</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Observações sobre a sessão"
                                className="min-h-[100px]"
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
                                Esta sessão é uma reavaliação
                              </FormLabel>
                              <FormDescription>
                                Marque esta opção se esta sessão for uma reavaliação do tratamento.
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Agendar Sessão
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gradient-elegant border-primary/20">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  Agenda de Sessões
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sessoes.length > 0 ? (
                  <div className="space-y-3">
                    {sessoes.map((sessao) => (
                      <div key={sessao.id} className="flex items-center justify-between p-3 bg-background rounded-md border border-primary/10">
                        <div>
                          <p className="font-medium text-foreground">{sessao.clientes?.nome}</p>
                          <p className="text-sm text-muted-foreground">{sessao.areas_tratamento}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-primary">{formatDate(sessao.data_sessao)}</p>
                          <p className="text-xs text-muted-foreground">{sessao.profissional_responsavel}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">
                      Nenhuma sessão agendada
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Clique em "Novo Agendamento" para agendar uma sessão.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default AgendaPage;