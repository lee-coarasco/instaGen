import { useState, useEffect } from 'react'
import { Image as ImageIcon, Check, RefreshCw, Loader, AlertCircle, Download, ArrowLeft, Instagram } from 'lucide-react'
import { useProject } from '@contexts/ProjectContext'
import { imageEngine } from '@services/generation/imageEngine'
import InstagramModal from '@components/common/InstagramModal'
import './ImageGenerator.css'

export default function ImageGenerator({ onNext, onBack }) {
    const { project, updateProject, saveProject } = useProject()
    const [generating, setGenerating] = useState(false)
    const [images, setImages] = useState(project.finalImages || [])
    const [error, setError] = useState(null)
    const [selectedImage, setSelectedImage] = useState(null)
    const [previewIndex, setPreviewIndex] = useState(null)

    // Start generation on mount if not already present
    useEffect(() => {
        const hasNoImages = images.length === 0 && (!project.finalImages || project.finalImages.length === 0)

        if (project.status !== 'completed' && hasNoImages && project.content?.slides && !generating) {
            generateAll()
        }
    }, [])

    // Sync with project context if it hydrates later
    useEffect(() => {
        if (project.finalImages?.length > 0 && images.length === 0) {
            setImages(project.finalImages)
        }
    }, [project.finalImages])

    const generateAll = async () => {
        if (generating) return
        setGenerating(true)
        setError(null)

        try {
            // Placeholder images array while generating
            const placeholders = project.content.slides.map((_, i) => ({
                slideIndex: i,
                status: 'loading'
            }))
            setImages(placeholders)

            const results = await imageEngine.generateAllImages(project)

            // Map results to state format
            const finalImages = results.map(r => ({
                slideIndex: r.slideIndex,
                url: r.imageUrl,
                prompt: r.prompt,
                status: r.status === 'success' ? 'complete' : 'error',
                error: r.error
            }))

            setImages(finalImages)
            updateProject({ finalImages })

        } catch (err) {
            console.error('Generation failed:', err)
            setError(err.message)
        } finally {
            setGenerating(false)
        }
    }

    const regenerateSingle = async (index) => {
        // Set specific image to loading
        const newImages = [...images]
        newImages[index] = { ...newImages[index], status: 'loading' }
        setImages(newImages)

        try {
            const result = await imageEngine.generateSingleImage(project, index)

            newImages[index] = {
                slideIndex: index,
                url: result.imageUrl,
                prompt: result.prompt,
                status: 'complete'
            }

            setImages(newImages)
            updateProject({ finalImages: newImages })

        } catch (err) {
            console.error(`Slide ${index + 1} regeneration failed:`, err)
            newImages[index] = { ...newImages[index], status: 'error', error: err.message }
            setImages(newImages)
        }
    }

    const handleFinish = async () => {
        try {
            // Explicitly save the current images and mark as completed
            // This prevents race conditions with context updates
            await saveProject({
                status: 'completed',
                finalImages: images
            });
            onNext();
        } catch (err) {
            console.error('Failed to finalize project:', err);
            setError('Failed to save project. Please check your connection.');
        }
    }

    if (!project.visualPlan) {
        return (
            <div className="image-generator">
                <div className="preview-empty">
                    <ImageIcon size={48} />
                    <h3>No Visual Plan</h3>
                    <p>Please complete visual planning first</p>
                    {onBack && (
                        <button className="btn-secondary" onClick={onBack} style={{ marginTop: '1rem' }}>
                            <ArrowLeft size={20} />
                            Back
                        </button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="image-generator">
            <div className="preview-header">
                <div className="header-content">
                    <ImageIcon className="header-icon" />
                    <div>
                        <h2>Generation Studio</h2>
                        <p>Generate high-quality images for your {project.content.slides.length} slides</p>
                    </div>
                </div>
                <div className="header-actions">
                    {onBack && (
                        <button className="btn-secondary" onClick={onBack}>
                            <ArrowLeft size={18} />
                            Back
                        </button>
                    )}
                    <button
                        className="btn-secondary"
                        onClick={generateAll}
                        disabled={generating}
                    >
                        <RefreshCw size={18} className={generating ? 'spin' : ''} />
                        Regenerate All
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleFinish}
                        disabled={generating || images.some(img => img.status === 'loading')}
                    >
                        <Check size={18} />
                        Finalize Project
                    </button>
                </div>
            </div>

            {error && (
                <div className="error-banner">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            <div className="images-grid">
                {project.content.slides.map((slide, index) => {
                    const img = images[index] || { status: 'pending' }

                    return (
                        <div key={index} className="image-card">
                            <div className="card-header">
                                <span className="slide-badge">Slide {index + 1}</span>
                                <span className="intent-badge">{slide.intent}</span>
                            </div>

                            <div className="image-container">
                                {img.status === 'loading' ? (
                                    <div className="loading-overlay">
                                        <Loader className="spin" size={32} />
                                        <span>Generating...</span>
                                    </div>
                                ) : img.status === 'error' ? (
                                    <div className="error-overlay">
                                        <AlertCircle size={32} />
                                        <span>Failed</span>
                                        <button onClick={() => regenerateSingle(index)}>Retry</button>
                                    </div>
                                ) : img.url ? (
                                    <img
                                        src={img.url}
                                        alt={`Slide ${index + 1}`}
                                        onClick={() => setSelectedImage(img)}
                                    />
                                ) : (
                                    <div className="placeholder-overlay">
                                        <ImageIcon size={32} />
                                        <span>Waiting...</span>
                                    </div>
                                )}
                            </div>

                            <div className="card-content">
                                <h4>{slide.heading}</h4>
                                <p>{slide.subtext}</p>
                            </div>

                            <div className="card-actions">
                                <button
                                    className="btn-icon"
                                    onClick={() => regenerateSingle(index)}
                                    title="Regenerate this slide"
                                    disabled={img.status === 'loading'}
                                >
                                    <RefreshCw size={16} />
                                </button>
                                {img.url && (
                                    <>
                                        <button
                                            className="btn-icon"
                                            onClick={() => setPreviewIndex(index)}
                                            title="Instagram Preview"
                                        >
                                            <Instagram size={16} />
                                        </button>
                                        <a
                                            href={img.url}
                                            download={`slide-${index + 1}.png`}
                                            className="btn-icon"
                                            title="Download standard"
                                        >
                                            <Download size={16} />
                                        </a>
                                    </>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Instagram Preview Modal */}
            <InstagramModal
                isOpen={previewIndex !== null}
                onClose={() => setPreviewIndex(null)}
                images={images}
                brandName={project.brandName}
                initialIndex={previewIndex || 0}
            />

            {/* Lightbox for full screen viewing */}
            {selectedImage && (
                <div className="lightbox" onClick={() => setSelectedImage(null)}>
                    <div className="lightbox-content" onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setSelectedImage(null)}>&times;</button>
                        <img src={selectedImage.url} alt="Full screen preview" />
                        <div className="lightbox-caption">
                            <p>{selectedImage.prompt}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
