

import { useState } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { Mail, Lock, User, ArrowRight, Loader, X } from 'lucide-react';

import './Auth.css';

export default function Auth({ mode = 'login', onToggle, onSuccess, onClose }) {
    const { login, register } = useAuth();
    // 'login' mode = login form, 'register' mode = signup form
    const [isLogin, setIsLogin] = useState(mode !== 'register');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                await login({ email: formData.email, password: formData.password });
            } else {
                await register(formData);
            }
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-card glass">

            <div className="auth-header">
                <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                <p>
                    {isLogin
                        ? 'Sign in to access your projects'
                        : 'Start generating viral carousels'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
                {!isLogin && (
                    <div className="form-group">
                        <label>Full Name</label>
                        <div className="input-wrapper">
                            <User size={18} />
                            <input
                                type="text"
                                placeholder="Enter your name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                required
                            />
                        </div>
                    </div>
                )}

                <div className="form-group">
                    <label>Email Address</label>
                    <div className="input-wrapper">
                        <Mail size={18} />
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <div className="input-wrapper">
                        <Lock size={18} />
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                            required
                        />
                    </div>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <button
                    type="submit"
                    className="btn-primary auth-submit"
                    disabled={loading}
                >
                    {loading ? (
                        <Loader className="spin" size={20} />
                    ) : (
                        <>
                            {isLogin ? 'Sign In' : 'Create Account'}
                            <ArrowRight size={18} />
                        </>
                    )}
                </button>
            </form>

            <div className="auth-footer">
                <p>
                    {isLogin
                        ? "Don't have an account?"
                        : 'Already have an account?'}{' '}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="toggle-btn"
                    >
                        {isLogin ? 'Register' : 'Login'}
                    </button>
                </p>
            </div>
        </div>

    );


}
