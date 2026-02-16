/**
 * Application Constants
 */

// Post Types
export const POST_TYPES = {
    SINGLE: 'single',
    CAROUSEL: 'carousel',
    REEL_COVER: 'reel_cover',
}

// Visual Styles
export const VISUAL_STYLES = {
    MINIMAL: 'minimal',
    ILLUSTRATIVE: 'illustrative',
    THREE_D: '3d',
    FUTURISTIC: 'futuristic',
    CORPORATE: 'corporate',
    ARTISTIC: 'artistic',
}

// Platform Formats
export const PLATFORM_FORMATS = {
    INSTAGRAM_FEED: 'instagram_feed',
    INSTAGRAM_STORY: 'instagram_story',
}

// Image Resolutions
export const RESOLUTIONS = {
    INSTAGRAM_SQUARE: 1080,
    INSTAGRAM_STORY: { width: 1080, height: 1920 },
    STORYBOARD_PREVIEW: 512,
}

// Slide Limits
export const SLIDE_LIMITS = {
    MIN: 1,
    MAX: parseInt(import.meta.env.VITE_MAX_SLIDES) || 10,
}

// AI Pipeline Stages
export const PIPELINE_STAGES = {
    INPUT: 'input',
    INTENT_UNDERSTANDING: 'intent_understanding',
    CONTENT_STRUCTURING: 'content_structuring',
    VISUAL_PLANNING: 'visual_planning',
    PROMPT_ENGINEERING: 'prompt_engineering',
    IMAGE_GENERATION: 'image_generation',
    QUALITY_CHECK: 'quality_check',
    COMPLETE: 'complete',
}

// Project Status
export const PROJECT_STATUS = {
    DRAFT: 'draft',
    PROCESSING: 'processing',
    STORYBOARD_READY: 'storyboard_ready',
    GENERATING: 'generating',
    COMPLETED: 'completed',
    FAILED: 'failed',
}

// Quality Check Types
export const QUALITY_CHECKS = {
    TEXT_OVERFLOW: 'text_overflow',
    CONTRAST: 'contrast',
    ALIGNMENT: 'alignment',
    LOGO_SAFE_ZONE: 'logo_safe_zone',
}

// Slide Intent Types
export const SLIDE_INTENTS = {
    HOOK: 'hook',
    EXPLAIN: 'explain',
    DETAIL: 'detail',
    CTA: 'cta',
    CONCLUSION: 'conclusion',
}

// Typography Options
export const SUPPORTED_FONTS = [
    'Inter, sans-serif',
    'Roboto, sans-serif',
    'Playfair Display, serif',
    'Montserrat, sans-serif',
    'Outfit, sans-serif',
    'Space Grotesk, sans-serif',
    'Lora, serif',
    'Bebas Neue, sans-serif',
]

export const FONT_SIZES = {
    HEADING: ['32px', '40px', '48px', '56px', '64px', '72px'],
    BODY: ['16px', '18px', '20px', '24px', '28px', '32px'],
    BRANDING: ['12px', '14px', '16px', '18px', '20px', '24px'],
}

// Spacing Options
export const SPACING_OPTIONS = ['20px', '40px', '60px', '80px', '100px']

export default {
    POST_TYPES,
    VISUAL_STYLES,
    PLATFORM_FORMATS,
    RESOLUTIONS,
    SLIDE_LIMITS,
    PIPELINE_STAGES,
    PROJECT_STATUS,
    QUALITY_CHECKS,
    SLIDE_INTENTS,
    SUPPORTED_FONTS,
    FONT_SIZES,
    SPACING_OPTIONS,
}
