import { geminiClient } from '@services/ai/geminiClient'
import { SLIDE_INTENTS } from '@config/constants'

/**
 * Content Structuring Engine (Layer 2)
 * Locks content structure before image generation
 * Optimizes text for Instagram readability
 */

export class ContentEngine {
    /**
     * Structure content based on intent
     */
    async structureContent(intent, userInput, slides = []) {
        const { postType, niche, goal, audience, tone } = intent

        const prompt = this.buildContentPrompt(intent, userInput, slides)

        try {
            const structuredContent = await geminiClient.generateJSON(prompt)

            // Validate and enrich
            return this.validateContent(structuredContent, intent)
        } catch (error) {
            console.error('Content structuring failed:', error)
            throw new Error(`Failed to structure content: ${error.message}`)
        }
    }

    /**
     * Build prompt for content structuring
     */
    buildContentPrompt(intent, userInput, slides) {
        const slideCount = slides.length || intent.suggested_slide_count || 5
        const density = intent.contentDensity || 'balanced'

        const densityGuideline = {
            minimal: "Keep content extremely brief. 1 short header (max 4 words) and 1 punchy one-liner subtext (max 10 words).",
            balanced: "Standard Instagram format. Hooky headers (max 6 words) and 1-2 concise sentences for subtext (max 18 words).",
            detailed: "In-depth educational content. Detailed headers (max 8 words) and 2-3 informative sentences for subtext (max 35 words)."
        }[density]

        return `You are an expert Instagram content strategist specializing in carousel posts.

USER'S ORIGINAL IDEA:
"${userInput}"

CREATIVE INTENT (from analysis):
- Goal: ${intent.goal}
- Audience: ${intent.audience}
- Tone: ${intent.tone}
- Visual Language: ${intent.visual_language}
- Key Messages: ${intent.key_messages?.join(', ')}
- Content Level: ${density.toUpperCase()} (${densityGuideline})

TASK:
Create ${slideCount} slides for an Instagram carousel. Each slide must:
1. Follow the ${density.toUpperCase()} density requirements: ${densityGuideline}
2. Be optimized for mobile readability while maximizing value
3. Follow a logical flow (Hook → Explain → Detail → CTA)
4. Maintain consistent tone throughout

SLIDE INTENT TYPES:
- hook: Grab attention (slide 1)
- explain: Explain the concept (slides 2-3)
- detail: Provide details/examples (middle slides)
- cta: Call to action (last slide)

INSTAGRAM BEST PRACTICES:
- Keep text scannable but provide high-value insights
- Use power words and action verbs
- Create curiosity and value
- End with clear next step

OUTPUT FORMAT (JSON):
{
  "title": "string - overall carousel title",
  "description": "string - carousel caption (2-3 sentences)",
  "slides": [
    {
      "slide_number": 1,
      "heading": "string",
      "subtext": "string",
      "intent": "hook|explain|detail|cta",
      "visual_focus": "string - what should be illustrated",
      "text_hierarchy": {
        "primary": "heading",
        "secondary": "subtext"
      }
    }
  ],
  "hashtags": ["array of 5-10 relevant hashtags"],
  "content_flow": "string - brief description of the narrative flow"
}

LINGUISTIC PURITY (STRICT):
- Use ONLY real English words from a standard dictionary.
- NEVER hallucinate or invent brand-new words (e.g., "boliplerate", "accelasdopment", "orchstertation").
- Ensure all technical terms are spelled correctly for the given niche.
- PROHIBITED: Do not include any slide numbers, UI labels, or process status text inside the headings or subtexts.

IMPORTANT:
- Slide 1 MUST be "hook" intent
- Last slide MUST be "cta" intent
- Middle slides should be "explain" or "detail"
- Ensure for ${density} mode the text matches the graininess required
- STRICTLY NO technical metadata, font specifications, or linter output.

Respond ONLY with the JSON object.`
    }

