import { useState, useEffect } from 'react'
import { Image as ImageIcon, Check, RefreshCw, Terminal, Wand2, ArrowLeft } from 'lucide-react'
import { promptEngine } from '@services/generation/promptEngine'
import { useProject } from '@contexts/ProjectContext'
import './StoryboardViewer.css'

export default function StoryboardViewer({ onNext, onBack }) {
    const { project, updateProject, updatePipelineStage } = useProject()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [storyboardPrompt, setStoryboardPrompt] = useState(project.storyboardPrompt || null)
    const [showPrompt, setShowPrompt] = useState(false)

    // Generate prompt on mount if not exists
    useEffect(() => {
        if (!storyboardPrompt && project.visualPlan && project.content) {
            generatePrompt()
        }
    }, [project.visualPlan, project.content])

    const generatePrompt = async () => {
        setLoading(true)
        setError(null)

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

    if (error) {
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
                    <div className="concept-placeholder">
                        <div className="placeholder-art">
                            <ImageIcon size={64} />
                            <div className="placeholder-text">
                                <h3>Ready to Generate</h3>
                                <p>The AI has crafted a detailed visual prompt based on your:</p>
                                <ul>
                                    <li>Intent: <strong>{project.intent?.goal}</strong></li>
                                    <li>Style: <strong>{project.visualPlan?.illustration_style?.type}</strong></li>
                                    <li>Theme: <strong>{project.intent?.visualLanguage}</strong></li>
                                </ul>
                            </div>
                        </div>
                    </div>
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
        </div>
    )
}
