import React, { useState, useRef, useEffect } from 'react';
import { City } from '../types';
import { searchCities } from '../data/cities';
import { Search, X, MapPin } from 'lucide-react';

interface CitySearchProps {
  onSelectCity: (city: City) => void;
  favorites: string[];
  onToggleFavorite: (cityId: string) => void;
}

export const CitySearch: React.FC<CitySearchProps> = ({
  onSelectCity,
  favorites,
  onToggleFavorite
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<City[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim().length > 0) {
      const filtered = searchCities(val);
      setResults(filtered.slice(0, 8)); // Limitar a 8 resultados
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  const handleSelect = (city: City) => {
    onSelectCity(city);
    setQuery('');
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-xl mx-auto z-40 mb-10" ref={containerRef} id="city-search-container">
      {/* Campo de Busca */}
      <div className="relative flex items-center w-full" id="search-input-wrapper">
        <Search className="absolute left-4 w-5 h-5 text-slate-400" id="icon-search" />
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          onFocus={() => query.trim().length > 0 && setIsOpen(true)}
          placeholder="Pesquisar cidade ou país... (Ex: Londres, Tóquio, Manaus)"
          className="w-full pl-12 pr-12 py-3.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-800 placeholder-slate-400 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-2xl outline-none text-base font-medium transition-all duration-200 shadow-sm"
          id="input-city-search"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-all"
            id="btn-clear-search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown de Resultados */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto" id="search-results-dropdown">
          <div className="py-2">
            <p className="px-4 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">
              Resultados encontrados
            </p>
            {results.map((city) => {
              const isFav = favorites.includes(city.id);
              return (
                <div
                  key={city.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => handleSelect(city)}
                  id={`search-result-${city.id}`}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <div>
                      <p className="font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                        {city.name}
                      </p>
                      <p className="text-xs text-slate-400 font-medium">
                        {city.country} • {city.timezone}
                      </p>
                    </div>
                  </div>
                  
                  {/* Botão de Favorito Rápido */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Não abrir a cidade ao clicar no favorito
                      onToggleFavorite(city.id);
                    }}
                    className={`p-2 rounded-xl transition-all ${
                      isFav 
                        ? 'text-amber-500 hover:bg-amber-50' 
                        : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
                    }`}
                    title={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                    id={`btn-fav-search-${city.id}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill={isFav ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.48 3.499c.15-.427.77-.427.92 0l1.598 4.549a1 1 0 00.95.69h4.902c.451 0 .637.57.279.836l-3.972 2.886a1 1 0 00-.364 1.118l1.598 4.55a1 1 0 00-1.417 1.118L13 15.357a1 1 0 00-.979 0l-3.972 2.887a1 1 0 00-1.417-1.118l1.598-4.55a1 1 0 00-.364-1.118L3.82 10.472c-.358-.266-.172-.836.279-.836h4.903a1 1 0 00.95-.69L11.48 3.5z"
                      />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isOpen && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-6 text-center text-slate-500" id="search-no-results">
          <p className="font-semibold text-slate-700">Nenhuma cidade encontrada</p>
          <p className="text-xs text-slate-400 mt-1">Tente pesquisar com outro termo ou verifique a ortografia.</p>
        </div>
      )}
    </div>
  );
};
