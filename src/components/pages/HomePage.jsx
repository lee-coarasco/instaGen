import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Sparkles, Layers, Zap, Target, CheckCircle, ArrowRight, User as UserIcon, X, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@contexts/AuthContext'
import Auth from '@components/auth/Auth'
import './HomePage.css'

function HomePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showAuth, setShowAuth] = useState(false);
    const [authMode, setAuthMode] = useState('login');

    const handleGetStarted = () => {
        setAuthMode('register');
        setShowAuth(true);
    };

    const handleAuthSuccess = () => {
        setShowAuth(false);
        navigate('/dashboard');
    };
    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-badge">
                            <Sparkles size={16} />
                            <span>AI-Powered Content Generation</span>
                        </div>

                        <h1 className="hero-title">
                            Create <span className="text-gradient">Agency-Level</span>
                            <br />
                            Instagram Content in Minutes
                        </h1>

                        <p className="hero-description">
                            Multi-stage AI orchestration that transforms your ideas into stunning,
                            consistent Instagram carousels. No prompt engineering required.
                        </p>

                        <div className="hero-actions">
                            {user ? (
                                <Link to="/dashboard" className="btn btn-primary btn-large">
                                    <LayoutDashboard size={20} />
                                    Go to Dashboard
                                    <ArrowRight size={20} />
                                </Link>
                            ) : (
                                <button className="btn btn-primary btn-large" onClick={handleGetStarted}>
                                    <Sparkles size={20} />
                                    Get Started Free
                                    <ArrowRight size={20} />
                                </button>
                            )}

                            <Link to="/create" className="btn btn-secondary btn-large">
                                <Layers size={20} />
                                Try Sample App
                            </Link>
                        </div>

                        <div className="hero-stats">
                            <div className="stat">
                                <div className="stat-value">5</div>
                                <div className="stat-label">AI Layers</div>
                            </div>
                            <div className="stat">
                                <div className="stat-value">8+</div>
                                <div className="stat-label">Niches</div>
                            </div>
                            <div className="stat">
                                <div className="stat-value">100%</div>
                                <div className="stat-label">Consistent</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <div className="container">
                    <div className="section-header">
                        <h2>Why InstaGen is Different</h2>
                        <p>Not just another AI image generator. A complete visual governance system.</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card glass">
                            <div className="feature-icon">
                                <Target />
                            </div>
                            <h3>Intent Understanding</h3>
                            <p>
                                Describe your idea in natural language. Our AI understands your
                                audience, tone, and visual direction automatically.
                            </p>
                        </div>

                        <div className="feature-card glass">
                            <div className="feature-icon">
                                <Layers />
                            </div>
                            <h3>Storyboard Preview</h3>
                            <p>
                                See all slides together before final generation. Approve the
                                direction, then commit to high-quality output.
                            </p>
                        </div>

                        <div className="feature-card glass">
                            <div className="feature-icon">
                                <CheckCircle />
                            </div>
                            <h3>Visual Consistency</h3>
                            <p>
                                Automated guardrails ensure perfect consistency across all slides.
                                No style drift, no character mismatches.
                            </p>
                        </div>

                        <div className="feature-card glass">
                            <div className="feature-icon">
                                <Zap />
                            </div>
                            <h3>Any Niche</h3>
                            <p>
                                Tech, marketing, film, education, finance, real estate, health,
                                fashion - works perfectly for any industry.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-it-works">
                <div className="container">
                    <div className="section-header">
                        <h2>5-Layer AI Architecture</h2>
                        <p>Each layer has a specific job. Together, they create magic.</p>
                    </div>

                    <div className="pipeline">
                        <div className="pipeline-step">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <h4>Intent Understanding</h4>
                                <p>Converts your idea into clear creative direction</p>
                            </div>
                        </div>

                        <div className="pipeline-arrow">→</div>

                        <div className="pipeline-step">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <h4>Content Structuring</h4>
                                <p>Optimizes text for Instagram readability</p>
                            </div>
                        </div>

                        <div className="pipeline-arrow">→</div>

                        <div className="pipeline-step">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <h4>Visual Planning</h4>
                                <p>Generates storyboard preview for approval</p>
                            </div>
                        </div>

                        <div className="pipeline-arrow">→</div>

                        <div className="pipeline-step">
                            <div className="step-number">4</div>
                            <div className="step-content">
                                <h4>Prompt Engineering</h4>
                                <p>Creates perfect prompts for AI generation</p>
                            </div>
                        </div>

                        <div className="pipeline-arrow">→</div>

                        <div className="pipeline-step">
                            <div className="step-number">5</div>
                            <div className="step-content">
                                <h4>Image Generation</h4>
                                <p>Produces final Instagram-ready images</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <div className="container">
                    <div className="cta-content glass">
                        <h2>Ready to Create?</h2>
                        <p>
                            Transform your ideas into professional Instagram content.
                            No design skills required.
                        </p>
                        <Link to="/create" className="btn btn-primary btn-large">
                            <Sparkles size={20} />
                            Start Your First Project
                            <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Auth Modal */}
            {showAuth && (
                <div className="auth-modal-overlay" onClick={() => setShowAuth(false)}>
                    <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="auth-close-btn" onClick={() => setShowAuth(false)}>
                            <X size={20} />
                        </button>
                        <Auth mode={authMode} onSuccess={handleAuthSuccess} />
                    </div>
                </div>
            )}
        </div>
    )
}

export default HomePage
