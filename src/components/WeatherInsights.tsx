import React from 'react';
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
      <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-3">
        {t.whatToWear}
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {insights.map((insight, i) => (
          <div
            key={i}
            className="flex-shrink-0 glass-card rounded-2xl px-4 py-3 min-w-[120px] text-center space-y-1"
          >
            <div className="text-3xl">{insight.emoji}</div>
            <p className="text-white text-xs font-semibold leading-tight">{insight.title}</p>
            <p className="text-white/60 text-xs leading-tight">{insight.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherInsights;
