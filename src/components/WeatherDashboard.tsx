import React, { useState, useRef, useEffect } from 'react';
import { Search, Volume2, VolumeX, MapPin, Wind, Droplets, Eye, Gauge, Settings } from 'lucide-react';
import VoiceInput from './VoiceInput';
import WeatherInsights from './WeatherInsights';
import ForecastSwiper from './ForecastSwiper';
import RadarView from './RadarView';
import SettingsModal from './SettingsModal';
import { useWeather } from '@/hooks/useWeather';
import { toast } from '@/hooks/use-toast';
import { getTranslations, translateWeatherCondition, detectBrowserLanguage } from '@/utils/translations';

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

const getAQILabel = (aqi: number, t: any): string => {
  const labels = ['', t.aqGood, t.aqFair, t.aqModerate, t.aqPoor, t.aqVeryPoor];
  return labels[aqi] || 'Unknown';
};

const getUVLabel = (uv: number, t: any): string => {
  if (uv <= 2) return t.uvLow;
  if (uv <= 5) return t.uvModerate;
  if (uv <= 7) return t.uvHigh;
  return t.uvVeryHigh;
};

const WeatherDashboard = () => {
  // Settings state
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('weather-api-key') || '');
  const [language, setLanguage] = useState(() => localStorage.getItem('weather-language') || detectBrowserLanguage());
  const [temperatureUnit, setTemperatureUnit] = useState<'C' | 'F'>(() => 
    (localStorage.getItem('weather-temp-unit') as 'C' | 'F') || 'C'
  );
  const [enableHaptics, setEnableHaptics] = useState(() => 
    localStorage.getItem('weather-haptics') !== 'false'
  );
  const [enableTTS, setEnableTTS] = useState(() => 
    localStorage.getItem('weather-tts') !== 'false'
  );
  const [showSettings, setShowSettings] = useState(false);

  // Component state
  const { weatherData, isLoading, searchText, setSearchText, searchWeather, geoStatus } = useWeather(apiKey || undefined, temperatureUnit);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const t = getTranslations(language);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('weather-api-key', apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem('weather-language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('weather-temp-unit', temperatureUnit);
  }, [temperatureUnit]);

  useEffect(() => {
    localStorage.setItem('weather-haptics', enableHaptics.toString());
  }, [enableHaptics]);

  useEffect(() => {
    localStorage.setItem('weather-tts', enableTTS.toString());
  }, [enableTTS]);

  const haptic = (pattern: number | number[] = 50) => {
    if ('vibrate' in navigator && enableHaptics) {
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
    if (!enableTTS) return;
    
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
    const aqiLabel = getAQILabel(current.airQuality, t);
    const uvLabel = getUVLabel(current.uvIndex, t);
    const tempUnit = temperatureUnit === 'F' ? 'Fahrenheit' : 'Celsius';
    const speedUnit = temperatureUnit === 'F' ? 'miles per hour' : 'kilometers per hour';
    const translatedCondition = translateWeatherCondition(current.condition, language);
    
    const text = `${t.current} in ${location}: ${current.temperature} degrees ${tempUnit}, ${translatedCondition}. ${t.feelsLike} ${current.feelsLike} degrees. ${t.humidity} ${current.humidity} percent. ${t.windSpeed} ${current.windSpeed} ${speedUnit}. UV ${t.uvIndex} ${current.uvIndex}, ${uvLabel}. ${t.airQuality} ${aqiLabel}.`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.lang = language === 'en' ? 'en-US' : language === 'es' ? 'es-ES' : language === 'fr' ? 'fr-FR' : language === 'de' ? 'de-DE' : language === 'ja' ? 'ja-JP' : language === 'ko' ? 'ko-KR' : language === 'pt' ? 'pt-PT' : language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : language === 'zh' ? 'zh-CN' : language === 'ar' ? 'ar-SA' : 'en-US';
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
                  {weatherData.current.temperature}°{temperatureUnit}
                </div>
                <div className="text-xl text-white/90 font-light mb-1">
                  {translateWeatherCondition(weatherData.current.condition, language)}
                </div>
                <div className="text-sm text-white/60">
                  {t.feelsLike} {weatherData.current.feelsLike}° · H:{weatherData.forecast[0]?.high}° L:{weatherData.forecast[0]?.low}°
                </div>
              </div>

              <div className="px-4 pb-4 grid grid-cols-2 gap-3">
                {[
                  { icon: <Droplets className="w-5 h-5" />, label: t.humidity, value: `${weatherData.current.humidity}%` },
                  { icon: <Wind className="w-5 h-5" />, label: t.windSpeed, value: `${weatherData.current.windSpeed} km/h` },
                  { icon: <Eye className="w-5 h-5" />, label: t.visibility, value: `${weatherData.current.visibility} km` },
                  { icon: <Gauge className="w-5 h-5" />, label: t.pressure, value: `${weatherData.current.pressure} hPa` },
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
                  <p className="text-white/60 text-xs mb-1">{t.uvIndex}</p>
                  <div className="flex items-end gap-2">
                    <p className="text-white font-bold text-2xl">{weatherData.current.uvIndex}</p>
                    <p className="text-white/60 text-xs mb-1">
                      {getUVLabel(weatherData.current.uvIndex, t)}
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
                  <p className="text-white/60 text-xs mb-1">{t.airQuality}</p>
                  <p className="text-white font-bold text-2xl">{getAQILabel(weatherData.current.airQuality, t)}</p>
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

              <WeatherInsights weatherData={weatherData} language={language} />
              <ForecastSwiper 
                hourly={weatherData.hourly} 
                forecast={weatherData.forecast} 
                onHaptic={() => haptic(30)}
                language={language}
              />
              <RadarView conditionCode={conditionCode} location={weatherData.location} language={language} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center">
              {isLoading ? (
                <div className="space-y-4">
                  <div className="text-6xl animate-bounce">🌍</div>
                  <p className="text-white/80 text-lg">
                    {geoStatus === 'loading' ? t.findingLocation : t.loadingWeather}
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
                  <h2 className="text-2xl font-semibold text-white">{t.weatherAssistant}</h2>
                  <p className="text-white/70">{t.searchAnyCity}</p>
                  {!apiKey && (
                    <div className="flex items-center gap-2 bg-orange-500/20 border border-orange-400/30 rounded-xl px-4 py-2 text-white/90 text-sm">
                      <span>⚠️</span>
                      <span>Add API key in settings for real weather data</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {isLoading && weatherData && (
            <div className="fixed inset-0 z-20 flex items-center justify-center pointer-events-none">
              <div className="bg-black/30 backdrop-blur-sm rounded-2xl px-6 py-4 flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
                <span className="text-white text-sm">{t.updating}</span>
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
                  placeholder={t.searchLocation}
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
                language={language}
              />
              {weatherData && enableTTS && (
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
                onClick={() => setShowSettings(true)}
                className="h-11 w-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center flex-shrink-0 transition-all bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              >
                <Settings className="w-5 h-5" />
              </button>
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

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
        language={language}
        setLanguage={setLanguage}
        temperatureUnit={temperatureUnit}
        setTemperatureUnit={setTemperatureUnit}
        enableHaptics={enableHaptics}
        setEnableHaptics={setEnableHaptics}
        enableTTS={enableTTS}
        setEnableTTS={setEnableTTS}
      />
    </div>
  );
};

export default WeatherDashboard;
