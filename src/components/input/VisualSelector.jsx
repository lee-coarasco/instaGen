import { VISUAL_STYLES } from '@config/constants'
import { Check } from 'lucide-react'
import './VisualSelector.css'

const STYLE_PREVIEWS = [
    {
        id: VISUAL_STYLES.MINIMAL,
        label: 'Minimal',
        description: 'Clean, whitespace, simple typography',
        className: 'preview-minimal'
    },
    {
        id: VISUAL_STYLES.ILLUSTRATIVE,
        label: 'Illustrative',
        description: 'Playful, doodle-style elements',
        className: 'preview-illustrative'
    },
    {
        id: VISUAL_STYLES.THREE_D,
        label: '3D Render',
        description: 'Depth, shadows, floating elements',
        className: 'preview-3d'
    },
    {
        id: VISUAL_STYLES.FUTURISTIC,
        label: 'Futuristic',
        description: 'Neon, dark mode, tech gradients',
        className: 'preview-futuristic'
    },
    {
        id: VISUAL_STYLES.CORPORATE,
        label: 'Corporate',
        description: 'Professional, trusted, structured',
        className: 'preview-corporate'
    },
    {
        id: VISUAL_STYLES.ARTISTIC,
        label: 'Artistic',
        description: 'Expressive, painterly, textured',
        className: 'preview-artistic'
    }
]

export default function VisualSelector({ selected, onSelect }) {
    return (
        <div className="visual-selector-grid">
            {STYLE_PREVIEWS.map((style) => (
                <div
                    key={style.id}
                    className={`visual-option ${selected === style.id ? 'selected' : ''}`}
                    onClick={() => onSelect(style.id)}
                >
                    <div className={`preview-box ${style.className}`}>
                        {/* Visual cues handled by CSS based on className */}
                        {selected === style.id && (
                            <div className="selected-badge">
                                <Check size={14} color="white" />
                            </div>
                        )}
                        <span className="mini-label">Abc</span>
                    </div>
                    
                    <div className="option-info">
                        <span className="option-label">{style.label}</span>
                        {/* <span className="option-desc">{style.description}</span> */}
                    </div>
                </div>
            ))}
        </div>
    )
}
