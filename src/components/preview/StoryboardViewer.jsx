import { useState, useEffect } from 'react'
import { Image as ImageIcon, Check, RefreshCw, Terminal, Wand2, ArrowLeft, Download, ZoomIn, X } from 'lucide-react'
import { promptEngine } from '@services/generation/promptEngine'
import { geminiClient } from '@services/ai/geminiClient'
import { useProject } from '@contexts/ProjectContext'
import './StoryboardViewer.css'

export default function StoryboardViewer({ onNext, onBack }) {
    const { project, updateProject, updatePipelineStage } = useProject()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [storyboardPrompt, setStoryboardPrompt] = useState(project.storyboardPrompt || null)
    const [showPrompt, setShowPrompt] = useState(false)
    const [overviewImage, setOverviewImage] = useState(project.storyboardOverviewImage || null)
    const [generatingOverview, setGeneratingOverview] = useState(false)
    const [lightboxOpen, setLightboxOpen] = useState(false)

    // Sync local state if project storyboardPrompt is cleared/updated externally
    useEffect(() => {
        if (project.storyboardPrompt !== storyboardPrompt) {
            setStoryboardPrompt(project.storyboardPrompt);
        }
    }, [project.storyboardPrompt, storyboardPrompt]);

    // Generate prompt on mount if not exists
    useEffect(() => {
        if (!storyboardPrompt && project.visualPlan && project.content) {
            generatePrompt()
        }
    }, [project.visualPlan, project.content])

    const generatePrompt = async () => {
        setLoading(true)
        setError(null)
        setOverviewImage(null)
        updateProject({ storyboardOverviewImage: null })

        try {
            console.log('🎨 Generating storyboard prompt...')

            const prompt = await promptEngine.generateStoryboardPrompt(
                project.intent,
                project.content,
                project.visualPlan
            )

            console.log('✅ Prompt generated')

            setStoryboardPrompt(prompt)
            updateProject({ storyboardPrompt: prompt })

        } catch (err) {
            console.error('Prompt generation error:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const generateStoryboardImage = async () => {
        // TODO: Implement actual image generation in Layer 5
        // For now, we move to the final generation stage
        onNext()
    }

    const generateOverview = async () => {
        if (!storyboardPrompt) return;
        setGeneratingOverview(true);
        setError(null);
        try {
            console.log('🎨 Generating storyboard overview image...');
            const imageBase64 = await geminiClient.generateImage(storyboardPrompt);
            setOverviewImage(imageBase64);
            updateProject({ storyboardOverviewImage: imageBase64 });
        } catch (err) {
            console.error('Failed to generate overview:', err);
            setError('Failed to generate visual overview. You can still proceed to final generation.');
        } finally {
            setGeneratingOverview(false);
        }
    };

    const handleDownload = () => {
        if (!overviewImage) return;
        const link = document.createElement('a');
        link.href = overviewImage;
        link.download = `storyboard-overview-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!project.visualPlan) {
        return (
            <div className="storyboard-viewer">
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

    if (loading) {
        return (
            <div className="storyboard-viewer">
                <div className="preview-loading">
                    <div className="loading-spinner"></div>
                    <h3>Designing Storyboard...</h3>
                    <p>Constructing the perfect prompt for your visual concept</p>
                </div>
            </div>
        )
    }

    if (error && !storyboardPrompt) {
        return (
            <div className="storyboard-viewer">
                <div className="preview-error">
                    <h3>Prompt Generation Failed</h3>
                    <p>{error}</p>
                    <button className="btn-secondary" onClick={generatePrompt}>
                        <RefreshCw size={20} />
                        Try Again
                    </button>
                    {onBack && (
                        <button className="btn-secondary" onClick={onBack} style={{ marginTop: '0.5rem' }}>
                            <ArrowLeft size={20} />
                            Back
                        </button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="storyboard-viewer">
            <div className="preview-header">
                <div className="header-content">
                    <Wand2 className="header-icon" />
                    <div>
                        <h2>Storyboard Concept</h2>
                        <p>Review the AI-generated direction before creating images</p>
                    </div>
                </div>
                <button
                    className={`btn-ghost ${showPrompt ? 'active' : ''}`}
                    onClick={() => setShowPrompt(!showPrompt)}
                    title="View Prompt Details"
                >
                    <Terminal size={18} />
                    <span>{showPrompt ? 'Hide Prompt' : 'View Prompt'}</span>
                </button>
            </div>

            <div className="storyboard-content">
                <div className="concept-preview">
                    {overviewImage ? (
                        <div className="generated-overview-wrapper">
                            <div className="generated-overview-container group" onClick={() => setLightboxOpen(true)}>
                                <img src={overviewImage} alt="Storyboard Overview" className="generated-overview-image" />
                                <div className="overview-overlay">
                                    <ZoomIn size={32} />
                                    <span>Click to Enlarge</span>
                                </div>
                            </div>
                            <div className="overview-actions-inline">
                                <button className="btn-secondary" onClick={() => setLightboxOpen(true)}>
                                    <ZoomIn size={16} /> View Full
                                </button>
                                <button className="btn-secondary" onClick={handleDownload}>
                                    <Download size={16} /> Download
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="concept-placeholder">
                            <div className="placeholder-art">
                                <ImageIcon size={64} />
                                <div className="placeholder-text">
                                    <h3>Visual Overview</h3>
                                    <p>The AI has crafted a detailed narrative flow. You can preview the entire carousel layout before generating individual slides.</p>
                                    <button
                                        className="btn-secondary"
                                        style={{ marginTop: '1rem' }}
                                        onClick={generateOverview}
                                        disabled={generatingOverview || !storyboardPrompt}
                                    >
                                        {generatingOverview ? (
                                            <>
                                                <RefreshCw className="spin" size={16} /> Generating Preview...
                                            </>
                                        ) : (
                                            <>
                                                <ImageIcon size={16} /> Generate Storyboard Overview
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {error && storyboardPrompt && (
                        <div className="error-text" style={{ color: 'var(--color-danger)', marginTop: '1rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}
                </div>

                {showPrompt && storyboardPrompt && (
                    <div className="prompt-display">
                        <div className="prompt-header">
                            <span className="prompt-label">System Prompt</span>
                            <span className="prompt-meta">{storyboardPrompt.length} chars</span>
                        </div>
                        <pre className="prompt-text">{storyboardPrompt}</pre>
                    </div>
                )}
            </div>

            <div className="preview-actions">
                {onBack && (
                    <button className="btn-secondary" onClick={onBack}>
                        <ArrowLeft size={20} />
                        Back
                    </button>
                )}
                <button className="btn-secondary" onClick={generatePrompt}>
                    <RefreshCw size={20} />
                    Regenerate Prompt
                </button>
                <button className="btn-primary" onClick={generateStoryboardImage}>
                    <Check size={20} />
                    Generate Images
                </button>
            </div>

            {lightboxOpen && overviewImage && (
                <div className="storyboard-lightbox animated-fade" onClick={() => setLightboxOpen(false)}>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <button className="lightbox-close" onClick={() => setLightboxOpen(false)}>
                            <X size={24} />
                        </button>
                        <img src={overviewImage} alt="Storyboard Overview Full" />
                        <div className="lightbox-actions">
                            <button className="btn-primary" onClick={handleDownload}>
                                <Download size={20} />
                                Download Overview
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
