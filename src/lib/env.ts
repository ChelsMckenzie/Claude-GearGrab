/**
 * Environment variable validation and access
 * Throws errors if required variables are missing
 */

function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. Please check your .env file.`
    )
  }
  return value
}

function getOptionalEnv(key: string): string | undefined {
  return process.env[key]
}

/**
 * Validated environment variables
 * Access these instead of process.env directly
 */
export const env = {
  supabaseUrl: getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  geminiApiKey: getOptionalEnv('GEMINI_API_KEY'),
} as const
