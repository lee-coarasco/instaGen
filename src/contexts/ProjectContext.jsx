import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { PROJECT_STATUS, PIPELINE_STAGES } from '@config/constants'
import { geminiClient } from '@services/ai/geminiClient'
import axios from 'axios'

const API_URL = 'http://localhost:5000/api'

const ProjectContext = createContext(null)

export const useProject = () => {
    const context = useContext(ProjectContext)
    if (!context) {
        throw new Error('useProject must be used within ProjectProvider')
    }
    return context
}

export const ProjectProvider = ({ children }) => {
    const [project, setProject] = useState({
        id: null,
        postType: null,
        niche: null,
        visualStyle: null,
        platformFormat: null,
        slides: [],
        intent: null,
        content: null,
        storyboardPrompt: null,
        finalImages: [],
        status: PROJECT_STATUS.DRAFT,
        currentStage: PIPELINE_STAGES.INPUT,
        brandAssets: {
            logo: null,
            referenceImages: [],
        },
        usage: {
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
            estimatedCost: 0
        }
    })

    const updateProject = useCallback((updates) => {
        setProject((prev) => ({
            ...prev,
            ...updates,
        }))
    }, [])

    const trackUsage = useCallback((usageMetadata) => {
        if (!usageMetadata) return;

        setProject((prev) => {
            const newInput = prev.usage.inputTokens + (usageMetadata.promptTokenCount || 0)
            const newOutput = prev.usage.outputTokens + (usageMetadata.candidatesTokenCount || 0)

            // GEMINI 1.5 FLASH PRICING (USD / 1M tokens)
            // Input: $0.075, Output: $0.30
            const inputCost = (newInput / 1000000) * 0.075
            const outputCost = (newOutput / 1000000) * 0.30

            return {
                ...prev,
                usage: {
                    inputTokens: newInput,
                    outputTokens: newOutput,
                    totalTokens: newInput + newOutput,
                    estimatedCost: inputCost + outputCost
                }
            }
        })
    }, [])

    useEffect(() => {
        geminiClient.setUsageCallback(trackUsage)
        return () => geminiClient.setUsageCallback(null)
    }, [trackUsage])

    const updateSlide = useCallback((slideIndex, updates) => {
        setProject((prev) => ({
            ...prev,
            slides: prev.slides.map((slide, idx) =>
                idx === slideIndex ? { ...slide, ...updates } : slide
            ),
        }))
    }, [])

    const addSlide = useCallback((slide) => {
        setProject((prev) => ({
            ...prev,
            slides: [...prev.slides, slide],
        }))
    }, [])

    const removeSlide = useCallback((slideIndex) => {
        setProject((prev) => ({
            ...prev,
            slides: prev.slides.filter((_, idx) => idx !== slideIndex),
        }))
    }, [])

    const setStage = useCallback((stage) => {
        setProject((prev) => ({
            ...prev,
            currentStage: stage,
        }))
    }, [])

    const setStatus = useCallback((status) => {
        setProject((prev) => ({
            ...prev,
            status,
        }))
    }, [])

    const resetProject = useCallback(() => {
        setProject({
            id: null,
            postType: null,
            niche: null,
            visualStyle: null,
            platformFormat: null,
            slides: [],
            intent: null,
            content: null,
            storyboardPrompt: null,
            finalImages: [],
            status: PROJECT_STATUS.DRAFT,
            currentStage: PIPELINE_STAGES.INPUT,
            brandAssets: {
                logo: null,
                referenceImages: [],
            },
            usage: {
                inputTokens: 0,
                outputTokens: 0,
                totalTokens: 0,
                estimatedCost: 0
            },
        })
    }, [])

    const saveProject = useCallback(async (overrides = {}) => {
        try {
            const projectToSave = {
                ...project,
                ...overrides
            };

            // Map frontend structure to backend schema
            const payload = {
                id: projectToSave.id,
                niche: projectToSave.niche,
                postType: projectToSave.postType,
                visualStyle: projectToSave.visualStyle,
                platformFormat: projectToSave.platformFormat,
                userIdea: projectToSave.userIdea,
                slideCount: projectToSave.slideCount,
                referenceImage: projectToSave.referenceImage,
                brandName: projectToSave.brandName,
                brandingPlacement: projectToSave.brandingPlacement,
                stages: {
                    intent: projectToSave.intent,
                    content: projectToSave.content,
                    visualPlan: projectToSave.visualPlan,
                    storyboardPrompt: projectToSave.storyboardPrompt,
                    finalImages: projectToSave.finalImages
                },
                usage: projectToSave.usage,
                status: projectToSave.status
            };

            const res = await axios.post(`${API_URL}/projects`, payload);

            if (res.data.success && !project.id) {
                // Set the ID if it's a new project
                updateProject({ id: res.data.data._id });
            }

            return res.data.data;
        } catch (err) {
            console.error('Failed to save project:', err);
            throw err;
        }
    }, [project, updateProject]);

    const value = {
        project,
        updateProject,
        updateSlide,
        addSlide,
        removeSlide,
        setStage,
        setStatus,
        resetProject,
        trackUsage,
        saveProject
    }

    return (
        <ProjectContext.Provider value={value}>
            {children}
        </ProjectContext.Provider>
    )
}
