import { useState } from 'react'
import { useProject } from '@contexts/ProjectContext'
import {
    CheckCircle2,
    Download,
    RefreshCw,
    LayoutGrid,
    History,
    Sparkles
} from 'lucide-react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import InstagramModal from '@components/common/InstagramModal'
import './ProjectSuccess.css'

import { useNavigate } from 'react-router-dom'
import {
    ChevronDown,
    ChevronUp,
    Copy,
    BrainCircuit,
    FileText,
    Palette,
    Check
} from 'lucide-react'

export default function ProjectSuccess() {
    const { project, resetProject } = useProject()
    const navigate = useNavigate()
    const [showPreview, setShowPreview] = useState(false)
    const [showDetailedDetails, setShowDetailedDetails] = useState(false)
    const [activeTab, setActiveTab] = useState('intent')
    const [copiedId, setCopiedId] = useState(null)

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const handleCreateNew = () => {
        resetProject()
        navigate('/create/input')
    }

    const downloadAllImages = async () => {
        const zip = new JSZip()
        const folder = zip.folder(`${project.brandName || 'instaGen'}-carousel`)

        const downloadPromises = project.finalImages.map(async (img, index) => {
            const response = await fetch(img.url)
            const blob = await response.blob()
            folder.file(`slide-${index + 1}.png`, blob)
        })

        await Promise.all(downloadPromises)
        const content = await zip.generateAsync({ type: 'blob' })
        saveAs(content, `${project.brandName || 'instaGen'}-carousel.zip`)
    }

    return (
        <div className="project-success">
            <div className="success-header">
                <CheckCircle2 size={64} className="success-icon" />
                <h1>Project Finalized!</h1>
                <p>Your AI-generated carousel is ready for the world.</p>
            </div>

            <div className="success-stats-grid">
                <div className="stat-card">
                    <span className="stat-label">Slides</span>
                    <span className="stat-value">{project.content?.slides?.length || 0}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Format</span>
                    <span className="stat-value">1:1 Square</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Niche</span>
                    <span className="stat-value" style={{ textTransform: 'capitalize' }}>{project.niche || 'Custom'}</span>
                </div>
            </div>

            <div className="action-grid">
                <button className="main-action-card" onClick={downloadAllImages}>
                    <div className="icon-wrapper download">
                        <Download size={28} />
                    </div>
                    <div className="action-info">
                        <h3>Download All (ZIP)</h3>
                        <p>Get all high-res slides in one bundle</p>
                    </div>
                </button>

                <button className="main-action-card secondary" onClick={() => setShowPreview(true)}>
                    <div className="icon-wrapper visual">
                        <LayoutGrid size={28} />
                    </div>
                    <div className="action-info">
                        <h3>Instagram Preview</h3>
                        <p>See the live post experience</p>
                    </div>
                </button>
            </div>

            <div className="export-metadata shadow-sm">
                <h3>Design Strategy Summary</h3>
                <div className="specs-grid">
                    <div className="spec-item">
                        <span className="spec-label">Style Language:</span>
                        <code>{project.intent?.visual_language || 'Professional'}</code>
                    </div>
                    <div className="spec-item">
                        <span className="spec-label">Tone:</span>
                        <code>{project.intent?.tone || 'Engaging'}</code>
                    </div>
                    <div className="spec-item">
                        <span className="spec-label">Primary Color:</span>
                        <div className="spec-color-row">
                            <div className="color-dot" style={{ backgroundColor: project.visualPlan?.design_tokens?.colors?.primary }}></div>
                            <code>{project.visualPlan?.design_tokens?.colors?.primary}</code>
                        </div>
                    </div>
                    <div className="spec-item">
                        <span className="spec-label">Heading Font:</span>
                        <code>{project.visualPlan?.design_tokens?.typography?.heading_font?.split(',')[0]}</code>
                    </div>
                </div>
            </div>

            {project.usage && (
                <div className="export-metadata usage-summary shadow-sm">
                    <h3>Resource Usage</h3>
                    <div className="specs-grid">
                        <div className="spec-item">
                            <span className="spec-label">Total Tokens:</span>
                            <code>{project.usage.totalTokens.toLocaleString()}</code>
                        </div>
                        <div className="spec-item">
                            <span className="spec-label">Estimated Cost:</span>
                            <code className="cost-value">${project.usage.estimatedCost.toFixed(4)} USD</code>
                        </div>
                        <div className="spec-item">
                            <span className="spec-label">Input / Output:</span>
                            <code>{project.usage.inputTokens.toLocaleString()} / {project.usage.outputTokens.toLocaleString()}</code>
                        </div>
                        <div className="spec-item">
                            <span className="spec-label">AI Model:</span>
                            <code>Gemini 1.5 Flash</code>
                        </div>
                    </div>
                </div>
            )}

            {/* Detailed Project Breakdown Accordion */}
            <div className={`detailed-breakdown ${showDetailedDetails ? 'open' : ''}`}>
                <button
                    className="details-toggle-btn glass"
                    onClick={() => setShowDetailedDetails(!showDetailedDetails)}
                >
                    <div className="toggle-left">
                        <FileText size={20} />
                        <span>Detailed Project Breakdown</span>
                    </div>
                    {showDetailedDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {showDetailedDetails && (
                    <div className="details-content glass">
                        <div className="details-tabs">
                            <button
                                className={`tab-btn ${activeTab === 'input' ? 'active' : ''}`}
                                onClick={() => setActiveTab('input')}
                            >
                                <LayoutGrid size={16} /> Input
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'intent' ? 'active' : ''}`}
                                onClick={() => setActiveTab('intent')}
                            >
                                <BrainCircuit size={16} /> Intent
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'content' ? 'active' : ''}`}
                                onClick={() => setActiveTab('content')}
                            >
                                <FileText size={16} /> Content
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'visuals' ? 'active' : ''}`}
                                onClick={() => setActiveTab('visuals')}
                            >
                                <Palette size={16} /> Visuals
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'storyboard' ? 'active' : ''}`}
                                onClick={() => setActiveTab('storyboard')}
                            >
                                <History size={16} /> Storyboard
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'prompts' ? 'active' : ''}`}
                                onClick={() => setActiveTab('prompts')}
                            >
                                <Sparkles size={16} /> Prompts
                            </button>
                        </div>

                        <div className="tab-panel">
                            {activeTab === 'input' && (
                                <div className="panel-content input-panel">
                                    <div className="detail-row">
                                        <label>User Idea / Vision:</label>
                                        <div className="text-box highlight">{project.userIdea || 'N/A'}</div>
                                    </div>
                                    <div className="design-token-grid">
                                        <div className="token-card">
                                            <h4>Project Settings</h4>
                                            <div className="token-list">
                                                <div className="token-item">
                                                    <span>Post Type</span>
                                                    <code>{project.postType}</code>
                                                </div>
                                                <div className="token-item">
                                                    <span>Niche</span>
                                                    <code>{project.niche}</code>
                                                </div>
                                                <div className="token-item">
                                                    <span>Visual Style</span>
                                                    <code>{project.visualStyle}</code>
                                                </div>
                                                <div className="token-item">
                                                    <span>Platform</span>
                                                    <code>{project.platformFormat}</code>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="token-card">
                                            <h4>Branding</h4>
                                            <div className="token-list">
                                                <div className="token-item">
                                                    <span>Brand Name</span>
                                                    <code>{project.brandName || 'N/A'}</code>
                                                </div>
                                                <div className="token-item">
                                                    <span>Placement</span>
                                                    <code>{project.brandingPlacement || 'N/A'}</code>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'intent' && (
                                <div className="panel-content intent-panel">
                                    <div className="detail-row">
                                        <label>Core Strategy:</label>
                                        <div className="text-box">{project.intent?.strategy || 'N/A'}</div>
                                    </div>
                                    <div className="detail-row">
                                        <label>Target Audience:</label>
                                        <div className="text-box">{project.intent?.target_audience || 'N/A'}</div>
                                    </div>
                                    <div className="detail-row">
                                        <label>Key Takeaway:</label>
                                        <div className="text-box">{project.intent?.key_takeaway || 'N/A'}</div>
                                    </div>
                                    <div className="detail-row">
                                        <label>Tone & Style:</label>
                                        <div className="text-box">
                                            {project.intent?.tone} - {project.intent?.visual_language}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'content' && (
                                <div className="panel-content content-panel">
                                    {project.content?.slides?.map((slide, idx) => (
                                        <div key={idx} className="slide-detail-card">
                                            <div className="slide-card-header">
                                                <h4>Slide {idx + 1} ({slide.intent})</h4>
                                                <button
                                                    className={`copy-chip ${copiedId === `s${idx}` ? 'copied' : ''}`}
                                                    onClick={() => handleCopy(`${slide.heading}\n${slide.subtext}`, `s${idx}`)}
                                                >
                                                    {copiedId === `s${idx}` ? <Check size={14} /> : <Copy size={14} />}
                                                    {copiedId === `s${idx}` ? 'Copied' : 'Copy Text'}
                                                </button>
                                            </div>
                                            <div className="slide-card-body">
                                                <div className="slide-line"><strong>Heading:</strong> {slide.heading}</div>
                                                <div className="slide-line"><strong>Subtext:</strong> {slide.subtext}</div>
                                                {slide.bulletPoints && slide.bulletPoints.length > 0 && (
                                                    <div className="slide-bullets">
                                                        <strong>Bullets:</strong>
                                                        <ul>
                                                            {slide.bulletPoints.map((bp, i) => <li key={i}>{bp}</li>)}
                                                        </ul>
                                                    </div>
                                                )}
                                                <div className="slide-idea">
                                                    <strong>Image Idea:</strong> {slide.imageIdea}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'visuals' && (
                                <div className="panel-content visuals-panel">
                                    <div className="design-token-grid">
                                        <div className="token-card">
                                            <h4>Colors</h4>
                                            <div className="token-list">
                                                {Object.entries(project.visualPlan?.design_tokens?.colors || {}).map(([name, val]) => (
                                                    <div key={name} className="token-item">
                                                        <span>{name}</span>
                                                        <div className="token-value-row">
                                                            <div className="color-preview" style={{ backgroundColor: val }}></div>
                                                            <code>{val}</code>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="token-card">
                                            <h4>Typography</h4>
                                            <div className="token-list">
                                                <div className="token-item">
                                                    <span>Heading</span>
                                                    <code>{project.visualPlan?.design_tokens?.typography?.heading_font}</code>
                                                </div>
                                                <div className="token-item">
                                                    <span>Body</span>
                                                    <code>{project.visualPlan?.design_tokens?.typography?.body_font}</code>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="token-card full">
                                            <h4>Layout Strategy</h4>
                                            <p className="token-desc">{project.visualPlan?.layout_strategy}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'storyboard' && (
                                <div className="panel-content storyboard-panel">
                                    <div className="detail-row">
                                        <label>Global Storyboard Concept:</label>
                                        <div className="text-box">{project.storyboardPrompt || 'N/A'}</div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'prompts' && (
                                <div className="panel-content prompts-panel">
                                    {project.finalImages?.map((img, idx) => (
                                        <div key={idx} className="slide-detail-card">
                                            <div className="slide-card-header">
                                                <h4>Slide {idx + 1} Prompt</h4>
                                                <button
                                                    className={`copy-chip ${copiedId === `p${idx}` ? 'copied' : ''}`}
                                                    onClick={() => handleCopy(img.prompt, `p${idx}`)}
                                                >
                                                    {copiedId === `p${idx}` ? <Check size={14} /> : <Copy size={14} />}
                                                    {copiedId === `p${idx}` ? 'Copied' : 'Copy Prompt'}
                                                </button>
                                            </div>
                                            <div className="slide-card-body">
                                                <div className="text-box prompt-text">{img.prompt || 'Pending generation...'}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="footer-actions">
                <button className="btn-secondary" onClick={handleCreateNew}>
                    <RefreshCw size={18} />
                    Create Another Project
                </button>
            </div>

            {/* Reusable Instagram Preview Modal */}
            <InstagramModal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                images={project.finalImages}
                brandName={project.brandName}
            />
        </div>
    )
}
