
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Cloud, Thermometer, Wind, Eye, Droplets, Sun, Mic, MicOff, Search } from 'lucide-react';
import VoiceInput from './VoiceInput';
import WeatherCard from './WeatherCard';
import WeatherChart from './WeatherChart';
import ForecastGrid from './ForecastGrid';

const WeatherDashboard = () => {
  const [location, setLocation] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock weather data for demonstration
  const mockWeatherData = {
    location: 'San Francisco, CA',
    current: {
      temperature: 22,
      condition: 'Partly Cloudy',
      humidity: 65,
      windSpeed: 12,
      uvIndex: 6,
      visibility: 10,
      pressure: 1013
    },
    forecast: [
      { day: 'Today', high: 24, low: 18, condition: 'Partly Cloudy' },
      { day: 'Tomorrow', high: 26, low: 19, condition: 'Sunny' },
      { day: 'Wednesday', high: 23, low: 17, condition: 'Cloudy' },
      { day: 'Thursday', high: 25, low: 20, condition: 'Sunny' },
      { day: 'Friday', high: 22, low: 16, condition: 'Rain' }
    ],
    hourly: [
      { time: '12 PM', temp: 22 },
      { time: '1 PM', temp: 23 },
      { time: '2 PM', temp: 24 },
      { time: '3 PM', temp: 24 },
      { time: '4 PM', temp: 23 },
      { time: '5 PM', temp: 22 }
    ]
  };

  const handleSearch = async () => {
    if (!location.trim()) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setWeatherData(mockWeatherData);
      setIsLoading(false);
    }, 1000);
  };

  const handleVoiceInput = (transcript: string) => {
    setLocation(transcript);
    handleSearch();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Cloud className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Weather Assistant
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Get comprehensive weather information with voice or text commands
          </p>
        </div>

        {/* Search Section */}
        <Card className="animate-scale-in">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Enter location (e.g., San Francisco, CA)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 h-12 text-lg"
                />
              </div>
              <div className="flex gap-2">
                <VoiceInput
                  onTranscript={handleVoiceInput}
                  isActive={isVoiceActive}
                  setIsActive={setIsVoiceActive}
                />
                <Button 
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isLoading ? 'Searching...' : 'Get Weather'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weather Display */}
        {weatherData && (
          <div className="space-y-6 animate-fade-in">
            {/* Current Weather */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <CardTitle className="text-2xl">Current Weather</CardTitle>
                <p className="text-blue-100">{weatherData.location}</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <WeatherCard
                    icon={<Thermometer className="h-8 w-8 text-orange-500" />}
                    title="Temperature"
                    value={`${weatherData.current.temperature}°C`}
                    description={weatherData.current.condition}
                  />
                  <WeatherCard
                    icon={<Droplets className="h-8 w-8 text-blue-500" />}
                    title="Humidity"
                    value={`${weatherData.current.humidity}%`}
                    description="Relative humidity"
                  />
                  <WeatherCard
                    icon={<Wind className="h-8 w-8 text-gray-500" />}
                    title="Wind Speed"
                    value={`${weatherData.current.windSpeed} km/h`}
                    description="Current wind"
                  />
                  <WeatherCard
                    icon={<Sun className="h-8 w-8 text-yellow-500" />}
                    title="UV Index"
                    value={weatherData.current.uvIndex}
                    description="UV radiation level"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Temperature Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Hourly Temperature</CardTitle>
              </CardHeader>
              <CardContent>
                <WeatherChart data={weatherData.hourly} />
              </CardContent>
            </Card>

            {/* Forecast */}
            <Card>
              <CardHeader>
                <CardTitle>5-Day Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <ForecastGrid forecast={weatherData.forecast} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Instructions */}
        {!weatherData && (
          <Card className="animate-fade-in">
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <Cloud className="h-16 w-16 text-blue-400 mx-auto" />
                <h3 className="text-xl font-semibold text-gray-700">
                  Welcome to Your Weather Assistant
                </h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Search for any location to get comprehensive weather information including 
                  current conditions, hourly forecasts, and 5-day predictions. You can type 
                  your query or use voice input by clicking the microphone button.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WeatherDashboard;
