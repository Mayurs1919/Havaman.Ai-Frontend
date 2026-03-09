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

const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Weather condition mapping from OpenWeather to our codes
const mapWeatherCondition = (weatherMain: string, weatherDescription: string): { condition: string; conditionCode: string } => {
  const main = weatherMain.toLowerCase();
  const desc = weatherDescription.toLowerCase();
  
  switch (main) {
    case 'clear':
      return { condition: 'Clear', conditionCode: 'Clear' };
    case 'clouds':
      if (desc.includes('few')) return { condition: 'Partly Cloudy', conditionCode: 'Clouds' };
      if (desc.includes('scattered') || desc.includes('broken')) return { condition: 'Cloudy', conditionCode: 'Clouds' };
      return { condition: 'Overcast', conditionCode: 'Clouds' };
    case 'rain':
      if (desc.includes('light')) return { condition: 'Light Rain', conditionCode: 'Rain' };
      if (desc.includes('heavy')) return { condition: 'Heavy Rain', conditionCode: 'Rain' };
      return { condition: 'Rain', conditionCode: 'Rain' };
    case 'drizzle':
      return { condition: 'Drizzle', conditionCode: 'Drizzle' };
    case 'thunderstorm':
      return { condition: 'Thunderstorm', conditionCode: 'Thunderstorm' };
    case 'snow':
      if (desc.includes('light')) return { condition: 'Light Snow', conditionCode: 'Snow' };
      if (desc.includes('heavy')) return { condition: 'Heavy Snow', conditionCode: 'Snow' };
      return { condition: 'Snow', conditionCode: 'Snow' };
    case 'mist':
      return { condition: 'Mist', conditionCode: 'Mist' };
    case 'fog':
      return { condition: 'Fog', conditionCode: 'Fog' };
    default:
      return { condition: weatherDescription, conditionCode: main };
  }
};

// Mock data as fallback
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

const DEFAULT_DATA = createMockData('San Francisco', 'US', 'Clear', 22, 'Sunny', 65, 12, 7, 2);

