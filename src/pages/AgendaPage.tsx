import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";

const AgendaPage = () => {
  return (
    <div className="min-h-screen bg-gradient-elegant">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Agenda</h1>
            <p className="text-muted-foreground">Gerencie agendamentos e sessões</p>
          </div>

          <Card className="bg-gradient-elegant border-primary/20">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Agenda de Sessões
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                Funcionalidade da agenda em desenvolvimento
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Em breve você poderá visualizar e gerenciar todos os agendamentos aqui.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AgendaPage;