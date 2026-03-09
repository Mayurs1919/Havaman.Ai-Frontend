import React, { useState, useRef } from 'react';
import { HourlyItem, ForecastItem } from '@/hooks/useWeather';

const getWeatherEmoji = (conditionCode: string): string => {
  const map: Record<string, string> = {
    Clear: '☀️',
    Clouds: '☁️',
    Rain: '🌧️',
    Drizzle: '🌦️',
    Thunderstorm: '⛈️',
    Snow: '🌨️',
    Mist: '🌫️',
    Fog: '🌫️',
  };
  return map[conditionCode] || '🌤️';
};

interface ForecastSwiperProps {
  hourly: HourlyItem[];
  forecast: ForecastItem[];
  onHaptic?: () => void;
}

const ForecastSwiper = ({ hourly, forecast, onHaptic }: ForecastSwiperProps) => {
  const [activeTab, setActiveTab] = useState<'hourly' | 'daily'>('hourly');
  const touchStartX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 60) {
      if (diff > 0 && activeTab === 'hourly') {
        setActiveTab('daily');
        onHaptic?.();
      } else if (diff < 0 && activeTab === 'daily') {
        setActiveTab('hourly');
        onHaptic?.();
      }
    }
  };

  return (
    <div className="px-4 pb-4">
      <div className="flex glass-card rounded-2xl p-1 mb-4 gap-1">
        <button
          onClick={() => { setActiveTab('hourly'); onHaptic?.(); }}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 min-h-[44px] ${
            activeTab === 'hourly'
              ? 'bg-white/25 text-white shadow-sm'
              : 'text-white/60'
          }`}
        >
          Hourly
        </button>
        <button
          onClick={() => { setActiveTab('daily'); onHaptic?.(); }}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 min-h-[44px] ${
            activeTab === 'daily'
              ? 'bg-white/25 text-white shadow-sm'
              : 'text-white/60'
          }`}
        >
          5-Day
        </button>
      </div>

      <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {activeTab === 'hourly' ? (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {hourly.map((item, i) => (
              <div key={i} className="flex-shrink-0 glass-card rounded-2xl px-3 py-4 min-w-[70px] text-center space-y-2">
                <p className="text-white/70 text-xs font-medium">{item.time}</p>
                <div className="text-xl">{getWeatherEmoji(item.conditionCode)}</div>
                <p className="text-white font-bold text-sm">{item.temp}°</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {forecast.map((item, i) => (
              <div key={i} className="glass-card rounded-2xl px-4 py-3 flex items-center justify-between min-h-[56px]">
                <span className="text-white/80 text-sm font-medium w-16">{item.day}</span>
                <span className="text-xl">{getWeatherEmoji(item.conditionCode)}</span>
                <div className="flex-1 mx-4">
                  <div className="flex items-center gap-2">
                    <span className="text-white/50 text-xs">💧 {item.precipChance}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-blue-400/60 rounded-full transition-all duration-500"
                      style={{ width: `${item.precipChance}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-white font-bold text-sm">{item.high}°</span>
                  <span className="text-white/50 text-sm ml-1">{item.low}°</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex justify-center gap-1.5 mt-3">
        <div className={`h-1.5 rounded-full transition-all duration-300 ${activeTab === 'hourly' ? 'w-4 bg-white/70' : 'w-1.5 bg-white/30'}`} />
        <div className={`h-1.5 rounded-full transition-all duration-300 ${activeTab === 'daily' ? 'w-4 bg-white/70' : 'w-1.5 bg-white/30'}`} />
      </div>
    </div>
  );
};

export default ForecastSwiper;
