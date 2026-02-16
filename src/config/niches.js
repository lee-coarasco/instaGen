/**
 * Niche Profiles Configuration
 * Dynamic niche profiles that LLM uses to understand visual language
 */

export const NICHE_PROFILES = {
    tech: {
        id: 'tech',
        name: 'Technology & Software',
        icons: ['AI', 'code', 'circuits', 'laptop', 'cloud', 'database'],
        colors: ['blue', 'purple', 'cyan', 'electric blue'],
        colorPalette: {
            primary: 'hsl(250, 84%, 60%)',
            secondary: 'hsl(280, 70%, 65%)',
            accent: 'hsl(199, 89%, 48%)',
        },
        illustrations: [
            'AI agents',
            'dashboards',
            'code editors',
            'neural networks',
            'holographic interfaces',
            'tech professionals',
        ],
        tone: 'modern, futuristic, innovative',
        audience: 'developers, tech enthusiasts, startups',
    },

    marketing: {
        id: 'marketing',
        name: 'Marketing & Business',
        icons: ['megaphone', 'charts', 'growth arrows', 'target', 'analytics', 'campaigns'],
        colors: ['vibrant orange', 'energetic red', 'success green', 'electric yellow'],
        colorPalette: {
            primary: 'hsl(25, 95%, 53%)',
            secondary: 'hsl(142, 76%, 45%)',
            accent: 'hsl(320, 85%, 60%)',
        },
        illustrations: [
            'marketing teams',
            'campaign visuals',
            'analytics dashboards',
            'growth charts',
            'social media icons',
            'business professionals',
        ],
        tone: 'energetic, persuasive, results-driven',
        audience: 'marketers, business owners, agencies',
    },

    film: {
        id: 'film',
        name: 'Film & Video Production',
        icons: ['camera', 'clapperboard', 'film reel', 'director chair', 'spotlight'],
        colors: ['warm cinematic', 'golden hour', 'deep shadows', 'rich blacks'],
        colorPalette: {
            primary: 'hsl(38, 92%, 50%)',
            secondary: 'hsl(25, 70%, 45%)',
            accent: 'hsl(0, 0%, 15%)',
        },
        illustrations: [
            'directors',
            'lighting rigs',
            'film sets',
            'cameras',
            'editing suites',
            'cinematic scenes',
        ],
        tone: 'cinematic, dramatic, artistic',
        audience: 'filmmakers, video creators, cinematographers',
    },

    education: {
        id: 'education',
        name: 'Education & Learning',
        icons: ['books', 'graduation cap', 'lightbulb', 'pencil', 'brain', 'certificate'],
        colors: ['friendly blue', 'approachable green', 'warm yellow', 'soft purple'],
        colorPalette: {
            primary: 'hsl(210, 79%, 46%)',
            secondary: 'hsl(142, 71%, 45%)',
            accent: 'hsl(45, 100%, 51%)',
        },
        illustrations: [
            'students',
            'teachers',
            'learning environments',
            'educational tools',
            'knowledge sharing',
            'study materials',
        ],
        tone: 'friendly, informative, encouraging',
        audience: 'educators, students, online course creators',
    },

    finance: {
        id: 'finance',
        name: 'Finance & Investment',
        icons: ['dollar sign', 'stocks', 'charts', 'wallet', 'coins', 'bank'],
        colors: ['professional blue', 'trust green', 'gold accents', 'sophisticated gray'],
        colorPalette: {
            primary: 'hsl(210, 100%, 40%)',
            secondary: 'hsl(142, 76%, 36%)',
            accent: 'hsl(45, 100%, 51%)',
        },
        illustrations: [
            'financial charts',
            'investment portfolios',
            'banking interfaces',
            'financial advisors',
            'money management',
            'wealth growth',
        ],
        tone: 'professional, trustworthy, sophisticated',
        audience: 'investors, financial advisors, fintech users',
    },

    realestate: {
        id: 'realestate',
        name: 'Real Estate',
        icons: ['house', 'building', 'key', 'location pin', 'blueprint'],
        colors: ['luxury gold', 'elegant navy', 'natural green', 'premium white'],
        colorPalette: {
            primary: 'hsl(210, 50%, 30%)',
            secondary: 'hsl(45, 100%, 51%)',
            accent: 'hsl(142, 40%, 45%)',
        },
        illustrations: [
            'modern homes',
            'luxury properties',
            'real estate agents',
            'property tours',
            'architectural designs',
            'neighborhood views',
        ],
        tone: 'luxurious, aspirational, professional',
        audience: 'real estate agents, property buyers, investors',
    },

    health: {
        id: 'health',
        name: 'Health & Wellness',
        icons: ['heart', 'fitness', 'meditation', 'nutrition', 'yoga', 'wellness'],
        colors: ['calming green', 'energizing orange', 'peaceful blue', 'natural earth'],
        colorPalette: {
            primary: 'hsl(142, 71%, 45%)',
            secondary: 'hsl(199, 89%, 48%)',
            accent: 'hsl(25, 95%, 53%)',
        },
        illustrations: [
            'fitness activities',
            'healthy lifestyle',
            'wellness practices',
            'nutrition',
            'mental health',
            'active people',
        ],
        tone: 'motivating, caring, positive',
        audience: 'fitness enthusiasts, health coaches, wellness brands',
    },

    fashion: {
        id: 'fashion',
        name: 'Fashion & Style',
        icons: ['clothing', 'accessories', 'runway', 'shopping bag', 'style'],
        colors: ['chic black', 'elegant white', 'bold pink', 'trendy purple'],
        colorPalette: {
            primary: 'hsl(0, 0%, 10%)',
            secondary: 'hsl(320, 85%, 60%)',
            accent: 'hsl(280, 70%, 65%)',
        },
        illustrations: [
            'fashion models',
            'clothing designs',
            'style accessories',
            'runway shows',
            'fashion photography',
            'trendy outfits',
        ],
        tone: 'stylish, trendy, aspirational',
        audience: 'fashion enthusiasts, designers, style influencers',
    },
}

/**
 * Get niche profile by ID
 */
export const getNicheProfile = (nicheId) => {
    return NICHE_PROFILES[nicheId] || NICHE_PROFILES.tech
}

/**
 * Get all niche options for UI
 */
export const getAllNiches = () => {
    return Object.values(NICHE_PROFILES)
}

/**
 * Get niche color palette
 */
export const getNicheColors = (nicheId) => {
    const profile = getNicheProfile(nicheId)
    return profile.colorPalette
}
