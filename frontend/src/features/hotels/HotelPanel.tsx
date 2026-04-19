import { useEffect, useState } from 'react';
import './HotelPanel.css';

type Hotel = {
  id: string;
  name: string;
  location: string;
  city: string;
  rating?: number;
  priceRange?: string;
  description?: string;
  amenities?: string[];
  distance?: string;
};

interface HotelPanelProps {
  city?: string;
  location?: string;
}

const HotelPanel = ({ city, location }: HotelPanelProps) => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchCity = city || 'Delhi';
    setLoading(true);
    const url = location 
      ? `/api/hotels?city=${encodeURIComponent(searchCity)}&location=${encodeURIComponent(location)}`
      : `/api/hotels?city=${encodeURIComponent(searchCity)}`;
    
    fetch(url)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setHotels(data);
        setLoading(false);
      })
      .catch(() => {
        setHotels([]);
        setLoading(false);
      });
  }, [city, location]);

  return (
    <div className="card hotels-card">
      <h3>🏨 Hotel Recommendations</h3>
      {loading ? (
        <p>Loading hotels...</p>
      ) : hotels.length === 0 ? (
        <p>No hotels found</p>
      ) : (
        <div className="hotels-list">
          {hotels.slice(0, 5).map((hotel) => (
            <div key={hotel.id} className="hotel-item">
              <div className="hotel-header">
                <h4>{hotel.name}</h4>
                {hotel.rating && (
                  <div className="hotel-rating">
                    ⭐ {hotel.rating.toFixed(1)}
                  </div>
                )}
              </div>
              <div className="hotel-location">📍 {hotel.location}, {hotel.city}</div>
              {hotel.priceRange && (
                <div className="hotel-price">💰 {hotel.priceRange}</div>
              )}
              {hotel.description && (
                <p className="hotel-description">{hotel.description}</p>
              )}
              {hotel.amenities && hotel.amenities.length > 0 && (
                <div className="hotel-amenities">
                  {hotel.amenities.slice(0, 4).map((amenity, idx) => (
                    <span key={idx} className="amenity-tag">{amenity}</span>
                  ))}
                </div>
              )}
              {hotel.distance && (
                <div className="hotel-distance">📏 {hotel.distance}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HotelPanel;

