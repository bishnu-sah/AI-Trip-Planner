import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

type Trip = { id: string; title: string, days: any[] };

const ExportPage = () => {
  const { token } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // Fetch user trips
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch('/api/trips', { headers });
        if (res.ok) {
          const data = await res.json();
          setTrips(data);
        }
      } catch (error) {
        console.error("Failed to fetch trips", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [token]);

  const handleExport = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!selectedTrip) return;

    setDownloading(true);
    try {
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/pdf/${selectedTrip}`, { headers });
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trip-plan-${selectedTrip}.pdf`;
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

  return (
    <div className="page" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{
          fontSize: '2.5rem',
          color: 'var(--accent-blue)',
          marginBottom: '1rem'
        }}>
          Export Your Memories
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Download your itineraries as PDF to take them offline.</p>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Left Column: Trip Selection */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>Select a Trip</h3>
          {loading ? (
            <div style={{ color: '#666' }}>Loading trips...</div>
          ) : trips.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
              No trips found. Create one first!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {trips.map(trip => (
                <div
                  key={trip.id}
                  onClick={() => setSelectedTrip(trip.id)}
                  style={{
                    padding: '1.5rem',
                    borderRadius: '12px',
                    background: selectedTrip === trip.id
                      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)'
                      : 'var(--bg-ocean-soft)',
                    border: selectedTrip === trip.id
                      ? '1px solid var(--accent-blue)'
                      : '1px solid var(--glass-border)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem' }}>{trip.title}</h4>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{trip.days.length} Days</span>
                  </div>
                  {selectedTrip === trip.id && (
                    <span style={{ color: '#3b82f6', fontSize: '1.5rem' }}>✓</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Preview/Action */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div className="card" style={{
            height: '100%',
            background: 'var(--bg-deep)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '3rem',
            textAlign: 'center',
            border: '1px dashed var(--glass-border)'
          }}>
            {!selectedTrip ? (
              <>
                <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.3 }}>📄</div>
                <p style={{ color: '#666' }}>Select a trip to see export options</p>
              </>
            ) : (
              <>
                <div style={{ fontSize: '4rem', marginBottom: '1rem', color: '#10b981' }}>PDF</div>
                <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>Ready to Export</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Generates a high-quality PDF with your full itinerary.</p>

                <button
                  onClick={handleExport}
                  disabled={downloading}
                  style={{
                    padding: '1rem 2rem',
                    borderRadius: '50px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                    color: 'white',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                    opacity: downloading ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  {downloading ? (
                    <>
                      <span className="spinner" /> Generating...
                    </>
                  ) : (
                    <>Download PDF</>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <style>{`
            .spinner {
                width: 20px;
                height: 20px;
                border: 2px solid rgba(255,255,255,0.3);
                border-top: 2px solid white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                display: inline-block;
            }
        `}</style>
    </div>
  );
};

export default ExportPage;

