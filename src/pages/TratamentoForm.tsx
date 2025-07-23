import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
}

// Schema de validação para o formulário
const tratamentoSchema = z.object({
  area_tratamento: z.string().min(1, { message: "Área de tratamento é obrigatória" }),
  sessoes_recomendadas: z.number().min(1, { message: "Número de sessões é obrigatório" }),
  observacoes_gerais: z.string().optional(),
});

type TratamentoFormValues = z.infer<typeof tratamentoSchema>;

const TratamentoForm = () => {
  const { clienteId } = useParams<{ clienteId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cliente, setCliente] = useState<Cliente | null>(null);

  // Inicializar o formulário com react-hook-form
  const form = useForm<TratamentoFormValues>({
    resolver: zodResolver(tratamentoSchema),
    defaultValues: {
      area_tratamento: "",
      sessoes_recomendadas: 10,
      observacoes_gerais: "",
    },
  });

  // Buscar dados do cliente
  useEffect(() => {
    const fetchCliente = async () => {
      if (!clienteId) return;

      try {
        const { data, error } = await supabase
          .from("clientes")
          .select("id, nome, telefone")
          .eq("id", clienteId)
          .single();

        if (error) throw error;
        setCliente(data);
      } catch (error) {
        console.error("Erro ao buscar cliente:", error);
        toast({
          title: "Erro ao buscar cliente",
          description: "Não foi possível carregar os dados do cliente.",
          variant: "destructive",
        });
        navigate("/clientes");
      }
    };

    fetchCliente();
  }, [clienteId, navigate, toast]);

  const onSubmit = async (data: TratamentoFormValues) => {
    if (!clienteId) return;

    try {
      setLoading(true);

      // Inserir tratamento no banco de dados
      const tratamentoObj = {
        ...data,
        cliente_id: clienteId,
        status: "ativo",
      };
      
        // Primeiro inserir
      const { error } = await supabase
        .from("tratamentos")
        .insert([tratamentoObj]);
      
      if (error) throw error;
      
      // Depois buscar o registro inserido, se necessário
      const { data: tratamentoData } = await supabase
        .from("tratamentos")
        .select()
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false })
        .limit(1);

      toast({
        title: "Plano de tratamento cadastrado com sucesso!",
        description: "Os dados foram salvos com sucesso.",
      });

      // Redirecionar para a página de detalhes do cliente
      navigate(`/clientes/${clienteId}`);
    } catch (error: any) {
      console.error("Erro ao cadastrar plano de tratamento:", error);
      toast({
        title: "Erro ao cadastrar plano de tratamento",
        description:
          error.message || "Ocorreu um erro ao cadastrar o plano de tratamento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-elegant">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate(`/clientes/${clienteId}`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para o Cliente
          </Button>
          <h1 className="text-3xl font-bold text-foreground">
            Plano de Tratamento
          </h1>
          {cliente && (
            <p className="text-muted-foreground">
              Cliente: <span className="font-medium">{cliente.nome}</span>
            </p>
          )}
        </div>

        <Card className="bg-gradient-elegant border-primary/20">
          <CardHeader>
            <CardTitle>Informações do Tratamento</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="area_tratamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Áreas de Tratamento*</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Axilas, Virilha, Pernas" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sessoes_recomendadas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Sessões Recomendadas*</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="observacoes_gerais"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Observações adicionais sobre o tratamento"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    className="bg-gradient-primary text-primary-foreground"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" /> Salvar Plano de Tratamento
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TratamentoForm;