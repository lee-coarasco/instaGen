import { useState } from 'react'
import { useProject } from '@contexts/ProjectContext'
import { POST_TYPES, VISUAL_STYLES, PLATFORM_FORMATS } from '@config/constants'
import { getAllNiches } from '@config/niches'
import { ArrowRight, Image, Layers, Film } from 'lucide-react'
import './InputForm.css'
import VisualSelector from './VisualSelector'

function InputForm({ onNext }) {
    const { project, updateProject, addSlide } = useProject()
    const [formData, setFormData] = useState({
        postType: project.postType || POST_TYPES.CAROUSEL,
        niche: project.niche || 'tech',
        visualStyle: project.visualStyle || VISUAL_STYLES.FUTURISTIC,
        platformFormat: project.platformFormat || PLATFORM_FORMATS.INSTAGRAM_FEED,
        userIdea: project.userIdea || '',
        slideCount: project.slideCount || 5,
        slideCountMethod: project.slideCountMethod || 'manual',
        referenceImage: project.referenceImage || null,
        brandName: project.brandName || '',
        brandingPlacement: project.brandingPlacement || 'top-right',
        title: project.title || '',
    })
    const [isDragging, setIsDragging] = useState(false)

    const niches = getAllNiches()

    const processFile = (file) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setFormData({ ...formData, referenceImage: reader.result })
            }
            reader.readAsDataURL(file)
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        processFile(file)
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        processFile(file)
    }

    const removeReferenceImage = () => {
        setFormData({ ...formData, referenceImage: null })
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        // Update project with form data
        // Update project with form data
        updateProject({
            postType: formData.postType,
            niche: formData.niche,
            visualStyle: formData.visualStyle,
            platformFormat: formData.platformFormat,
            userIdea: formData.userIdea,
            slideCount: formData.slideCount,
            slideCountMethod: formData.slideCountMethod,
            referenceImage: formData.referenceImage,
            title: formData.title,
            brandName: formData.brandName,
            brandingPlacement: formData.brandingPlacement,
        })

        // If Auto method, clear any existing slides to let AI generate them from intent
        if (formData.slideCountMethod === 'auto') {
            updateProject({ slides: [] });
        }

        // Initialize slides for carousel ONLY if they don't exist and user chose MANUAL count
        if (formData.postType === POST_TYPES.CAROUSEL &&
            formData.slideCountMethod === 'manual' &&
            (!project.slides || project.slides.length === 0)) {
            for (let i = 0; i < formData.slideCount; i++) {
                addSlide({
                    id: `slide-${i}`,
                    heading: '',
                    subtext: '',
                    imageIdea: '',
                    intent: i === 0 ? 'hook' : 'explain',
                })
            }
        }

        // Move to next step
        onNext()
    }

    return (
        <div className="input-form">
            <div className="form-header">
                <h1>Let's Create Something Amazing</h1>
                <p>Describe your idea and we'll handle the rest</p>
            </div>

            <form onSubmit={handleSubmit} className="form-container glass">
                {/* Post Type Selection */}
                <div className="form-section">
                    <label className="form-label">Post Type</label>
                    <div className="post-type-grid">
                        <button
                            type="button"
                            className={`post-type-card ${formData.postType === POST_TYPES.SINGLE ? 'active' : ''
                                }`}
                            onClick={() => setFormData({ ...formData, postType: POST_TYPES.SINGLE })}
                        >
                            <Image size={32} />
                            <span>Single Post</span>
                        </button>

                        <button
                            type="button"
                            className={`post-type-card ${formData.postType === POST_TYPES.CAROUSEL ? 'active' : ''
                                }`}
                            onClick={() => setFormData({ ...formData, postType: POST_TYPES.CAROUSEL })}
                        >
                            <Layers size={32} />
                            <span>Carousel</span>
                        </button>

                        <button
                            type="button"
                            className={`post-type-card ${formData.postType === POST_TYPES.REEL_COVER ? 'active' : ''
                                }`}
                            onClick={() => setFormData({ ...formData, postType: POST_TYPES.REEL_COVER })}
                        >
                            <Film size={32} />
                            <span>Reel Cover</span>
                        </button>
                    </div>
                </div>

                {/* Niche & Slide Count Row */}
                <div className="form-row dual">
                    <div className="form-section">
                        <label className="form-label" htmlFor="niche">
                            Niche / Industry
                        </label>
                        <select
                            id="niche"
                            className="form-select"
                            value={formData.niche}
                            onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                        >
                            {niches.map((niche) => (
                                <option key={niche.id} value={niche.id}>
                                    {niche.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {formData.postType === POST_TYPES.CAROUSEL && (
                        <div className="form-section full-width">
                            <div className="section-header-row">
                                <label className="form-label">Slide Count Strategy</label>
                                <div className="strategy-toggle">
                                    <button
                                        type="button"
                                        className={`strategy-btn ${formData.slideCountMethod === 'auto' ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, slideCountMethod: 'auto', slideCount: null })}
                                    >
                                        Auto (AI Recommended)
                                    </button>
                                    <button
                                        type="button"
                                        className={`strategy-btn ${formData.slideCountMethod === 'manual' ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, slideCountMethod: 'manual', slideCount: 5 })}
                                    >
                                        Manual (Choose Fixed)
                                    </button>
                                </div>
                            </div>

                            {formData.slideCountMethod === 'manual' && (
                                <div className="slide-count-selector animated-fade">
                                    {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                        <button
                                            key={num}
                                            type="button"
                                            className={`slide-chip ${formData.slideCount === num ? 'active' : ''}`}
                                            onClick={() => setFormData({ ...formData, slideCount: num })}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                    <span className="count-hint">Specify exact slides for your carousel.</span>
                                </div>
                            )}
                            {formData.slideCountMethod === 'auto' && (
                                <div className="auto-count-hint animated-fade">
                                    <Layers size={14} />
                                    <span>AI will analyze your vision and recommend the perfect slide sequence (usually 5-8 slides).</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Visual Style */}
                <div className="form-section">
                    <label className="form-label">Visual Style</label>
                    <VisualSelector
                        selected={formData.visualStyle}
                        onSelect={(style) => setFormData({ ...formData, visualStyle: style })}
                    />
                </div>

                {/* User Idea */}
                <div className="form-section highlight">
                    <label className="form-label" htmlFor="userIdea">
                        What's your vision?
                    </label>
                    <textarea
                        id="userIdea"
                        className="form-textarea"
                        rows="4"
                        placeholder="Example: Create a carousel about AI-powered coding tools for non-technical founders. Make it modern and futuristic with soft gradients..."
                        value={formData.userIdea}
                        onChange={(e) => setFormData({ ...formData, userIdea: e.target.value })}
                        required
                    />
                    <p className="form-hint">
                        Describe your idea in natural language.
                    </p>
                </div>

                {/* Project Identity Row */}
                <div className="form-row dual top-align">
                    <div className="form-section">
                        <label className="form-label" htmlFor="projectTitle">
                            Project Title (Optional)
                        </label>
                        <input
                            type="text"
                            id="projectTitle"
                            className="form-input"
                            placeholder="e.g. AI Coding Guide 2026"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                        <p className="form-hint">A name to identify this project in your dashboard.</p>
                    </div>

                    <div className="form-section">
                        <label className="form-label">Branding (Optional)</label>
                        <div className="branding-mini-form">
                            <div className="form-field">
                                <label className="form-sub-label" htmlFor="brandName">Brand Name</label>
                                <input
                                    type="text"
                                    id="brandName"
                                    className="form-input"
                                    placeholder="Company name"
                                    value={formData.brandName}
                                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                                />
                            </div>
                            <div className="form-field" style={{ marginTop: 'var(--space-md)' }}>
                                <label className="form-sub-label" htmlFor="brandingPlacement">Placement</label>
                                <select
                                    id="brandingPlacement"
                                    className="form-select"
                                    value={formData.brandingPlacement}
                                    onChange={(e) => setFormData({ ...formData, brandingPlacement: e.target.value })}
                                >
                                    <option value="top-left">Top Left</option>
                                    <option value="top-right">Top Right</option>
                                    <option value="bottom-left">Bottom Left</option>
                                    <option value="bottom-right">Bottom Right</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <label className="form-label">Style Reference (Optional)</label>
                        <div className="reference-upload-container mini">
                            {!formData.referenceImage ? (
                                <label
                                    className={`reference-upload-label compact ${isDragging ? 'dragging' : ''}`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <Image size={24} />
                                    <span>{isDragging ? 'Drop' : 'Drag or click'}</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                            ) : (
                                <div className="reference-preview compact">
                                    <img src={formData.referenceImage} alt="Reference" />
                                    <button
                                        type="button"
                                        className="remove-reference mini"
                                        onClick={removeReferenceImage}
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <button type="submit" className="btn btn-primary btn-large btn-full">
                    Continue to Intent Analysis
                    <ArrowRight size={20} />
                </button>
            </form>
        </div>
    )
}

export default InputForm
