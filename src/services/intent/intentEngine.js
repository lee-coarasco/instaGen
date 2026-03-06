import { geminiClient } from '@services/ai/geminiClient'
import { getNicheProfile } from '@config/niches'

/**
 * Intent Understanding Engine (Layer 1)
 * Converts messy human input → clear creative intent
 */

export class IntentEngine {
    /**
     * Analyze user input and extract creative intent
     */
    async analyzeIntent(userInput, context = {}) {
        const { niche, postType, referenceImage, brandName, brandingPlacement, contentDensity } = context

        const nicheProfile = getNicheProfile(niche)

        let referenceStyle = null
        if (referenceImage) {
            console.log('🖼️ Analyzing visual reference...')
            referenceStyle = await this.analyzeVisualReference(referenceImage)
        }

        const prompt = this.buildIntentPrompt(userInput, nicheProfile, postType, referenceStyle, context)

        try {
            const intent = await geminiClient.generateJSON(prompt)

            // Validate and enrich intent
            return this.validateIntent(
                { ...intent, referenceStyle, brandName, brandingPlacement, contentDensity },
                nicheProfile
            )
        } catch (error) {
            console.error('Intent analysis failed:', error)
            throw new Error(`Failed to understand intent: ${error.message}`)
        }
    }

    /**
     * Analyze a visual reference image to extract style tokens
     */
    async analyzeVisualReference(base64Image) {
        // Strip data prefix if present
        const imageData = base64Image.replace(/^data:image\/\w+;base64,/, '')

        const prompt = `Analyze this design reference image. Extract the following details for a design system:
1. Color Palette: Identify primary, secondary, and accent colors (provide as HSL or Hex).
2. Typography: Describe the font style (e.g., modern sans-serif, elegant serif, bold display), weights, and overall typography "vibe".
3. Illustration/Visual Style: Describe the artistic style (e.g., minimalist flat illustration, grainy 3D, neon cyberpunk).
4. Composition: Note any distinct layout patterns or uses of whitespace.

OUTPUT FORMAT (JSON):
{
  "colors": {
    "primary": "string",
    "secondary": "string",
    "accent": "string",
    "background": "string"
  },
  "typography": {
    "heading_vibe": "string",
    "body_vibe": "string",
    "style_category": "string"
  },
  "visual_style": {
    "type": "string",
    "characteristics": ["string"],
    "mood": "string"
  },
  "layout_hints": "string"
}

Respond ONLY with the JSON object.`

        try {
            const resultText = await geminiClient.analyzeImage(imageData, prompt)
            // Clean up response - remove markdown code blocks if present
            const cleanedText = resultText
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim()
            return JSON.parse(cleanedText)
        } catch (error) {
            console.error('Visual reference analysis failed:', error)
            return null // Fallback to default if analysis fails
        }
    }

    /**
     * Build prompt for intent understanding
     */
    buildIntentPrompt(userInput, nicheProfile, postType, referenceStyle = null, context = {}) {
        return `You are an expert creative director analyzing a request for Instagram content.

USER INPUT:
"${userInput}"

CONTEXT:
- Niche: ${nicheProfile.name}
- Post Type: ${postType}
${referenceStyle ? `
STYLE REFERENCE (PRIORITY):
The user has provided a reference image with the following extracted style:
- Colors: ${JSON.stringify(referenceStyle.colors)}
- Typography: ${JSON.stringify(referenceStyle.typography)}
- Visual Style: ${JSON.stringify(referenceStyle.visual_style)}
- Layout Hints: ${referenceStyle.layout_hints}

TASK: Incorporate these reference styles into the creative intent. The visual language, tone, and colors should be heavily influenced by this reference while staying relevant to the ${nicheProfile.name} niche.` : `
- Niche Characteristics:
  * Typical Icons: ${nicheProfile.icons.join(', ')}
  * Color Palette: ${nicheProfile.colors.join(', ')}
  * Visual Style: ${nicheProfile.illustrations.join(', ')}
  * Tone: ${nicheProfile.tone}
  * Audience: ${nicheProfile.audience}`
            }

TASK:
Analyze the user's input and extract the creative intent. Determine:
1. What is the primary goal of this content?
2. Who is the target audience?
3. What tone should the content have?
4. What visual language would work best?
5. What level of consistency is needed across slides?
6. What emotions should it evoke?

OUTPUT FORMAT (JSON):
{
  "goal": "string - primary objective (e.g., 'Educational carousel', 'Promotional post')",
  "audience": "string - target audience description",
  "tone": "string - content tone (e.g., 'modern, futuristic, informative')",
  "platform": "string - platform (always 'Instagram')",
  "visual_language": "string - visual style description",
  "consistency_level": "string - 'High', 'Medium', or 'Low'",
  "emotions": ["array of emotions to evoke"],
  "key_messages": ["array of 3-5 key messages to communicate"],
  "complexity": "string - 'Simple', 'Moderate', or 'Complex'",
  "suggested_slide_count": ${context.slideCountMethod === 'manual' ? context.slideCount : 'number - recommended number of slides (if carousel)'}
}

${context.slideCountMethod === 'manual' ? `IMPORTANT: The user has requested EXACTLY ${context.slideCount} slides. Your suggestions and key messages must be optimized for this specific length.` : ''}

Respond ONLY with the JSON object.`
    }

    /**
     * Validate and enrich intent object
     */
    validateIntent(intent, nicheProfile) {
        // Ensure all required fields are present
        const required = [
            'goal',
            'audience',
            'tone',
            'platform',
            'visual_language',
            'consistency_level',
        ]

        for (const field of required) {
            if (!intent[field]) {
                throw new Error(`Intent missing required field: ${field}`)
            }
        }

        // Enrich with niche-specific data
        return {
            ...intent,
            niche: nicheProfile.id,
            nicheProfile: {
                name: nicheProfile.name,
                colorPalette: nicheProfile.colorPalette,
                icons: nicheProfile.icons,
                illustrations: nicheProfile.illustrations,
            },
            timestamp: new Date().toISOString(),
        }
    }

    /**
     * Refine intent based on user feedback
     */
    async refineIntent(originalIntent, userFeedback) {
        const prompt = `You are refining creative intent based on user feedback.

ORIGINAL INTENT:
${JSON.stringify(originalIntent, null, 2)}

USER FEEDBACK:
"${userFeedback}"

TASK:
Update the intent based on the user's feedback. Keep what works, modify what doesn't.

OUTPUT FORMAT (JSON):
Return the complete updated intent object with the same structure as the original.

Respond ONLY with the JSON object.`

        try {
            const refinedIntent = await geminiClient.generateJSON(prompt)
            return this.validateIntent(refinedIntent, originalIntent.nicheProfile)
        } catch (error) {
            console.error('Intent refinement failed:', error)
            throw new Error(`Failed to refine intent: ${error.message}`)
        }
    }
}

// Export singleton instance
export const intentEngine = new IntentEngine()
export default intentEngine
