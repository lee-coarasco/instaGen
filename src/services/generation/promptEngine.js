import { visualPlanner } from '@services/visual/visualPlanner'

/**
 * Prompt Engineering Engine (Layer 4)
 * Creates perfect prompts for AI image generation
 * Combines outputs from Layers 1-3
 */

export class PromptEngine {
    /**
     * Generate storyboard prompt (combined preview)
     */
    async generateStoryboardPrompt(intent, content, visualPlan) {
        return visualPlanner.generateStoryboardPrompt(visualPlan, content)
    }

    /**
     * Generate individual slide prompts
     */
    async generateSlidePrompts(intent, content, visualPlan) {
        const prompts = []

        for (let i = 0; i < content.slides.length; i++) {
            const prompt = visualPlanner.generateSlidePrompt(i, visualPlan, content)
            prompts.push({
                slideIndex: i,
                slideNumber: i + 1,
                prompt,
                slide: content.slides[i],
            })
        }

        return prompts
    }

    /**
     * Generate prompt with brand assets
     */
    async generatePromptWithBranding(basePrompt, brandAssets) {
        if (!brandAssets.logo && brandAssets.referenceImages.length === 0) {
            return basePrompt
        }

        let enhancedPrompt = basePrompt

        if (brandAssets.logo) {
            enhancedPrompt += `\n\nBRAND LOGO:
- Include brand logo in bottom-right corner
- Logo should be subtle but visible
- Maintain safe zone around logo
- Size: approximately 80x80px`
        }

        if (brandAssets.referenceImages.length > 0) {
            enhancedPrompt += `\n\nSTYLE REFERENCES:
- Match the visual style of provided reference images
- Maintain brand consistency
- Use similar color treatments and composition`
        }

        return enhancedPrompt
    }

    /**
     * Optimize prompt for specific AI model
     */
    optimizeForModel(prompt, modelName = 'gemini') {
        // Model-specific optimizations
        const optimizations = {
            gemini: {
                prefix: '',
                suffix: '\n\nGenerate a high-quality, professional image following these specifications exactly.',
                maxLength: 4000,
            },
            // Add other models as needed
        }

        const config = optimizations[modelName] || optimizations.gemini

        let optimized = config.prefix + prompt + config.suffix

        // Truncate if too long
        if (optimized.length > config.maxLength) {
            optimized = optimized.substring(0, config.maxLength - 3) + '...'
        }

        return optimized
    }

    /**
     * Generate regeneration prompt for failed slides
     */
    generateRegenerationPrompt(originalPrompt, issues) {
        let regenerationPrompt = originalPrompt

        regenerationPrompt += `\n\nREGENERATION NOTES:
Previous generation had issues. Please fix:
${issues.map(issue => `- ${issue.type}: ${issue.message}`).join('\n')}

Pay special attention to:
- Text readability and contrast
- Proper alignment
- No text overflow
- Clear visual hierarchy`

        return regenerationPrompt
    }

    /**
     * Extract prompt metadata
     */
    extractMetadata(prompt) {
        return {
            length: prompt.length,
            wordCount: prompt.split(/\s+/).length,
            hasColors: /hsl\(/.test(prompt),
            hasTypography: /font/.test(prompt),
            hasLayout: /padding|margin|composition/.test(prompt),
            timestamp: new Date().toISOString(),
        }
    }
}

// Export singleton instance
export const promptEngine = new PromptEngine()
export default promptEngine