    /**
     * Validate and enrich content structure
     */
    validateContent(content, intent) {
        const density = intent.contentDensity || 'balanced'
        const limits = {
            minimal: { header: 6, sub: 12 },
            balanced: { header: 8, sub: 22 },
            detailed: { header: 12, sub: 45 }
        }[density]

        // Ensure required fields
        if (!content.slides || !Array.isArray(content.slides)) {
            throw new Error('Content missing slides array')
        }

        // Validate each slide
        content.slides.forEach((slide, index) => {
            if (!slide.heading || !slide.subtext) {
                throw new Error(`Slide ${index + 1} missing heading or subtext`)
            }

            // Enforce text length limits based on density
            const headerWords = slide.heading.split(' ').length
            const subWords = slide.subtext.split(' ').length

            if (headerWords > limits.header) {
                console.warn(`Slide ${index + 1} heading too long for ${density} mode, truncating`)
                slide.heading = slide.heading.split(' ').slice(0, limits.header).join(' ')
            }

            if (subWords > limits.sub) {
                console.warn(`Slide ${index + 1} subtext too long for ${density} mode, truncating`)
                slide.subtext = slide.subtext.split(' ').slice(0, limits.sub).join(' ')
            }

            // Ensure intent is valid
            if (!Object.values(SLIDE_INTENTS).includes(slide.intent)) {
                slide.intent = SLIDE_INTENTS.EXPLAIN
            }
        })

        // Enforce first slide is hook
        if (content.slides[0].intent !== SLIDE_INTENTS.HOOK) {
            content.slides[0].intent = SLIDE_INTENTS.HOOK
        }

        // Enforce last slide is CTA
        const lastIndex = content.slides.length - 1
        if (content.slides[lastIndex].intent !== SLIDE_INTENTS.CTA) {
            content.slides[lastIndex].intent = SLIDE_INTENTS.CTA
        }

        return {
            ...content,
            caption: this.generateCaption(content),
            niche: intent.niche,
            tone: intent.tone,
            audience: intent.audience,
            timestamp: new Date().toISOString(),
        }
    }

    /**
     * Refine individual slide content
     */
    async refineSlide(slideIndex, currentContent, userFeedback) {
        const slide = currentContent.slides[slideIndex]

        const prompt = `You are refining content for slide ${slideIndex + 1} of an Instagram carousel.

CURRENT SLIDE:
- Heading: "${slide.heading}"
- Subtext: "${slide.subtext}"
- Intent: ${slide.intent}

USER FEEDBACK:
"${userFeedback}"

CONTEXT:
- Overall tone: ${currentContent.tone}
- Audience: ${currentContent.audience}

TASK:
Update this slide based on the feedback while maintaining:
- Short heading (max 5 words)
- Concise subtext (max 15 words)
- Same intent type
- Instagram-friendly language

OUTPUT FORMAT (JSON):
{
  "heading": "string",
  "subtext": "string",
  "intent": "${slide.intent}",
  "visual_focus": "string"
}

Respond ONLY with the JSON object.`

        try {
            const refinedSlide = await geminiClient.generateJSON(prompt)

            // Update the slide in content
            const updatedContent = { ...currentContent }
            updatedContent.slides[slideIndex] = {
                ...slide,
                ...refinedSlide,
                slide_number: slideIndex + 1,
            }

            return updatedContent
        } catch (error) {
            console.error('Slide refinement failed:', error)
            throw new Error(`Failed to refine slide: ${error.message}`)
        }
    }

    /**
     * Optimize text for readability
     */
    optimizeTextReadability(text, maxWords) {
        const words = text.trim().split(/\s+/)

        if (words.length <= maxWords) {
            return text
        }

        // Truncate and add ellipsis
        return words.slice(0, maxWords).join(' ') + '...'
    }

    /**
     * Generate Instagram caption from content
     */
    generateCaption(content) {
        const { title, description, hashtags } = content

        let caption = `${title}\n\n${description}\n\n`

        if (hashtags && hashtags.length > 0) {
            caption += hashtags.map(tag => `#${tag.replace('#', '')}`).join(' ')
        }

        return caption
    }

    /**
     * Validate text contrast and readability
     */
    validateReadability(slide) {
        const issues = []

        // Check heading length
        if (slide.heading.length > 50) {
            issues.push({
                type: 'heading_too_long',
                message: 'Heading exceeds 50 characters',
                severity: 'warning',
            })
        }

        // Check subtext length
        if (slide.subtext.length > 100) {
            issues.push({
                type: 'subtext_too_long',
                message: 'Subtext exceeds 100 characters',
                severity: 'warning',
            })
        }

        // Check for all caps (bad for readability)
        if (slide.heading === slide.heading.toUpperCase()) {
            issues.push({
                type: 'all_caps_heading',
                message: 'All caps reduces readability',
                severity: 'info',
            })
        }

        return {
            isValid: issues.filter(i => i.severity === 'error').length === 0,
            issues,
        }
    }
}

// Export singleton instance
export const contentEngine = new ContentEngine()
export default contentEngine
