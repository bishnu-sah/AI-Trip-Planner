import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

type Hotel = {
  name: string;
  rating?: string;
  priceLevel?: string;
  description?: string;
};

type Place = {
  id: string;
  name: string;
  country: string;
  description: string;
  imageUrl: string;
  nearbyPlaces: string[];
  hotels: Hotel[];
};

const PlaceSearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [term, setTerm] = useState(searchParams.get('q') || '');
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setTerm(q);
      search(q);
    } else {
      // Load from persistence if no query param
      const savedPlace = localStorage.getItem('last_searched_place');
      const savedTerm = localStorage.getItem('last_search_term');
      if (savedPlace) {
        setPlace(JSON.parse(savedPlace));
        if (savedTerm) setTerm(savedTerm);
      }
    }
  }, [searchParams]);

  const search = async (searchTerm: string = term) => {
    const query = searchTerm.trim();
    if (!query) return;

    setLoading(true);
    setError('');
    // Note: We don't clear the previous place immediately to avoid jumping UI
    try {
      const res = await fetch(`/api/places/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to fetch place');
      }
      const data = await res.json();
      setPlace(data);
      // Save to persistence
      localStorage.setItem('last_searched_place', JSON.stringify(data));
      localStorage.setItem('last_search_term', query);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Could not find information for this place. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') search();
  };

  return (
    <div className="page" style={{
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      minHeight: '100vh',
      color: 'var(--text-main)'
    }}>
      {/* Search Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '800',
          color: 'var(--text-main)',
          marginBottom: '1rem'
        }}>
          Explore the World
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Discover stunning destinations, local secrets, and the best places to stay.
        </p>
      </div>

      {/* Search Bar */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        marginBottom: '4rem',
        maxWidth: '700px',
        margin: '0 auto 4rem auto'
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Where do you want to go?"
            style={{
              width: '100%',
              padding: '1.2rem 2rem',
              borderRadius: '12px',
              border: '1px solid var(--glass-border)',
              background: 'white',
              color: 'var(--text-main)',
              fontSize: '1.1rem',
              outline: 'none'
            }}
          />
          <div style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)'
          }}>
            <button
              onClick={() => search()}
              disabled={loading}
              style={{
                padding: '0.8rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--gradient-vibrant)',
                color: 'white',
                fontWeight: '900',
                cursor: 'pointer',
                boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)'
              }}
            >
              Explore
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <div className="spinner" style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255,255,255,0.1)',
            borderTop: '4px solid var(--accent-emerald)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Searching...</p>
        </div>
      )}

      {error && (
        <div style={{ textAlign: 'center', color: '#ef4444', marginTop: '2rem' }}>
          {error}
        </div>
      )}

      {place && !loading && (
        <div>
          {/* Hero Section */}
          <div style={{
            position: 'relative',
            borderRadius: '24px',
            overflow: 'hidden',
            marginBottom: '3rem',
            height: '400px'
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: `url(${place.imageUrl}) center/cover no-repeat`
            }} />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '2rem',
              left: '2rem',
              right: '2rem',
              textAlign: 'center',
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(8px)',
              padding: '2rem',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <span style={{ color: 'var(--accent-teal)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>{place.country}</span>
              <h2 style={{ fontSize: '4rem', fontWeight: '900', margin: 0, color: 'white' }}>{place.name}</h2>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '4rem' }}>
            {/* Left Column: Description & Nearby Places */}
            <div>
              <section style={{ marginBottom: '5rem' }}>
                <h3 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-main)', letterSpacing: '-1px' }}>
                  <span style={{ width: '10px', height: '32px', background: 'var(--accent-emerald)', borderRadius: '6px' }}></span>
                  About {place.name}
                </h3>
                <p style={{ fontSize: '1.3rem', lineHeight: '2', color: 'var(--text-muted)', whiteSpace: 'pre-line', fontWeight: '500' }}>
                  {place.description}
                </p>
              </section>

              {place.nearbyPlaces && place.nearbyPlaces.length > 0 && (
                <section style={{ marginBottom: '5rem' }}>
                  <h3 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-main)', letterSpacing: '-1px' }}>
                    <span style={{ width: '10px', height: '32px', background: 'var(--accent-blue)', borderRadius: '6px' }}></span>
                    Nearby Attractions
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: '1.5rem'
                  }}>
                    {place.nearbyPlaces.map((spot, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setTerm(spot);
                          navigate(`/places?q=${encodeURIComponent(spot)}`);
                        }}
                        style={{
                          background: 'var(--bg-card)',
                          padding: '1.5rem 2rem',
                          borderRadius: '24px',
                          border: '1px solid var(--glass-border)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1.25rem',
                          transition: 'all 0.4s ease',
                          cursor: 'pointer',
                          boxShadow: 'var(--glass-shadow)'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'translateY(-5px)';
                          e.currentTarget.style.borderColor = 'var(--accent-purple)';
                          e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.05)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.borderColor = 'var(--glass-border)';
                          e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.02)';
                        }}
                      >
                        <span style={{ fontSize: '2rem' }}>📍</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '1.1rem' }}>{spot}</span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', fontWeight: '700' }}>Explore now</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right Column: Hotel Recommendations */}
            <div>
              <h3 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-main)', letterSpacing: '-1px' }}>
                <span style={{ width: '10px', height: '32px', background: 'var(--accent-rose)', borderRadius: '6px' }}></span>
                Stay Highlights
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {place.hotels.map((hotel, index) => (
                  <div key={index} style={{
                    background: 'var(--bg-card)',
                    borderRadius: '32px',
                    padding: '2.5rem',
                    border: '1px solid var(--glass-border)',
                    transition: 'all 0.4s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: 'var(--glass-shadow)'
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--accent-blue)';
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.05)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--glass-border)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.02)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '1.5rem', fontWeight: '900', flex: 1, marginRight: '1rem', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>{hotel.name}</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                        <span style={{ color: 'var(--accent-emerald)', fontSize: '1.2rem', fontWeight: '900' }}>★ {hotel.rating}</span>
                        <span style={{
                          fontSize: '0.85rem',
                          background: 'rgba(45, 212, 191, 0.1)',
                          color: 'var(--accent-teal)',
                          padding: '4px 12px',
                          borderRadius: '100px',
                          fontWeight: '800',
                          border: '1px solid rgba(45, 212, 191, 0.2)'
                        }}>{hotel.priceLevel}</span>
                      </div>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.7', margin: 0, fontWeight: '500' }}>
                      {hotel.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { 
          0% { transform: rotate(0deg); } 
          100% { transform: rotate(360deg); } 
        }
        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(30px) scale(0.98); } 
          to { opacity: 1; transform: translateY(0) scale(1); } 
        }
        ::placeholder {
          color: #64748b;
        }
      `}</style>
    </div>
  );
};

export default PlaceSearchPage;
