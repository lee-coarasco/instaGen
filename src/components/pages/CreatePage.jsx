import { useState, useEffect } from 'react'
import { useProject } from '@contexts/ProjectContext'
import { useAuth } from '@contexts/AuthContext'
import { PIPELINE_STAGES } from '@config/constants'
import InputForm from '@components/input/InputForm'
import IntentPreview from '@components/preview/IntentPreview'
import ContentPreview from '@components/preview/ContentPreview'
import VisualPreview from '@components/preview/VisualPreview'
import StoryboardViewer from '@components/preview/StoryboardViewer'
import ImageGenerator from '@components/preview/ImageGenerator'
import ProjectSuccess from '@components/preview/ProjectSuccess'
import UsageBanner from '@components/common/UsageBanner'
import {
    Edit3,
    BrainCircuit,
    FileText,
    Palette,
    LayoutTemplate,
    Wand2,
    Check,
    PartyPopper
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import './CreatePage.css'

function CreatePage() {
    const { setStage, saveProject, project, fetchProjectById } = useProject()
    const { user } = useAuth()
    const navigate = useNavigate()
    const { stage: urlStage, id: urlId } = useParams()
    const [pageLoading, setPageLoading] = useState(!!urlId)

    // Hydrate project from URL ID if context is empty (e.g. on refresh)
    useEffect(() => {
        if (urlId && (!project.id || project.id !== urlId)) {
            setPageLoading(true)
            fetchProjectById(urlId)
                .finally(() => setPageLoading(false))
        } else {
            setPageLoading(false)
        }
    }, [urlId, fetchProjectById, project.id])

    const steps = [
        { id: PIPELINE_STAGES.INPUT, label: 'Input', icon: Edit3, component: InputForm, slug: 'input' },
        { id: PIPELINE_STAGES.INTENT_UNDERSTANDING, label: 'Intent', icon: BrainCircuit, component: IntentPreview, slug: 'intent' },
        { id: PIPELINE_STAGES.CONTENT_STRUCTURING, label: 'Content', icon: FileText, component: ContentPreview, slug: 'content' },
        { id: PIPELINE_STAGES.VISUAL_PLANNING, label: 'Visuals', icon: Palette, component: VisualPreview, slug: 'visuals' },
        { id: PIPELINE_STAGES.PROMPT_ENGINEERING, label: 'Storyboard', icon: LayoutTemplate, component: StoryboardViewer, slug: 'storyboard' },
        { id: PIPELINE_STAGES.IMAGE_GENERATION, label: 'Generate', icon: Wand2, component: ImageGenerator, slug: 'generate' },
        { id: 'complete', label: 'Finish', icon: Check, component: ProjectSuccess, slug: 'complete' },
    ]

    // Find current step index based on URL slug or step ID
    const currentStepIndex = steps.findIndex(s => s.slug === urlStage || s.id === urlStage)
    const currentStep = currentStepIndex !== -1 ? currentStepIndex : 0

    // Handle redirect for base /create route
    useEffect(() => {
        if (!urlStage) {
            navigate(`/create/${steps[0].slug}`, { replace: true })
        }
    }, [urlStage, navigate])

    const handleNext = async (idOverride) => {
        const nextStepIndex = currentStep + 1
        if (nextStepIndex < steps.length) {
            const currentId = idOverride || project.id;

            // Save draft if user is logged in, EXCEPT for the final transition which is handled by ImageGenerator
            if (user && steps[nextStepIndex].id !== 'complete') {
                try {
                    const saved = await saveProject({ status: 'draft' });
                    const nextId = currentId || saved?._id || saved?.id;
                    navigate(`/create/${steps[nextStepIndex].slug}${nextId ? `/${nextId}` : ''}`)
                } catch (err) {
                    console.error('Auto-save failed:', err);
                    navigate(`/create/${steps[nextStepIndex].slug}${currentId ? `/${currentId}` : ''}`)
                }
            } else {
                const targetId = currentId || project.id;
                navigate(`/create/${steps[nextStepIndex].slug}${targetId ? `/${targetId}` : ''}`)
            }
            setStage(steps[nextStepIndex].id)
        }
    }

    const handleBack = () => {
        const prevStepIndex = currentStep - 1
        if (prevStepIndex >= 0) {
            navigate(`/create/${steps[prevStepIndex].slug}${project.id ? `/${project.id}` : ''}`)
            setStage(steps[prevStepIndex].id)
        }
    }

    const CurrentComponent = steps[currentStep].component

    if (pageLoading) {
        return (
            <div className="create-page flex items-center justify-center">
                <div className="text-center p-12 glass rounded-2xl">
                    <Wand2 className="spin mx-auto mb-4 text-primary" size={48} />
                    <h2 className="text-2xl font-bold mb-2">Retrieving Your Magic...</h2>
                    <p className="opacity-70">Hang tight while we hydrate your workspace.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="create-page">
            {/* Progress Header */}
            <div className="progress-header glass">
                <div className="progress-container">
                    <UsageBanner />
                    <div className="progress-steps">
                        {steps.map((step, index) => {
                            const isCompleted = index < currentStep
                            const isActive = index === currentStep
                            const Icon = step.icon

                            return (
                                <div
                                    key={step.id}
                                    className={`progress-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                                >
                                    <div className="step-connector"></div>
                                    <div className="step-indicator">
                                        {isCompleted ? <Check size={16} /> : <Icon size={18} />}
                                    </div>
                                    <div className="step-content">
                                        <span className="step-label">{step.label}</span>
                                        {isActive && <span className="step-status">In Progress...</span>}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="create-content">
                <div className="container">
                    {CurrentComponent ? (
                        <CurrentComponent
                            onNext={handleNext}
                            onBack={currentStep > 0 ? handleBack : undefined}
                        />
                    ) : (
                        <div className="coming-soon">
                            <h2>Coming Soon</h2>
                            <p>This stage is under development</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CreatePage
