import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { WeatherData } from '@/hooks/useWeather';
import { getTranslations } from '@/utils/translations';

interface Insight {
  emoji: string;
  title: string;
  description: string;
  priority: number;
}

const getInsights = (data: WeatherData, t: any): Insight[] => {
  const insights: Insight[] = [];
  const { current, conditionCode } = data;

  if (current.uvIndex >= 8) {
    insights.push({ emoji: '🕶️', title: t.sunscreenEssential, description: 'Very high UV · SPF 50+', priority: 1 });
  } else if (current.uvIndex >= 6) {
    insights.push({ emoji: '🕶️', title: t.wearSunglasses, description: 'High UV · SPF 30 recommended', priority: 2 });
  }

  if (conditionCode === 'Rain' || conditionCode === 'Drizzle' || conditionCode === 'Thunderstorm') {
    insights.push({ emoji: '☂️', title: t.takeUmbrella, description: 'Rain expected today', priority: 1 });
  }

  if (current.temperature >= 35) {
    insights.push({ emoji: '🌊', title: t.stayHydrated, description: 'Extreme heat · Drink water often', priority: 1 });
    insights.push({ emoji: '👕', title: t.lightClothing, description: 'Wear breathable fabrics', priority: 2 });
  } else if (current.temperature >= 25) {
    insights.push({ emoji: '👕', title: t.lightClothing, description: 'T-shirt weather', priority: 3 });
  } else if (current.temperature <= 0) {
    insights.push({ emoji: '🧥', title: t.heavyCoat, description: 'Below freezing · Stay warm', priority: 1 });
    insights.push({ emoji: '🧤', title: t.glovesScarf, description: 'Protect extremities', priority: 2 });
  } else if (current.temperature <= 10) {
    insights.push({ emoji: '🧥', title: t.wearJacket, description: 'Cold conditions', priority: 2 });
  } else if (current.temperature <= 18) {
    insights.push({ emoji: '🧣', title: t.layerUp, description: 'Cool weather today', priority: 3 });
  }

  if (current.windSpeed >= 40) {
    insights.push({ emoji: '💨', title: t.holdHat, description: 'Very gusty winds', priority: 1 });
  } else if (current.windSpeed >= 25) {
    insights.push({ emoji: '💨', title: t.windyConditions, description: 'Secure loose items', priority: 2 });
  }

  if (current.humidity >= 85) {
    insights.push({ emoji: '💧', title: t.veryHumid, description: 'Wear breathable fabrics', priority: 2 });
  }

  if (conditionCode === 'Snow') {
    insights.push({ emoji: '🥾', title: t.wearBoots, description: 'Snowy & slippery roads', priority: 1 });
  }

  if (current.airQuality >= 4) {
    insights.push({ emoji: '😷', title: t.poorAirQuality, description: 'Consider wearing a mask', priority: 1 });
  }

  return insights.sort((a, b) => a.priority - b.priority).slice(0, 4);
};

interface WeatherInsightsProps {
  weatherData: WeatherData;
  language: string;
}

const WeatherInsights = ({ weatherData, language }: WeatherInsightsProps) => {
  const t = getTranslations(language);
  const insights = getInsights(weatherData, t);
  
  if (insights.length === 0) return null;
  
  return (
    <div className="px-4 pb-4">
      {/* AI Assistant Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card-strong ai-glow rounded-2xl p-4 mb-3"
      >
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500/30 to-blue-500/30 flex items-center justify-center border border-violet-400/20">
            <Sparkles className="w-4 h-4 text-violet-300" />
          </div>
          <div>
            <h3 className="text-white text-sm font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
              {t.whatToWear}
            </h3>
            <p className="text-white/40 text-[10px]">AI-powered clothing suggestions</p>
          </div>
        </div>

        {/* Primary insight as AI message */}
        <div className="bg-white/[0.06] rounded-xl p-3 border border-white/[0.08]">
          <p className="text-white/90 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
            <span className="text-lg mr-1.5">{insights[0].emoji}</span>
            <span className="font-medium">{insights[0].title}</span>
            <span className="text-white/50"> — {insights[0].description}</span>
          </p>
        </div>
      </motion.div>

      {/* Secondary insights as cards */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {insights.slice(1).map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 * (i + 1) }}
            className="flex-shrink-0 glass-card rounded-2xl px-4 py-3 min-w-[120px] text-center space-y-1.5 hover:bg-white/[0.12] transition-colors"
          >
            <div className="text-2xl">{insight.emoji}</div>
            <p className="text-white text-xs font-semibold leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              {insight.title}
            </p>
            <p className="text-white/50 text-[10px] leading-tight">{insight.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WeatherInsights;
