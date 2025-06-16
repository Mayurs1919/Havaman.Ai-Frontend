
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Cloud, Sun, CloudRain } from 'lucide-react';

interface ForecastItem {
  day: string;
  high: number;
  low: number;
  condition: string;
}

interface ForecastGridProps {
  forecast: ForecastItem[];
}

const ForecastGrid = ({ forecast }: ForecastGridProps) => {
  const getWeatherIcon = (condition: string) => {
    if (condition.includes('Sunny')) return <Sun className="h-6 w-6 text-yellow-500" />;
    if (condition.includes('Rain')) return <CloudRain className="h-6 w-6 text-blue-500" />;
    return <Cloud className="h-6 w-6 text-gray-500" />;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {forecast.map((item, index) => (
        <Card key={index} className="hover:shadow-lg transition-all duration-300 hover-scale">
          <CardContent className="p-4 text-center space-y-3">
            <h4 className="font-semibold text-gray-700">{item.day}</h4>
            <div className="flex justify-center">
              {getWeatherIcon(item.condition)}
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-gray-900">{item.high}°</p>
              <p className="text-sm text-gray-500">{item.low}°</p>
            </div>
            <p className="text-xs text-gray-600">{item.condition}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ForecastGrid;
