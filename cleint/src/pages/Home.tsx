import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/main.css';

const Home: React.FC = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Full Stack Developer",
      company: "TechCorp",
      quote: "StackSniper cut my debugging time by 70%. The AI explanations are incredibly accurate!",
      avatar: "👩‍💻"
    },
    {
      name: "Mike Rodriguez",
      role: "Backend Engineer",
      company: "StartupXYZ",
      quote: "Finally, a tool that understands complex error messages and provides relevant Stack Overflow answers.",
      avatar: "👨‍💻"
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero" style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: 'white',
        padding: '2rem'
      }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀 StackSniper</h1>
          <p style={{ fontSize: '1.5rem', marginBottom: '2rem', opacity: 0.9 }}>
            AI-Powered Debugging & Stack Overflow Answers
          </p>
          <p style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 3rem', opacity: 0.8, lineHeight: 1.6 }}>
            Instant solutions to programming errors with AI analysis and curated Stack Overflow answers. 
            Trusted by developers worldwide.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/auth" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
              Get Started Free
            </Link>
            <a href="#features" className="btn btn-secondary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ 
        background: 'var(--bg-primary)', 
        padding: '4rem 0',
        minHeight: '100vh'
      }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--text-primary)' }}>
            Why Developers Love StackSniper
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            {testimonials.map((testimonial, index) => (
              <div key={index} style={{
                background: 'var(--bg-secondary)',
                padding: '2rem',
                borderRadius: '12px',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{testimonial.avatar}</div>
                <p style={{ 
                  color: 'var(--text-secondary)', 
                  fontStyle: 'italic',
                  marginBottom: '1.5rem',
                  lineHeight: 1.6
                }}>
                  "{testimonial.quote}"
                </p>
                <div>
                  <strong style={{ color: 'var(--text-primary)', display: 'block' }}>
                    {testimonial.name}
                  </strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {testimonial.role} at {testimonial.company}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
