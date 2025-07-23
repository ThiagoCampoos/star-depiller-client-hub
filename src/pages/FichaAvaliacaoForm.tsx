import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
}

const formSchema = z.object({
  fototipo: z.string().optional(),
  caracteristica_pelo_cor: z.string().optional(),
  caracteristica_pelo_espessura: z.string().optional(),
  ja_fez_laser: z.boolean().default(false),
  sessoes_laser_anteriores: z.number().optional(),
  medicamento_continuo: z.boolean().default(false),
  qual_medicamento_continuo: z.string().optional(),
  usa_acido: z.boolean().default(false),
  qual_acido: z.string().optional(),
  tem_alergia: z.boolean().default(false),
  qual_alergia: z.string().optional(),
  doenca_pele: z.boolean().default(false),
  doenca_autoimune: z.boolean().default(false),
  usa_suplementacao: z.boolean().default(false),
  qual_suplementacao: z.string().optional(),
  disfuncao_hormonal: z.boolean().default(false),
  qual_disfuncao_hormonal: z.string().optional(),
  reposicao_hormonal: z.boolean().default(false),
  qual_reposicao_hormonal: z.string().optional(),
  medicamento_cabelo_unha: z.boolean().default(false),
  qual_medicamento_cabelo_unha: z.string().optional(),
  gestante: z.boolean().default(false),
  amamentando: z.boolean().default(false),
  usa_protetor_solar: z.boolean().default(false),
  medicamento_fotossensibilizante: z.boolean().default(false),
  observacoes: z.string().optional(),
  concordancia_tratamento: z.boolean().default(false),
  termos_explicados: z.boolean().default(false),
  responsavel_legal: z.string().optional(),
  data_consentimento: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const FichaAvaliacaoForm = () => {
  const { clienteId } = useParams<{ clienteId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cliente, setCliente] = useState<Cliente | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fototipo: "",
      caracteristica_pelo_cor: "",
      caracteristica_pelo_espessura: "",
      ja_fez_laser: false,
      sessoes_laser_anteriores: undefined,
      medicamento_continuo: false,
      qual_medicamento_continuo: "",
      usa_acido: false,
      qual_acido: "",
      tem_alergia: false,
      qual_alergia: "",
      doenca_pele: false,
      doenca_autoimune: false,
      usa_suplementacao: false,
      qual_suplementacao: "",
      disfuncao_hormonal: false,
      qual_disfuncao_hormonal: "",
      reposicao_hormonal: false,
      qual_reposicao_hormonal: "",
      medicamento_cabelo_unha: false,
      qual_medicamento_cabelo_unha: "",
      gestante: false,
      amamentando: false,
      usa_protetor_solar: false,
      medicamento_fotossensibilizante: false,
      observacoes: "",
      concordancia_tratamento: false,
      termos_explicados: false,
      responsavel_legal: "",
      data_consentimento: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (clienteId) {
      fetchCliente(clienteId);
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
      navigate('/clientes');
    }
  };

  useEffect(() => {
    if (clienteId) {
      fetchCliente(clienteId);
      fetchFichaAvaliacao(clienteId);
    }
  }, [clienteId]);

  const fetchFichaAvaliacao = async (clienteId: string) => {
    try {
      const { data, error } = await supabase
        .from('fichas_avaliacao')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Código para "No rows returned"
          // Não há ficha de avaliação para este cliente, usar valores padrão
          return;
        }
        throw error;
      }

      if (data) {
        // Preencher o formulário com os dados da ficha existente
        form.reset({
          fototipo: data.fototipo || "",
          caracteristica_pelo_cor: data.caracteristica_pelo_cor || "",
          caracteristica_pelo_espessura: data.caracteristica_pelo_espessura || "",
          ja_fez_laser: data.ja_fez_laser,
          sessoes_laser_anteriores: data.sessoes_laser_anteriores,
          medicamento_continuo: data.medicamento_continuo,
          qual_medicamento_continuo: data.qual_medicamento_continuo || "",
          usa_acido: data.usa_acido,
          qual_acido: data.qual_acido || "",
          tem_alergia: data.tem_alergia,
          qual_alergia: data.qual_alergia || "",
          doenca_pele: data.doenca_pele,
          doenca_autoimune: data.doenca_autoimune,
          usa_suplementacao: data.usa_suplementacao,
          qual_suplementacao: data.qual_suplementacao || "",
          disfuncao_hormonal: data.disfuncao_hormonal,
          qual_disfuncao_hormonal: data.qual_disfuncao_hormonal || "",
          reposicao_hormonal: data.reposicao_hormonal,
          qual_reposicao_hormonal: data.qual_reposicao_hormonal || "",
          medicamento_cabelo_unha: data.medicamento_cabelo_unha,
          qual_medicamento_cabelo_unha: data.qual_medicamento_cabelo_unha || "",
          gestante: data.gestante,
          amamentando: data.amamentando,
          usa_protetor_solar: data.usa_protetor_solar,
          medicamento_fotossensibilizante: data.medicamento_fotossensibilizante,
          observacoes: data.observacoes || "",
          concordancia_tratamento: data.concordancia_tratamento,
          termos_explicados: data.termos_explicados,
          responsavel_legal: data.responsavel_legal || "",
          data_consentimento: data.data_consentimento || new Date().toISOString().split('T')[0],
        });
      }
    } catch (error: any) {
      console.error("Erro ao buscar ficha de avaliação:", error);
      toast({
        title: "Erro ao carregar ficha de avaliação",
        description: error.message || "Não foi possível carregar os dados da ficha de avaliação.",
        variant: "destructive",
      });
    }
  };

  // Modificar a função onSubmit para atualizar a ficha existente ou criar uma nova
  const onSubmit = async (data: FormValues) => {
    if (!clienteId) return;
    
    try {
      setLoading(true);
      
      // Inserir ficha de avaliação no banco de dados
      const { error } = await supabase
        .from('fichas_avaliacao')
        .insert([
          {
            cliente_id: clienteId,
            fototipo: data.fototipo || null,
            caracteristica_pelo_cor: data.caracteristica_pelo_cor || null,
            caracteristica_pelo_espessura: data.caracteristica_pelo_espessura || null,
            ja_fez_laser: data.ja_fez_laser,
            sessoes_laser_anteriores: data.sessoes_laser_anteriores || null,
            medicamento_continuo: data.medicamento_continuo,
            qual_medicamento_continuo: data.medicamento_continuo ? data.qual_medicamento_continuo : null,
            usa_acido: data.usa_acido,
            qual_acido: data.usa_acido ? data.qual_acido : null,
            tem_alergia: data.tem_alergia,
            qual_alergia: data.tem_alergia ? data.qual_alergia : null,
            doenca_pele: data.doenca_pele,
            doenca_autoimune: data.doenca_autoimune,
            usa_suplementacao: data.usa_suplementacao,
            qual_suplementacao: data.usa_suplementacao ? data.qual_suplementacao : null,
            disfuncao_hormonal: data.disfuncao_hormonal,
            qual_disfuncao_hormonal: data.disfuncao_hormonal ? data.qual_disfuncao_hormonal : null,
            reposicao_hormonal: data.reposicao_hormonal,
            qual_reposicao_hormonal: data.reposicao_hormonal ? data.qual_reposicao_hormonal : null,
            medicamento_cabelo_unha: data.medicamento_cabelo_unha,
            qual_medicamento_cabelo_unha: data.medicamento_cabelo_unha ? data.qual_medicamento_cabelo_unha : null,
            gestante: data.gestante,
            amamentando: data.amamentando,
            usa_protetor_solar: data.usa_protetor_solar,
            medicamento_fotossensibilizante: data.medicamento_fotossensibilizante,
            observacoes: data.observacoes || null,
            concordancia_tratamento: data.concordancia_tratamento,
            termos_explicados: data.termos_explicados,
            responsavel_legal: data.responsavel_legal || null,
            data_consentimento: data.data_consentimento || null,
          },
        ]);

      if (error) {
        throw error;
      }

      toast({
        title: "Ficha de avaliação cadastrada com sucesso!",
        description: "Agora você pode iniciar um tratamento para este cliente.",
      });

      // Navegar de volta para a lista de clientes
      navigate('/clientes');
    } catch (error: any) {
      console.error("Erro ao cadastrar ficha de avaliação:", error);
      toast({
        title: "Erro ao cadastrar ficha de avaliação",
        description: error.message || "Ocorreu um erro ao cadastrar a ficha de avaliação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!cliente) {
    return (
      <div className="min-h-screen bg-gradient-elegant flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-elegant">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Ficha de Avaliação Laser Galaxy Fiber</h1>
          <p className="text-muted-foreground mb-6">Cliente: {cliente.nome}</p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card className="bg-gradient-elegant border-primary/20">
                <CardHeader>
                  <CardTitle>Características Físicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fototipo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fototipo</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value || undefined}
                            value={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="I">I - Muito clara, sempre queima</SelectItem>
                              <SelectItem value="II">II - Clara, queima com facilidade</SelectItem>
                              <SelectItem value="III">III - Média, às vezes queima</SelectItem>
                              <SelectItem value="IV">IV - Morena, raramente queima</SelectItem>
                              <SelectItem value="V">V - Morena escura, muito raramente queima</SelectItem>
                              <SelectItem value="VI">VI - Negra, nunca queima</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Características do Pelo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="caracteristica_pelo_cor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cor</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Claro">Claro</SelectItem>
                                <SelectItem value="Escuro">Escuro</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="caracteristica_pelo_espessura"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Espessura</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Fino">Fino</SelectItem>
                                <SelectItem value="Médio">Médio</SelectItem>
                                <SelectItem value="Grosso">Grosso</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-elegant border-primary/20">
                <CardHeader>
                  <CardTitle>Experiência com Laser</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="ja_fez_laser"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Já fez laser antes?</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  {form.watch("ja_fez_laser") && (
                    <FormField
                      control={form.control}
                      name="sessoes_laser_anteriores"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantas sessões já fez?</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-elegant border-primary/20">
                <CardHeader>
                  <CardTitle>Condições de Saúde</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="medicamento_continuo"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Toma algum medicamento contínuo?</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {form.watch("medicamento_continuo") && (
                      <FormField
                        control={form.control}
                        name="qual_medicamento_continuo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Qual medicamento?</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <FormField
                      control={form.control}
                      name="usa_acido"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Usa algum tipo de ácido na área a ser tratada?</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {form.watch("usa_acido") && (
                      <FormField
                        control={form.control}
                        name="qual_acido"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Qual ácido?</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <FormField
                      control={form.control}
                      name="tem_alergia"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Tem alergia de medicamento ou alimento?</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {form.watch("tem_alergia") && (
                      <FormField
                        control={form.control}
                        name="qual_alergia"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Qual alergia?</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <FormField
                      control={form.control}
                      name="doenca_pele"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Tem doença de pele?</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="doenca_autoimune"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Tem doença autoimune?</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="usa_suplementacao"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Faz uso de suplementação? (Polivitamínico, BCAA, Whey, Anabolizante)</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {form.watch("usa_suplementacao") && (
                      <FormField
                        control={form.control}
                        name="qual_suplementacao"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Qual suplementação?</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <FormField
                      control={form.control}
                      name="disfuncao_hormonal"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Apresenta disfunção hormonal?</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {form.watch("disfuncao_hormonal") && (
                      <FormField
                        control={form.control}
                        name="qual_disfuncao_hormonal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Qual disfunção hormonal?</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <FormField
                      control={form.control}
                      name="reposicao_hormonal"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Faz reposição hormonal?</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {form.watch("reposicao_hormonal") && (
                      <FormField
                        control={form.control}
                        name="qual_reposicao_hormonal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Qual reposição hormonal?</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <FormField
                      control={form.control}
                      name="medicamento_cabelo_unha"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Faz uso de medicamento para crescimento de cabelo e unha?</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {form.watch("medicamento_cabelo_unha") && (
                      <FormField
                        control={form.control}
                        name="qual_medicamento_cabelo_unha"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Qual medicamento?</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <FormField
                      control={form.control}
                      name="gestante"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Está gestante?</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="amamentando"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Está amamentando?</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="usa_protetor_solar"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Faz uso de protetor solar?</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="medicamento_fotossensibilizante"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Está usando medicamento fotossensibilizante?</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-elegant border-primary/20">
                <CardHeader>
                  <CardTitle>Observações</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="observacoes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Observações adicionais"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-elegant border-primary/20">
                <CardHeader>
                  <CardTitle>Termo de Consentimento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/20 p-4 rounded-md text-sm">
                    <p>Declaro que fui devidamente informado(a) sobre o procedimento de depilação a laser, seus riscos, benefícios e limitações. Compreendo que os resultados podem variar de acordo com características individuais e que o tratamento requer múltiplas sessões.</p>
                    <p className="mt-2">Comprometo-me a seguir todas as orientações pré e pós-procedimento, incluindo o uso de protetor solar e evitar exposição solar intensa.</p>
                    <p className="mt-2">Autorizo a realização do procedimento e o uso de imagens para fins de acompanhamento clínico.</p>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="termos_explicados"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Confirmo que os termos foram explicados ao cliente</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="concordancia_tratamento"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Cliente concorda com os termos e condições do tratamento</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="responsavel_legal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Responsável Legal (se aplicável)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="data_consentimento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/clientes')}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-primary text-primary-foreground"
                  disabled={loading || !form.watch("concordancia_tratamento") || !form.watch("termos_explicados")}
                >
                  {loading ? "Salvando..." : "Finalizar Cadastro"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
};

export default FichaAvaliacaoForm;