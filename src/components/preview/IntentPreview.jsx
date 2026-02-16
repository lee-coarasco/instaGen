import { useState } from 'react'
import { useProject } from '@contexts/ProjectContext'
import { intentEngine } from '@services/intent/intentEngine'
import { Sparkles, CheckCircle, AlertCircle, Loader, ArrowRight, RefreshCw, ArrowLeft } from 'lucide-react'
import './IntentPreview.css'

function IntentPreview({ onNext, onBack }) {
    const { project, updateProject } = useProject()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [intent, setIntent] = useState(project.intent || null)
    const [analyzing, setAnalyzing] = useState(false)

    const analyzeIntent = async () => {
        setAnalyzing(true)
        setLoading(true)
        setError(null)

        try {
            // Get user idea from project context
            const userIdea = project.userIdea

            if (!userIdea) {
                throw new Error("No user idea found. Please go back to the input step.")
            }

            const result = await intentEngine.analyzeIntent(userIdea, {
                niche: project.niche,
                postType: project.postType,
                referenceImage: project.referenceImage,
                brandName: project.brandName,
                brandingPlacement: project.brandingPlacement,
            })

            setIntent(result)
            updateProject({ intent: result })
        } catch (err) {
            setError(err.message)
            console.error('Intent analysis error:', err)
        } finally {
            setLoading(false)
            setAnalyzing(false)
        }
    }

    const handleApprove = () => {
        if (intent) {
            onNext()
        }
    }

    const handleRefine = async () => {
        // TODO: Implement refinement with user feedback
        console.log('Refine intent')
    }

    return (
        <div className="intent-preview">
            <div className="preview-header">
                <h2>Creative Intent Analysis</h2>
                <p>AI is analyzing your idea to understand the creative direction</p>
            </div>

            {!intent && !loading && (
                <div className="analyze-prompt glass">
                    <div className="prompt-icon">
                        <Sparkles size={48} />
                    </div>
                    <h3>Ready to Analyze</h3>
                    <p>Click below to let AI understand your creative intent</p>
                    <div className="action-row" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        {onBack && (
                            <button onClick={onBack} className="btn btn-secondary btn-large">
                                <ArrowLeft size={20} />
                                Back
                            </button>
                        )}
                        <button
                            onClick={analyzeIntent}
                            className="btn btn-primary btn-large"
                            disabled={analyzing}
                        >
                            {analyzing ? (
                                <>
                                    <Loader className="spin" size={20} />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={20} />
                                    Analyze Intent
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {loading && !intent && (
                <div className="loading-state glass">
                    <Loader className="spin" size={48} />
                    <h3>Analyzing Your Idea...</h3>
                    <p>Understanding audience, tone, and visual direction</p>
                    <div className="loading-steps">
                        <div className="loading-step active">
                            <CheckCircle size={16} />
                            <span>Processing input</span>
                        </div>
                        <div className="loading-step active">
                            <Loader className="spin" size={16} />
                            <span>Extracting intent</span>
                        </div>
                        <div className="loading-step">
                            <div className="step-dot"></div>
                            <span>Validating direction</span>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="error-state glass">
                    <AlertCircle size={48} />
                    <h3>Analysis Failed</h3>
                    <p>{error}</p>
                    <button onClick={analyzeIntent} className="btn btn-secondary">
                        <RefreshCw size={20} />
                        Try Again
                    </button>
                </div>
            )}

            {intent && (
                <div className="intent-result">
                    <div className="result-card glass">
                        <div className="result-header">
                            <CheckCircle size={24} className="success-icon" />
                            <h3>Intent Understood</h3>
                        </div>

                        <div className="intent-grid">
                            <div className="intent-item">
                                <label>Goal</label>
                                <p>{intent.goal}</p>
                            </div>

                            <div className="intent-item">
                                <label>Target Audience</label>
                                <p>{intent.audience}</p>
                            </div>

                            <div className="intent-item">
                                <label>Tone</label>
                                <p>{intent.tone}</p>
                            </div>

                            <div className="intent-item">
                                <label>Visual Language</label>
                                <p>{intent.visual_language}</p>
                            </div>

                            <div className="intent-item">
                                <label>Consistency Level</label>
                                <p className="consistency-badge">{intent.consistency_level}</p>
                            </div>

                            <div className="intent-item">
                                <label>Complexity</label>
                                <p>{intent.complexity}</p>
                            </div>
                        </div>

                        {intent.key_messages && intent.key_messages.length > 0 && (
                            <div className="key-messages">
                                <label>Key Messages</label>
                                <ul>
                                    {intent.key_messages.map((message, idx) => (
                                        <li key={idx}>{message}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {intent.emotions && intent.emotions.length > 0 && (
                            <div className="emotions">
                                <label>Emotions to Evoke</label>
                                <div className="emotion-tags">
                                    {intent.emotions.map((emotion, idx) => (
                                        <span key={idx} className="emotion-tag">{emotion}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {intent.suggested_slide_count && (
                            <div className="slide-suggestion">
                                <label>Suggested Slide Count</label>
                                <p className="slide-count">{intent.suggested_slide_count} slides</p>
                            </div>
                        )}
                    </div>

                    <div className="action-buttons">
                        {onBack && (
                            <button onClick={onBack} className="btn btn-secondary">
                                <ArrowLeft size={20} />
                                Back
                            </button>
                        )}
                        <button onClick={handleRefine} className="btn btn-secondary">
                            <RefreshCw size={20} />
                            Refine Intent
                        </button>

                        <button onClick={handleApprove} className="btn btn-primary btn-large">
                            Looks Good, Continue
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default IntentPreview
