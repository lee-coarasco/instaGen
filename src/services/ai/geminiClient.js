import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * Gemini AI Client
 * Handles all interactions with Google Gemini API
 */

class GeminiClient {
    constructor() {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY

        if (!apiKey) {
            throw new Error('VITE_GEMINI_API_KEY is not defined in environment variables')
        }

        this.apiKey = apiKey
        this.genAI = new GoogleGenerativeAI(apiKey)
        this.currentModel = null
        this.textModel = null
        this.visionModel = null

        // Initialize immediately
        this.initPromise = this.initializeModels()

        this.usageCallback = null
    }

    setUsageCallback(callback) {
        this.usageCallback = callback
    }

    handleUsage(response) {
        if (response.usageMetadata && this.usageCallback) {
            this.usageCallback(response.usageMetadata)
        }
    }

    async initializeModels() {
        console.log('🔍 Initializing Gemini models...')
        console.log('🔑 API Key present:', this.apiKey ? 'Yes' : 'No')
        console.log('🔑 API Key starts with:', this.apiKey.substring(0, 10))

        // Updated list based on user's available models
        const modelNamesToTry = [
            'models/gemini-2.5-flash',
            'models/gemini-2.0-flash',
            'models/gemini-flash-latest',
        ]

        for (const modelName of modelNamesToTry) {
            try {
                console.log(`  🔍 Trying: ${modelName}`)

                const model = this.genAI.getGenerativeModel({ model: modelName })

                // Test with a minimal generation
                console.log(`  📤 Sending test request...`)
                const result = await model.generateContent('test')
                const response = await result.response
                const text = response.text()

                // Success!
                this.textModel = model
                this.visionModel = model
                this.currentModel = modelName

                console.log(`  ✅ SUCCESS! Using: ${modelName}`)
                return true

            } catch (error) {
                console.warn(`  ⚠️ ${modelName} failed: ${error.message}`)
                continue
            }
        }

        // If we get here, nothing worked
        console.error('❌ FAILED: Could not initialize any Gemini model')
        console.error('💡 All models failed. Check the errors above.')
        throw new Error('Could not initialize any Gemini model. Please check your API key.')
    }

    async ensureInitialized() {
        if (!this.textModel) {
            await this.initPromise
        }
        if (!this.textModel) {
            throw new Error('Gemini model not initialized')
        }
    }

    /**
     * Generate text response from prompt
     */
    async generateText(prompt, options = {}) {
        await this.ensureInitialized()

        try {
            const result = await this.textModel.generateContent(prompt)
            const response = await result.response
            this.handleUsage(response)
            return response.text()
        } catch (error) {
            console.error('Gemini text generation error:', error)
            throw new Error(`Failed to generate text: ${error.message}`)
        }
    }

    /**
     * Generate structured JSON response
     */
    async generateJSON(prompt, options = {}) {
        await this.ensureInitialized()

        try {
            const jsonPrompt = `${prompt}\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no explanations, just pure JSON.`

            console.log('📤 Sending JSON request to Gemini...')
            const result = await this.textModel.generateContent(jsonPrompt)
            const response = await result.response
            this.handleUsage(response)
            const text = response.text()
            console.log('📥 Received response from Gemini')
            console.log('📄 Response length:', text.length, 'characters')

            // Clean up response - remove markdown code blocks if present
            const cleanedText = text
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim()

            const parsed = JSON.parse(cleanedText)
            console.log('✅ Successfully parsed JSON response')
            return parsed
        } catch (error) {
            console.error('❌ Gemini JSON generation error:', error)
            throw new Error(`Failed to generate JSON: ${error.message}`)
        }
    }

    /**
     * Analyze image with vision model
     */
    async analyzeImage(imageData, prompt) {
        await this.ensureInitialized()

        try {
            const imagePart = {
                inlineData: {
                    data: imageData,
                    mimeType: 'image/jpeg',
                },
            }

            const result = await this.visionModel.generateContent([prompt, imagePart])
            const response = await result.response
            this.handleUsage(response)
            return response.text()
        } catch (error) {
            console.error('Gemini vision analysis error:', error)
            throw new Error(`Failed to analyze image: ${error.message}`)
        }
    }

    /**
     * Generate image using Imagen (via Gemini)
     * Note: This is a placeholder - actual implementation depends on available Gemini image generation API
     */
    async generateImage(prompt, options = {}) {
        await this.ensureInitialized()

        // Models to try based on user's verified list
        const imageModels = [
            'models/gemini-2.0-flash-exp-image-generation',
            'models/gemini-2.5-flash-image', // Nano Banana
            'models/imagen-3.0-generate-001', // Standard fallback
        ]

        // Loop through models until one works or we timeout
        for (const modelName of imageModels) {
            try {
                console.log(`🖼️ Trying image generation with model: ${modelName}`)
                const model = this.genAI.getGenerativeModel({ model: modelName })

                // Add a timeout of 30 seconds for image generation
                const generationTask = model.generateContent(prompt)
                const result = await Promise.race([
                    generationTask,
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 30000))
                ])

                const response = await result.response

                // Check for inline data (standard image response)
                if (response.candidates && response.candidates[0]?.content?.parts) {
                    const parts = response.candidates[0].content.parts;
                    console.log(`📥 Model ${modelName} returned ${parts.length} parts`);

                    this.handleUsage(response)
                    for (const part of parts) {
                        // Debug log part types
                        const partTypes = Object.keys(part).filter(k => k !== 'text');
                        console.log(`🔍 Part info: keys=${JSON.stringify(partTypes)}, hasText=${!!part.text}`);

                        if (part.inlineData && part.inlineData.data) {
                            console.log(`✅ Success! Generated image using ${modelName} (mime: ${part.inlineData.mimeType})`)
                            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
                        }
                    }
                }

                console.warn(`⚠️ ${modelName} returned response but no inline image data found. Parts:`, JSON.stringify(response.candidates?.[0]?.content?.parts));
            } catch (error) {
                const msg = error.message === 'Timeout' ? 'Request timed out' :
                    (error.message?.includes('404') ? 'Model not found or not supported' : error.message)
                console.warn(`❌ Failed with ${modelName}: ${msg}`)
            }
        }

        // If all models fail, use fallback
        console.log('⚠️ All image models failed, using placeholder')

        // Safety check for prompt
        const topic = prompt && typeof prompt === 'string' ? prompt.split(' ').slice(0, 5).join(' ') : 'Instagram Post'
        const encodedTopic = encodeURIComponent(topic)

        // Using a more reliable placeholder service
        return `https://placehold.co/1080x1080/1a1a1a/ffffff?text=${encodedTopic}`
    }

    /**
     * Chat-based interaction for multi-turn conversations
     */
    async chat(messages) {
        await this.ensureInitialized()

        try {
            const chat = this.textModel.startChat({
                history: messages.slice(0, -1).map(msg => ({
                    role: msg.role,
                    parts: [{ text: msg.content }],
                })),
            })

            const lastMessage = messages[messages.length - 1]
            const result = await chat.sendMessage(lastMessage.content)
            const response = await result.response
            this.handleUsage(response)
            return response.text()
        } catch (error) {
            console.error('Gemini chat error:', error)
            throw new Error(`Failed to chat: ${error.message}`)
        }
    }
}

// Export singleton instance
export const geminiClient = new GeminiClient()
export default geminiClient
