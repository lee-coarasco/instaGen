import { useState, useEffect } from 'react'
import { useProject } from '@contexts/ProjectContext'
import {
    CheckCircle2,
    Download,
    RefreshCw,
    LayoutGrid,
    History,
    Sparkles,
    Loader
} from 'lucide-react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import InstagramModal from '@components/common/InstagramModal'
import './ProjectSuccess.css'
import { formatCurrency } from '@utils/formatting'

import { useNavigate, useParams } from 'react-router-dom'
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
    const { project, resetProject, fetchProjectById } = useProject()
    const navigate = useNavigate()
    const { id: urlId } = useParams()
    const [loading, setLoading] = useState(!!urlId && (!project.id || project.id !== urlId))

    // Handle initial hydration if arriving from a direct link or dashboard
    useEffect(() => {
        if (urlId && (!project.id || project.id !== urlId)) {
            setLoading(true)
            fetchProjectById(urlId).finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [urlId, project.id, fetchProjectById])

    // Ensure we have images (might be in stages.finalImages if root not synced)
    const finalImages = project.finalImages?.length > 0
        ? project.finalImages
        : project.stages?.finalImages || []

    const [showPreview, setShowPreview] = useState(false)
    const [showDetailedDetails, setShowDetailedDetails] = useState(false)
    const [activeTab, setActiveTab] = useState('intent')
    const [copiedId, setCopiedId] = useState(null)
    const [expandedHistory, setExpandedHistory] = useState(null)
    const [lightboxImage, setLightboxImage] = useState(null)

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const handleCreateNew = () => {
        resetProject()
        navigate('/create/input')
    }

    const [downloadingZip, setDownloadingZip] = useState(false)

    const getProxyUrl = (url) => {
        if (!url || !url.startsWith('https://storage.googleapis.com')) return url
        const API_URL = 'http://localhost:5000/api'
        return `${API_URL} /projects/proxy - image ? url = ${encodeURIComponent(url)} `
    }

    const downloadAllImages = async () => {
        if (downloadingZip || !finalImages.length) return
        setDownloadingZip(true)
        console.log('📦 Starting ZIP generation for', finalImages.length, 'images')

        try {
            const zip = new JSZip()
            const brand = project.brandName || project.title || 'instagen'
            const folderName = `${brand} -carousel`.replace(/[^a-z0-9]/gi, '-').toLowerCase()
            const folder = zip.folder(folderName)
            const token = localStorage.getItem('token')

            const downloadPromises = finalImages.map(async (img, index) => {
                const rawUrl = typeof img === 'string' ? img : img.url
                if (!rawUrl) return;

                try {
                    const proxyUrl = getProxyUrl(rawUrl)
                    const response = await fetch(proxyUrl, {
                        headers: token ? { 'Authorization': `Bearer ${token} ` } : {}
                    })
                    if (!response.ok) throw new Error(`HTTP ${response.status} `)
                    const blob = await response.blob()
                    folder.file(`slide - ${index + 1}.png`, blob)
                    console.log(`✅ Added slide ${index + 1} to ZIP`)
                } catch (err) {
                    console.error(`❌ Failed slide ${index + 1}: `, err)
                }
            })

            await Promise.all(downloadPromises)

            const zipFiles = Object.keys(zip.files).length
            if (zipFiles <= 1) { // 1 because folder itself is an entry
                throw new Error('No images were successfully fetched to include in ZIP. Try individual downloads.')
            }

            const content = await zip.generateAsync({ type: 'blob' })
            saveAs(content, `${folderName}.zip`)
            console.log('🚀 ZIP Download Triggered')
        } catch (err) {
            console.error('ZIP generation failed:', err)
            alert(`ZIP failed: ${err.message} `)
        } finally {
            setDownloadingZip(false)
        }
    }

    const forceDownload = async (url, filename) => {
        try {
            const token = localStorage.getItem('token')
            const proxyUrl = getProxyUrl(url)
            const response = await fetch(proxyUrl, {
                headers: token ? { 'Authorization': `Bearer ${token} ` } : {}
            })
            if (!response.ok) throw new Error(`HTTP ${response.status} `)
            const blob = await response.blob()
            const blobUrl = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = blobUrl
            link.download = filename || 'instaGen-image.png'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(blobUrl)
        } catch (err) {
            console.error('Download failed:', err)
            window.open(url, '_blank')
        }
    }

    if (loading) {
        return (
            <div className="project-success loading-state">
                <Loader className="spin" size={48} />
                <h3>Hydrating Visuals...</h3>
                <p>Retrieving all slides and project data.</p>
            </div>
        )
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
                    <span className="stat-label">Project</span>
                    <span className="stat-value">{project.title || project.userIdea || 'Untitled'}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Slides</span>
                    <span className="stat-value">{project.content?.slides?.length || project.finalImages?.length || project.stages?.finalImages?.length || 0}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Niche</span>
                    <span className="stat-value" style={{ textTransform: 'capitalize' }}>{project.niche || 'Custom'}</span>
                </div>
            </div>

            <div className="action-grid">
                <button
                    className={`main - action - card ${downloadingZip ? 'disabled' : ''} `}
                    onClick={downloadAllImages}
                    disabled={downloadingZip}
                >
                    <div className="icon-wrapper download">
                        {downloadingZip ? <Loader className="spin" size={28} /> : <Download size={28} />}
                    </div>
                    <div className="action-info">
                        <h3>{downloadingZip ? 'Preparing Bundle...' : 'Download All (ZIP)'}</h3>
                        <p>{downloadingZip ? 'Gathering high-res slides...' : 'Get all high-res slides in one bundle'}</p>
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
                        <code>{project.intent?.visual_language || project.visualPlan?.illustration_style?.type || 'Professional'}</code>
                    </div>
                    <div className="spec-item">
                        <span className="spec-label">Tone:</span>
                        <code>{project.intent?.tone || project.visualPlan?.illustration_style?.mood || 'Engaging'}</code>
                    </div>
                    <div className="spec-item">
                        <span className="spec-label">Primary Color:</span>
                        <div className="spec-color-row">
                            <div className="color-dot" style={{ backgroundColor: project.visualPlan?.design_tokens?.colors?.primary }}></div>
                            <code>{project.visualPlan?.design_tokens?.colors?.primary || 'N/A'}</code>
                        </div>
                    </div>
                    <div className="spec-item">
                        <span className="spec-label">Branding:</span>
                        <code>{project.brandName || 'instaGen'} ({project.brandingPlacement || 'Top Right'})</code>
                    </div>
                </div>
            </div>

            {project.usage && (
                <div className="export-metadata usage-summary shadow-sm">
                    <h3>Resource Usage</h3>
                    <div className="specs-grid">
                        <div className="spec-item">
                            <span className="spec-label">Total Tokens:</span>
                            <code>{project.usage.totalTokens?.toLocaleString() || 0}</code>
                        </div>
                        <div className="spec-item">
                            <span className="spec-label">Estimated Cost:</span>
                            <code className="cost-value">{formatCurrency(project.usage.estimatedCost || 0)}</code>
                        </div>
                        <div className="spec-item">
                            <span className="spec-label">Input / Output:</span>
                            <code>{project.usage.inputTokens?.toLocaleString() || 0} / {project.usage.outputTokens?.toLocaleString() || 0}</code>
                        </div>
                        <div className="spec-item">
                            <span className="spec-label">AI Models Used:</span>
                            <code>{localStorage.getItem('instaGen-textModel')?.replace('models/', '') || 'gemini'} <br /> {localStorage.getItem('instaGen-imageModel')?.replace('models/', '') || 'imagen'}</code>
                        </div>
                    </div>
                </div>
            )}

            {/* Final Visuals Section with History */}
            <div className="final-visuals-section">
                <div className="section-header-mini">
                    <Sparkles size={20} />
                    <h3>Final Visuals & History</h3>
                </div>

                <div className="visuals-grid-main">
                    {finalImages.map((img, idx) => (
                        <div key={idx} className={`final - visual - card glass ${expandedHistory === idx ? 'expanded' : ''} `}>
                            <div className="visual-preview-container">
                                <img src={img.url} alt={`Slide ${idx + 1} `} onClick={() => setLightboxImage(img.url)} />
                                <div className="slide-badge">Slide {idx + 1}</div>

                                {img.generationHistory?.length > 0 && (
                                    <button
                                        className={`history - toggle - btn ${expandedHistory === idx ? 'active' : ''} `}
                                        onClick={() => setExpandedHistory(expandedHistory === idx ? null : idx)}
                                        title="View Version History"
                                    >
                                        <History size={16} />
                                        <span>{img.generationHistory.length} versions</span>
                                    </button>
                                )}
                            </div>

                            {expandedHistory === idx && img.generationHistory?.length > 0 && (
                                <div className="history-reveal-panel animated-fade-in">
                                    <div className="history-header">
                                        <span>Version History</span>
                                    </div>
                                    <div className="history-strip-mini">
                                        {/* Current version as first item */}
                                        <div className="history-item-mini active">
                                            <div className="history-thumb-wrapper">
                                                <img src={img.url} alt="Current" onClick={() => setLightboxImage(img.url)} />
                                                <button
                                                    className="mini-history-download"
                                                    onClick={(e) => { e.stopPropagation(); forceDownload(img.url, `slide - ${idx + 1} -latest.png`); }}
                                                    title="Download current version"
                                                >
                                                    <Download size={12} />
                                                </button>
                                            </div>
                                            <span className="version-tag">Current</span>
                                        </div>
                                        {img.generationHistory.map((h, hIdx) => (
                                            <div key={hIdx} className="history-item-mini">
                                                <div className="history-thumb-wrapper">
                                                    <img src={h.url} alt={`v${hIdx} `} onClick={() => setLightboxImage(h.url)} />
                                                    <button
                                                        className="mini-history-download"
                                                        onClick={(e) => { e.stopPropagation(); forceDownload(h.url, `slide - ${idx + 1} -v${img.generationHistory.length - hIdx}.png`); }}
                                                        title={`Download version ${img.generationHistory.length - hIdx} `}
                                                    >
                                                        <Download size={12} />
                                                    </button>
                                                </div>
                                                <span className="version-tag">v{img.generationHistory.length - hIdx}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="history-hint-text">Click any version to preview full-res.</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Lightbox for History/Image Preview */}
            {lightboxImage && (
                <div className="success-lightbox-overlay" onClick={() => setLightboxImage(null)}>
                    <div className="success-lightbox-content animated-scale-in" onClick={e => e.stopPropagation()}>
                        <div className="lightbox-image-container">
                            <img src={lightboxImage} alt="Preview" />
                            <div className="lightbox-image-actions">
                                <button
                                    className="btn-primary lightbox-download-trigger"
                                    onClick={() => forceDownload(lightboxImage, 'instaGen-download.png')}
                                >
                                    <Download size={20} />
                                    <span>Download Original</span>
                                </button>
                            </div>
                        </div>
                        <button className="close-lightbox" onClick={() => setLightboxImage(null)}>✕</button>
                    </div>
                </div>
            )}

            {/* Detailed Project Breakdown Accordion */}
            <div className={`detailed - breakdown ${showDetailedDetails ? 'open' : ''} `}>
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
                                className={`tab - btn ${activeTab === 'input' ? 'active' : ''} `}
                                onClick={() => setActiveTab('input')}
                            >
                                <LayoutGrid size={16} /> Input
                            </button>
                            <button
                                className={`tab - btn ${activeTab === 'intent' ? 'active' : ''} `}
                                onClick={() => setActiveTab('intent')}
                            >
                                <BrainCircuit size={16} /> Intent
                            </button>
                            <button
                                className={`tab - btn ${activeTab === 'content' ? 'active' : ''} `}
                                onClick={() => setActiveTab('content')}
                            >
                                <FileText size={16} /> Content
                            </button>
                            <button
                                className={`tab - btn ${activeTab === 'visuals' ? 'active' : ''} `}
                                onClick={() => setActiveTab('visuals')}
                            >
                                <Palette size={16} /> Visuals
                            </button>
                            <button
                                className={`tab - btn ${activeTab === 'storyboard' ? 'active' : ''} `}
                                onClick={() => setActiveTab('storyboard')}
                            >
                                <History size={16} /> Storyboard
                            </button>
                            <button
                                className={`tab - btn ${activeTab === 'prompts' ? 'active' : ''} `}
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
                                        <label>Primary Goal:</label>
                                        <div className="text-box">{project.intent?.goal || project.intent?.strategy || 'N/A'}</div>
                                    </div>
                                    <div className="detail-row">
                                        <label>Target Audience:</label>
                                        <div className="text-box">{project.intent?.audience || project.intent?.target_audience || 'N/A'}</div>
                                    </div>
                                    <div className="detail-row">
                                        <label>Key Messages:</label>
                                        <div className="text-box">
                                            {project.intent?.key_messages?.length > 0
                                                ? <ul style={{ paddingLeft: '1.2rem', margin: '0.5rem 0' }}>
                                                    {project.intent.key_messages.map((m, i) => <li key={i}>{m}</li>)}
                                                </ul>
                                                : (project.intent?.key_takeaway || 'N/A')}
                                        </div>
                                    </div>
                                    <div className="detail-row">
                                        <label>Tone & Visual Style:</label>
                                        <div className="text-box">
                                            <strong>Tone:</strong> {project.intent?.tone || 'N/A'}<br />
                                            <strong>Visual Language:</strong> {project.intent?.visual_language || 'N/A'}<br />
                                            {project.intent?.emotions && <strong>Emotions:</strong>} {project.intent?.emotions?.join(', ')}
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
                                                    className={`copy - chip ${copiedId === `s${idx}` ? 'copied' : ''} `}
                                                    onClick={() => handleCopy(`${slide.heading} \n${slide.subtext} `, `s${idx} `)}
                                                >
                                                    {copiedId === `s${idx} ` ? <Check size={14} /> : <Copy size={14} />}
                                                    {copiedId === `s${idx} ` ? 'Copied' : 'Copy Text'}
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
                                                {Object.keys(project.visualPlan?.design_tokens?.colors || {}).length === 0 && <span className="text-muted">N/A</span>}
                                            </div>
                                        </div>
                                        <div className="token-card">
                                            <h4>Typography</h4>
                                            <div className="token-list">
                                                <div className="token-item">
                                                    <span>Heading</span>
                                                    <code>{project.visualPlan?.design_tokens?.typography?.heading_font || 'N/A'}</code>
                                                </div>
                                                <div className="token-item">
                                                    <span>Body</span>
                                                    <code>{project.visualPlan?.design_tokens?.typography?.body_font || 'N/A'}</code>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="token-card full">
                                            <h4>Layout Strategy</h4>
                                            <p className="token-desc">
                                                {project.visualPlan?.layout_strategy ||
                                                    project.visualPlan?.overall_mood ||
                                                    project.visualPlan?.concept ||
                                                    'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'storyboard' && (
                                <div className="panel-content storyboard-panel">
                                    {project.storyboardOverviewImage && (
                                        <div className="detail-row" style={{ marginBottom: '1.5rem' }}>
                                            <label>Storyboard Overview Preview:</label>
                                            <div className="storyboard-overview-preview">
                                                <img
                                                    src={project.storyboardOverviewImage}
                                                    alt="Storyboard Overview"
                                                    style={{
                                                        maxWidth: '100%',
                                                        borderRadius: 'var(--radius-md)',
                                                        border: '1px solid var(--glass-border)',
                                                        boxShadow: 'var(--shadow-md)'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
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
                                                    className={`copy - chip ${copiedId === `p${idx}` ? 'copied' : ''} `}
                                                    onClick={() => handleCopy(img.prompt, `p${idx} `)}
                                                >
                                                    {copiedId === `p${idx} ` ? <Check size={14} /> : <Copy size={14} />}
                                                    {copiedId === `p${idx} ` ? 'Copied' : 'Copy Prompt'}
                                                </button>
                                            </div>
                                            <div className="slide-card-body">
                                                <div className="text-box prompt-text">{img.prompt || 'Pending generation...'}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!project.finalImages || project.finalImages.length === 0) && <div className="text-center p-4">No images generated yet.</div>}
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
                images={finalImages}
                brandName={project.brandName}
            />
        </div>
    )
}
