import { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { useProject } from '@contexts/ProjectContext';
import axios from 'axios';
import {
    Image as ImageIcon,
    Download,
    ExternalLink,
    Search,
    Filter,
    Loader,
    X,
    Maximize2,
    Eye,
    ChevronUp,
    Search as SearchIcon
} from 'lucide-react';
import { useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './GalleryPage.css';

const API_URL = 'http://localhost:5000/api';

export default function GalleryPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const {
        fetchGallery,
        isInitialLoad,
        setIsInitialLoad,
        fetchProjectById,
        getResumeSlug
    } = useProject();

    const handleResumeProject = async (projectId) => {
        try {
            setLoading(true);
            const p = await fetchProjectById(projectId);
            const slug = getResumeSlug(p);
            navigate(`/create/${slug}/${projectId}`);
        } catch (err) {
            console.error('Failed to resume project:', err);
        } finally {
            setLoading(false);
        }
    };

    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showBackToTop, setShowBackToTop] = useState(false);

    // Observer for infinite scroll
    const observer = useRef();
    const lastImageElementRef = useCallback(node => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                handleLoadMore();
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore]);

    const getProxyUrl = (url) => {
        if (!url || !url.startsWith('https://storage.googleapis.com')) return url
        const API_URL = 'http://localhost:5000/api'
        return `${API_URL}/projects/proxy-image?url=${encodeURIComponent(url)}`
    }

    const forceDownload = async (url, filename) => {
        try {
            const token = localStorage.getItem('token')
            const proxyUrl = getProxyUrl(url)
            const response = await fetch(proxyUrl, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            })
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            const blob = await response.blob()
            const blobUrl = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = blobUrl
            link.download = filename || 'instaGen-visual.png'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(blobUrl)
        } catch (err) {
            console.error('Download failed:', err)
            window.open(url, '_blank')
        }
    }

    // Handle scroll for Back to Top button
    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 500);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchImages = async () => {
            setLoading(true);
            try {
                const result = await fetchGallery(false, 1, 12); // Smaller initial batch

                // Handle both raw array (from cache) and object with pagination
                const imgList = Array.isArray(result) ? result : result.data;
                const pagination = result.pagination || {};

                setImages(imgList || []);
                setHasMore(pagination.page < pagination.pages);
                setPage(1);
            } catch (err) {
                console.error('Failed to fetch gallery images:', err);
            } finally {
                setLoading(false);
                setIsInitialLoad(false);
            }
        };

        fetchImages();
    }, [fetchGallery, setIsInitialLoad]);

    const handleLoadMore = async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        try {
            const nextPage = page + 1;
            const result = await fetchGallery(true, nextPage, 12);

            setImages(prev => [...prev, ...result.data]);
            setPage(nextPage);
            setHasMore(result.pagination.page < result.pagination.pages);
        } catch (err) {
            console.error('Load more error:', err);
        } finally {
            setLoadingMore(false);
        }
    };

    const filteredImages = images.filter(img =>
        img.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (img.displayCaption || img.technicalPrompt || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading || isInitialLoad) {
        return (
            <div className="gallery-loading-full">
                <Loader className="spin" size={64} />
                <div className="loading-text">
                    <h2>Curating Visuals</h2>
                    <p>Assembling your creative library...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="gallery-page container">
            <header className="gallery-header glass">
                <div className="header-info">
                    <h1>Visual Library</h1>
                    <p>All your AI-generated assets in one place.</p>
                </div>
                <div className="header-actions">
                    <div className="search-box-container">
                        <SearchIcon size={18} className="search-icon-fixed" />
                        <input
                            type="text"
                            placeholder="Search projects, captions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="gallery-search-input"
                        />
                        {searchTerm && (
                            <button className="clear-search" onClick={() => setSearchTerm('')}>
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {filteredImages.length === 0 ? (
                <div className="gallery-empty glass">
                    <ImageIcon size={64} />
                    <h3>{searchTerm ? 'No matches found' : 'No assets yet'}</h3>
                    <p>{searchTerm ? 'Try a different search term.' : 'Start a new project to populate your library.'}</p>
                </div>
            ) : (
                <div className="gallery-grid">
                    {filteredImages.map((img, idx) => {
                        const isLastItem = idx === filteredImages.length - 1;
                        return (
                            <div
                                key={idx}
                                ref={isLastItem ? lastImageElementRef : null}
                                className="gallery-card glass"
                                onClick={() => setSelectedImage(img)}
                            >
                                <div className="image-wrapper">
                                    <img src={img.url} alt={img.displayCaption || `Slide ${img.slideIndex}`} loading="lazy" />
                                    <div className="image-overlay">
                                        <button
                                            className="icon-btn"
                                            title="Download Image"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                forceDownload(img.url, `slide-${img.slideIndex + 1}.png`);
                                            }}
                                        >
                                            <Download size={18} />
                                        </button>
                                        <button className="icon-btn" title="View Full" onClick={() => setSelectedImage(img)}>
                                            <Maximize2 size={18} />
                                        </button>
                                        <button
                                            className="icon-btn"
                                            title="View Project"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleResumeProject(img.projectId);
                                            }}
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className="image-info">
                                    <div className="project-header-row">
                                        <span className="project-title-mini">{img.projectName}</span>
                                        <span className="slide-tag">#{img.slideIndex + 1}</span>
                                    </div>
                                    <p className="image-prompt">{img.displayCaption || img.technicalPrompt || 'Generated Visual'}</p>
                                    <div className="image-meta">
                                        <span className="timestamp-mini">{new Date(img.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {loadingMore && (
                <div className="gallery-loading-more">
                    <Loader className="spin" size={32} />
                    <span>Developing more visuals...</span>
                </div>
            )}

            {showBackToTop && (
                <button
                    className="back-to-top glass shadow-lg"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    title="Back to Top"
                >
                    <ChevronUp size={24} />
                </button>
            )}

            {hasMore && (
                <div className="gallery-load-more mt-12 flex justify-center">
                    <button
                        className="btn-outline px-12 py-4 flex items-center gap-3"
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                    >
                        {loadingMore ? (
                            <>
                                <Loader className="spin" size={18} />
                                <span>Developing more visuals...</span>
                            </>
                        ) : (
                            <>
                                <span>Show More Assets</span>
                                <Filter size={18} />
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Lightbox */}
            {selectedImage && (
                <div className="lightbox-overlay" onClick={() => setSelectedImage(null)}>
                    <div className="lightbox-content" onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setSelectedImage(null)}>
                            <X size={24} />
                        </button>
                        <img src={selectedImage.url} alt="Large preview" />
                        <div className="lightbox-details">
                            <h3>{selectedImage.projectName} — Slide {selectedImage.slideIndex + 1}</h3>
                            <div className="prompt-display">
                                <strong>Content:</strong>
                                <p className="main-caption">{selectedImage.displayCaption || 'Generated Image'}</p>
                            </div>
                            <div className="technical-details">
                                <strong>AI Prompt:</strong>
                                <p className="tech-prompt">{selectedImage.technicalPrompt || selectedImage.prompt}</p>
                            </div>
                            <div className="lightbox-actions">
                                <button
                                    className="btn-primary"
                                    onClick={() => forceDownload(selectedImage.url, `slide-${selectedImage.slideIndex + 1}.png`)}
                                >
                                    <Download size={18} />
                                    Download Image
                                </button>
                                <button
                                    className="btn-secondary"
                                    onClick={() => handleResumeProject(selectedImage.projectId)}
                                >
                                    <Eye size={18} />
                                    View Project
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
