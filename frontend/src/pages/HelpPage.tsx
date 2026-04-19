const HelpPage = () => {
  const faqs = [
    {
      q: "How do I create a new trip?",
      a: "Navigate to the 'Dashboard' and click on 'Create New Trip'. Enter your destination, duration, and budget to get an AI-generated itinerary."
    },
    {
      q: "Can I edit an existing trip?",
      a: "Yes! From your Dashboard, click 'View Details' on any trip. You can then use the 'Edit' option to modify places or notes."
    },
    {
      q: "What is 'Budget Estimation'?",
      a: "Our AI analyzes current travel trends, hotel prices, and local costs to provide a detailed breakdown of your expected expenses."
    },
    {
      q: "Can I use the app offline?",
      a: "You can download any itinerary as a PDF by clicking the 'Download PDF' button on the Trip Details page. This allows you to access your plans even without an internet connection."
    }
  ];

  return (
    <div className="page" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '900', color: 'white', marginBottom: '1rem', background: 'var(--gradient-colorful)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>How can we help?</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Everything you need to know about using AI Trip Planner</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Quick Start Guide */}
        <section className="card" style={{ gridColumn: '1 / -1' }}>
          <h2 style={{ color: 'var(--accent-amber)', marginBottom: '1.5rem', fontWeight: '900' }}>🚀 Quick Start Guide</h2>
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎯</div>
              <h4 style={{ fontWeight: '800', color: 'white' }}>1. Choose Destination</h4>
              <p style={{ color: 'var(--text-muted)' }}>Search for any city in the 'Explore' tab.</p>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🪄</div>
              <h4 style={{ fontWeight: '800', color: 'white' }}>2. Generate Plan</h4>
              <p style={{ color: 'var(--text-muted)' }}>Provide dates and budget for an AI itinerary.</p>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📂</div>
              <h4 style={{ fontWeight: '800', color: 'white' }}>3. Save & Export</h4>
              <p style={{ color: 'var(--text-muted)' }}>Keep trips in Dashboard and download as PDF.</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section style={{ gridColumn: '1 / -1' }}>
          <h2 style={{ color: 'var(--accent-sky)', marginBottom: '1.5rem', fontWeight: '900' }}>❓ Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqs.map((faq, i) => (
              <div key={i} className="card">
                <h4 style={{ marginBottom: '0.5rem', color: 'white' }}>{faq.q}</h4>
                <p style={{ color: '#aaa', fontSize: '0.95rem' }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Support Card */}
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💬</div>
          <h3 style={{ fontWeight: '800', color: 'white' }}>Need More Help?</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Our team is here to assist you.</p>
          <button style={{ padding: '0.8rem 2rem', borderRadius: '12px', border: 'none', background: 'var(--accent-sky)', color: '#0f172a', fontWeight: '900' }}>
            Contact Support
          </button>
        </div>

        {/* Links Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
          <a href="#" style={{ color: '#3b82f6', textDecoration: 'none' }}>📜 Terms of Service</a>
          <a href="#" style={{ color: '#3b82f6', textDecoration: 'none' }}>🔒 Privacy Policy</a>
          <a href="#" style={{ color: '#3b82f6', textDecoration: 'none' }}>🛠️ Feature Feedback</a>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;