export const useWeather = (apiKey?: string, temperatureUnit: 'C' | 'F' = 'C') => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const convertTemp = useCallback((temp: number) => {
    if (temperatureUnit === 'F') {
      return Math.round((temp * 9/5) + 32);
    }
    return Math.round(temp);
  }, [temperatureUnit]);

  const fetchWeatherData = useCallback(async (lat: number, lon: number, locationName?: string): Promise<WeatherData> => {
    if (!apiKey) {
      return { ...DEFAULT_DATA, location: locationName || DEFAULT_DATA.location };
    }

    try {
      const units = temperatureUnit === 'F' ? 'imperial' : 'metric';
      
      // Fetch current weather
      const currentResponse = await fetch(
        `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`
      );
      
      if (!currentResponse.ok) {
        throw new Error(`Weather API error: ${currentResponse.status}`);
      }
      
      const currentData = await currentResponse.json();
      
      // Fetch forecast
      const forecastResponse = await fetch(
        `${OPENWEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`
      );
      
      if (!forecastResponse.ok) {
        throw new Error(`Forecast API error: ${forecastResponse.status}`);
      }
      
      const forecastData = await forecastResponse.json();
      
      // Fetch UV Index (requires One Call API)
      let uvIndex = 5; // fallback
      try {
        const uvResponse = await fetch(
          `${OPENWEATHER_BASE_URL}/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`
        );
        if (uvResponse.ok) {
          const uvData = await uvResponse.json();
          uvIndex = Math.round(uvData.value || 5);
        }
      } catch (e) {
        console.warn('UV data unavailable');
      }
      
      // Fetch Air Quality
      let airQuality = 2; // fallback
      try {
        const aqResponse = await fetch(
          `${OPENWEATHER_BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
        );
        if (aqResponse.ok) {
          const aqData = await aqResponse.json();
          airQuality = aqData.list[0]?.main?.aqi || 2;
        }
      } catch (e) {
        console.warn('Air quality data unavailable');
      }

      const { condition, conditionCode } = mapWeatherCondition(
        currentData.weather[0].main,
        currentData.weather[0].description
      );

      // Process hourly forecast (next 8 hours)
      const hourly: HourlyItem[] = forecastData.list.slice(0, 8).map((item: any, index: number) => {
        const { condition: hourCondition, conditionCode: hourCode } = mapWeatherCondition(
          item.weather[0].main,
          item.weather[0].description
        );
        
        return {
          time: index === 0 ? 'Now' : `+${index}h`,
          temp: Math.round(item.main.temp),
          condition: hourCondition,
          conditionCode: hourCode,
        };
      });

      // Process 5-day forecast
      const dailyForecasts = new Map();
      const today = new Date().toDateString();
      
      forecastData.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000);
        const dateStr = date.toDateString();
        
        if (!dailyForecasts.has(dateStr)) {
          const { condition: dayCondition, conditionCode: dayCode } = mapWeatherCondition(
            item.weather[0].main,
            item.weather[0].description
          );
          
          dailyForecasts.set(dateStr, {
            day: dateStr === today ? 'Today' : date.toLocaleDateString('en', { weekday: 'short' }),
            high: Math.round(item.main.temp_max),
            low: Math.round(item.main.temp_min),
            condition: dayCondition,
            conditionCode: dayCode,
            precipChance: Math.round((item.pop || 0) * 100),
          });
        } else {
          const existing = dailyForecasts.get(dateStr);
          existing.high = Math.max(existing.high, Math.round(item.main.temp_max));
          existing.low = Math.min(existing.low, Math.round(item.main.temp_min));
          existing.precipChance = Math.max(existing.precipChance, Math.round((item.pop || 0) * 100));
        }
      });

      const forecast = Array.from(dailyForecasts.values()).slice(0, 5);

      return {
        location: locationName || currentData.name,
        country: currentData.sys.country,
        conditionCode,
        current: {
          temperature: Math.round(currentData.main.temp),
          feelsLike: Math.round(currentData.main.feels_like),
          condition,
          conditionCode,
          humidity: currentData.main.humidity,
          windSpeed: Math.round(currentData.wind.speed * 3.6), // m/s to km/h
          uvIndex,
          visibility: Math.round((currentData.visibility || 10000) / 1000), // m to km
          pressure: currentData.main.pressure,
          airQuality,
        },
        forecast,
        hourly,
      };
      
    } catch (error) {
      console.error('Weather API Error:', error);
      return { ...DEFAULT_DATA, location: locationName || DEFAULT_DATA.location };
    }
  }, [apiKey, temperatureUnit]);

  const geocodeLocation = useCallback(async (locationQuery: string): Promise<{ lat: number; lon: number; name: string } | null> => {
    if (!apiKey) {
      return { lat: 37.7749, lon: -122.4194, name: locationQuery };
    }

    try {
      const response = await fetch(
        `${OPENWEATHER_BASE_URL}/geocoding/direct?q=${encodeURIComponent(locationQuery)}&limit=1&appid=${apiKey}`
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      if (data.length === 0) return null;
      
      const location = data[0];
      return {
        lat: location.lat,
        lon: location.lon,
        name: `${location.name}${location.state ? ', ' + location.state : ''}`,
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }, [apiKey]);

  useEffect(() => {
    if (geoStatus !== 'idle') return;
    
    if (navigator.geolocation) {
      setGeoStatus('loading');
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setGeoStatus('done');
          setIsLoading(true);
          try {
            const data = await fetchWeatherData(
              position.coords.latitude,
              position.coords.longitude
            );
            setWeatherData(data);
          } catch (error) {
            console.error('Failed to fetch weather data:', error);
            setWeatherData(DEFAULT_DATA);
          } finally {
            setIsLoading(false);
          }
        },
        () => {
          setGeoStatus('error');
        },
        { timeout: 8000 }
      );
    } else {
      setGeoStatus('error');
    }
  }, [geoStatus, fetchWeatherData]);

  const searchWeather = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setIsLoading(true);
    
    try {
      const location = await geocodeLocation(query);
      if (location) {
        const data = await fetchWeatherData(location.lat, location.lon, location.name);
        setWeatherData(data);
      } else {
        // Fallback to mock data with the query as location name
        setWeatherData({ ...DEFAULT_DATA, location: query.split(',')[0].trim() });
      }
    } catch (error) {
      console.error('Search error:', error);
      setWeatherData({ ...DEFAULT_DATA, location: query.split(',')[0].trim() });
    } finally {
      setIsLoading(false);
    }
  }, [geocodeLocation, fetchWeatherData]);

  return {
    weatherData,
    isLoading,
    searchText,
    setSearchText,
    searchWeather,
    geoStatus,
  };
};
