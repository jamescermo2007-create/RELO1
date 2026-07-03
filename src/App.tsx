import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClockOffset, City } from './types';
import { getSynchronizedDate } from './utils/time';
import { checkClockAccuracy } from './utils/accuracy';
import { ClockMain } from './components/ClockMain';
import { CitySearch } from './components/CitySearch';
import { WorldClockGrid } from './components/WorldClockGrid';
import { TimezoneConverter } from './components/TimezoneConverter';
import { FavoritesList } from './components/FavoritesList';
import { Clock, Globe, ArrowRightLeft, Bookmark, Info, RefreshCw, Star } from 'lucide-react';

export default function App() {
  // Tabs: 'main' (Hora Exata), 'world' (Relógio Mundial), 'converter' (Conversor), 'favorites' (Favoritos)
  const [activeTab, setActiveTab] = useState<'main' | 'world' | 'converter' | 'favorites'>('main');

  // Offset medido em segundos entre o dispositivo do usuário e o servidor
  const [offsetSeconds, setOffsetSeconds] = useState<number>(0);
  
  // Estado completo da precisão (incluindo status, RTT, etc.)
  const [accuracy, setAccuracy] = useState<ClockOffset>({
    offsetSeconds: 0,
    measured: false,
    status: 'syncing',
    rtt: 0
  });

  // Cidade atualmente sob foco no relógio principal (se selecionada via busca)
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  // Lista de IDs das cidades favoritas
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('timeis_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Fuso horário nativo do usuário detectado pelo navegador
  const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Master clock: única fonte de tick em tempo real para toda a aplicação
  const [currentTime, setCurrentTime] = useState<Date>(getSynchronizedDate(0));

  // Função para executar a medição de precisão (NTP)
  const handleSyncTime = async () => {
    setAccuracy(prev => ({ ...prev, status: 'syncing' }));
    const result = await checkClockAccuracy();
    setAccuracy(result);
    setOffsetSeconds(result.offsetSeconds);
  };

  // Sincronizar ao montar a aplicação
  useEffect(() => {
    handleSyncTime();
  }, []);

  // Efeito para atualizar o master ticker em tempo real baseado no offset calculado
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getSynchronizedDate(offsetSeconds));
    }, 200); // 200ms para manter o relógio altamente preciso e fluido
    return () => clearInterval(interval);
  }, [offsetSeconds]);

  // Sincronizar alteração dos favoritos com localStorage
  const handleToggleFavorite = (cityId: string) => {
    setFavorites(prev => {
      const updated = prev.includes(cityId)
        ? prev.filter(id => id !== cityId)
        : [...prev, cityId];
      try {
        localStorage.setItem('timeis_favorites', JSON.stringify(updated));
      } catch (err) {
        console.error('Erro ao salvar favoritos no localStorage', err);
      }
      return updated;
    });
  };

  // Tratar seleção de cidade a partir da busca ou dos grids
  const handleSelectCity = (city: City) => {
    setSelectedCity(city);
    setActiveTab('main'); // Redireciona para o relógio principal
    // Scroll suave até o relógio principal
    const element = document.getElementById('main-clock-card');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleClearSelectedCity = () => {
    setSelectedCity(null);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans flex flex-col justify-between" id="app-root">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30" id="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between py-4 md:py-0 md:h-16 gap-4">
            
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => { setActiveTab('main'); setSelectedCity(null); }}
              id="app-logo-wrapper"
            >
              <Clock className="w-5 h-5 text-[#0f172a] group-hover:rotate-12 transition-transform duration-300" id="logo-icon-clock" />
              <span className="font-bold text-lg tracking-tight text-[#0f172a]">
                Hora.is
              </span>
            </div>

            {/* Navegação Principal (Tabs) - Flat & Minimalist */}
            <nav className="flex items-center gap-6" id="app-navigation">
              <button
                onClick={() => setActiveTab('main')}
                className={`relative py-1.5 text-xs sm:text-sm font-semibold tracking-tight transition-all duration-200 cursor-pointer ${
                  activeTab === 'main'
                    ? 'text-[#0f172a] border-b-2 border-[#0f172a]'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
                id="tab-btn-main"
              >
                Hora Exata
              </button>

              <button
                onClick={() => setActiveTab('world')}
                className={`relative py-1.5 text-xs sm:text-sm font-semibold tracking-tight transition-all duration-200 cursor-pointer ${
                  activeTab === 'world'
                    ? 'text-[#0f172a] border-b-2 border-[#0f172a]'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
                id="tab-btn-world"
              >
                Relógio Mundial
              </button>

              <button
                onClick={() => setActiveTab('converter')}
                className={`relative py-1.5 text-xs sm:text-sm font-semibold tracking-tight transition-all duration-200 cursor-pointer ${
                  activeTab === 'converter'
                    ? 'text-[#0f172a] border-b-2 border-[#0f172a]'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
                id="tab-btn-converter"
              >
                Conversor
              </button>

              <button
                onClick={() => setActiveTab('favorites')}
                className={`relative py-1.5 text-xs sm:text-sm font-semibold tracking-tight transition-all duration-200 cursor-pointer flex items-center gap-1 ${
                  activeTab === 'favorites'
                    ? 'text-[#0f172a] border-b-2 border-[#0f172a]'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
                id="tab-btn-favorites"
              >
                <span>Favoritos</span>
                {favorites.length > 0 && (
                  <span className="bg-[#0f172a] text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full">
                    {favorites.length}
                  </span>
                )}
              </button>
            </nav>

          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12" id="app-main-content">
        
        {/* Barra de Busca de Cidades - Sempre visível no topo para conveniência, exceto no conversor */}
        {activeTab !== 'converter' && (
          <CitySearch 
            onSelectCity={handleSelectCity}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {/* Gerenciamento das Telas Ativas com Transições AnimatePresence */}
        <div className="w-full" id="tab-views-container">
          <AnimatePresence mode="wait">
            {activeTab === 'main' && (
              <motion.div
                key="main"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <ClockMain
                  offsetSeconds={offsetSeconds}
                  accuracy={accuracy}
                  onRefreshAccuracy={handleSyncTime}
                  selectedCity={selectedCity}
                  onClearSelectedCity={handleClearSelectedCity}
                  detectedTimezone={detectedTimezone}
                />
                
                {/* Seção Informativa Curta sobre Precisão */}
                <div className="mt-8 max-w-xl mx-auto p-4 bg-white/50 border border-slate-100 rounded-2xl flex items-start gap-3 text-left">
                  <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-slate-700 text-xs">Por que a sincronização é importante?</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      A maioria dos relógios de computadores e smartphones difere do horário real em alguns segundos. Este applet sincroniza seu navegador com servidores oficiais de hora, garantindo precisão absoluta milissegundo a milissegundo.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'world' && (
              <motion.div
                key="world"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <WorldClockGrid
                  currentTime={currentTime}
                  detectedTimezone={detectedTimezone}
                  onSelectCity={handleSelectCity}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              </motion.div>
            )}

            {activeTab === 'converter' && (
              <motion.div
                key="converter"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <TimezoneConverter
                  detectedTimezone={detectedTimezone}
                />
              </motion.div>
            )}

            {activeTab === 'favorites' && (
              <motion.div
                key="favorites"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <FavoritesList
                  currentTime={currentTime}
                  detectedTimezone={detectedTimezone}
                  favorites={favorites}
                  onSelectCity={handleSelectCity}
                  onToggleFavorite={handleToggleFavorite}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-6 md:py-8 text-center text-slate-400 text-xs" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-medium">
            Hora.is © 2026 • Inspirado no Time.is • Desenvolvido com precisão atômica.
          </p>
          <div className="flex items-center gap-4 font-bold text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Sincronizado
            </span>
            <span>•</span>
            <button 
              onClick={handleSyncTime}
              className="hover:text-blue-600 transition-colors flex items-center gap-1 cursor-pointer"
              id="footer-sync-btn"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Calibrar
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
