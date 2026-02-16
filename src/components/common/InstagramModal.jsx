import { useState } from 'react'
import {
    Heart,
    MessageCircle,
    Send,
    Bookmark,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    X
} from 'lucide-react'
import './InstagramModal.css'

export default function InstagramModal({ isOpen, onClose, images, brandName, initialIndex = 0 }) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)

    if (!isOpen || !images || images.length === 0) return null

    const nextSlide = (e) => {
        e.stopPropagation()
        if (currentIndex < images.length - 1) {
            setCurrentIndex(currentIndex + 1)
        }
    }

    const prevSlide = (e) => {
        e.stopPropagation()
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1)
        }
    }

    return (
        <div className="ig-preview-overlay" onClick={onClose}>
            <div className="ig-preview-content" onClick={e => e.stopPropagation()}>
                <button className="close-preview" onClick={onClose}>
                    <X size={24} />
                </button>

                <div className="ig-post-shell">
                    {/* IG Header */}
                    <div className="ig-header">
                        <div className="ig-user-info">
                            <div className="ig-avatar">
                                {brandName ? brandName.charAt(0).toUpperCase() : 'I'}
                            </div>
                            <span className="ig-username">{brandName || 'your_brand'}</span>
                        </div>
                        <MoreHorizontal size={20} />
                    </div>

                    {/* IG Image Carousel */}
                    <div className="ig-image-area">
                        <img src={images[currentIndex].url} alt="Carousel slide" />

                        {currentIndex > 0 && (
                            <button className="ig-nav-btn prev" onClick={prevSlide}>
                                <ChevronLeft size={24} />
                            </button>
                        )}
                        {currentIndex < images.length - 1 && (
                            <button className="ig-nav-btn next" onClick={nextSlide}>
                                <ChevronRight size={24} />
                            </button>
                        )}

                        <div className="ig-slide-counter">
                            {currentIndex + 1}/{images.length}
                        </div>
                    </div>

                    {/* IG Actions */}
                    <div className="ig-actions">
                        <div className="ig-left-actions">
                            <Heart size={24} />
                            <MessageCircle size={24} />
                            <Send size={24} />
                        </div>
                        <div className="ig-indicators">
                            {images.map((_, i) => (
                                <div key={i} className={`ig-dot ${i === currentIndex ? 'active' : ''}`} />
                            ))}
                        </div>
                        <Bookmark size={24} />
                    </div>

                    {/* IG Caption */}
                    <div className="ig-caption">
                        <span className="ig-username-bold">{brandName || 'your_brand'}</span>
                        <span className="ig-text"> Previewing slide {currentIndex + 1} of your AI-generated carousel content.</span>
                        <div className="ig-view-comments">View all comments</div>
                        <div className="ig-time">JUST NOW</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
