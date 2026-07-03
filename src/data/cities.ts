import { City } from '../types';

export const CITIES: City[] = [
  // Cidades Brasileiras
  { id: 'sao-paulo', name: 'São Paulo', country: 'Brasil', timezone: 'America/Sao_Paulo', popular: true },
  { id: 'rio-de-janeiro', name: 'Rio de Janeiro', country: 'Brasil', timezone: 'America/Sao_Paulo', popular: false },
  { id: 'brasilia', name: 'Brasília', country: 'Brasil', timezone: 'America/Sao_Paulo', popular: false },
  { id: 'manaus', name: 'Manaus', country: 'Brasil', timezone: 'America/Manaus', popular: false },
  { id: 'fernando-de-noronha', name: 'Fernando de Noronha', country: 'Brasil', timezone: 'America/Noronha', popular: false },

  // América do Norte
  { id: 'nova-york', name: 'Nova York', country: 'Estados Unidos', timezone: 'America/New_York', popular: true },
  { id: 'los-angeles', name: 'Los Angeles', country: 'Estados Unidos', timezone: 'America/Los_Angeles', popular: true },
  { id: 'chicago', name: 'Chicago', country: 'Estados Unidos', timezone: 'America/Chicago', popular: false },
  { id: 'toronto', name: 'Toronto', country: 'Canadá', timezone: 'America/Toronto', popular: false },
  { id: 'vancouver', name: 'Vancouver', country: 'Canadá', timezone: 'America/Vancouver', popular: false },
  { id: 'cidade-do-mexico', name: 'Cidade do México', country: 'México', timezone: 'America/Mexico_City', popular: false },
  { id: 'honolulu', name: 'Honolulu', country: 'Estados Unidos', timezone: 'Pacific/Honolulu', popular: false },

  // Europa
  { id: 'londres', name: 'Londres', country: 'Reino Unido', timezone: 'Europe/London', popular: true },
  { id: 'paris', name: 'Paris', country: 'França', timezone: 'Europe/Paris', popular: true },
  { id: 'berlim', name: 'Berlim', country: 'Alemanha', timezone: 'Europe/Berlin', popular: false },
  { id: 'roma', name: 'Roma', country: 'Itália', timezone: 'Europe/Rome', popular: false },
  { id: 'madrid', name: 'Madri', country: 'Espanha', timezone: 'Europe/Madrid', popular: false },
  { id: 'moscou', name: 'Moscou', country: 'Rússia', timezone: 'Europe/Moscow', popular: false },
  { id: 'istambul', name: 'Istambul', country: 'Turquia', timezone: 'Europe/Istanbul', popular: false },

  // Ásia e Oriente Médio
  { id: 'toquio', name: 'Tóquio', country: 'Japão', timezone: 'Asia/Tokyo', popular: true },
  { id: 'pequim', name: 'Pequim', country: 'China', timezone: 'Asia/Shanghai', popular: false },
  { id: 'singapura', name: 'Singapura', country: 'Singapura', timezone: 'Asia/Singapore', popular: false },
  { id: 'seul', name: 'Seul', country: 'Coreia do Sul', timezone: 'Asia/Seoul', popular: false },
  { id: 'dubai', name: 'Dubai', country: 'Emirados Árabes Unidos', timezone: 'Asia/Dubai', popular: true },
  { id: 'nova-deli', name: 'Nova Déli', country: 'Índia', timezone: 'Asia/Kolkata', popular: false },

  // Oceania
  { id: 'sydney', name: 'Sydney', country: 'Austrália', timezone: 'Australia/Sydney', popular: true },
  { id: 'auckland', name: 'Auckland', country: 'Nova Zelândia', timezone: 'Pacific/Auckland', popular: false },

  // América do Sul (Outras)
  { id: 'buenos-aires', name: 'Buenos Aires', country: 'Argentina', timezone: 'America/Argentina/Buenos_Aires', popular: false },
  { id: 'santiago', name: 'Santiago', country: 'Chile', timezone: 'America/Santiago', popular: false },
  { id: 'lima', name: 'Lima', country: 'Peru', timezone: 'America/Lima', popular: false },
  { id: 'bogota', name: 'Bogotá', country: 'Colômbia', timezone: 'America/Bogota', popular: false },

  // África
  { id: 'cairo', name: 'Cairo', country: 'Egito', timezone: 'Africa/Cairo', popular: false },
  { id: 'joanesburgo', name: 'Joanesburgo', country: 'África do Sul', timezone: 'Africa/Johannesburg', popular: false }
];

export function getCityById(id: string): City | undefined {
  return CITIES.find(city => city.id === id);
}

export function searchCities(query: string): City[] {
  const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return CITIES.filter(city => {
    const normName = city.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normCountry = city.country.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return normName.includes(normalizedQuery) || normCountry.includes(normalizedQuery);
  });
}
