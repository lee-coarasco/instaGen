/**
 * Gemini API Verification Utility
 * Use this to test if your API key is working
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

export async function verifyGeminiAPI() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY

    if (!apiKey) {
        return {
            success: false,
            error: 'VITE_GEMINI_API_KEY not found in environment variables',
            suggestion: 'Add your API key to the .env file',
        }
    }

    if (apiKey === 'your_gemini_api_key_here') {
        return {
            success: false,
            error: 'API key is still the placeholder value',
            suggestion: 'Replace with your actual Gemini API key from https://makersuite.google.com/app/apikey',
        }
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' })

        // Try a simple generation
        const result = await model.generateContent('Say "Hello" if you can hear me.')
        const response = await result.response
        const text = response.text()

        return {
            success: true,
            message: 'API key is valid and working!',
            model: 'models/gemini-2.5-flash',
            testResponse: text,
        }
    } catch (error) {
        return {
            success: false,
            error: error.message,
            suggestion: 'Check if your API key is correct and has the necessary permissions',
            details: error,
        }
    }
}

export async function listAvailableModels() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY

    if (!apiKey) {
        console.error('No API key found')
        return []
    }

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        )

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        return data.models || []
    } catch (error) {
        console.error('Failed to list models:', error)
        return []
    }
}

// Run verification on import in development mode
if (import.meta.env.DEV) {
    verifyGeminiAPI().then(result => {
        if (result.success) {
            console.log('✅ Gemini API verified:', result.message)
            console.log('📝 Test response:', result.testResponse)
        } else {
            console.error('❌ Gemini API verification failed:', result.error)
            console.log('💡 Suggestion:', result.suggestion)
        }
    })
}
