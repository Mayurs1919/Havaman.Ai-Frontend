import React, { useState, useRef } from 'react';
import { Search, Volume2, VolumeX, MapPin, Wind, Droplets, Eye, Gauge } from 'lucide-react';
import VoiceInput from './VoiceInput';
import WeatherInsights from './WeatherInsights';
import ForecastSwiper from './ForecastSwiper';
import RadarView from './RadarView';
import { useWeather } from '@/hooks/useWeather';
import { toast } from '@/hooks/use-toast';

const getWeatherEmoji = (conditionCode: string): string => {
  const map: Record<string, string> = {
    Clear: '☀️',
    Clouds: '☁️',
    Rain: '🌧️',
    Drizzle: '🌦️',
    Thunderstorm: '⛈️',
    Snow: '❄️',
    Mist: '🌫️',
  };
  return map[conditionCode] || '🌤️';
};

const getAQILabel = (aqi: number): string => {
  const labels = ['', 'Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
  return labels[aqi] || 'Unknown';
};

const WeatherDashboard = () => {
  const { weatherData, isLoading, searchText, setSearchText, searchWeather, geoStatus } = useWeather();
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const haptic = (pattern: number | number[] = 50) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const handleSearch = () => {
    haptic(30);
    searchWeather(searchText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleVoiceTranscript = (text: string) => {
    setSearchText(text);
    searchWeather(text);
  };

  const toggleSpeak = () => {
    haptic(40);
    if (!('speechSynthesis' in window)) {
      toast({ title: 'TTS not supported', variant: 'destructive' });
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!weatherData) return;

    const { current, location } = weatherData;
    const aqiLabel = getAQILabel(current.airQuality);
    const text = `Weather in ${location}: ${current.temperature} degrees Celsius, ${current.condition}. Feels like ${current.feelsLike} degrees. Humidity is ${current.humidity} percent. Wind speed ${current.windSpeed} kilometers per hour. UV index ${current.uvIndex}. Air quality is ${aqiLabel}.`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const conditionCode = weatherData?.conditionCode || 'Default';

  return (
    <div data-weather={conditionCode} className="weather-app max-w-[480px] mx-auto relative min-h-screen">
      <div className="weather-bg" />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="flex-1 overflow-y-auto pb-28 pt-safe">
          
          {weatherData ? (
            <>
              <div className="px-4 pt-10 pb-6 text-center">
                <div className="flex items-center justify-center gap-1.5 text-white/80 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">{weatherData.location}, {weatherData.country}</span>
                </div>
                <div className="text-[88px] leading-none font-thin text-white mb-2">
                  {getWeatherEmoji(conditionCode)}
                </div>
                <div className="text-[72px] leading-none font-extralight text-white mb-1">
                  {weatherData.current.temperature}°
                </div>
                <div className="text-xl text-white/90 font-light mb-1">
                  {weatherData.current.condition}
                </div>
                <div className="text-sm text-white/60">
                  Feels like {weatherData.current.feelsLike}° · H:{weatherData.forecast[0]?.high}° L:{weatherData.forecast[0]?.low}°
                </div>
              </div>

              <div className="px-4 pb-4 grid grid-cols-2 gap-3">
                {[
                  { icon: <Droplets className="w-5 h-5" />, label: 'Humidity', value: `${weatherData.current.humidity}%` },
                  { icon: <Wind className="w-5 h-5" />, label: 'Wind', value: `${weatherData.current.windSpeed} km/h` },
                  { icon: <Eye className="w-5 h-5" />, label: 'Visibility', value: `${weatherData.current.visibility} km` },
                  { icon: <Gauge className="w-5 h-5" />, label: 'Pressure', value: `${weatherData.current.pressure} hPa` },
                ].map((stat, i) => (
                  <div key={i} className="glass-card rounded-2xl p-4 flex items-center gap-3">
                    <div className="text-white/70">{stat.icon}</div>
                    <div>
                      <p className="text-white/60 text-xs">{stat.label}</p>
                      <p className="text-white font-semibold text-sm">{stat.value}</p>
                    </div>
                  </div>
                ))}
                
                <div className="glass-card rounded-2xl p-4">
                  <p className="text-white/60 text-xs mb-1">UV Index</p>
                  <div className="flex items-end gap-2">
                    <p className="text-white font-bold text-2xl">{weatherData.current.uvIndex}</p>
                    <p className="text-white/60 text-xs mb-1">
                      {weatherData.current.uvIndex <= 2 ? 'Low' : weatherData.current.uvIndex <= 5 ? 'Moderate' : weatherData.current.uvIndex <= 7 ? 'High' : 'Very High'}
                    </p>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(weatherData.current.uvIndex / 11) * 100}%`,
                        background: weatherData.current.uvIndex <= 2 ? '#22c55e' : weatherData.current.uvIndex <= 5 ? '#eab308' : weatherData.current.uvIndex <= 7 ? '#f97316' : '#ef4444',
                      }}
                    />
                  </div>
                </div>
                <div className="glass-card rounded-2xl p-4">
                  <p className="text-white/60 text-xs mb-1">Air Quality</p>
                  <p className="text-white font-bold text-2xl">{getAQILabel(weatherData.current.airQuality)}</p>
                  <div className="h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(weatherData.current.airQuality / 5) * 100}%`,
                        background: weatherData.current.airQuality <= 2 ? '#22c55e' : weatherData.current.airQuality === 3 ? '#eab308' : '#ef4444',
                      }}
                    />
                  </div>
                </div>
              </div>

              <WeatherInsights weatherData={weatherData} />
              <ForecastSwiper hourly={weatherData.hourly} forecast={weatherData.forecast} onHaptic={() => haptic(30)} />
              <RadarView conditionCode={conditionCode} location={weatherData.location} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center">
              {isLoading ? (
                <div className="space-y-4">
                  <div className="text-6xl animate-bounce">🌍</div>
                  <p className="text-white/80 text-lg">
                    {geoStatus === 'loading' ? 'Finding your location...' : 'Loading weather...'}
                  </p>
                  <div className="flex gap-1.5 justify-center">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-7xl">🌤️</div>
                  <h2 className="text-2xl font-semibold text-white">Weather Assistant</h2>
                  <p className="text-white/70">Search any city or allow location access to get started</p>
                  <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2 text-white/60 text-sm">
                    <span>💡</span>
                    <span>Try: "London", "Tokyo", "New York"</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {isLoading && weatherData && (
            <div className="fixed inset-0 z-20 flex items-center justify-center pointer-events-none">
              <div className="bg-black/30 backdrop-blur-sm rounded-2xl px-6 py-4 flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
                <span className="text-white text-sm">Updating...</span>
              </div>
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-30 pb-safe">
          <div className="mx-3 mb-4 glass-card rounded-2xl px-3 py-3 border border-white/20">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="text"
                  placeholder="Search location..."
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full h-11 pl-9 pr-3 bg-white/10 text-white placeholder:text-white/40 rounded-xl border border-white/20 focus:border-white/40 focus:outline-none text-sm"
                />
              </div>
              <VoiceInput
                onTranscript={handleVoiceTranscript}
                isActive={isVoiceActive}
                setIsActive={setIsVoiceActive}
                onHaptic={() => haptic([30, 20, 30])}
              />
              {weatherData && (
                <button
                  onClick={toggleSpeak}
                  className={`h-11 w-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                    isSpeaking
                      ? 'bg-purple-500/50 text-purple-200'
                      : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              )}
              <button
                onClick={handleSearch}
                disabled={isLoading || !searchText.trim()}
                className="h-11 px-4 min-h-[44px] rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-medium disabled:opacity-40 transition-all flex-shrink-0"
              >
                Go
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherDashboard;
