import { setDefaultOptions } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Configurar o fuso horário para São Paulo, Brasil (UTC-3)
setDefaultOptions({
  locale: ptBR,
});

// Função auxiliar para criar datas com o fuso horário correto
export function createDateWithTimeZone(dateString: string | Date, timeString?: string): Date {
  // Criar uma nova data
  const date = new Date(dateString);
  
  // Se tiver string de horário, aplicar
  if (timeString && timeString.includes(':')) {
    const [hours, minutes] = timeString.split(':');
    const hoursNum = parseInt(hours);
    const minutesNum = parseInt(minutes);
    
    if (!isNaN(hoursNum) && !isNaN(minutesNum)) {
      date.setHours(hoursNum);
      date.setMinutes(minutesNum);
      date.setSeconds(0);
    }
  }
  
  return date;
}

// Função para formatar data para o banco de dados com fuso horário correto
export function formatDateForDB(date: Date): string {
  // Formatar a data no formato YYYY-MM-DD HH:MM:SS
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:00`;
}