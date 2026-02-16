import { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
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
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const res = await axios.get(`${API_URL}/projects`);
                const allImages = res.data.data.reduce((acc, project) => {
                    const projectImages = project.stages.finalImages || [];
                    return [...acc, ...projectImages.map(img => ({
                        ...img,
                        projectId: project._id,
                        projectName: project.brandName || project.niche || 'Untitled'
                    }))];
                }, []);

                // Sort by slide index or similar if needed, or by project date
                setImages(allImages);
            } catch (err) {
                console.error('Failed to fetch gallery images:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, []);

    const filteredImages = images.filter(img =>
        img.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.prompt?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="gallery-loading">
                <Loader className="spin" size={48} />
                <p>Curating your visual library...</p>
            </div>
        );
    }

    return (
        <div className="gallery-container container">
            <header className="gallery-header">
                <div>
                    <h1>Visual Library</h1>
                    <p>All your AI-generated assets in one place.</p>
                </div>
                <div className="gallery-actions">
                    <div className="search-bar">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search by project or prompt..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            {filteredImages.length === 0 ? (
                <div className="empty-gallery glass">
                    <ImageIcon size={64} />
                    <h2>No images found</h2>
                    <p>Start a new project to populate your library.</p>
                </div>
            ) : (
                <div className="gallery-grid">
                    {filteredImages.map((img, idx) => (
                        <div key={`${img.projectId}-${idx}`} className="gallery-card glass">
                            <div className="image-wrapper">
                                <img src={img.url} alt={img.projectName} loading="lazy" />
                                <div className="image-overlay">
                                    <button
                                        className="btn-icon"
                                        onClick={() => setSelectedImage(img)}
                                        title="Maximize"
                                    >
                                        <Maximize2 size={20} />
                                    </button>
                                    <a
                                        href={img.url}
                                        download={`slide-${idx}.png`}
                                        className="btn-icon"
                                        title="Download"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <Download size={20} />
                                    </a>
                                </div>
                            </div>
                            <div className="card-info">
                                <span className="project-tag">{img.projectName}</span>
                                <p className="image-prompt">{img.prompt?.substring(0, 60)}...</p>
                            </div>
                        </div>
                    ))}
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
                            <h3>{selectedImage.projectName}</h3>
                            <div className="prompt-display">
                                <strong>Prompt:</strong>
                                <p>{selectedImage.prompt}</p>
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
