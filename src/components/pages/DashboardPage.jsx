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
    Trash2,
    Search,
    Loader,
    Download,
    Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';

const API_URL = 'http://localhost:5000/api';

export default function DashboardPage() {
    const { user, token } = useAuth();
    const {
        resetProject,
        updateProject,
        fetchProjects,
        fetchStats,
        getResumeSlug,
        isInitialLoad,
        setIsInitialLoad,
        invalidateCache
    } = useProject();
    const navigate = useNavigate();

    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(isInitialLoad);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user || !token) {
                setLoading(false);
                return;
            }
            try {
                // Ensure auth header is set
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // Fetch first page and stats
                const [statsData, projectsResult] = await Promise.all([
                    fetchStats(),
                    fetchProjects(false, 1, 10) // Small initial batch for speed
                ]);

                // Handle both raw array (from cache) and object with pagination
                const projectList = Array.isArray(projectsResult) ? projectsResult : projectsResult.data;
                const pagination = projectsResult.pagination || {};

                setProjects(projectList || []);
                setStats(statsData || null);
                setHasMore(pagination.page < pagination.pages);
                setPage(1);
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
            } finally {
                setLoading(false);
                setIsInitialLoad(false);
            }
        };

        fetchDashboardData();
    }, [user, token, fetchProjects, fetchStats, setIsInitialLoad]);

    const handleLoadMore = async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        try {
            const nextPage = page + 1;
            const result = await fetchProjects(true, nextPage, 10);

            setProjects(prev => [...prev, ...result.data]);
            setPage(nextPage);
            setHasMore(result.pagination.page < result.pagination.pages);
        } catch (err) {
            console.error('Load more error:', err);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleNewProject = () => {
        resetProject();
        navigate('/create/input');
    };

    const handleContinueProject = (project) => {
        updateProject({
            ...project,
            id: project._id,
            ...project.stages,
            slides: project.stages?.content?.slides || project.slides || []
        });

        const targetSlug = getResumeSlug(project);
        const projectId = project._id || project.id;
        navigate(`/create/${targetSlug}${projectId ? `/${projectId}` : ''}`);
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this project?')) return;

        try {
            await axios.delete(`${API_URL}/projects/${id}`);
            invalidateCache(); // Clear cache to force refetch
            setProjects(prev => prev.filter(p => p._id !== id));
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const [scrollPos, setScrollPos] = useState(0);

    // Unified filtering logic
    const filteredProjects = projects.filter(p => {
        const displayName = p.title || p.stages?.content?.title || p.brandName || p.niche || 'Untitled Project';
        const matchesSearch = displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.niche?.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (filter === 'all') return true;
        if (filter === 'carousel') return p.postType?.toLowerCase() === 'carousel';
        if (filter === 'story') return p.postType?.toLowerCase() === 'story';
        if (filter === 'draft') return p.status === 'draft';
        if (filter === 'finalized') return p.status === 'completed';
        return true;
    });

    // Get first image from the 10 most recent projects that have images
    const latestImages = projects
        .filter(p => p.stages?.finalImages?.length > 0)
        .map(p => ({
            ...(p.stages?.finalImages?.[0] || {}),
            title: p.title || p.userIdea || p.brandName || 'Untitled',
            description: p.stages?.finalImages?.[0]?.displayCaption || p.stages?.content?.description || p.stages?.content?.slides?.[0]?.heading || p.stages?.finalImages?.[0]?.prompt,
            postType: p.postType,
            projectId: p._id
        }))
        .slice(0, 10);

    // Auto-scroll logic for carousel
    useEffect(() => {
        if (latestImages.length <= 4) return;
        const pageCount = Math.ceil(latestImages.length / 4);
        const interval = setInterval(() => {
            setScrollPos(prev => (prev + 1) % pageCount);
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
                    <h1>Hey, {user?.name?.split(' ')[0] || 'there'}!</h1>
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
                            style={{
                                transform: `translateX(-${scrollPos * (100 / (latestImages.length <= 4 ? 1 : latestImages.length / 4))}%)`,
                                width: `${Math.max(100, (latestImages.length / 4) * 100)}%`
                            }}
                        >
                            {latestImages.map((img, idx) => (
                                <div key={idx} className="work-item-wrapper" style={{ flex: `0 0 ${100 / latestImages.length}%` }}>
                                    <div className="work-item glass" onClick={() => handleContinueProject(projects.find(p => p._id === img.projectId))}>
                                        <div className="work-preview">
                                            <img src={img.url} alt={`Latest ${idx}`} />
                                            <div className="work-overlay">
                                                <a
                                                    href={img.url}
                                                    download={`latest-work-${idx}.png`}
                                                    className="icon-btn"
                                                    title="Download Image"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Download size={16} />
                                                </a>
                                                <button
                                                    className="icon-btn"
                                                    title="View/Continue Project"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleContinueProject(projects.find(p => p._id === img.projectId));
                                                    }}
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="work-info">
                                            <div className="work-info-header">
                                                <span className="work-project">{img.title}</span>
                                                <div className="work-badge">{img.postType || 'POST'}</div>
                                            </div>
                                            <p className="work-prompt">{img.description?.substring(0, 60)}...</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {latestImages.length > 4 && (
                        <div className="carousel-dots">
                            {Array.from({ length: Math.ceil(latestImages.length / 4) }).map((_, i) => (
                                <button
                                    key={i}
                                    className={`dot ${scrollPos === i ? 'active' : ''}`}
                                    onClick={() => setScrollPos(i)}
                                />
                            ))}
                        </div>
                    )}
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
                    <div className="filter-group">
                        <div className="search-bar-mini glass">
                            <Search size={14} />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="filter-pill-container">
                            {['all', 'carousel', 'story', 'draft', 'finalized'].map(f => (
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
                        filteredProjects.map(project => {
                            const displayName = project.title || project.userIdea || project.brandName || 'Untitled Project';
                            const firstImage = project.stages?.finalImages?.[0];

                            return (
                                <div
                                    key={project._id}
                                    className="project-history-card glass"
                                    onClick={() => handleContinueProject(project)}
                                >
                                    <div className="card-top">
                                        <button
                                            className="delete-btn"
                                            onClick={(e) => handleDelete(e, project._id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="project-preview">
                                        {firstImage ? (
                                            <img src={firstImage.url} alt="Preview" />
                                        ) : (
                                            <div className="no-preview">
                                                <ImageIcon size={32} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="project-info">
                                        <div className="project-header-row">
                                            <h3 className="project-title-text">{displayName}</h3>
                                            <span className="mini-badge">{project.postType}</span>
                                        </div>
                                        <div className="meta-row">
                                            <div className="meta-item">
                                                <Calendar size={14} />
                                                <span>{new Date(project.updatedAt || project.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                            </div>
                                            <div className="meta-item">
                                                <Zap size={14} />
                                                <span>{project.usage?.totalTokens?.toLocaleString() || 0} tkn</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-footer">
                                        <span className={`status-indicator ${project.status}`}>
                                            {project.status === 'completed' ? 'Finalized' : 'Draft'}
                                        </span>
                                        <ChevronRight size={18} />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {hasMore && (
                    <div className="load-more-container mt-8">
                        <button
                            className="btn-outline w-full py-4 flex items-center justify-center gap-2"
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                        >
                            {loadingMore ? (
                                <>
                                    <Loader className="spin" size={18} />
                                    <span>Retrieving more projects...</span>
                                </>
                            ) : (
                                <>
                                    <span>Load More History</span>
                                    <ChevronRight size={18} className="rotate-90" />
                                </>
                            )}
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}
