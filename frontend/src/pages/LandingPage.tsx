import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <div className="landing-hero">
        <div className="hero-background">
          <div className="hero-overlay"></div>
          <img
            src="https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1920&q=80"
            alt="Taj Mahal"
            className="hero-image"
          />
        </div>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="gradient-text">AI Trip Planner</span>
            </h1>
            <p className="hero-subtitle">
              Discover the beauty of India with AI-powered trip planning
            </p>
            <p className="hero-description">
              Plan your perfect journey across incredible destinations like the Taj Mahal, 
              Golden Temple, and countless other breathtaking places. Let AI create your 
              personalized itinerary.
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2 className="section-title">Why Choose AI Trip Planner?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🗺️</div>
            <h3>Smart Itinerary</h3>
            <p>AI-powered planning creates the perfect route for your Indian adventure</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏛️</div>
            <h3>Iconic Destinations</h3>
            <p>Explore famous landmarks like Taj Mahal, Golden Temple, and more</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌤️</div>
            <h3>Weather Forecast</h3>
            <p>Get real-time weather updates for your travel destinations</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏨</div>
            <h3>Hotel Recommendations</h3>
            <p>Find the best accommodations near your planned destinations</p>
          </div>
        </div>
      </div>

      <div className="destinations-section">
        <h2 className="section-title">Explore Incredible India</h2>
        <div className="destinations-grid">
          <div className="destination-card">
            <img
              src="https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80"
              alt="Taj Mahal"
              className="destination-image"
            />
            <div className="destination-overlay">
              <h3>Taj Mahal</h3>
              <p>Agra, Uttar Pradesh</p>
            </div>
          </div>
          <div className="destination-card">
            <img
              src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80"
              alt="Golden Temple"
              className="destination-image"
            />
            <div className="destination-overlay">
              <h3>Golden Temple</h3>
              <p>Amritsar, Punjab</p>
            </div>
          </div>
          <div className="destination-card">
            <img
              src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80"
              alt="Red Fort"
              className="destination-image"
            />
            <div className="destination-overlay">
              <h3>Red Fort</h3>
              <p>Delhi</p>
            </div>
          </div>
          <div className="destination-card">
            <img
              src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80"
              alt="Gateway of India"
              className="destination-image"
            />
            <div className="destination-overlay">
              <h3>Gateway of India</h3>
              <p>Mumbai, Maharashtra</p>
            </div>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <div className="cta-content">
          <h2>Ready to Start Your Journey?</h2>
          <p>Join thousands of travelers exploring India with AI Trip Planner</p>
          <Link to="/register" className="btn btn-primary btn-large">
            Create Your Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

