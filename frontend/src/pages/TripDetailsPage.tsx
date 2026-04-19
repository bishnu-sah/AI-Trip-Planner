import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import WeatherPanel from '../features/weather/WeatherPanel';
import HotelPanel from '../features/hotels/HotelPanel';
import ChatWidget from '../features/chat-assistant/ChatWidget';
import { useFeatures } from '../context/FeatureToggleContext';
import './TripDetailsPage.css';

type Trip = {
  id: string;
  title: string;
  travelerName: string;
  budget?: string;
  budgetEstimate?: {
    total: string;
    currency: string;
    breakdown: Array<{ category: string; amount: string; description: string }>;
  };
  status: string;
  days: Array<{
    date: string;
    places: Array<{ id: string; name: string; country: string }>;
    notes?: string;
  }>;
  createdAt: string;
};

const TripDetailsPage = () => {
  const { id } = useParams();
  const { features } = useFeatures();
  const { token } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const [downloading, setDownloading] = useState(false);
  const [estimating, setEstimating] = useState(false);

  const fetchTrip = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/trips/${id}`, { headers });
      if (!res.ok) throw new Error('Failed to load trip');
      const data = await res.json();
      setTrip(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trip');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrip();
  }, [id, token]);

  const handleDownloadPDF = async () => {
    if (!id || !token) return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/pdf/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trip-plan-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error", error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleEstimateBudget = async () => {
    if (!id || !token) return;
    setEstimating(true);
    try {
      const res = await fetch(`/api/trips/${id}/estimate-budget`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to estimate budget');
      const updatedTrip = await res.json();
      setTrip(updatedTrip);
    } catch (err) {
      alert('Failed to estimate budget. Please try again.');
    } finally {
      setEstimating(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-state">Loading trip details...</div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="page">
        <div className="error-state">
          <p>❌ {error || 'Trip not found'}</p>
          <Link to="/" className="btn-back">← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page trip-details-page">
      <Link to="/" className="btn-back">← Back to Dashboard</Link>

      <div className="trip-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>{trip.title}</h1>
            <div className="trip-meta">
              <span>📍 {trip.days.length} days</span>
              <span>👤 {trip.travelerName}</span>
              <span>📅 {new Date(trip.createdAt).toLocaleDateString()}</span>
              {trip.budget && <span>💰 {trip.budget} Budget</span>}
              <span className={`status status-${trip.status}`}>{trip.status}</span>
            </div>
          </div>
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            style={{
              padding: '0.8rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer',
              opacity: downloading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
            }}
          >
            {downloading ? (
              <>⌛ Generating...</>
            ) : (
              <>📥 Download PDF</>
            )}
          </button>
        </div>
      </div>

      {trip.budgetEstimate ? (
        <div className="card budget-card" style={{ marginBottom: '20px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              💰 Estimated Budget Breakup
            </h3>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fbbf24' }}>
              Total: {trip.budgetEstimate.total}
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e2e8f0' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #444', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Category</th>
                  <th style={{ padding: '10px' }}>Amount</th>
                  <th style={{ padding: '10px' }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {trip.budgetEstimate.breakdown.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '10px', fontWeight: '500' }}>{item.category}</td>
                    <td style={{ padding: '10px', color: '#fbbf24' }}>{item.amount}</td>
                    <td style={{ padding: '10px', color: '#94a3b8', fontSize: '0.9rem' }}>{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card" style={{ marginBottom: '20px', textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: '#888', marginBottom: '1rem' }}>No budget estimation available for this trip yet.</p>
          <button
            onClick={handleEstimateBudget}
            disabled={estimating}
            style={{
              padding: '0.8rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer',
              opacity: estimating ? 0.7 : 1
            }}
          >
            {estimating ? '🤖 Estimating...' : '✨ Estimate Budget with AI'}
          </button>
        </div>
      )}

      <div className="trip-days">
        {trip.days.map((day, idx) => (
          <div key={idx} className="card day-card">
            <div className="day-header">
              <h2>Day {idx + 1}</h2>
              <span className="day-date">
                {new Date(day.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>

            {day.places && day.places.length > 0 && (
              <div className="day-places">
                <h3>📍 Places to Visit</h3>
                <ul>
                  {day.places.map((place, pIdx) => (
                    <li key={pIdx}>
                      <strong>{place.name}</strong>
                      {place.country && <span className="country">, {place.country}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {day.notes && (
              <div className="day-notes">
                <h3>📝 Itinerary Notes</h3>
                <p>{day.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="trip-features">
        {features.weather && (
          <WeatherPanel
            location={trip.days[0]?.places[0]?.name}
            city={trip.days[0]?.places[0]?.name}
          />
        )}
        {features.hotels && (
          <HotelPanel
            city={trip.days[0]?.places[0]?.name || 'Delhi'}
            location={trip.days[0]?.places[0]?.name}
          />
        )}
        {features.chatAssistant && <ChatWidget />}
      </div>
    </div>
  );
};

export default TripDetailsPage;

