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
    Maximize2
} from 'lucide-react';
import './GalleryPage.css';

const API_URL = 'http://localhost:5000/api';

export default function GalleryPage() {
    const { user } = useAuth();
    const { fetchGallery, isInitialLoad, setIsInitialLoad } = useProject();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(isInitialLoad);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchImages = async () => {
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

    return (
        <div className="gallery-page container">
            <header className="gallery-header glass">
                <div className="header-info">
                    <h1>Visual Library</h1>
                    <p>All your AI-generated assets in one place.</p>
                </div>
                <div className="header-actions">
                    <div className="search-box glass">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search by project or caption..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            {loading || isInitialLoad ? (
                <div className="gallery-loading">
                    <Loader className="spin" size={48} />
                    <p>Curating your visual universe...</p>
                </div>
            ) : filteredImages.length === 0 ? (
                <div className="gallery-empty glass">
                    <ImageIcon size={64} />
                    <h3>{searchTerm ? 'No matches found' : 'No assets yet'}</h3>
                    <p>{searchTerm ? 'Try a different search term.' : 'Start a new project to populate your library.'}</p>
                </div>
            ) : (
                <div className="gallery-grid">
                    {filteredImages.map((img, idx) => (
                        <div key={idx} className="gallery-card glass" onClick={() => setSelectedImage(img)}>
                            <div className="image-wrapper">
                                <img src={img.url} alt={img.displayCaption || `Slide ${img.slideIndex}`} loading="lazy" />
                                <div className="image-overlay">
                                    <a
                                        href={img.url}
                                        download={`slide-${img.slideIndex + 1}.png`}
                                        className="icon-btn"
                                        title="Download Image"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <Download size={18} />
                                    </a>
                                    <button className="icon-btn" title="View Full" onClick={() => setSelectedImage(img)}>
                                        <Maximize2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="image-info">
                                <span className="project-title-mini">{img.projectName}</span>
                                <div className="image-meta">
                                    <span className="slide-tag">Slide {img.slideIndex + 1}</span>
                                    <span className="timestamp-mini">{new Date(img.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="image-prompt">{img.displayCaption || img.technicalPrompt || 'Generated Visual'}</p>
                            </div>
                        </div>
                    ))}
                </div>
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
                                <a href={selectedImage.url} download className="btn-primary">
                                    <Download size={18} />
                                    Download Image
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
