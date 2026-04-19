import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ tripsCount: 0, daysPlanned: 0 });
  const [preferences, setPreferences] = useState({
    cabinClass: 'Economy',
    dietary: 'None',
    travelStyle: 'Backpacker'
  });

  useEffect(() => {
    if (user) {
      setFormData({ username: user.username, email: user.email });
      // Fetch stats if available, or just mock count from trips
      fetch('/api/trips', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(trips => {
          if (Array.isArray(trips)) {
            setStats({
              tripsCount: trips.length,
              // @ts-ignore
              daysPlanned: trips.reduce((acc, t) => acc + (t.days?.length || 0), 0)
            });
          }
        })
        .catch(console.error);
    }
  }, [user, token]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        // In a real app, update global auth context here
        setIsEditing(false);
        alert('Profile updated! (Note: Re-login might be needed to see changes in header)');
      } else {
        alert('Failed to update profile');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{
          width: '100px', height: '100px',
          borderRadius: '50%',
          background: 'var(--gradient-colorful)',
          margin: '0 auto 1.5rem auto',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '3rem', color: 'white', fontWeight: 'bold',
          boxShadow: 'var(--glass-shadow)'
        }}>
          {user?.username.charAt(0).toUpperCase()}
        </div>
        <h1 style={{
          fontSize: '2.5rem',
          color: 'white',
          marginBottom: '0.5rem'
        }}>
          {user?.username}
        </h1>
        <p style={{ color: '#aaa', fontSize: '1.1rem' }}>{user?.email}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

        {/* Stats Section */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3>Your Journey Stats</h3>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '1.5rem', flexWrap: 'wrap', gap: '2rem' }}>
            <div style={{ textAlign: 'center', minWidth: '120px' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-amber)' }}>{stats.tripsCount}</div>
              <div style={{ color: 'var(--text-muted)' }}>Trips Planned</div>
            </div>
            <div style={{ textAlign: 'center', minWidth: '120px' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-rose)' }}>{stats.daysPlanned}</div>
              <div style={{ color: 'var(--text-muted)' }}>Days of Adventure</div>
            </div>
          </div>
        </div>

        {/* Edit Profile Section */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>Account Details</h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                style={{ background: 'transparent', border: '1px solid #666', color: '#ccc', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}
              >
                Edit
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Username</label>
              <input
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                disabled={!isEditing}
                style={{
                  width: '100%', padding: '10px', borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: isEditing ? 'rgba(0,0,0,0.2)' : 'transparent',
                  color: 'white'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email</label>
              <input
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                style={{
                  width: '100%', padding: '10px', borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: isEditing ? 'rgba(0,0,0,0.2)' : 'transparent',
                  color: 'white'
                }}
              />
            </div>

            {isEditing && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                    background: '#f59e0b', color: 'white', fontWeight: 'bold', cursor: 'pointer'
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #666',
                    background: 'transparent', color: '#ccc', cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Travel Preferences Section */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>✈️</span>
            <h3 style={{ margin: 0 }}>Travel Preferences</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.6rem', fontSize: '0.9rem', fontWeight: '600' }}>Preferred Cabin Class</label>
              <select
                value={preferences.cabinClass}
                onChange={e => setPreferences({ ...preferences, cabinClass: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border)',
                  background: 'rgba(0,0,0,0.3)',
                  color: 'white',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="Economy">Economy</option>
                <option value="Premium Economy">Premium Economy</option>
                <option value="Business">Business</option>
                <option value="First Class">First Class</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.6rem', fontSize: '0.9rem', fontWeight: '600' }}>Dietary Preferences</label>
              <select
                value={preferences.dietary}
                onChange={e => setPreferences({ ...preferences, dietary: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border)',
                  background: 'rgba(0,0,0,0.3)',
                  color: 'white',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="None">No specific preference</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Halal">Halal</option>
                <option value="Kosher">Kosher</option>
                <option value="Gluten-Free">Gluten-Free</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.6rem', fontSize: '0.9rem', fontWeight: '600' }}>Travel Style</label>
              <select
                value={preferences.travelStyle}
                onChange={e => setPreferences({ ...preferences, travelStyle: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border)',
                  background: 'rgba(0,0,0,0.3)',
                  color: 'white',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="Backpacker">Backpacker (Budget)</option>
                <option value="Relaxed">Relaxed (Mid-range)</option>
                <option value="Luxury">Luxury</option>
                <option value="Adventure">Adventure / Active</option>
                <option value="Business">Business</option>
              </select>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;

