import { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { useProject } from '@contexts/ProjectContext';
import axios from 'axios';
import {
    LayoutDashboard,
    History,
    Zap,
    Coins,
    Image as ImageIcon,
    Plus,
    ChevronRight,
    Calendar,
    Filter,
    Loader,
    ExternalLink,
    Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';

const API_URL = 'http://localhost:5000/api';

export default function DashboardPage() {
    const { user, logout } = useAuth();
    const { resetProject, updateProject, setStage } = useProject();
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, projectsRes] = await Promise.all([
                    axios.get(`${API_URL}/projects/stats`),
                    axios.get(`${API_URL}/projects`)
                ]);
                setStats(statsRes.data.data);
                setProjects(projectsRes.data.data);
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleNewProject = () => {
        resetProject();
        // Clear stage explicitly and navigate to start
        navigate('/create/input');
    };

    const handleContinueProject = (project) => {
        // Hydrate project context with saved data
        updateProject({
            ...project,
            id: project._id,
            ...project.stages,
            // Ensure slides are hydrated from structured content if possible
            slides: project.stages?.content?.slides || project.slides || []
        });
        // Map project stage to URL slug
        let targetSlug = 'input';

        if (project.status === 'completed' || project.stages.finalImages?.length > 0) {
            targetSlug = 'complete';
        } else if (project.stages.visualPlan) {
            targetSlug = 'generate';
        } else if (project.stages.content) {
            targetSlug = 'visuals';
        } else if (project.stages.intent) {
            targetSlug = 'content';
        } else if (project.userIdea) {
            targetSlug = 'intent';
        }

        navigate(`/create/${targetSlug}`);
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this project?')) return;

        try {
            await axios.delete(`${API_URL}/projects/${id}`);
            setProjects(projects.filter(p => p._id !== id));
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const [scrollPos, setScrollPos] = useState(0);

    // Filter projects that have images and flatten them to get last 10 images
    const latestImages = projects
        .filter(p => p.stages.finalImages?.length > 0)
        .flatMap(p => p.stages.finalImages.map(img => ({ ...img, projectName: p.brandName || p.niche || 'Untitled' })))
        .slice(0, 10);

    // Auto-scroll logic for carousel
    useEffect(() => {
        if (latestImages.length === 0) return;
        const interval = setInterval(() => {
            setScrollPos(prev => (prev + 1) % latestImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [latestImages.length]);

    if (loading) {
        return (
            <div className="dashboard-loading">
                <Loader className="spin" size={48} />
                <p>Loading your creative space...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container container">
            <header className="dashboard-header">
                <div className="user-welcome">
                    <h1>Hey, {user?.name.split(' ')[0]}!</h1>
                    <p>Track your AI performance and creative history.</p>
                </div>
            </header>

            {/* Latest Works Carousel */}
            {latestImages.length > 0 && (
                <section className="latest-works-section">
                    <div className="section-header">
                        <div className="title-row">
                            <ImageIcon size={20} />
                            <h2>Latest Works</h2>
                        </div>
                        <button className="view-all-link" onClick={() => navigate('/gallery')}>
                            View All <ChevronRight size={16} />
                        </button>
                    </div>
                    <div className="works-carousel-container">
                        <div
                            className="works-carousel-track"
                            style={{ transform: `translateX(-${scrollPos * 100}%)` }}
                        >
                            {latestImages.map((img, idx) => (
                                <div key={idx} className="work-item-wrapper">
                                    <div className="work-item glass">
                                        <img src={img.url} alt={`Latest ${idx}`} />
                                        <div className="work-info">
                                            <span className="work-project">{img.projectName}</span>
                                            <p className="work-prompt">{img.prompt?.substring(0, 50)}...</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="carousel-dots">
                            {latestImages.map((_, i) => (
                                <button
                                    key={i}
                                    className={`dot ${scrollPos === i ? 'active' : ''}`}
                                    onClick={() => setScrollPos(i)}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Stats Overview */}
            <div className="stats-grid">
                <div className="stat-card glass">
                    <div className="stat-icon tokens"><Zap size={24} /></div>
                    <div className="stat-info">
                        <span className="stat-label">Tokens Used</span>
                        <span className="stat-value">{stats?.totalTokens?.toLocaleString() || 0}</span>
                    </div>
                </div>
                <div className="stat-card glass">
                    <div className="stat-icon cost"><Coins size={24} /></div>
                    <div className="stat-info">
                        <span className="stat-label">Total Cost</span>
                        <span className="stat-value">${stats?.totalCost?.toFixed(3) || '0.00'}</span>
                    </div>
                </div>
                <div className="stat-card glass">
                    <div className="stat-icon images"><ImageIcon size={24} /></div>
                    <div className="stat-info">
                        <span className="stat-label">Images Generated</span>
                        <span className="stat-value">{stats?.totalImages || 0}</span>
                    </div>
                </div>
                <div className="stat-card glass">
                    <div className="stat-icon projects"><LayoutDashboard size={24} /></div>
                    <div className="stat-info">
                        <span className="stat-label">Projects</span>
                        <span className="stat-value">{stats?.projectCount || 0}</span>
                    </div>
                </div>
            </div>

            {/* Project History */}
            <section className="history-section">
                <div className="section-header">
                    <div className="title-row">
                        <History size={20} />
                        <h2>Recent History</h2>
                    </div>
                    <div className="filter-pill-container">
                        {['all', 'carousel', 'story'].map(f => (
                            <button
                                key={f}
                                className={`filter-pill ${filter === f ? 'active' : ''}`}
                                onClick={() => setFilter(f)}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="projects-grid">
                    {projects.length === 0 ? (
                        <div className="empty-history glass">
                            <ImageIcon size={48} />
                            <h3>No projects yet</h3>
                            <p>Start your first AI carousel journey today.</p>
                            <button className="btn-primary" onClick={handleNewProject}>Create Now</button>
                        </div>
                    ) : (
                        projects.map(project => (
                            <div
                                key={project._id}
                                className="project-history-card glass"
                                onClick={() => handleContinueProject(project)}
                            >
                                <div className="card-top">
                                    <div className="project-type-badge">
                                        {project.postType}
                                    </div>
                                    <button
                                        className="delete-btn"
                                        onClick={(e) => handleDelete(e, project._id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="project-preview">
                                    {project.stages.finalImages?.[0] ? (
                                        <img src={project.stages.finalImages[0].url} alt="Preview" />
                                    ) : (
                                        <div className="no-preview">
                                            <ImageIcon size={32} />
                                        </div>
                                    )}
                                </div>

                                <div className="project-info">
                                    <h3>{project.brandName || project.niche || 'Untitled Project'}</h3>
                                    <div className="meta-row">
                                        <div className="meta-item">
                                            <Calendar size={14} />
                                            <span>{new Date(project.updatedAt || project.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                        </div>
                                        <div className="meta-item">
                                            <Zap size={14} />
                                            <span>{project.usage.totalTokens} tkn</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-footer">
                                    <span className="status-indicator">
                                        {project.status === 'completed' ? 'Finalized' : 'Draft'}
                                    </span>
                                    <ChevronRight size={18} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}
