import { ClockOffset } from '../types';

/**
 * Mede a precisão do relógio do dispositivo local em relação a servidores de hora mundiais.
 * Utiliza compensação de latência de rede (RTT) para determinar o offset real.
 */
export async function checkClockAccuracy(): Promise<ClockOffset> {
  const t0 = Date.now();
  
  try {
    // Tenta primeiro o WorldTimeAPI (CORS habilitado)
    const response = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Falha no WorldTimeAPI');
    }
    
    const t1 = Date.now();
    const rtt = t1 - t0;
    
    const data = await response.json();
    // utc_datetime contém milissegundos precisos
    const serverTimeMs = new Date(data.utc_datetime).getTime();
    
    // De acordo com o algoritmo SNTP:
    // O momento real no servidor quando a resposta chega é aproximadamente: serverTimeMs + (RTT / 2)
    const estimatedServerTime = serverTimeMs + (rtt / 2);
    const offsetMs = estimatedServerTime - t1;
    const offsetSeconds = offsetMs / 1000;
    
    return {
      offsetSeconds,
      measured: true,
      status: 'synced',
      rtt
    };
  } catch (error) {
    console.warn('WorldTimeAPI falhou, tentando TimeAPI...', error);
    
    // Fallback para TimeAPI
    const t0Fallback = Date.now();
    try {
      const response = await fetch('https://timeapi.io/api/time/current/zone?timeZone=UTC', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error('Falha no TimeAPI');
      }
      
      const t1Fallback = Date.now();
      const rtt = t1Fallback - t0Fallback;
      
      const data = await response.json();
      // data.dateTime contém o formato ISO "2026-07-03T02:17:07.123"
      const serverTimeMs = new Date(data.dateTime + 'Z').getTime();
      
      const estimatedServerTime = serverTimeMs + (rtt / 2);
      const offsetMs = estimatedServerTime - t1Fallback;
      const offsetSeconds = offsetMs / 1000;
      
      return {
        offsetSeconds,
        measured: true,
        status: 'synced',
        rtt
      };
    } catch (fallbackError) {
      console.error('Todos os servidores de hora falharam. Usando hora local.', fallbackError);
      return {
        offsetSeconds: 0,
        measured: false,
        status: 'error',
        rtt: 0
      };
    }
  }
}
