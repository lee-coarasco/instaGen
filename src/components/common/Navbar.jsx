import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import {
    LayoutDashboard,
    Home,
    Sparkles,
    LogOut,
    User as UserIcon,
    X,
    Menu,
    Image as ImageIcon
} from 'lucide-react';
import Auth from '@components/auth/Auth';
import './Navbar.css';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showAuth, setShowAuth] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleAuthSuccess = () => {
        setShowAuth(false);
        navigate('/dashboard');
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (<>
        <nav className="navbar glass">
            <div className="container navbar-content">
                <Link to="/" className="navbar-logo">
                    <Sparkles className="logo-icon" />
                    <span>instaGen</span>
                </Link>

                <div className={`navbar-links ${isMenuOpen ? 'open' : ''}`}>
                    <Link
                        to="/"
                        className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <Home size={18} />
                        <span>Home</span>
                    </Link>

                    {user && (
                        <>
                            <Link
                                to="/dashboard"
                                className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <LayoutDashboard size={18} />
                                <span>Dashboard</span>
                            </Link>
                            <Link
                                to="/gallery"
                                className={`nav-link ${location.pathname === '/gallery' ? 'active' : ''}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <ImageIcon size={18} />
                                <span>Gallery</span>
                            </Link>
                            <Link
                                to="/create"
                                className={`nav-link ${location.pathname.startsWith('/create') ? 'active' : ''}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <Sparkles size={18} />
                                <span>Create</span>
                            </Link>
                        </>
                    )}



                    {user ? (
                        <div className="user-control">
                            <div className="user-info">
                                <div className="user-avatar">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="user-name">{user.name.split(' ')[0]}</span>
                            </div>
                            <button className="nav-btn logout-btn" onClick={handleLogout}>
                                <LogOut size={18} />
                                <span>Logout</span>
                            </button>
                        </div>
                    ) : (
                        <button className="btn-primary" onClick={() => setShowAuth(true)}>
                            Login / Signup
                        </button>
                    )}
                </div>

                <button className="mobile-menu-toggle" onClick={toggleMenu}>
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
        </nav>

        {showAuth && (
            <div className="auth-modal-overlay" onClick={() => setShowAuth(false)}>
                <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
                    <button
                        className="auth-close-btn"
                        onClick={() => setShowAuth(false)}
                    >
                        <X size={20} />
                    </button>

                    <Auth onSuccess={handleAuthSuccess} />
                </div>
            </div>
        )}

    </>
    );
}
