import React from 'react';
import { City } from '../types';
import { CITIES } from '../data/cities';
import { 
  formatTimeForTimezone, 
  getTimezoneOffsetString, 
  getTimezoneDifferenceInHours, 
  formatDifferenceDescription 
} from '../utils/time';
import { Star, MapPin, Clock, ArrowRight } from 'lucide-react';

interface WorldClockGridProps {
  currentTime: Date;
  detectedTimezone: string;
  onSelectCity: (city: City) => void;
  favorites: string[];
  onToggleFavorite: (cityId: string) => void;
}

export const WorldClockGrid: React.FC<WorldClockGridProps> = ({
  currentTime,
  detectedTimezone,
  onSelectCity,
  favorites,
  onToggleFavorite
}) => {
  // Obter apenas as cidades marcadas como populares
  const popularCities = CITIES.filter(city => city.popular);

  return (
    <div className="space-y-6" id="world-clock-tab-content">
      {/* Cabeçalho */}
      <div className="text-center md:text-left mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-[#0f172a] tracking-tight">
          Relógios Mundiais
        </h2>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Acompanhe o horário atualizado em tempo real nas principais metrópoles globais.
        </p>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5" id="world-clock-grid">
        {popularCities.map((city) => {
          const isFav = favorites.includes(city.id);
          const timeStr = formatTimeForTimezone(currentTime, city.timezone, true);
          const offsetStr = getTimezoneOffsetString(currentTime, city.timezone);
          
          // Calcular diferença em relação ao fuso local do usuário
          const diffHours = getTimezoneDifferenceInHours(currentTime, detectedTimezone, city.timezone);
          const diffDesc = formatDifferenceDescription(diffHours);
          const isLocalTimezone = city.timezone === detectedTimezone;

          return (
            <div
              key={city.id}
              className={`group relative flex flex-col justify-between p-6 bg-white border rounded-2xl transition-all duration-200 hover:border-slate-300 cursor-pointer ${
                isLocalTimezone ? 'border-[#0f172a] bg-slate-50/20' : 'border-slate-100'
              }`}
              onClick={() => onSelectCity(city)}
              id={`world-clock-card-${city.id}`}
            >
              {/* Botão de Favorito no Canto do Card */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(city.id);
                }}
                className={`absolute top-4 right-4 p-2 rounded-xl transition-all z-20 ${
                  isFav 
                    ? 'text-amber-500 hover:bg-slate-50 bg-slate-50' 
                    : 'text-slate-300 hover:text-slate-800 hover:bg-slate-50'
                }`}
                title={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                id={`btn-fav-card-${city.id}`}
              >
                <Star
                  className="w-4 h-4"
                  fill={isFav ? "currentColor" : "none"}
                />
              </button>

              {/* Informações da Cidade */}
              <div className="text-left">
                <span className={`inline-block text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md mb-2 ${
                  isLocalTimezone 
                    ? 'bg-[#0f172a] text-white' 
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {offsetStr}
                </span>
                
                <h3 className="font-bold text-slate-800 text-base leading-tight group-hover:text-[#0f172a] transition-colors">
                  {city.name}
                </h3>
                
                <p className="text-xs text-slate-400 font-medium mb-4">
                  {city.country}
                </p>
              </div>

              {/* Horário Atual da Cidade */}
              <div className="mt-2 text-left">
                <p className="font-sans text-3xl font-bold text-slate-900 tracking-tight mb-2" id={`time-text-${city.id}`}>
                  {timeStr}
                </p>
                
                {/* Diferença de Fuso */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium border-t border-slate-50 pt-2.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    isLocalTimezone 
                      ? 'bg-emerald-500' 
                      : diffHours === 0 
                        ? 'bg-slate-400' 
                        : diffHours > 0 
                          ? 'bg-blue-500' 
                          : 'bg-amber-500'
                  }`} />
                  <span className="capitalize text-slate-500 shrink-0">
                    {isLocalTimezone ? 'Seu fuso horário' : diffDesc}
                  </span>
                </div>
              </div>

              {/* Overlay Sutil de Ação para Click */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 text-xs text-[#0f172a] font-bold bg-white/90 pl-2 py-1 rounded-lg">
                Focar <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
