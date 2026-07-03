import React, { useState, useEffect } from 'react';
import { ClockOffset, City } from '../types';
import { 
  getSynchronizedDate, 
  formatTimeForTimezone, 
  formatDateForTimezone, 
  getTimezoneOffsetString 
} from '../utils/time';
import { RefreshCw, CheckCircle2, AlertTriangle, HelpCircle, MapPin, Globe } from 'lucide-react';

interface ClockMainProps {
  offsetSeconds: number;
  accuracy: ClockOffset;
  onRefreshAccuracy: () => Promise<void>;
  selectedCity: City | null;
  onClearSelectedCity: () => void;
  detectedTimezone: string;
}

export const ClockMain: React.FC<ClockMainProps> = ({
  offsetSeconds,
  accuracy,
  onRefreshAccuracy,
  selectedCity,
  onClearSelectedCity,
  detectedTimezone
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(getSynchronizedDate(offsetSeconds));

  // Atualizar o relógio a cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getSynchronizedDate(offsetSeconds));
    }, 200); // Atualizar mais frequentemente para maior precisão de visualização
    return () => clearInterval(interval);
  }, [offsetSeconds]);

  const timezoneToShow = selectedCity ? selectedCity.timezone : detectedTimezone;
  const timeString = formatTimeForTimezone(currentTime, timezoneToShow, true);
  const dateString = formatDateForTimezone(currentTime, timezoneToShow);
  const offsetString = getTimezoneOffsetString(currentTime, timezoneToShow);

  // Formatar nome amigável de exibição do local
  const displayLocation = selectedCity 
    ? `${selectedCity.name}, ${selectedCity.country}`
    : detectedTimezone.split('/').pop()?.replace(/_/g, ' ') || detectedTimezone;

  // Detalhes da precisão do relógio
  const absOffset = Math.abs(accuracy.offsetSeconds);
  const isAccurate = absOffset < 0.6; // Menos de 600ms de diferença é considerado correto
  const isAhead = accuracy.offsetSeconds < 0; // se offsetSeconds é negativo, o relógio do dispositivo está adiantado

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 md:py-16 bg-white rounded-3xl border border-slate-100 max-w-4xl mx-auto" id="main-clock-card">
      
      {/* Precision Badge no topo - inspirado em Clean Minimalism */}
      <div className="mb-6" id="accuracy-banner-container">
        {accuracy.status === 'syncing' ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold animate-pulse border border-blue-100">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Sincronizando com o servidor...</span>
          </div>
        ) : accuracy.status === 'error' ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-800 rounded-full text-xs font-semibold border border-amber-100">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Usando hora local (desconectado)</span>
            <button 
              onClick={onRefreshAccuracy}
              className="p-1 hover:bg-amber-100 rounded-full transition-colors ml-1"
              title="Sincronizar"
            >
              <RefreshCw className="w-3 h-3 text-amber-700" />
            </button>
          </div>
        ) : (
          <div className={`flex flex-col sm:flex-row items-center gap-2 sm:gap-4 px-5 py-2.5 rounded-full text-xs md:text-sm font-semibold border transition-all duration-300 ${
            isAccurate 
              ? 'bg-emerald-100/60 border-emerald-200/50 text-emerald-800' 
              : 'bg-amber-100/60 border-amber-200/50 text-amber-800'
          }`} id="precision-result-card">
            <div className="flex items-center gap-1.5">
              {isAccurate ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span>
                {isAccurate 
                  ? `Sua hora está certa! (Diferença de ${absOffset.toFixed(2)}s)` 
                  : `Seu relógio está ${isAhead ? 'adiantado' : 'atrasado'} ${absOffset.toFixed(2)}s`
                }
              </span>
            </div>
            <div className="hidden sm:inline text-slate-300">|</div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
              <span>RTT: {accuracy.rtt}ms</span>
              <button 
                onClick={onRefreshAccuracy} 
                className="text-blue-600 hover:underline flex items-center gap-1 font-bold ml-1"
                id="btn-sync-now"
              >
                <RefreshCw className="w-2.5 h-2.5" /> Calibrar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Relógio Gigante Digital */}
      <div 
        className="font-sans font-bold tracking-tighter text-[#0f172a] select-none transition-all duration-300 leading-none text-7xl sm:text-8xl md:text-9xl lg:text-[140px] text-center w-full mb-6" 
        style={{ letterSpacing: '-0.04em' }}
        id="live-digital-clock"
      >
        {timeString}
      </div>

      {/* Fuso Horário e Data */}
      <div className="flex flex-col items-center gap-1.5 mb-6" id="date-timezone-info">
        <p className="text-xl md:text-2xl font-bold text-[#64748b] text-center capitalize">
          {dateString}
        </p>
        <p className="text-sm font-semibold text-[#1e293b] flex items-center gap-1.5">
          {selectedCity ? (
            <MapPin className="w-4 h-4 text-blue-600 animate-pulse" id="icon-map-pin" />
          ) : (
            <Globe className="w-4 h-4 text-emerald-600" id="icon-globe" />
          )}
          {displayLocation} <span className="text-slate-300">•</span> <span className="uppercase text-xs tracking-wider">{timezoneToShow} ({offsetString})</span>
        </p>
      </div>

      {/* Botão de Retorno (se estiver visualizando outra cidade) */}
      {selectedCity && (
        <button
          onClick={onClearSelectedCity}
          className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200/50 shadow-xs"
          id="btn-back-to-local"
        >
          <Globe className="w-3.5 h-3.5" />
          Voltar ao meu relógio local
        </button>
      )}
    </div>
  );
};
