import { useState, useCallback, useEffect } from 'react';

export interface WeatherCurrent {
  temperature: number;
  feelsLike: number;
  condition: string;
  conditionCode: string;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  visibility: number;
  pressure: number;
  airQuality: number;
}

export interface ForecastItem {
  day: string;
  high: number;
  low: number;
  condition: string;
  conditionCode: string;
  precipChance: number;
}

export interface HourlyItem {
  time: string;
  temp: number;
  condition: string;
  conditionCode: string;
}

export interface WeatherData {
  location: string;
  country: string;
  conditionCode: string;
  current: WeatherCurrent;
  forecast: ForecastItem[];
  hourly: HourlyItem[];
}

const createMockData = (
  location: string,
  country: string,
  conditionCode: string,
  temp: number,
  condition: string,
  humidity: number,
  wind: number,
  uv: number,
  aq: number
): WeatherData => ({
  location,
  country,
  conditionCode,
  current: {
    temperature: temp,
    feelsLike: temp + 2,
    condition,
    conditionCode,
    humidity,
    windSpeed: wind,
    uvIndex: uv,
    visibility: 10,
    pressure: 1013,
    airQuality: aq,
  },
  forecast: [
    { day: 'Today', high: temp + 2, low: temp - 4, condition, conditionCode, precipChance: conditionCode === 'Rain' ? 80 : 10 },
    { day: 'Tue', high: temp + 4, low: temp - 3, condition: 'Partly Cloudy', conditionCode: 'Clouds', precipChance: 20 },
    { day: 'Wed', high: temp - 1, low: temp - 6, condition: 'Cloudy', conditionCode: 'Clouds', precipChance: 40 },
    { day: 'Thu', high: temp - 3, low: temp - 8, condition: 'Rain', conditionCode: 'Rain', precipChance: 85 },
    { day: 'Fri', high: temp + 1, low: temp - 5, condition: 'Sunny', conditionCode: 'Clear', precipChance: 5 },
  ],
  hourly: [
    { time: 'Now', temp, condition, conditionCode },
    { time: '+1h', temp: temp + 1, condition, conditionCode },
    { time: '+2h', temp: temp + 2, condition: 'Partly Cloudy', conditionCode: 'Clouds' },
    { time: '+3h', temp: temp + 2, condition: 'Partly Cloudy', conditionCode: 'Clouds' },
    { time: '+4h', temp: temp + 1, condition: 'Cloudy', conditionCode: 'Clouds' },
    { time: '+5h', temp, condition: 'Cloudy', conditionCode: 'Clouds' },
    { time: '+6h', temp: temp - 1, condition: 'Cloudy', conditionCode: 'Clouds' },
    { time: '+7h', temp: temp - 2, condition, conditionCode },
  ],
});

const LOCATION_DB: Record<string, WeatherData> = {
  'san francisco': createMockData('San Francisco', 'US', 'Clear', 22, 'Sunny', 65, 12, 7, 2),
  london: createMockData('London', 'UK', 'Rain', 14, 'Rainy', 82, 18, 2, 1),
  tokyo: createMockData('Tokyo', 'JP', 'Clear', 28, 'Sunny', 70, 8, 8, 3),
  'new york': createMockData('New York', 'US', 'Clouds', 19, 'Overcast', 72, 22, 4, 2),
  dubai: createMockData('Dubai', 'UAE', 'Clear', 38, 'Scorching Sun', 45, 15, 11, 2),
  paris: createMockData('Paris', 'FR', 'Clouds', 16, 'Partly Cloudy', 68, 14, 3, 2),
  sydney: createMockData('Sydney', 'AU', 'Clear', 26, 'Sunny', 58, 20, 9, 1),
  mumbai: createMockData('Mumbai', 'IN', 'Rain', 31, 'Humid & Rainy', 90, 25, 6, 4),
  chicago: createMockData('Chicago', 'US', 'Thunderstorm', 15, 'Thunderstorm', 78, 35, 3, 3),
  moscow: createMockData('Moscow', 'RU', 'Snow', -5, 'Heavy Snow', 85, 10, 1, 2),
};

const DEFAULT_DATA = LOCATION_DB['san francisco'];

export const useWeather = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  useEffect(() => {
    if (geoStatus !== 'idle') return;
    
    if (navigator.geolocation) {
      setGeoStatus('loading');
      navigator.geolocation.getCurrentPosition(
        () => {
          setGeoStatus('done');
          setIsLoading(true);
          setTimeout(() => {
            setWeatherData(DEFAULT_DATA);
            setIsLoading(false);
          }, 1500);
        },
        () => {
          setGeoStatus('error');
        },
        { timeout: 8000 }
      );
    } else {
      setGeoStatus('error');
    }
  }, [geoStatus]);

  const searchWeather = useCallback((query: string) => {
    if (!query.trim()) return;
    setIsLoading(true);
    
    setTimeout(() => {
      const key = Object.keys(LOCATION_DB).find(k => query.toLowerCase().includes(k));
      const data = key ? LOCATION_DB[key] : { ...DEFAULT_DATA, location: query.split(',')[0].trim() };
      setWeatherData(data);
      setIsLoading(false);
    }, 1200);
  }, []);

  return {
    weatherData,
    isLoading,
    searchText,
    setSearchText,
    searchWeather,
    geoStatus,
  };
};
