import { useProject } from '@contexts/ProjectContext'
import { Zap, Coins } from 'lucide-react'
import './UsageBanner.css'

export default function UsageBanner() {
    const { project } = useProject()
    const { usage } = project

    if (!usage || usage.totalTokens === 0) return null

    return (
        <div className="usage-banner glass">
            <div className="usage-item">
                <Zap size={14} className="usage-icon tokens" />
                <span className="usage-label">Tokens:</span>
                <span className="usage-value">{usage.totalTokens.toLocaleString()}</span>
            </div>
            <div className="usage-divider"></div>
            <div className="usage-item">
                <Coins size={14} className="usage-icon cost" />
                <span className="usage-label">Est. Cost:</span>
                <span className="usage-value">${usage.estimatedCost.toFixed(4)}</span>
            </div>
        </div>
    )
}
