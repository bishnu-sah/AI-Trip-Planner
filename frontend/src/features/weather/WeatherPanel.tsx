import { useEffect, useState } from 'react';
import './WeatherPanel.css';

type Weather = { forecast: string; temperatureC: number; placeId?: string };

interface WeatherPanelProps {
  location?: string;
  city?: string;
}

const WeatherPanel = ({ location, city }: WeatherPanelProps) => {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const place = location || city || 'Delhi';
    setLoading(true);
    fetch(`/api/weather/${encodeURIComponent(place)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setWeather(data);
        setLoading(false);
      })
      .catch(() => {
        setWeather(null);
        setLoading(false);
      });
  }, [location, city]);

  return (
    <div className="card weather-card">
      <h3>🌤️ Weather</h3>
      {loading ? (
        <p>Loading weather...</p>
      ) : !weather ? (
        <p>No weather data available</p>
      ) : (
        <div className="weather-info">
          <div className="weather-temp">{weather.temperatureC}°C</div>
          <div className="weather-forecast">{weather.forecast}</div>
          {weather.placeId && <div className="weather-location">📍 {weather.placeId}</div>}
        </div>
      )}
    </div>
  );
};

export default WeatherPanel;

