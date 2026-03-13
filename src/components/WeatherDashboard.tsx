import React, { useState, useRef, useEffect } from 'react';
import { Search, Volume2, VolumeX, MapPin, Wind, Droplets, Eye, Gauge, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import VoiceInput from './VoiceInput';
import WeatherInsights from './WeatherInsights';
import ForecastSwiper from './ForecastSwiper';
import RadarView from './RadarView';
import SettingsModal from './SettingsModal';
import WeatherParticles from './WeatherParticles';
import WeatherWindow from './WeatherWindow';
import AppHeader from './AppHeader';
import SevereWeatherAlert, { WeatherAlert } from './SevereWeatherAlert';
import { useWeather } from '@/hooks/useWeather';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { toast } from '@/hooks/use-toast';
import { getTranslations, translateWeatherCondition, detectBrowserLanguage } from '@/utils/translations';

const getWeatherEmoji = (conditionCode: string): string => {
  const map: Record<string, string> = {
    Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Drizzle: '🌦️',
    Thunderstorm: '⛈️', Snow: '❄️', Mist: '🌫️',
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
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('weather-api-key') || '');
  const [language, setLanguage] = useState(() => localStorage.getItem('weather-language') || detectBrowserLanguage());
  const [temperatureUnit, setTemperatureUnit] = useState<'C' | 'F'>(() =>
    (localStorage.getItem('weather-temp-unit') as 'C' | 'F') || 'C'
  );
  const [enableHaptics, setEnableHaptics] = useState(() => localStorage.getItem('weather-haptics') !== 'false');
  const [enableTTS, setEnableTTS] = useState(() => localStorage.getItem('weather-tts') !== 'false');
  const [showSettings, setShowSettings] = useState(false);

  const { weatherData, isLoading, searchText, setSearchText, searchWeather, geoStatus } = useWeather(apiKey || undefined, temperatureUnit);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const t = getTranslations(language);

  useEffect(() => { localStorage.setItem('weather-api-key', apiKey); }, [apiKey]);
  useEffect(() => { localStorage.setItem('weather-language', language); }, [language]);
  useEffect(() => { localStorage.setItem('weather-temp-unit', temperatureUnit); }, [temperatureUnit]);
  useEffect(() => { localStorage.setItem('weather-haptics', enableHaptics.toString()); }, [enableHaptics]);
  useEffect(() => { localStorage.setItem('weather-tts', enableTTS.toString()); }, [enableTTS]);

  const haptic = (pattern: number | number[] = 50) => {
    if ('vibrate' in navigator && enableHaptics) navigator.vibrate(pattern);
  };

  const handleSearch = () => { haptic(30); searchWeather(searchText); };
  const handleKeyPress = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSearch(); };
  const handleVoiceTranscript = (text: string) => { setSearchText(text); searchWeather(text); };

  const toggleSpeak = () => {
    if (!enableTTS) return;
    haptic(40);
    if (!('speechSynthesis' in window)) {
      toast({ title: 'TTS not supported', variant: 'destructive' });
      return;
    }
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); return; }
    if (!weatherData) return;

    const { current, location } = weatherData;
    const tempUnit = temperatureUnit === 'F' ? 'Fahrenheit' : 'Celsius';
    const speedUnit = temperatureUnit === 'F' ? 'miles per hour' : 'kilometers per hour';
    const translatedCondition = translateWeatherCondition(current.condition, language);
    const text = `${t.current} in ${location}: ${current.temperature} degrees ${tempUnit}, ${translatedCondition}. ${t.feelsLike} ${current.feelsLike} degrees. ${t.humidity} ${current.humidity} percent. ${t.windSpeed} ${current.windSpeed} ${speedUnit}.`;

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

  // Severe Weather Alert state — triggered by extreme conditions
  const [activeAlert, setActiveAlert] = useState<WeatherAlert | null>(null);
  useEffect(() => {
    if (!weatherData) return;
    const { current, conditionCode: code } = weatherData;
    let alert: WeatherAlert | null = null;

    if (code === 'Thunderstorm') {
      alert = {
        type: 'storm', severity: 'extreme',
        title: 'Severe Thunderstorm Alert',
        description: `A severe thunderstorm is affecting ${weatherData.location}. Dangerous lightning, heavy rainfall, and strong winds expected.`,
        expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
        survivalSteps: ['Move to a sturdy indoor shelter immediately', 'Stay away from windows and unplug electronics', 'Charge devices now and prepare emergency supplies'],
      };
    } else if (current.temperature >= 42) {
      alert = {
        type: 'high_heat', severity: 'extreme',
        title: 'Extreme Heat Warning',
        description: `Dangerously high temperatures of ${current.temperature}° detected in ${weatherData.location}. Risk of heat stroke is very high.`,
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
        survivalSteps: ['Stay indoors in air-conditioned spaces', 'Drink water every 15 minutes even if not thirsty', 'Avoid outdoor activities between 11 AM and 4 PM'],
      };
    } else if (current.windSpeed >= 60) {
      alert = {
        type: 'hurricane', severity: 'extreme',
        title: 'High Wind Emergency',
        description: `Extreme wind speeds of ${current.windSpeed} km/h detected. Flying debris possible.`,
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
        survivalSteps: ['Seek shelter in an interior room away from windows', 'Secure loose outdoor objects immediately', 'Do not drive — pull over if already on the road'],
      };
    } else if (code === 'Snow' && current.temperature <= -10) {
      alert = {
        type: 'blizzard', severity: 'warning',
        title: 'Blizzard Warning',
        description: `Blizzard conditions with heavy snowfall and ${current.temperature}° temperatures in ${weatherData.location}.`,
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
        survivalSteps: ['Stay indoors and keep warm with layers', 'Keep a flashlight and extra batteries accessible', 'Avoid travel — roads may be impassable'],
      };
    }
    setActiveAlert(alert);
  }, [weatherData]);

  const getTimeOfDay = (): string => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 15) return 'afternoon';
    if (hour >= 15 && hour < 18) return 'dusk';
    if (hour >= 18 && hour < 20) return 'evening';
    return 'night';
  };

  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay());
  useEffect(() => {
    const interval = setInterval(() => setTimeOfDay(getTimeOfDay()), 60000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = (): string => {
    switch (timeOfDay) {
      case 'morning': return t.goodMorning;
      case 'afternoon': return t.goodAfternoon;
      case 'dusk': case 'evening': return t.goodEvening;
      default: return t.goodNight;
    }
  };

  return (
    <div data-weather={conditionCode} data-timeofday={timeOfDay} data-alert={activeAlert ? 'active' : undefined} className="weather-app max-w-[480px] mx-auto relative min-h-screen">
      <div className="weather-bg" />
      <WeatherParticles conditionCode={conditionCode} timeOfDay={timeOfDay} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <AppHeader />
        <div className="flex-1 overflow-y-auto pb-28">

          {weatherData ? (
            <>
              {/* Hero temperature display */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="px-4 pt-8 pb-6 text-center"
              >
                <p className="text-white/60 text-sm font-medium mb-3" style={{ fontFamily: 'var(--font-body)' }}>
                  {getGreeting()} ☀️
                </p>
                <div className="flex items-center justify-center gap-1.5 text-white/70 mb-3">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="text-sm font-medium" style={{ fontFamily: 'var(--font-body)' }}>
                    {weatherData.location}, {weatherData.country}
                  </span>
                </div>
                <div className="text-[80px] leading-none mb-2 animate-float-slow">
                  {getWeatherEmoji(conditionCode)}
                </div>
                <div className="text-[68px] leading-none font-extralight text-white mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                  {weatherData.current.temperature}°<span className="text-3xl text-white/50">{temperatureUnit}</span>
                </div>
                <div className="text-lg text-white/80 font-light mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                  {translateWeatherCondition(weatherData.current.condition, language)}
                </div>
                <div className="text-sm text-white/50" style={{ fontFamily: 'var(--font-body)' }}>
                  {t.feelsLike} {weatherData.current.feelsLike}° · H:{weatherData.forecast[0]?.high}° L:{weatherData.forecast[0]?.low}°
                </div>
              </motion.div>

              {/* Stats grid */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="px-4 pb-4 grid grid-cols-2 gap-3"
              >
                {[
                  { icon: <Droplets className="w-5 h-5" />, label: t.humidity, value: `${weatherData.current.humidity}%` },
                  { icon: <Wind className="w-5 h-5" />, label: t.windSpeed, value: `${weatherData.current.windSpeed} km/h` },
                  { icon: <Eye className="w-5 h-5" />, label: t.visibility, value: `${weatherData.current.visibility} km` },
                  { icon: <Gauge className="w-5 h-5" />, label: t.pressure, value: `${weatherData.current.pressure} hPa` },
                ].map((stat, i) => (
                  <div key={i} className="glass-card rounded-2xl p-4 flex items-center gap-3 hover:bg-white/[0.12] transition-colors">
                    <div className="text-white/60">{stat.icon}</div>
                    <div>
                      <p className="text-white/50 text-xs" style={{ fontFamily: 'var(--font-body)' }}>{stat.label}</p>
                      <p className="text-white font-semibold text-sm" style={{ fontFamily: 'var(--font-heading)' }}>{stat.value}</p>
                    </div>
                  </div>
                ))}

                <div className="glass-card rounded-2xl p-4">
                  <p className="text-white/50 text-xs mb-1">{t.uvIndex}</p>
                  <div className="flex items-end gap-2">
                    <p className="text-white font-bold text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>{weatherData.current.uvIndex}</p>
                    <p className="text-white/50 text-xs mb-1">{getUVLabel(weatherData.current.uvIndex, t)}</p>
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
                  <p className="text-white/50 text-xs mb-1">{t.airQuality}</p>
                  <p className="text-white font-bold text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>{getAQILabel(weatherData.current.airQuality, t)}</p>
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
              </motion.div>

              <SevereWeatherAlert alert={activeAlert} onDismiss={() => setActiveAlert(null)} language={language} />
              <WeatherInsights weatherData={weatherData} language={language} />
              <ForecastSwiper
                hourly={weatherData.hourly}
                forecast={weatherData.forecast}
                onHaptic={() => haptic(30)}
                language={language}
              />
              <WeatherWindow hourly={weatherData.hourly} language={language} onHaptic={() => haptic(30)} />
              <RadarView conditionCode={conditionCode} location={weatherData.location} language={language} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center">
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="text-6xl animate-bounce">🌍</div>
                  <p className="text-white/80 text-lg" style={{ fontFamily: 'var(--font-heading)' }}>
                    {geoStatus === 'loading' ? t.findingLocation : t.loadingWeather}
                  </p>
                  <div className="flex gap-1.5 justify-center">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="text-7xl animate-float-slow">🌤️</div>
                  <h2 className="text-2xl font-semibold text-white" style={{ fontFamily: 'var(--font-heading)' }}>{t.weatherAssistant}</h2>
                  <p className="text-white/60" style={{ fontFamily: 'var(--font-body)' }}>{t.searchAnyCity}</p>
                  {!apiKey && (
                    <div className="flex items-center gap-2 bg-orange-500/20 border border-orange-400/30 rounded-xl px-4 py-2 text-white/90 text-sm">
                      <span>⚠️</span>
                      <span>Add API key in settings for real weather data</span>
                    </div>
                  )}
                </motion.div>
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

        {/* Search bar */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-30 pb-safe">
          <div className="mx-3 mb-4 glass-card-strong rounded-2xl px-3 py-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder={t.searchLocation}
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full h-11 pl-9 pr-3 bg-white/10 text-white placeholder:text-white/30 rounded-xl border border-white/15 focus:border-white/40 focus:outline-none text-sm transition-all"
                  style={{ fontFamily: 'var(--font-body)' }}
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
                      ? 'bg-violet-500/40 text-violet-200'
                      : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              )}
              <button
                onClick={() => setShowSettings(true)}
                className="h-11 w-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center flex-shrink-0 transition-all bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={handleSearch}
                disabled={isLoading || !searchText.trim()}
                className="h-11 px-4 min-h-[44px] rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-medium disabled:opacity-40 transition-all flex-shrink-0"
                style={{ fontFamily: 'var(--font-heading)' }}
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
