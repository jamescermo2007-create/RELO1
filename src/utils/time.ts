/**
 * Utilidades de manipulação de data, hora e fusos horários.
 */

/**
 * Retorna uma data ajustada com base no offset medido com o servidor.
 */
export function getSynchronizedDate(offsetSeconds: number): Date {
  return new Date(Date.now() + offsetSeconds * 1000);
}

/**
 * Formata a hora de uma data para o fuso horário especificado.
 * Formato: 24h (HH:MM:SS)
 */
export function formatTimeForTimezone(date: Date, timezone: string, showSeconds = true): string {
  try {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    if (showSeconds) {
      options.second = '2-digit';
    }
    
    const formatted = new Intl.DateTimeFormat('pt-BR', options).format(date);
    
    // Garantir formato de dois dígitos (ex: algumas plataformas podem remover o zero à esquerda)
    return formatted;
  } catch (error) {
    console.error(`Erro ao formatar hora para fuso: ${timezone}`, error);
    // Fallback básico
    return date.toTimeString().split(' ')[0];
  }
}

/**
 * Formata a data completa por fuso horário.
 * Exemplo: "quinta-feira, 2 de julho de 2026"
 */
export function formatDateForTimezone(date: Date, timezone: string): string {
  try {
    const formatted = new Intl.DateTimeFormat('pt-BR', {
      timeZone: timezone,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
    
    // Capitalizar a primeira letra do dia da semana
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch (error) {
    console.error(`Erro ao formatar data para fuso: ${timezone}`, error);
    return date.toLocaleDateString('pt-BR');
  }
}

/**
 * Obtém a string amigável de offset (ex: "GMT-3", "GMT+5:30", "GMT")
 */
export function getTimezoneOffsetString(date: Date, timezone: string): string {
  try {
    const parts = new Intl.DateTimeFormat('pt-BR', {
      timeZone: timezone,
      timeZoneName: 'longOffset'
    }).formatToParts(date);
    
    const tzPart = parts.find(p => p.type === 'timeZoneName');
    if (!tzPart) return 'GMT';
    
    // Limpar formatos como "Horário Padrão de Brasília" ou traduzir GMT
    let val = tzPart.value;
    if (val === 'GMT' || val === 'UTC') return 'UTC';
    
    // Substituir GMT por UTC para ficar mais limpo e moderno (ex: UTC-03:00)
    return val.replace('GMT', 'UTC');
  } catch (error) {
    console.error(`Erro ao obter offset para fuso: ${timezone}`, error);
    return 'UTC';
  }
}

/**
 * Calcula a diferença em horas entre o fuso de origem e o fuso de destino.
 * Retorna valores positivos se o destino estiver à frente, ou negativos se estiver atrás.
 */
export function getTimezoneDifferenceInHours(date: Date, sourceTimezone: string, targetTimezone: string): number {
  try {
    // Obter data string no formato local para cada fuso
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    };
    
    const sourceStr = new Intl.DateTimeFormat('en-US', { ...options, timeZone: sourceTimezone }).format(date);
    const targetStr = new Intl.DateTimeFormat('en-US', { ...options, timeZone: targetTimezone }).format(date);
    
    const sourceDate = new Date(sourceStr);
    const targetDate = new Date(targetStr);
    
    const diffMs = targetDate.getTime() - sourceDate.getTime();
    return Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10; // Arredonda para 1 casa decimal
  } catch (error) {
    console.error(`Erro ao calcular diferença de fuso entre ${sourceTimezone} e ${targetTimezone}`, error);
    return 0;
  }
}

/**
 * Retorna um texto amigável descrevendo a diferença em horas (ex: "Mesmo horário", "3h adiantado", "5h atrasado")
 */
export function formatDifferenceDescription(hours: number): string {
  if (hours === 0) return 'mesmo horário';
  const absHours = Math.abs(hours);
  const hourText = absHours === 1 ? 'hora' : 'horas';
  const label = absHours % 1 === 0 ? absHours.toString() : absHours.toFixed(1);
  
  if (hours > 0) {
    return `${label} ${hourText} adiantado (+${label}h)`;
  } else {
    return `${label} ${hourText} atrasado (-${label}h)`;
  }
}
