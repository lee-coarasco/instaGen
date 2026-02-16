import { useState } from 'react'
import { Palette, Check, RefreshCw, Eye, ArrowLeft, Type, Maximize } from 'lucide-react'
import { visualPlanner } from '@services/visual/visualPlanner'
import { useProject } from '@contexts/ProjectContext'
import { SUPPORTED_FONTS, FONT_SIZES, SPACING_OPTIONS } from '@config/constants'
import './VisualPreview.css'

// Utility to convert HSL to Hex (needed for <input type="color">)
const hslToHex = (h, s, l) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
};

const parseColorToHex = (color) => {
    if (!color) return '#000000';
    if (color.startsWith('#')) return color;
    if (color.startsWith('hsl')) {
        const matches = color.match(/\d+(\.\d+)?/g);
        if (matches && matches.length >= 3) {
            return hslToHex(parseFloat(matches[0]), parseFloat(matches[1]), parseFloat(matches[2]));
        }
    }
    return '#7c3aed'; // Default brand color
};

export default function VisualPreview({ onNext, onBack }) {
    const { project, updateProject, updatePipelineStage } = useProject()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [visualPlan, setVisualPlan] = useState(project.visualPlan || null)

    const createVisualPlan = async () => {
        setLoading(true)
        setError(null)

        try {
            console.log('🎨 Creating visual plan...')

            const plan = await visualPlanner.createVisualPlan(
                project.intent,
                project.content
            )

            console.log('✅ Visual plan created:', plan)

            setVisualPlan(plan)
            updateProject({ visualPlan: plan })

        } catch (err) {
            console.error('Visual planning error:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleTokenChange = (category, key, value) => {
        if (!visualPlan) return

        const updatedPlan = {
            ...visualPlan,
            design_tokens: {
                ...visualPlan.design_tokens,
                [category]: {
                    ...visualPlan.design_tokens[category],
                    [key]: value
                }
            }
        }
        setVisualPlan(updatedPlan)
        updateProject({ visualPlan: updatedPlan })
    }

    const approveVisualPlan = () => {
        onNext()
    }

    if (!project.content) {
        return (
            <div className="visual-preview">
                <div className="preview-empty">
                    <Palette size={48} />
                    <h3>No Content Data</h3>
                    <p>Please complete content structuring first</p>
                </div>
            </div>
        )
    }

    if (!visualPlan && !loading) {
        return (
            <div className="visual-preview">
                <div className="preview-header">
                    <div className="header-content">
                        <Palette className="header-icon" />
                        <div>
                            <h2>Visual Planning</h2>
                            <p>Create a comprehensive design system for your carousel</p>
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
                    <button className="btn-primary" onClick={createVisualPlan}>
                        <Palette size={20} />
                        Create Visual Plan
                    </button>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="visual-preview">
                <div className="preview-loading">
                    <div className="loading-spinner"></div>
                    <h3>Creating Visual Plan...</h3>
                    <div className="loading-steps">
                        <div className="loading-step active">
                            <div className="step-icon">1</div>
                            <span>Generating design tokens</span>
                        </div>
                        <div className="loading-step active">
                            <div className="step-icon">2</div>
                            <span>Defining illustration style</span>
                        </div>
                        <div className="loading-step active">
                            <div className="step-icon">3</div>
                            <span>Planning slide visuals</span>
                        </div>
                        <div className="loading-step">
                            <div className="step-icon">4</div>
                            <span>Creating storyboard</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="visual-preview">
                <div className="preview-error">
                    <h3>Visual Planning Failed</h3>
                    <p>{error}</p>
                    <button className="btn-secondary" onClick={createVisualPlan}>
                        <RefreshCw size={20} />
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="visual-preview">
            <div className="preview-header">
                <div className="header-content">
                    <Check className="header-icon success" />
                    <div>
                        <h2>Visual Plan Ready</h2>
                        <p>Complete design system created for {visualPlan.slide_visuals.length} slides</p>
                        {project.intent.referenceStyle && (
                            <div className="reference-badge">
                                <Eye size={14} />
                                Style Extracted from Reference Image
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="design-system-layout">
                {/* Editor Sidebar */}
                <div className="design-editor shadow-lg">
                    <div className="editor-header">
                        <h3><Palette size={20} /> Design Tokens</h3>
                    </div>

                    <div className="editor-sections">
                        {/* Colors */}
                        <div className="editor-group">
                            <label className="section-label">Colors</label>
                            <div className="color-grid">
                                {Object.entries(visualPlan.design_tokens.colors).map(([key, value]) => (
                                    <div key={key} className="color-field">
                                        <div className="color-info">
                                            <span className="color-name">{key.replace('_', ' ')}</span>
                                            <input
                                                type="color"
                                                value={parseColorToHex(value)}
                                                onChange={(e) => handleTokenChange('colors', key, e.target.value)}
                                                className="color-picker-input"
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            className="editor-input color-text"
                                            value={value}
                                            onChange={(e) => handleTokenChange('colors', key, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Typography */}
                        <div className="editor-group">
                            <label className="section-label">Typography</label>
                            <div className="field-row">
                                <div className="field-item">
                                    <label>Font Family</label>
                                    <select
                                        className="editor-select"
                                        value={visualPlan.design_tokens.typography.heading_font}
                                        onChange={(e) => handleTokenChange('typography', 'heading_font', e.target.value)}
                                    >
                                        {SUPPORTED_FONTS.map(font => (
                                            <option key={font} value={font}>{font.split(',')[0]}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="field-row dual">
                                <div className="field-item">
                                    <label>H1 Size</label>
                                    <select
                                        className="editor-select"
                                        value={visualPlan.design_tokens.typography.heading_size}
                                        onChange={(e) => handleTokenChange('typography', 'heading_size', e.target.value)}
                                    >
                                        {FONT_SIZES.HEADING.map(size => (
                                            <option key={size} value={size}>{size}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="field-item">
                                    <label>Body Size</label>
                                    <select
                                        className="editor-select"
                                        value={visualPlan.design_tokens.typography.body_size}
                                        onChange={(e) => handleTokenChange('typography', 'body_size', e.target.value)}
                                    >
                                        {FONT_SIZES.BODY.map(size => (
                                            <option key={size} value={size}>{size}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Spacing */}
                        <div className="editor-group">
                            <label className="section-label">Spacing & Layout</label>
                            <div className="field-row dual">
                                <div className="field-item">
                                    <label>Padding</label>
                                    <select
                                        className="editor-select"
                                        value={visualPlan.design_tokens.spacing.padding}
                                        onChange={(e) => handleTokenChange('spacing', 'padding', e.target.value)}
                                    >
                                        {SPACING_OPTIONS.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="field-item">
                                    <label>Gap</label>
                                    <select
                                        className="editor-select"
                                        value={visualPlan.design_tokens.spacing.gap}
                                        onChange={(e) => handleTokenChange('spacing', 'gap', e.target.value)}
                                    >
                                        {SPACING_OPTIONS.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Branding Style (Only if brandName exists) */}
                        {visualPlan.brandName && (
                            <div className="editor-group">
                                <label className="section-label">Branding Style</label>
                                <div className="field-row">
                                    <div className="field-item">
                                        <label>Brand Font</label>
                                        <select
                                            className="editor-select"
                                            value={visualPlan.design_tokens.branding?.font || visualPlan.design_tokens.typography.body_font}
                                            onChange={(e) => handleTokenChange('branding', 'font', e.target.value)}
                                        >
                                            {SUPPORTED_FONTS.map(font => (
                                                <option key={font} value={font}>{font.split(',')[0]}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="field-row dual">
                                    <div className="field-item">
                                        <label>Brand Color</label>
                                        <div className="color-info" style={{ marginBottom: '4px' }}>
                                            <input
                                                type="color"
                                                value={parseColorToHex(visualPlan.design_tokens.branding?.color || visualPlan.design_tokens.colors.text_secondary)}
                                                onChange={(e) => handleTokenChange('branding', 'color', e.target.value)}
                                                className="color-picker-input"
                                            />
                                        </div>
                                    </div>
                                    <div className="field-item">
                                        <label>Brand Size</label>
                                        <select
                                            className="editor-select"
                                            value={visualPlan.design_tokens.branding?.size || '14px'}
                                            onChange={(e) => handleTokenChange('branding', 'size', e.target.value)}
                                        >
                                            {FONT_SIZES.BRANDING.map(size => (
                                                <option key={size} value={size}>{size}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Live Preview */}
                <div className="design-preview shadow-xl">
                    <div className="preview-toolbar">
                        <h3><Eye size={18} /> Live Design Preview</h3>
                    </div>

                    <div className="preview-container">
                        <LiveDesignPreview tokens={visualPlan.design_tokens} brandName={visualPlan.brandName} brandingPlacement={visualPlan.brandingPlacement} />
                    </div>
                </div>
            </div>

            {/* Illustration Style */}
            <div className="illustration-style">
                <h3><Eye size={20} /> Illustration Style</h3>
                <div className="style-description">
                    <p><strong>Style:</strong> {visualPlan.illustration_style.type}</p>
                    <p><strong>Mood:</strong> {visualPlan.illustration_style.mood}</p>
                    <p><strong>Detail:</strong> {visualPlan.illustration_style.detail_level}</p>
                    {visualPlan.illustration_style.characteristics && (
                        <div className="style-elements">
                            <strong>Characteristics:</strong>
                            <div className="element-tags">
                                {visualPlan.illustration_style.characteristics.map((element, i) => (
                                    <span key={i} className="element-tag">{element}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Slide Visuals */}
            <div className="slide-visuals">
                <h3>Slide Visual Plans</h3>
                <div className="visual-grid">
                    {visualPlan.slide_visuals.map((slideVisual, index) => (
                        <div key={index} className="visual-card">
                            <div className="visual-header">
                                <span className="visual-number">Slide {index + 1}</span>
                                <span className="visual-layout">{slideVisual.layout_system?.composition || visualPlan.layout_system.composition}</span>
                            </div>
                            <p className="visual-description">{slideVisual.visual_description}</p>
                            {slideVisual.supporting_elements && slideVisual.supporting_elements.length > 0 && (
                                <div className="focus-elements">
                                    {slideVisual.supporting_elements.map((element, i) => (
                                        <span key={i} className="focus-tag">{element}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="preview-actions">
                {onBack && (
                    <button className="btn-secondary" onClick={onBack}>
                        <ArrowLeft size={20} />
                        Back
                    </button>
                )}
                <button className="btn-secondary" onClick={createVisualPlan}>
                    <RefreshCw size={20} />
                    Regenerate
                </button>
                <button className="btn-primary" onClick={approveVisualPlan}>
                    <Check size={20} />
                    Approve & Continue
                </button>
            </div>
        </div>
    )
}

function LiveDesignPreview({ tokens, brandName, brandingPlacement }) {
    const { colors, typography, spacing, branding } = tokens;

    const getBrandingStyle = () => {
        const baseStyle = {
            position: 'absolute',
            fontFamily: branding?.font || typography.body_font,
            fontSize: branding?.size || '14px',
            color: branding?.color || colors.text_secondary,
            opacity: branding?.opacity || 0.8,
            fontWeight: '600',
            padding: '4px 8px',
            pointerEvents: 'none'
        };

        const placements = {
            'top-left': { top: '20px', left: '20px' },
            'top-right': { top: '20px', right: '20px' },
            'bottom-left': { bottom: '20px', left: '20px' },
            'bottom-right': { bottom: '20px', right: '20px' }
        };

        return { ...baseStyle, ...(placements[brandingPlacement] || placements['top-right']) };
    };

    return (
        <div
            className="preview-card"
            style={{
                backgroundColor: colors.background,
                padding: spacing.padding,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: spacing.gap,
                transition: 'all 0.3s ease',
                position: 'relative'
            }}
        >
            {brandName && (
                <div style={getBrandingStyle()}>
                    {brandName}
                </div>
            )}

            <div className="preview-content">
                <h1 style={{
                    fontFamily: typography.heading_font,
                    fontSize: typography.heading_size,
                    color: colors.text_primary,
                    fontWeight: typography.heading_weight || 'bold',
                    lineHeight: typography.line_height,
                    margin: 0
                }}>
                    Example Slide Heading
                </h1>
                <p style={{
                    fontFamily: typography.body_font,
                    fontSize: typography.body_size,
                    color: colors.text_secondary,
                    margin: 0
                }}>
                    This is how your subtext and body content will look with the selected spacing and typography.
                </p>
                <div
                    className="preview-accent"
                    style={{
                        height: '4px',
                        width: '60px',
                        backgroundColor: colors.accent,
                        borderRadius: '2px',
                        marginTop: '12px'
                    }}
                />
            </div>
            <div className="preview-footer" style={{ marginTop: '20px' }}>
                <button style={{
                    backgroundColor: colors.primary,
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontFamily: typography.body_font,
                    fontWeight: 'bold',
                    cursor: 'default'
                }}>
                    Action Button
                </button>
            </div>
        </div>
    )
}
