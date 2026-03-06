import { useState, useEffect } from 'react'
import { Sparkles, Check, RefreshCw, Edit2, Trash2, Hash, MessageSquare, ArrowLeft } from 'lucide-react'
import { contentEngine } from '@services/content/contentEngine'
import { useProject } from '@contexts/ProjectContext'
import './ContentPreview.css'

export default function ContentPreview({ onNext, onBack }) {
    const { project, updateProject, updatePipelineStage } = useProject()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [content, setContent] = useState(project.content || null)
    const [editingSlide, setEditingSlide] = useState(null)

    // Sync local state if project content is cleared/updated externally
    useEffect(() => {
        if (project.content !== content) {
            setContent(project.content);
        }
    }, [project.content, content]);

    const structureContent = async () => {
        setLoading(true)
        setError(null)

        try {
            console.log('🔧 Structuring content...')

            const structuredContent = await contentEngine.structureContent(
                project.intent,
                project.userIdea,
                project.slides || []
            )

            console.log('✅ Content structured:', structuredContent)

            setContent(structuredContent)
            updateProject({ content: structuredContent })

        } catch (err) {
            console.error('Content structuring error:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const approveContent = () => {
        onNext()
    }

    const editSlide = (index) => {
        setEditingSlide(index)
    }

    const saveSlideEdit = (index, updatedSlide) => {
        const updatedSlides = [...content.slides]
        updatedSlides[index] = updatedSlide
        const updatedContent = { ...content, slides: updatedSlides }
        setContent(updatedContent)
        updateProject({ content: updatedContent })
        setEditingSlide(null)
    }

    const deleteSlide = (index) => {
        if (content.slides.length <= 1) {
            alert("A carousel must have at least one slide.")
            return
        }

        if (window.confirm("Are you sure you want to delete this slide?")) {
            const updatedSlides = content.slides
                .filter((_, i) => i !== index)
                .map((slide, i) => ({ ...slide, slide_number: i + 1 }))

            const updatedContent = { ...content, slides: updatedSlides }
            setContent(updatedContent)
            updateProject({ content: updatedContent })
            setEditingSlide(null)
        }
    }

    const getIntentBadgeColor = (intent) => {
        const colors = {
            hook: 'var(--color-accent-pink)',
            explain: 'var(--color-accent-blue)',
            detail: 'var(--color-accent-purple)',
            cta: 'var(--color-primary)',
        }
        return colors[intent] || 'var(--color-text-secondary)'
    }

    if (!project.intent) {
        return (
            <div className="content-preview">
                <div className="preview-empty">
                    <Sparkles size={48} />
                    <h3>No Intent Data</h3>
                    <p>Please complete intent analysis first</p>
                </div>
            </div>
        )
    }

    if (!content && !loading) {
        return (
            <div className="content-preview">
                <div className="preview-header">
                    <div className="header-content">
                        <Sparkles className="header-icon" />
                        <div>
                            <h2>Content Structuring</h2>
                            <p>Transform your idea into Instagram-optimized slides</p>
                        </div>
                    </div>
                </div>

                <div className="preview-action" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    {onBack && (
                        <button className="btn-secondary" onClick={onBack}>
                            <ArrowLeft size={20} />
                            Back
                        </button>
                    )}
                    <button className="btn-primary" onClick={structureContent}>
                        <Sparkles size={20} />
                        Structure Content
                    </button>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="content-preview">
                <div className="preview-loading">
                    <div className="loading-spinner"></div>
                    <h3>Structuring Content...</h3>
                    <div className="loading-steps">
                        <div className="loading-step active">
                            <div className="step-icon">1</div>
                            <span>Analyzing text length</span>
                        </div>
                        <div className="loading-step active">
                            <div className="step-icon">2</div>
                            <span>Optimizing for Instagram</span>
                        </div>
                        <div className="loading-step active">
                            <div className="step-icon">3</div>
                            <span>Creating slide flow</span>
                        </div>
                        <div className="loading-step">
                            <div className="step-icon">4</div>
                            <span>Generating hashtags</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="content-preview">
                <div className="preview-error">
                    <h3>Content Structuring Failed</h3>
                    <p>{error}</p>
                    <button className="btn-secondary" onClick={structureContent}>
                        <RefreshCw size={20} />
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="content-preview">
            <div className="preview-header">
                <div className="header-content">
                    <Check className="header-icon success" />
                    <div>
                        <h2>Content Structured</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <p style={{ margin: 0 }}>{content.slides.length} slides ready for visual planning</p>
                            <span className="density-badge">
                                {project.contentDensity || 'Balanced'} Mode
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="content-slides">
                {content.slides.map((slide, index) => (
                    <div key={index} className="content-slide">
                        <div className="slide-header">
                            <div className="slide-number">Slide {index + 1}</div>
                            <div
                                className="slide-intent-badge"
                                style={{ backgroundColor: getIntentBadgeColor(slide.intent) }}
                            >
                                {slide.intent}
                            </div>
                            <div className="slide-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    className="btn-icon"
                                    onClick={() => editSlide(index)}
                                    title="Edit slide"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    className="btn-icon"
                                    onClick={() => deleteSlide(index)}
                                    title="Delete slide"
                                    style={{ color: 'var(--color-error)' }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        {editingSlide === index ? (
                            <SlideEditor
                                slide={slide}
                                onSave={(updated) => saveSlideEdit(index, updated)}
                                onCancel={() => setEditingSlide(null)}
                            />
                        ) : (
                            <div className="slide-content">
                                <h3 className="slide-heading">{slide.heading}</h3>
                                <p className="slide-subtext">{slide.subtext}</p>
                                {slide.bulletPoints && slide.bulletPoints.length > 0 && (
                                    <ul className="slide-bullets">
                                        {slide.bulletPoints.map((point, i) => (
                                            <li key={i}>{point}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}

                        <div className="slide-meta">
                            <span className="meta-item">
                                Heading: {slide.heading.split(' ').length} words
                            </span>
                            <span className="meta-item">
                                Subtext: {slide.subtext.split(' ').length} words
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="content-metadata">
                <div className="metadata-section">
                    <div className="section-header">
                        <Hash size={20} />
                        <h3>Hashtags</h3>
                    </div>
                    <div className="hashtags">
                        {content.hashtags.map((tag, i) => (
                            <span key={i} className="hashtag">#{tag.replace(/^#+/, '')}</span>
                        ))}
                    </div>
                </div>

                <div className="metadata-section">
                    <div className="section-header">
                        <MessageSquare size={20} />
                        <h3>Caption</h3>
                    </div>
                    <p className="caption">{content.caption || content.description}</p>
                </div>
            </div>

            <div className="preview-actions">
                {onBack && (
                    <button className="btn-secondary" onClick={onBack}>
                        <ArrowLeft size={20} />
                        Back
                    </button>
                )}
                <button className="btn-secondary" onClick={structureContent}>
                    <RefreshCw size={20} />
                    Regenerate
                </button>
                <button className="btn-primary" onClick={approveContent}>
                    <Check size={20} />
                    Approve & Continue
                </button>
            </div>
        </div>
    )
}

function SlideEditor({ slide, onSave, onCancel }) {
    const [heading, setHeading] = useState(slide.heading)
    const [subtext, setSubtext] = useState(slide.subtext)

    const handleSave = () => {
        onSave({
            ...slide,
            heading,
            subtext,
        })
    }

    return (
        <div className="slide-editor">
            <div className="editor-field">
                <label>Heading ({heading.split(' ').length} words)</label>
                <input
                    type="text"
                    value={heading}
                    onChange={(e) => setHeading(e.target.value)}
                    placeholder="Slide heading..."
                />
            </div>
            <div className="editor-field">
                <label>Subtext ({subtext.split(' ').length} words)</label>
                <textarea
                    value={subtext}
                    onChange={(e) => setSubtext(e.target.value)}
                    placeholder="Slide subtext..."
                    rows={3}
                />
            </div>
            <div className="editor-actions">
                <button className="btn-secondary" onClick={onCancel}>
                    Cancel
                </button>
                <button className="btn-primary" onClick={handleSave}>
                    Save
                </button>
            </div>
        </div>
    )
}
