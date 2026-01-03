import OpenAI from "openai";

/**
 * OpenAI client for Stella+ AI-powered content.
 *
 * Uses GPT-5-mini for fast/cheap daily content generation.
 * Uses GPT-5.2 for high-quality Stella chat conversations.
 */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Model constants for different use cases.
 */
export const MODELS = {
  /** Fast model for daily content generation (scores, forecasts, rituals) */
  FAST: "gpt-5-mini",
  /** Quality model for Stella chat conversations */
  QUALITY: "gpt-5.2",
} as const;

/**
 * Default generation settings for content APIs.
 */
export const GENERATION_SETTINGS = {
  daily: {
    model: MODELS.FAST,
    temperature: 0.7,
    max_tokens: 500,
  },
  weekly: {
    model: MODELS.FAST,
    temperature: 0.7,
    max_tokens: 1500,
  },
  ritual: {
    model: MODELS.FAST,
    temperature: 0.8,
    max_tokens: 300,
  },
  chat: {
    model: MODELS.QUALITY,
    temperature: 0.8,
    max_tokens: 800,
  },
} as const;
