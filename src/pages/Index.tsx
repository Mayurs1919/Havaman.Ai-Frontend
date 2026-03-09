import WeatherDashboard from "@/components/WeatherDashboard";
import DesktopGate from "@/components/DesktopGate";

const Index = () => {
  return (
    <DesktopGate>
      <WeatherDashboard />
    </DesktopGate>
  );
};

export default Index;
