'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import type { GearAnalysisResult } from '@/types/database'

interface AnalyzeGearResult {
  data: GearAnalysisResult | null
  error: string | null
  isAiGenerated: boolean
}

// Mock response for when API key is not available (keeps Playwright tests passing)
const mockResult: GearAnalysisResult = {
  brand: 'Garmin',
  model: 'Fenix 7',
  category: 'Electronics',
  sub_category: 'Watches',
  retail_price: 14000,
  description: 'Rugged multisport GPS watch with advanced training features.',
  product_link: 'https://garmin.com/fenix7',
  confidence: 95,
}

export async function analyzeGear(imageData: string): Promise<AnalyzeGearResult> {
  const apiKey = process.env.GEMINI_API_KEY

  // If no API key or using placeholder, use mock response (for development/testing)
  if (!apiKey || apiKey.length < 20) {
    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    return {
      data: mockResult,
      error: null,
      isAiGenerated: false,
    }
  }

  // Real Gemini API integration
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    // Extract base64 data from data URL
    const base64Match = imageData.match(/^data:image\/(\w+);base64,(.+)$/)
    if (!base64Match) {
      throw new Error('Invalid image data format')
    }

    const mimeType = `image/${base64Match[1]}`
    const base64Data = base64Match[2]

    // Add timeout wrapper to prevent hanging (10 seconds for better UX)
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI analysis timed out')), 10000)
    )

    const prompt = `Analyze this outdoor gear image. Return strictly valid JSON with these exact keys:
{
  "brand": "string - the brand name",
  "model": "string - the model name/number",
  "category": "string - main category (e.g., Hiking, Cycling, Camping, Climbing, Water Sports, Running, Fitness)",
  "sub_category": "string - specific type within category",
  "condition_score": "number 1-10 - estimated condition based on visible wear",
  "retail_price_zar": "number - estimated retail price in South African Rand",
  "description": "string - brief description of the item and its features",
  "confidence": "number 0-100 - your confidence in this analysis"
}

Only return the JSON object, no additional text or markdown formatting.`

    const apiPromise = model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
      prompt,
    ])

    // Race between API call and timeout
    const result = await Promise.race([apiPromise, timeoutPromise])

    const response = result.response
    const text = response.text()

    // Parse the JSON response
    // Remove any markdown code blocks if present
    const cleanedText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const parsed = JSON.parse(cleanedText)

    // Map the response to our GearAnalysisResult format
    const analysisResult: GearAnalysisResult = {
      brand: parsed.brand || 'Unknown',
      model: parsed.model || 'Unknown',
      category: parsed.category || 'Other',
      sub_category: parsed.sub_category || '',
      retail_price: parsed.retail_price_zar || 0,
      description: parsed.description || '',
      product_link: '', // Gemini doesn't provide product links
      confidence: parsed.confidence || 50,
    }

    return {
      data: analysisResult,
      error: null,
      isAiGenerated: true,
    }
  } catch (error) {
    console.error('Gemini API error:', error)

    // Fallback to mock on error
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      data: mockResult,
      error: error instanceof Error ? error.message : 'AI analysis failed',
      isAiGenerated: false,
    }
  }
}
