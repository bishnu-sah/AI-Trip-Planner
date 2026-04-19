import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFeatures } from '../context/FeatureToggleContext';
import { useAuth } from '../context/AuthContext';
import WeatherPanel from '../features/weather/WeatherPanel';
import './DashboardPage.css';

type Trip = { id: string; title: string };

// Using local images downloaded to /public/images
const heroImages = [
  "/images/tajmahal.jpg",
  "/images/kerala.jpg",
  "/images/hawamahal.jpg",
  "/images/goa.jpg"
];

const allDestinations = [
  { name: 'Taj Mahal', location: 'Agra, UP', image: '/images/tajmahal.jpg', description: 'Symbol of eternal love.' },
  { name: 'Varanasi Ghats', location: 'Varanasi, UP', image: '/images/varanasi.jpg', description: 'Spiritual heart of India.' },
  { name: 'Hawa Mahal', location: 'Jaipur, Rajasthan', image: '/images/hawamahal.jpg', description: 'Palace of Winds.' },
  { name: 'Qutub Minar', location: 'Delhi', image: '/images/qutubminar.jpg', description: 'Tallest brick minaret.' },
  { name: 'Gateway of India', location: 'Mumbai', image: '/images/gateway.jpg', description: 'Colonial arch monument.' },
  { name: 'Kerala Backwaters', location: 'Kerala', image: '/images/kerala.jpg', description: 'Serene palm-lined waters.' },
  { name: 'Mysore Palace', location: 'Mysore', image: '/images/mysore.jpg', description: 'Historical royal residence.' },
  { name: 'Golden Temple', location: 'Amritsar', image: '/images/goldentemple.jpg', description: 'Holiest Gurudwara (Harmandir Sahib).' },
  { name: 'Meenakshi Temple', location: 'Madurai', image: '/images/meenakshi.jpg', description: 'Historic Hindu temple.' }
];

const DashboardPage = () => {
  const { features } = useFeatures();
  const { token } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const [popularDestinations, setPopularDestinations] = useState<any[]>([]);

  useEffect(() => {
    loadTrips();

    const interval = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    const shuffled = [...allDestinations].sort(() => 0.5 - Math.random());
    setPopularDestinations(shuffled.slice(0, 3));

    return () => clearInterval(interval);
  }, [token]);

  const loadTrips = () => {
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch('/api/trips', { headers })
      .then((r) => r.json())
      .then(setTrips)
      .catch(() => setTrips([]));
  };

  const handleDeleteTrip = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      return;
    }

    setDeleting(id);
    try {
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/trips/${id}`, {
        method: 'DELETE',
        headers
      });

      if (!res.ok) {
        throw new Error('Failed to delete trip');
      }

      setTrips(trips.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting trip:', error);
      alert('Failed to delete trip. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-hero">
        <div className="hero-content">
          <h1>Welcome to Your Trip Planner</h1>
          <p>Plan your perfect journey across incredible India</p>
          {features.trips && (
            <Link to="/create" className="btn-create-trip">
              ✈️ Create New Trip
            </Link>
          )}
        </div>

        <div className="hero-image" style={{ position: 'relative', overflow: 'hidden' }}>
          {heroImages.map((img, index) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                // Opacity adjusted for brightness
                backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.4)), url(${img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: currentHeroImage === index ? 1 : 0,
                transition: 'opacity 1s ease-in-out',
                zIndex: -1
              }}
            />
          ))}
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Your Trips</h2>
        <div className="trips-grid">
          {trips.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🗺️</div>
              <h3>No trips yet</h3>
              <p>Start planning your first adventure!</p>
              {features.trips && (
                <Link to="/create" className="btn-create-trip">
                  Create Your First Trip
                </Link>
              )}
            </div>
          ) : (
            trips.map((t) => (
              <div key={t.id} className="trip-card">
                <h3>{t.title}</h3>
                <div className="trip-card-actions">
                  <Link to={`/trips/${t.id}`} className="trip-link">
                    View Details →
                  </Link>
                  <button
                    onClick={() => handleDeleteTrip(t.id)}
                    className="btn-delete-trip"
                    disabled={deleting === t.id}
                    title="Delete trip"
                  >
                    {deleting === t.id ? 'Deleting...' : '🗑️ Delete'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Popular Destinations in India</h2>
        <div className="destinations-grid">
          {popularDestinations.map((dest, idx) => (
            <Link
              key={idx}
              to={`/places?q=${encodeURIComponent(dest.name)}`}
              className="destination-card-small clickable"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <img src={dest.image} alt={dest.name} />
              <div className="destination-info">
                <h3>{dest.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{dest.location}</p>
                <p style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>{dest.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="dashboard-features">
        {features.weather && <WeatherPanel />}
      </div>

      <div className="dashboard-section" style={{ marginTop: '3rem', borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
        <h2>About AI Trip Planner</h2>
        <div className="card" style={{ background: 'var(--bg-deep)', color: 'var(--text-main)', lineHeight: '1.6', border: '1px solid var(--glass-border)' }}>
          <p>
            Welcome to AI Trip Planner, your ultimate companion for exploring the diverse and beautiful markets, monuments, and landscapes of India.
            Our mission is to simplify travel planning using advanced AI technology.
          </p>
          <p>
            Whether you're looking for the spiritual serenity of Varanasi, the architectural marvels of Rajasthan, or the bustling streets of Mumbai,
            we help you create personalized itineraries that suit your travel style.
          </p>
          <p>
            <strong>Built with ❤️ for travelers.</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
