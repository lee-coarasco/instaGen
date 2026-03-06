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
        contentDensity: 'balanced', // Options: minimal, balanced, detailed
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

    const trackUsage = useCallback((usageMetadata, modelName, isImage) => {
        if (!usageMetadata && !isImage) return;

        setProject((prev) => {
            const newInput = prev.usage.inputTokens + (usageMetadata?.promptTokenCount || 0)
            const newOutput = prev.usage.outputTokens + (usageMetadata?.candidatesTokenCount || 0)

            // Dynamic Pricing based on known models. Fallbacks to 2.5 Flash.
            let inputPriceM = 0.075;
            let outputPriceM = 0.30;
            let flatCost = 0;

            const name = modelName ? modelName.toLowerCase() : '';

            if (isImage) {
                // Image Models Flat Pricing
                if (name.includes('imagen-3.0')) {
                    flatCost = 0.03;
                } else if (name.includes('gemini-2.0-flash-exp-image-generation')) {
                    flatCost = 0.00; // Free experimental
                } else if (name.includes('gemini-2.5-flash-image')) {
                    flatCost = 0.03; // Assumption placeholder
                } else {
                    flatCost = 0.03; // Fallback for unknown image generators
                }
            } else {
                // Text Models Token Pricing (per 1 Million tokens)
                if (name.includes('gemini-2.0-flash')) {
                    inputPriceM = 0.10;
                    outputPriceM = 0.40;
                } else if (name.includes('gemini-2.0-pro') || name.includes('1.5-pro')) {
                    inputPriceM = 1.25;
                    outputPriceM = 5.00;
                } else if (name.includes('gemini-2.5-flash')) {
                    inputPriceM = 0.075;
                    outputPriceM = 0.30;
                }
            }

            const currentInputCost = ((usageMetadata?.promptTokenCount || 0) / 1000000) * inputPriceM;
            const currentOutputCost = ((usageMetadata?.candidatesTokenCount || 0) / 1000000) * outputPriceM;
            const newCostAdded = currentInputCost + currentOutputCost + flatCost;

            return {
                ...prev,
                usage: {
                    inputTokens: newInput,
                    outputTokens: newOutput,
                    totalTokens: newInput + newOutput,
                    estimatedCost: (prev.usage.estimatedCost || 0) + newCostAdded
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
            return galleryCache; // Return the full cached object including pagination
        }
        try {
            const res = await axios.get(`${API_URL}/projects/gallery`, { params: { page, limit } });
            const result = {
                data: res.data.data,
                pagination: res.data.pagination
            };
            if (page === 1) {
                setGalleryCache(result);
            }
            return result;
        } catch (err) {
            console.error('Fetch gallery error:', err);
            return { data: [], pagination: { page: 1, pages: 1 } };
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

    const getResumeSlug = useCallback((projectObj) => {
        if (!projectObj) return 'input';

        // Priority check in REVERSE order of pipeline stages
        if (projectObj.status === 'completed') {
            return 'complete';
        } else if (projectObj.stages?.storyboardPrompt) {
            return 'generate';
        } else if (projectObj.stages?.visualPlan) {
            return 'storyboard';
        } else if (projectObj.stages?.content) {
            return 'visuals';
        } else if (projectObj.stages?.intent) {
            return 'content';
        } else if (projectObj.userIdea) {
            return 'intent';
        }
        return 'input';
    }, []);

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
                contentDensity: projectToSave.contentDensity,
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
                    status: savedData.status,
                    ...savedData.stages,
                    // Ensure slides are correctly mapped if they moved in stages.content
                    slides: savedData.stages?.content?.slides || projectToSave.slides
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
        getResumeSlug,
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
