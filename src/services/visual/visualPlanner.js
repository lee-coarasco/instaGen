import { geminiClient } from '@services/ai/geminiClient'
import { getNicheColors } from '@config/niches'

/**
 * Visual Planning Engine (Layer 3)
 * Generates storyboard preview and design tokens
 * Creates visual consistency framework
 */

export class VisualPlanner {
  /**
   * Create visual plan and storyboard
   */
  async createVisualPlan(intent, structuredContent) {
    const { niche, visual_language, tone } = intent
    const nicheColors = getNicheColors(niche)

    const prompt = this.buildVisualPlanPrompt(intent, structuredContent, nicheColors)

    try {
      const visualPlan = await geminiClient.generateJSON(prompt)

      // Validate and enrich
      return this.validateVisualPlan(visualPlan, intent, structuredContent)
    } catch (error) {
      console.error('Visual planning failed:', error)
      throw new Error(`Failed to create visual plan: ${error.message}`)
    }
  }

  /**
   * Build prompt for visual planning
   */
  buildVisualPlanPrompt(intent, content, nicheColors) {
    return `You are an expert visual designer creating a comprehensive visual plan for an Instagram carousel.

CREATIVE INTENT:
- Niche: ${intent.niche}
- Visual Language: ${intent.visual_language}
- Tone: ${intent.tone}
- Audience: ${intent.audience}

CONTENT STRUCTURE:
${JSON.stringify(content.slides.map(s => ({
      slide: s.slide_number,
      heading: s.heading,
      intent: s.intent,
    })), null, 2)}

NICHE COLOR PALETTE:
- Primary: ${nicheColors.primary}
- Secondary: ${nicheColors.secondary}
- Accent: ${nicheColors.accent}

${intent.referenceStyle ? `
STYLE REFERENCE (HIGH PRIORITY):
Use the following styles extracted from the user's reference image:
- Colors: ${JSON.stringify(intent.referenceStyle.colors)}
- Typography Vibe: ${JSON.stringify(intent.referenceStyle.typography)}
- Visual Style: ${JSON.stringify(intent.referenceStyle.visual_style)}
- Layout Hints: ${intent.referenceStyle.layout_hints}

TASK: Prioritize these style tokens over niche defaults. Ensure the design tokens you create match these colors and vibes exactly.` : ''}

TASK:
Create a comprehensive visual plan that ensures consistency across all slides.

Define:
1. **Color System**: Exact colors to use (HSL format)
2. **Typography**: Font families, sizes, weights
3. **Illustration Style**: Detailed style description
4. **Character Design**: If characters appear, how they should look
5. **Layout Grid**: Spacing, alignment, composition
6. **Visual Elements**: Icons, shapes, decorative elements
7. **Per-Slide Visuals**: Specific visual direction for each slide

OUTPUT FORMAT (JSON):
{
  "design_tokens": {
    "colors": {
      "primary": "hsl(...)",
      "secondary": "hsl(...)",
      "accent": "hsl(...)",
      "background": "hsl(...)",
      "text_primary": "hsl(...)",
      "text_secondary": "hsl(...)"
    },
    "typography": {
      "heading_font": "string - font family",
      "body_font": "string - font family",
      "heading_size": "string - e.g., '48px'",
      "body_size": "string - e.g., '24px'",
      "heading_weight": "string - e.g., 'bold'",
      "line_height": "string - e.g., '1.2'"
    },
    "spacing": {
      "padding": "string - e.g., '60px'",
      "margin": "string - e.g., '40px'",
      "gap": "string - e.g., '20px'"
    },
    "effects": {
      "border_radius": "string - e.g., '20px'",
      "shadow": "string - CSS shadow",
      "gradient": "string - CSS gradient if applicable"
    },
    "branding": {
      "font": "string - font family",
      "color": "hsl(...)",
      "size": "string - e.g., '14px'",
      "opacity": "number - 0 to 1"
    }
  },
  "illustration_style": {
    "type": "string - e.g., 'flat illustration', '3D render', 'minimalist'",
    "characteristics": ["array of style traits"],
    "color_treatment": "string - how colors are applied",
    "detail_level": "string - 'minimal', 'moderate', 'detailed'",
    "mood": "string - overall visual mood"
  },
  "character_design": {
    "style": "string - character illustration style",
    "consistency_rules": ["array of rules to maintain same character"],
    "key_features": ["array of defining features"]
  },
  "layout_system": {
    "composition": "string - e.g., 'centered', 'asymmetric'",
    "text_placement": "string - where text appears",
    "image_placement": "string - where illustrations appear",
    "hierarchy": "string - visual hierarchy approach"
  },
  "slide_visuals": [
    {
      "slide_number": 1,
      "visual_description": "string - detailed description of what to illustrate",
      "focal_point": "string - main visual element",
      "supporting_elements": ["array of secondary elements"],
      "color_emphasis": "string - which colors dominate this slide"
    }
  ],
  "consistency_guidelines": {
    "character_references": "string - how to keep characters consistent",
    "style_references": "string - style consistency rules",
    "color_usage": "string - color application rules",
    "composition_rules": "string - layout consistency rules"
  }
}

CRITICAL REQUIREMENTS:
- All slides must use the SAME color palette
- All slides must use the SAME typography
- If characters appear, they must look IDENTICAL across slides
- Maintain visual consistency while varying content
- Design for 1080x1080px square format
- Ensure high readability on mobile

Respond ONLY with the JSON object.`
  }

