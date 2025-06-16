
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface WeatherCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  description: string;
}

const WeatherCard = ({ icon, title, value, description }: WeatherCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover-scale">
      <CardContent className="p-6 text-center space-y-3">
        <div className="flex justify-center">{icon}</div>
        <div>
          <h3 className="font-semibold text-gray-700 mb-1">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherCard;
