import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './CreateTripPage.css';

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

const CreateTripPage = () => {
  const { token } = useAuth();
  const [origin, setOrigin] = useState('Delhi');
  const [keyword, setKeyword] = useState('Taj Mahal');
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState('Standard');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState<string>('');
  const [saveMessage, setSaveMessage] = useState<string>('');
  const navigate = useNavigate();

  const submit = async () => {
    setLoading(true);
    setError('');
    setTrip(null);

    try {
      console.log('[CreateTripPage] Submitting trip request:', { origin, keyword, days });

      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/trips/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ origin, destinationKeywords: keyword, days, budget })
      });

      // Get response text first to handle errors better
      const responseText = await res.text();
      console.log('[CreateTripPage] Response status:', res.status);
      console.log('[CreateTripPage] Response text length:', responseText.length);
      console.log('[CreateTripPage] Response preview:', responseText.substring(0, 200));

      if (!res.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { message: responseText || 'Failed to generate trip' };
        }
        console.error('[CreateTripPage] API error:', errorData);
        console.error('[CreateTripPage] Full error response:', responseText);

        // Show detailed error message
        const errorMessage = errorData.error || errorData.message || 'Failed to generate trip';
        const errorDetails = errorData.details ? `\n\nDetails: ${errorData.details}` : '';
        throw new Error(`${errorMessage}${errorDetails}`);
      }

      // Parse JSON response
      let data;
      try {
        if (!responseText || responseText.trim() === '') {
          throw new Error('Empty response from server');
        }
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('[CreateTripPage] JSON parse error:', parseError);
        console.error('[CreateTripPage] Response text:', responseText);
        throw new Error('Invalid response from server. Please check backend logs.');
      }

      console.log('[CreateTripPage] Trip received:', data);
      console.log('[CreateTripPage] Trip days:', data.days?.length);

      if (!data || !data.id) {
        throw new Error('Invalid trip data received');
      }

      setTrip(data);
      setSaveMessage(''); // Clear any previous save message
    } catch (err) {
      console.error('[CreateTripPage] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate trip');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!trip) return;

    setSaving(true);
    setSaveMessage('');
    setError('');

    try {
      console.log('[CreateTripPage] Saving trip:', trip.id);
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/trips/save', {
        method: 'POST',
        headers,
        body: JSON.stringify(trip)
      });

      const responseText = await res.text();
      console.log('[CreateTripPage] Save response status:', res.status);
      console.log('[CreateTripPage] Save response:', responseText.substring(0, 200));

      if (!res.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { message: responseText || 'Failed to save trip' };
        }
        throw new Error(errorData.message || errorData.error || 'Failed to save trip');
      }

      let savedTrip;
      try {
        savedTrip = JSON.parse(responseText);
      } catch {
        throw new Error('Invalid response from server');
      }

      // Preserve the original trip data structure
      setTrip(savedTrip);
      setSaveMessage('✅ Trip saved successfully to database!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error('[CreateTripPage] Save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save trip');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page create-trip-page">
      <h1>Create New Trip</h1>

      <div className="card trip-form-card">
        <h2>Trip Details</h2>
        <div className="form-group">
          <label>
            Origin City
            <input
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g., Delhi, Mumbai"
            />
          </label>
        </div>
        <div className="form-group">
          <label>
            Destination Keywords
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g., Taj Mahal, Golden Temple"
            />
          </label>
        </div>
        <div className="form-group">
          <label>
            Number of Days
            <input
              type="number"
              min="1"
              max="30"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            />
          </label>
        </div>
        <div className="form-group">
          <label>
            Budget Level
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'white', color: 'var(--text-main)' }}
            >
              <option value="Budget">Budget (Economical)</option>
              <option value="Standard">Standard (Comfortable)</option>
              <option value="Luxury">Luxury (Premium)</option>
            </select>
          </label>
        </div>
        <button
          onClick={submit}
          className="btn-generate"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              <span>AI is generating your personalized itinerary...</span>
            </>
          ) : (
            '✨ Generate Itinerary with AI'
          )}
        </button>
        {loading && (
          <div className="loading-info">
            <p>🤖 AI is analyzing your destinations and creating a detailed plan...</p>
            <p>This may take 2-5 seconds</p>
          </div>
        )}
      </div>

      {error && (
        <div className="card error-card">
          <h3 style={{ marginTop: 0, marginBottom: '12px', color: '#dc2626' }}>❌ Error</h3>
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{error}</p>
          <p style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>
            💡 Check the browser console (F12) and backend logs for more details.
          </p>
        </div>
      )}

      {saveMessage && (
        <div className="card success-card">
          <p style={{ margin: 0, color: '#10b981' }}>{saveMessage}</p>
        </div>
      )}

      {trip && (
        <div className="trip-result">
          <div className="card trip-header-card">
            <h2>{trip.title}</h2>
            <p className="trip-meta">
              <span>📍 {trip.days.length} days</span>
              <span>👤 {trip.travelerName}</span>
              <span>📅 Created: {new Date(trip.createdAt).toLocaleDateString()}</span>
            </p>
            <div className="trip-actions">
              <button
                onClick={handleSaveTrip}
                className="btn-save-trip"
                disabled={saving}
              >
                {saving ? '💾 Saving...' : '💾 Save Trip'}
              </button>
              <button
                onClick={() => navigate(`/trips/${trip.id}`)}
                className="btn-view-details"
              >
                View Full Details →
              </button>
            </div>
          </div>

          {trip.budgetEstimate && (
            <div className="card budget-card" style={{ marginBottom: '20px', borderLeft: '4px solid #f59e0b', background: 'var(--bg-amber-soft)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  💰 Estimated Budget Breakup
                </h3>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#d97706' }}>
                  Total: {trip.budgetEstimate.total}
                </span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-main)' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #444', textAlign: 'left' }}>
                      <th style={{ padding: '10px', color: 'var(--text-muted)' }}>Category</th>
                      <th style={{ padding: '10px' }}>Amount</th>
                      <th style={{ padding: '10px' }}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trip.budgetEstimate.breakdown.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #333' }}>
                        <td style={{ padding: '10px', fontWeight: '500' }}>{item.category}</td>
                        <td style={{ padding: '10px', color: '#d97706', fontWeight: 'bold' }}>{item.amount}</td>
                        <td style={{ padding: '10px', color: '#94a3b8', fontSize: '0.9rem' }}>{item.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="trip-days">
            {trip.days.map((day, idx) => (
              <div key={idx} className="card day-card">
                <div className="day-header">
                  <h3>Day {idx + 1}</h3>
                  <span className="day-date">{new Date(day.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>

                {day.places && day.places.length > 0 && (
                  <div className="day-places">
                    <h4>📍 Places to Visit:</h4>
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
                    <h4>📝 Notes:</h4>
                    <p>{day.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTripPage;

