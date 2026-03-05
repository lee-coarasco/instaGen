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

    // Cache State
    const [projectCache, setProjectCache] = useState(null);
    const [galleryCache, setGalleryCache] = useState(null);
    const [statsCache, setStatsCache] = useState(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

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

    const updatePipelineStage = useCallback((stage, data) => {
        setProject((prev) => ({
            ...prev,
            currentStage: stage,
            ...data
        }))
    }, [])

    const setStatus = useCallback((status) => {
        setProject((prev) => ({
            ...prev,
            status,
        }))
    }, [])

    // --- CACHED API CALLS ---

    const fetchProjects = useCallback(async (forceRefresh = false, page = 1, limit = 20) => {
        if (!forceRefresh && projectCache && page === 1) {
            return { data: projectCache, pagination: { page: 1, pages: 1 } }; // Simplified pagination for cache
        }
        try {
            const res = await axios.get(`${API_URL}/projects`, { params: { page, limit } });
            const data = res.data.data;
            if (page === 1) {
                setProjectCache(data);
            }
            return { data, pagination: res.data.pagination };
        } catch (err) {
            console.error('Fetch projects error:', err);
            return { data: [], pagination: {} };
        }
    }, [projectCache]);

    const fetchGallery = useCallback(async (forceRefresh = false, page = 1, limit = 24) => {
        if (!forceRefresh && galleryCache && page === 1) {
            return { data: galleryCache, pagination: { page: 1, pages: 1 } };
        }
        try {
            const res = await axios.get(`${API_URL}/projects/gallery`, { params: { page, limit } });
            const data = res.data.data;
            if (page === 1) {
                setGalleryCache(data);
            }
            return { data, pagination: res.data.pagination };
        } catch (err) {
            console.error('Fetch gallery error:', err);
            return { data: [], pagination: {} };
        }
    }, [galleryCache]);

    const fetchStats = useCallback(async (forceRefresh = false) => {
        if (!forceRefresh && statsCache) return statsCache;
        try {
            const res = await axios.get(`${API_URL}/projects/stats`);
            setStatsCache(res.data.data);
            return res.data.data;
        } catch (err) {
            console.error('Fetch stats error:', err);
            return null;
        }
    }, [statsCache]);

    const fetchProjectById = useCallback(async (id) => {
        try {
            const res = await axios.get(`${API_URL}/projects/${id}`);
            const p = res.data.data || res.data;
            if (p) {
                // Hydrate project context with saved data
                const hydratedProject = {
                    ...p,
                    id: p._id,
                    ...p.stages,
                    slides: p.stages?.content?.slides || p.slides || []
                };
                setProject(hydratedProject);
                return hydratedProject;
            }
        } catch (err) {
            console.error('Fetch project by ID error:', err);
            throw err;
        }
    }, []);

    const invalidateCache = useCallback(() => {
        setProjectCache(null);
        setGalleryCache(null);
        setStatsCache(null);
    }, []);

    const resetProject = useCallback(() => {
        setProject({
            id: null,
            postType: null,
            niche: null,
            visualStyle: null,
            platformFormat: null,
            title: '',
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
                title: projectToSave.title,
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

            if (res.data.success) {
                const savedData = res.data.data;
                // Invalidate cache since we have a new/updated project
                invalidateCache();

                // Sync context state with what was just saved and the new ID
                updateProject({
                    ...overrides,
                    id: savedData._id,
                    usage: savedData.usage || projectToSave.usage,
                    status: savedData.status
                });
                return savedData;
            }
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
        saveProject,
        updatePipelineStage,
        fetchProjects,
        fetchGallery,
        fetchStats,
        fetchProjectById,
        invalidateCache,
        isInitialLoad,
        setIsInitialLoad
    }

    return (
        <ProjectContext.Provider value={value}>
            {children}
        </ProjectContext.Provider>
    )
}
