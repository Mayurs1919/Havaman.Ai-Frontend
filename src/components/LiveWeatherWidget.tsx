import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Droplets, Wind, Eye, Thermometer } from 'lucide-react';

interface WeatherPreview {
  city: string;
  temp: number;
  condition: string;
  emoji: string;
  humidity: number;
  wind: number;
  feelsLike: number;
}

const cities: WeatherPreview[] = [
  { city: 'Mumbai', temp: 32, condition: 'Partly Cloudy', emoji: '⛅', humidity: 72, wind: 14, feelsLike: 36 },
  { city: 'London', temp: 12, condition: 'Rainy', emoji: '🌧️', humidity: 88, wind: 22, feelsLike: 9 },
  { city: 'Tokyo', temp: 18, condition: 'Clear', emoji: '☀️', humidity: 55, wind: 8, feelsLike: 17 },
  { city: 'New York', temp: 8, condition: 'Cloudy', emoji: '☁️', humidity: 65, wind: 18, feelsLike: 4 },
  { city: 'Dubai', temp: 38, condition: 'Sunny', emoji: '☀️', humidity: 30, wind: 12, feelsLike: 42 },
];

const LiveWeatherWidget: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % cities.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const city = cities[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="w-full max-w-md"
    >
      <div className="rounded-2xl bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.3)]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/50 text-xs font-medium" style={{ fontFamily: 'var(--font-heading)' }}>Live Weather Preview</span>
          </div>
          <div className="flex gap-1">
            {cities.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIndex ? 'bg-white/60 w-3' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-3.5 h-3.5 text-white/40" />
              <span className="text-white/70 text-sm">{city.city}</span>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl text-white/10 mr-2">{city.emoji}</span>
                <span className="text-4xl font-light text-white" style={{ fontFamily: 'var(--font-heading)' }}>{city.temp}°</span>
                <span className="text-white/40 text-sm ml-1">C</span>
              </div>
              <div className="text-right">
                <p className="text-white/70 text-sm">{city.condition}</p>
                <p className="text-white/40 text-xs flex items-center gap-1 justify-end">
                  <Thermometer className="w-3 h-3" />
                  Feels {city.feelsLike}°
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Droplets, label: 'Humidity', value: `${city.humidity}%` },
                { icon: Wind, label: 'Wind', value: `${city.wind} km/h` },
                { icon: Eye, label: 'Visibility', value: '10 km' },
              ].map((stat, i) => (
                <div key={i} className="bg-white/[0.04] rounded-xl p-2.5 text-center border border-white/[0.06]">
                  <stat.icon className="w-3.5 h-3.5 text-white/30 mx-auto mb-1" />
                  <p className="text-white/80 text-xs font-medium">{stat.value}</p>
                  <p className="text-white/30 text-[9px]">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default LiveWeatherWidget;
