import React, { useState, useEffect } from 'react';
import { City } from '../types';
import { CITIES } from '../data/cities';
import { getTimezoneDifferenceInHours, formatDifferenceDescription, getTimezoneOffsetString } from '../utils/time';
import { Calendar, ArrowRightLeft, Clock, RefreshCw, Sun, Moon } from 'lucide-react';

interface TimezoneConverterProps {
  detectedTimezone: string;
}

export const TimezoneConverter: React.FC<TimezoneConverterProps> = ({
  detectedTimezone
}) => {
  // Encontrar cidade correspondente ao fuso do usuário, ou padrão para São Paulo
  const defaultSourceCity = CITIES.find(c => c.timezone === detectedTimezone) || CITIES[0];
  const defaultTargetCity = CITIES.find(c => c.id === 'londres') || CITIES[1];

  const [sourceCityId, setSourceCityId] = useState<string>(defaultSourceCity.id);
  const [targetCityId, setTargetCityId] = useState<string>(defaultTargetCity.id);
  
  // Pegar hora atual para inicializar a conversão
  const getNowTimeString = () => {
    const d = new Date();
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  const [sourceTime, setSourceTime] = useState<string>(getNowTimeString());

  // Resolver as instâncias das cidades selecionadas
  const sourceCity = CITIES.find(c => c.id === sourceCityId) || defaultSourceCity;
  const targetCity = CITIES.find(c => c.id === targetCityId) || defaultTargetCity;

  // Obter offsets
  const now = new Date();
  const sourceOffset = getTimezoneOffsetString(now, sourceCity.timezone);
  const targetOffset = getTimezoneOffsetString(now, targetCity.timezone);

  // Calcular diferença de fuso
  const diffHours = getTimezoneDifferenceInHours(now, sourceCity.timezone, targetCity.timezone);
  const diffDesc = formatDifferenceDescription(diffHours);

  // Calcular hora convertida
  const [targetTime, setTargetTime] = useState<string>('');
  const [dayOffset, setDayOffset] = useState<number>(0); // -1 para ontem, 0 para hoje, 1 para amanhã

  useEffect(() => {
    if (!sourceTime) return;

    const [hoursStr, minutesStr] = sourceTime.split(':');
    const sourceHours = parseInt(hoursStr, 10);
    const sourceMinutes = parseInt(minutesStr, 10);

    const baseMinutes = sourceHours * 60 + sourceMinutes;
    const offsetDiffMinutes = diffHours * 60;
    
    let totalTargetMinutes = baseMinutes + offsetDiffMinutes;
    
    // Calcular diferença de dias
    let calculatedDayOffset = 0;
    if (totalTargetMinutes < 0) {
      calculatedDayOffset = Math.floor(totalTargetMinutes / 1440);
      totalTargetMinutes = (totalTargetMinutes % 1440 + 1440) % 1440;
    } else if (totalTargetMinutes >= 1440) {
      calculatedDayOffset = Math.floor(totalTargetMinutes / 1440);
      totalTargetMinutes = totalTargetMinutes % 1440;
    }

    const targetH = Math.floor(totalTargetMinutes / 60);
    const targetM = Math.floor(totalTargetMinutes % 60);

    setTargetTime(`${String(targetH).padStart(2, '0')}:${String(targetM).padStart(2, '0')}`);
    setDayOffset(calculatedDayOffset);
  }, [sourceTime, diffHours]);

  // Alternar origem e destino
  const handleSwap = () => {
    setSourceCityId(targetCityId);
    setTargetCityId(sourceCityId);
  };

  // Definir hora para o momento atual do dispositivo
  const handleSetToCurrentTime = () => {
    setSourceTime(getNowTimeString());
  };

  // Obter ícone solar/lunar correspondente à hora
  const getTimePeriodIcon = (timeStr: string) => {
    if (!timeStr) return null;
    const hour = parseInt(timeStr.split(':')[0], 10);
    if (hour >= 6 && hour < 18) {
      return <Sun className="w-5 h-5 text-amber-500" />;
    } else {
      return <Moon className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-6" id="timezone-converter-tab-content">
      {/* Cabeçalho */}
      <div className="text-center md:text-left mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-[#0f172a] tracking-tight">
          Conversor de Fuso Horário
        </h2>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Planeje reuniões ou voos convertendo horários facilmente entre cidades.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 max-w-3xl mx-auto" id="converter-card">
        {/* Painel de Seleção das Cidades */}
        <div className="grid grid-cols-1 md:grid-cols-9 items-center gap-4 mb-8">
          
          {/* Cidade de Origem */}
          <div className="md:col-span-4 text-left">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Cidade de Origem
            </label>
            <div className="relative">
              <select
                value={sourceCityId}
                onChange={(e) => setSourceCityId(e.target.value)}
                className="w-full px-4 py-3 bg-[#f8fafc] border border-slate-100 focus:border-slate-300 rounded-xl outline-none font-bold text-slate-700 transition-all cursor-pointer appearance-none"
                id="select-converter-source"
              >
                {CITIES.map(city => (
                  <option key={city.id} value={city.id}>
                    {city.name} ({city.country})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 text-xs">
                ▼
              </div>
            </div>
            <span className="inline-block text-[11px] font-semibold text-slate-400 mt-1.5 ml-1">
              Fuso atual: {sourceOffset}
            </span>
          </div>

          {/* Botão de Alternar (SWAP) */}
          <div className="md:col-span-1 flex justify-center pt-2">
            <button
              onClick={handleSwap}
              className="p-3 bg-slate-50 hover:bg-slate-100 text-[#0f172a] border border-slate-100 rounded-full transition-all cursor-pointer"
              title="Alternar cidades"
              id="btn-swap-cities"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Cidade de Destino */}
          <div className="md:col-span-4 text-left">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Cidade de Destino
            </label>
            <div className="relative">
              <select
                value={targetCityId}
                onChange={(e) => setTargetCityId(e.target.value)}
                className="w-full px-4 py-3 bg-[#f8fafc] border border-slate-100 focus:border-slate-300 rounded-xl outline-none font-bold text-slate-700 transition-all cursor-pointer appearance-none"
                id="select-converter-target"
              >
                {CITIES.map(city => (
                  <option key={city.id} value={city.id}>
                    {city.name} ({city.country})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 text-xs">
                ▼
              </div>
            </div>
            <span className="inline-block text-[11px] font-semibold text-slate-400 mt-1.5 ml-1">
              Fuso atual: {targetOffset}
            </span>
          </div>

        </div>

        {/* Input de Hora de Origem */}
        <div className="bg-[#f8fafc] rounded-2xl border border-slate-100 p-5 mb-8" id="time-selection-panel">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left w-full sm:w-auto">
              <p className="font-bold text-slate-700 flex items-center gap-2">
                Escolha o Horário de Origem
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Altere o horário abaixo para converter automaticamente.
              </p>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto justify-start sm:justify-end">
              <input
                type="time"
                value={sourceTime}
                onChange={(e) => setSourceTime(e.target.value)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none font-sans font-bold text-slate-800 text-lg"
                id="input-converter-time"
              />
              <button
                onClick={handleSetToCurrentTime}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl transition-colors font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                id="btn-converter-use-now"
              >
                Agora
              </button>
            </div>
          </div>

          {/* Slider de horas para facilidade de uso rápida */}
          <div className="mt-5 pt-4 border-t border-slate-200/50" id="slider-wrapper">
            <input
              type="range"
              min="0"
              max="1439"
              step="15"
              value={(() => {
                const [h, m] = sourceTime.split(':').map(Number);
                return h * 60 + m;
              })()}
              onChange={(e) => {
                const totalMinutes = parseInt(e.target.value, 10);
                const h = Math.floor(totalMinutes / 60);
                const m = Math.floor(totalMinutes % 60);
                setSourceTime(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
              }}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0f172a] focus:outline-none"
              id="slider-converter-range"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold tracking-wider mt-2">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>23:45</span>
            </div>
          </div>
        </div>

        {/* Quadro de Resultado do Conversor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch" id="converter-results-dashboard">
          
          {/* Card de Origem */}
          <div className="p-6 bg-[#f8fafc] border border-slate-100 rounded-2xl flex flex-col justify-between text-left">
            <div>
              <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase bg-slate-100 px-2.5 py-1 rounded-md">
                Origem • {sourceOffset}
              </span>
              <h3 className="font-bold text-slate-800 text-lg mt-3">{sourceCity.name}</h3>
              <p className="text-xs text-slate-400 font-medium mb-4">{sourceCity.country}</p>
            </div>
            
            <div className="flex items-center gap-3 border-t border-slate-200/40 pt-4 mt-2">
              <span className="p-2 bg-white border border-slate-100 rounded-xl">
                {getTimePeriodIcon(sourceTime)}
              </span>
              <div>
                <p className="font-sans text-3xl font-bold text-slate-800 tracking-tight">{sourceTime}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Horário Selecionado</p>
              </div>
            </div>
          </div>

          {/* Card de Destino */}
          <div className="p-6 bg-slate-50 border border-[#0f172a]/10 rounded-2xl flex flex-col justify-between text-left">
            <div>
              <span className="text-[9px] font-bold text-white tracking-wider uppercase bg-[#0f172a] px-2.5 py-1 rounded-md">
                Destino • {targetOffset}
              </span>
              <h3 className="font-bold text-slate-800 text-lg mt-3">{targetCity.name}</h3>
              <p className="text-xs text-slate-400 font-medium mb-4">{targetCity.country}</p>
            </div>
            
            <div className="flex items-center gap-3 border-t border-slate-200/40 pt-4 mt-2">
              <span className="p-2 bg-white border border-slate-100 rounded-xl">
                {getTimePeriodIcon(targetTime)}
              </span>
              <div>
                <p className="font-sans text-3xl font-bold text-slate-800 tracking-tight flex items-baseline gap-1.5">
                  {targetTime}
                  {dayOffset !== 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-bold tracking-wide uppercase shrink-0" id="day-offset-badge">
                      {dayOffset > 0 ? `+${dayOffset}d` : `${dayOffset}d`}
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1">
                  {dayOffset === 0 ? 'Mesmo dia' : dayOffset > 0 ? 'Dia seguinte' : 'Dia anterior'}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Rodapé descritivo da diferença de fuso */}
        <div className="mt-6 text-center text-xs font-semibold text-slate-400 bg-[#f8fafc] rounded-xl py-3 border border-slate-100/50">
          Diferença de fuso: <span className="text-slate-600 font-bold capitalize">{diffDesc}</span>
        </div>

      </div>
    </div>
  );
};
