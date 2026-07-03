export interface City {
  id: string;
  name: string;
  country: string;
  timezone: string;
  popular: boolean;
}

export interface ClockOffset {
  offsetSeconds: number; // Offset in seconds: (serverTime - clientTime)
  measured: boolean;
  status: 'syncing' | 'synced' | 'error';
  rtt: number; // Round-trip time in milliseconds
}

export interface SavedFavorite {
  cityId: string;
}

export interface TimezoneConversion {
  sourceCityId: string;
  targetCityId: string;
  sourceTime: string; // "HH:MM"
}
