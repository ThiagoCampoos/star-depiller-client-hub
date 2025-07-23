import * as React from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  className?: string;
  value?: string; // Adicionado para receber o valor do campo horario_sessao
}

export function TimePicker({ date, setDate, className, value }: TimePickerProps) {
  const minuteRef = React.useRef<HTMLInputElement>(null);
  const hourRef = React.useRef<HTMLInputElement>(null);
  // Inicializar com valores padrão ais claros
  const [hour, setHour] = React.useState<number>(date ? date.getHours() : 12);
  const [minute, setMinute] = React.useState<number>(date ? date.getMinutes() : 0);
  const [open, setOpen] = React.useState(false);
  
  // Referência para controlar se o componente está montado
  const isMounted = React.useRef(true);
  
  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Atualiza o estado quando a data muda externamente
  React.useEffect(() => {
    if (date && isMounted.current) {
      setHour(date.getHours());
      setMinute(date.getMinutes());
    }
  }, [date]);

  // Atualiza o estado quando o valor (horario_sessao) muda
  React.useEffect(() => {
    if (value && value.includes(':') && isMounted.current) {
      const [hours, minutes] = value.split(':');
      const hoursNum = parseInt(hours);
      const minutesNum = parseInt(minutes);
      
      if (!isNaN(hoursNum) && !isNaN(minutesNum)) {
        setHour(hoursNum);
        setMinute(minutesNum);
      }
    }
  }, [value]);

  // Atualiza a data quando os valores mudam
  const updateDate = React.useCallback(() => {
    if (!isMounted.current) return;
    
    try {
      // Criar uma nova data baseada na data atual ou na data fornecida
      const newDate = date ? new Date(date) : new Date();
      
      // Definir horas e minutos
      newDate.setHours(hour);
      newDate.setMinutes(minute);
      newDate.setSeconds(0); // Garantir que os segundos sejam zero
      
      // Atualizar a data
      setDate(newDate);
    } catch (error) {
      console.error("Erro ao atualizar data:", error);
    }
  }, [date, hour, minute, setDate]);

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isMounted.current) return;
    
    const value = parseInt(e.target.value, 10);
    if (isNaN(value)) {
      setHour(0);
      return;
    }

    if (value >= 0 && value <= 23) {
      setHour(value);
      if (value === 0 || value === 23) {
        minuteRef.current?.focus();
      }
    }
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isMounted.current) return;
    
    const value = parseInt(e.target.value, 10);
    if (isNaN(value)) {
      setMinute(0);
      return;
    }

    if (value >= 0 && value <= 59) {
      setMinute(value);
      if (value === 0 || value === 59) {
        e.target.blur();
      }
    }
  };

  const formatTime = (date: Date | undefined) => {
    if (!date) return "Selecionar horário";
    try {
      return format(date, "HH:mm", { locale: ptBR });
    } catch (error) {
      console.error("Erro ao formatar horário:", error);
      return "Selecionar horário";
    }
  };

  const handleConfirm = () => {
    if (!isMounted.current) return;
    
    updateDate();
    setTimeout(() => {
      if (isMounted.current) {
        setOpen(false);
      }
    }, 0);
  };

  // Função simplificada para lidar com a abertura/fechamento do popover
  const handleOpenChange = (newOpen: boolean) => {
    if (!isMounted.current) return;
    
    if (!newOpen && open) {
      // Se estiver fechando o popover, atualize a data com um pequeno delay
      updateDate();
      setTimeout(() => {
        if (isMounted.current) {
          setOpen(newOpen);
        }
      }, 0);
    } else {
      setOpen(newOpen);
    }
  };

  // Renderização do componente com tratamento de erro
  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          type="button"
        >
          <Clock className="mr-2 h-4 w-4" />
          <span>{formatTime(date)}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-center gap-2">
            <div className="grid gap-1 text-center">
              <div className="text-sm font-medium">Hora</div>
              <Input
                ref={hourRef}
                className="w-16 h-10"
                value={hour.toString().padStart(2, "0")}
                onChange={handleHourChange}
                type="number"
                min={0}
                max={23}
              />
            </div>
            <div className="text-xl font-bold">:</div>
            <div className="grid gap-1 text-center">
              <div className="text-sm font-medium">Minuto</div>
              <Input
                ref={minuteRef}
                className="w-16 h-10"
                value={minute.toString().padStart(2, "0")}
                onChange={handleMinuteChange}
                type="number"
                min={0}
                max={59}
              />
            </div>
          </div>
          <Button onClick={handleConfirm} type="button" className="w-full">Confirmar</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}