  /**
   * Validate and enrich visual plan
   */
  validateVisualPlan(plan, intent, content) {
    // Ensure design tokens exist
    if (!plan.design_tokens) {
      throw new Error('Visual plan missing design tokens')
    }

    // Ensure slide visuals match content slides
    if (plan.slide_visuals.length !== content.slides.length) {
      console.warn('Slide visual count mismatch, adjusting...')

      // Pad or trim slide visuals
      while (plan.slide_visuals.length < content.slides.length) {
        plan.slide_visuals.push({
          slide_number: plan.slide_visuals.length + 1,
          visual_description: 'Continuation of visual theme',
          focal_point: 'Main content',
          supporting_elements: [],
          color_emphasis: 'primary',
        })
      }
    }

    return {
      ...plan,
      niche: intent.niche,
      brandName: intent.brandName,
      brandingPlacement: intent.brandingPlacement,
      format: '1080x1080',
      aspect_ratio: '1:1',
      platform: 'Instagram',
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Generate storyboard description for AI
   */
  generateStoryboardPrompt(visualPlan, content) {
    const { design_tokens, illustration_style, slide_visuals } = visualPlan

    return `Create a storyboard preview showing all ${content.slides.length} slides in a single wide canvas.

LAYOUT:
- Arrange ${content.slides.length} slides horizontally
- Each slide is a mini-panel (512x512px)
- Total canvas: ${content.slides.length * 512}x512px
- Small gaps between slides

DESIGN SYSTEM:
Colors:
- Primary: ${design_tokens.colors.primary}
- Secondary: ${design_tokens.colors.secondary}
- Accent: ${design_tokens.colors.accent}
- Background: ${design_tokens.colors.background}

Typography:
- Heading: ${design_tokens.typography.heading_font}, ${design_tokens.typography.heading_size}, ${design_tokens.typography.heading_weight}
- Body: ${design_tokens.typography.body_font}, ${design_tokens.typography.body_size}

Style: ${illustration_style.type}
Characteristics: ${illustration_style.characteristics.join(', ')}
Mood: ${illustration_style.mood}

SLIDES:
${slide_visuals.map((sv, idx) => `
Slide ${sv.slide_number}:
- Heading: "${content.slides[idx].heading}"
- Subtext: "${content.slides[idx].subtext}"
- Visual: ${sv.visual_description}
- Focal Point: ${sv.focal_point}
- Color Emphasis: ${sv.color_emphasis}
`).join('\n')}

CONSISTENCY REQUIREMENTS:
- Same color palette across ALL slides
- Same typography across ALL slides
- Same illustration style across ALL slides
- ${visualPlan.consistency_guidelines.character_references}
- ${visualPlan.consistency_guidelines.style_references}

OUTPUT:
A single wide image showing all slides side-by-side as a preview storyboard.
This allows the user to see the entire carousel flow and visual consistency before final generation.`
  }

  generateSlidePrompt(slideIndex, visualPlan, content) {
    const slide = content.slides[slideIndex]
    const slideVisual = visualPlan.slide_visuals[slideIndex]
    const { design_tokens, illustration_style, consistency_guidelines } = visualPlan

    return `Create a high-quality square Instagram post (1080x1080px).

CRITICAL: ONLY render the text provided in the "TEXT TO RENDER" section. Do NOT render any other words, character counts, technical specs, or labels.

TEXT TO RENDER (EVERYTHING ELSE IS STRICTLY FORBIDDEN):
- Heading: "${slide.heading}"
- Subtext: "${slide.subtext}"
${visualPlan.brandName ? `- Brand Name: "${visualPlan.brandName}"` : ''}

STRICT NEGATIVE RULES (FORBIDDEN):
- NEVER render technical metadata like "HSL", "Inter", "size", "px", "60px", "bold", "placement", "18l", "0,0%", "40".
- NEVER render color codes (e.g., #FFFFFF, rgb, hsl).
- NEVER render font details or CSS properties as text.
- NEVER render prompt keywords or instructions as text.
- NEVER render slide numbers, dimensions, or percentages.
- If it's not in the "TEXT TO RENDER" list, it is STICKTLY PROHIBITED from appearing in the image.

VISUAL STYLE & BRANDING INSTRUCTIONS:
- This is slide ${slideIndex + 1} of a series. It must match the visual identity of all other slides perfectly.
- Branding placement: Place the brand name "${visualPlan.brandName}" at the ${visualPlan.brandingPlacement}.
- Branding style: Use the color ${design_tokens.branding?.color || design_tokens.colors.primary} and a ${design_tokens.branding?.size || 'small'} font weight.
- Color Palette: Background: ${design_tokens.colors.background}, Primary: ${design_tokens.colors.primary}, Accent: ${design_tokens.colors.accent}.
- Composition: ${visualPlan.layout_system.composition}.
- Illustration Style: ${illustration_style.type} (${illustration_style.mood} mood).

IMAGE DESCRIPTION:
${slideVisual.visual_description}
Focal point: ${slideVisual.focal_point}
Supporting elements: ${slideVisual.supporting_elements.join(', ')}

CONSISTENCY ENFORCEMENT:
${consistency_guidelines.character_references}
${consistency_guidelines.style_references}
`
  }

  /**
   * Extract design tokens for frontend use
   */
  extractDesignTokens(visualPlan) {
    return visualPlan.design_tokens
  }

  /**
   * Validate visual consistency across slides
   */
  validateConsistency(generatedImages) {
    // This would use AI vision to check consistency
    // Placeholder for now
    const checks = {
      color_consistency: true,
      typography_consistency: true,
      style_consistency: true,
      character_consistency: true,
    }

    return {
      isConsistent: Object.values(checks).every(v => v),
      checks,
    }
  }
}

// Export singleton instance
export const visualPlanner = new VisualPlanner()
export default visualPlanner
