import React from 'react';
import { City } from '../types';
import { CITIES } from '../data/cities';
import { 
  formatTimeForTimezone, 
  getTimezoneOffsetString, 
  getTimezoneDifferenceInHours, 
  formatDifferenceDescription 
} from '../utils/time';
import { Star, MapPin, Bookmark, ArrowRight, Compass } from 'lucide-react';

interface FavoritesListProps {
  currentTime: Date;
  detectedTimezone: string;
  favorites: string[];
  onSelectCity: (city: City) => void;
  onToggleFavorite: (cityId: string) => void;
}

export const FavoritesList: React.FC<FavoritesListProps> = ({
  currentTime,
  detectedTimezone,
  favorites,
  onSelectCity,
  onToggleFavorite
}) => {
  // Filtrar todas as cidades cadastradas que estão favoritadas pelo usuário
  const favoriteCities = CITIES.filter(city => favorites.includes(city.id));

  return (
    <div className="space-y-6" id="favorites-tab-content">
      {/* Cabeçalho */}
      <div className="text-center md:text-left mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-[#0f172a] tracking-tight">
          Cidades Favoritas
        </h2>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Acesso rápido aos fusos horários salvos por você. Dados salvos localmente em seu navegador.
        </p>
      </div>

      {/* Condicional: Lista Vazia */}
      {favoriteCities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 bg-white border border-dashed border-slate-200 rounded-3xl text-center max-w-xl mx-auto" id="favorites-empty-state">
          <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl mb-4">
            <Star className="w-8 h-8" fill="none" />
          </div>
          <h3 className="font-bold text-slate-700 text-lg">Nenhuma cidade favoritada ainda</h3>
          <p className="text-sm text-slate-400 mt-2 max-w-sm leading-relaxed">
            Pesquise por qualquer cidade usando a barra de busca acima ou clique no ícone de estrela nos relógios populares para salvá-la aqui.
          </p>
        </div>
      ) : (
        /* Grid de Cards Favoritados */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5" id="favorites-grid">
          {favoriteCities.map((city) => {
            const timeStr = formatTimeForTimezone(currentTime, city.timezone, true);
            const offsetStr = getTimezoneOffsetString(currentTime, city.timezone);
            
            // Calcular diferença em relação ao fuso local do usuário
            const diffHours = getTimezoneDifferenceInHours(currentTime, detectedTimezone, city.timezone);
            const diffDesc = formatDifferenceDescription(diffHours);
            const isLocalTimezone = city.timezone === detectedTimezone;

            return (
              <div
                key={city.id}
                className="group relative flex flex-col justify-between p-6 bg-white border border-slate-100 rounded-2xl transition-all duration-200 hover:border-slate-300 cursor-pointer"
                onClick={() => onSelectCity(city)}
                id={`favorite-card-${city.id}`}
              >
                {/* Botão de Favorito no Canto */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(city.id);
                  }}
                  className="absolute top-4 right-4 p-2 bg-amber-50 text-amber-500 hover:bg-amber-100 rounded-xl transition-all z-20"
                  title="Remover dos favoritos"
                  id={`btn-unfav-card-${city.id}`}
                >
                  <Star
                    className="w-4 h-4"
                    fill="currentColor"
                  />
                </button>

                {/* Informações da Cidade */}
                <div className="text-left">
                  <span className="inline-block text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md mb-2 bg-slate-100 text-slate-500">
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
                  <p className="font-sans text-3xl font-bold text-slate-900 tracking-tight mb-2" id={`fav-time-text-${city.id}`}>
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

                {/* Overlay de Ação para Click */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 text-xs text-[#0f172a] font-bold bg-white/90 pl-2 py-1 rounded-lg">
                  Focar <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
