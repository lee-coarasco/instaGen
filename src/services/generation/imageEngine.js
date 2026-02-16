import { geminiClient } from '@services/ai/geminiClient'
import { visualPlanner } from '@services/visual/visualPlanner'

/**
 * Image Generation Engine (Layer 5)
 * Handles prompt construction and image generation via Gemini/Imagen
 */

export class ImageEngine {
    /**
     * Generate images for all slides
     */
    async generateAllImages(project) {
        const { content, visualPlan } = project
        const generatedImages = []

        console.log('🎨 Starting batch image generation for', content.slides.length, 'slides')

        // Generate in parallel or sequence? Sequence is safer for rate limits.
        // Parallel for speed if rate limits allow.
        // Let's try parallel with a limit or just Promise.all if count is small (5 slides).

        try {
            const promises = content.slides.map(async (slide, index) => {
                try {
                    console.log(`🖼️ Generating image for slide ${index + 1}...`)

                    // 1. Generate detailed prompt
                    const prompt = visualPlanner.generateSlidePrompt(index, visualPlan, content)

                    // 2. Generate image
                    const imageUrl = await geminiClient.generateImage(prompt)

                    return {
                        slideIndex: index,
                        imageUrl: imageUrl,
                        prompt: prompt,
                        status: imageUrl ? 'success' : 'error',
                        error: imageUrl ? null : 'Model failed to return image data'
                    }
                } catch (error) {
                    console.error(`❌ Failed to generate slide ${index + 1}:`, error)
                    return {
                        slideIndex: index,
                        imageUrl: null,
                        error: error.message || 'Generation failed',
                        status: 'error'
                    }
                }
            })

            const results = await Promise.all(promises)

            // Sort by index just in case
            return results.sort((a, b) => a.slideIndex - b.slideIndex)

        } catch (error) {
            console.error('Batch generation failed:', error)
            throw new Error(`Failed to generate images: ${error.message}`)
        }
    }

    /**
     * Generate single image
     */
    async generateSingleImage(project, slideIndex) {
        const { content, visualPlan } = project

        const prompt = visualPlanner.generateSlidePrompt(slideIndex, visualPlan, content)
        const imageUrl = await geminiClient.generateImage(prompt)

        return {
            slideIndex: slideIndex,
            imageUrl: imageUrl,
            prompt: prompt
        }
    }
}

export const imageEngine = new ImageEngine()
export default imageEngine
