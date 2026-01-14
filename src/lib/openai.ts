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
 *
 * GPT-5 chat completions use flat parameters:
 * - reasoning_effort: "none" | "low" | "medium" | "high"
 * - verbosity: "low" | "medium" | "high"
 */
export const GENERATION_SETTINGS = {
  /** Daily content (scores, forecasts) - fast, concise */
  // Note: gpt-5-mini uses ~500+ tokens for reasoning, need 2000+ total
  daily: {
    model: MODELS.FAST,
    reasoning_effort: "medium" as const,
    verbosity: "low" as const,
    max_completion_tokens: 2000,
  },
  /** Weekly forecasts - slightly more detailed */
  weekly: {
    model: MODELS.FAST,
    reasoning_effort: "medium" as const,
    verbosity: "medium" as const,
    max_completion_tokens: 4000,
  },
  /** Ritual prompts - creative, concise */
  ritual: {
    model: MODELS.FAST,
    reasoning_effort: "low" as const,
    verbosity: "low" as const,
    max_completion_tokens: 1500,
  },
  /** Stella chat - wise, conversational, mobile-friendly */
  chat: {
    model: MODELS.QUALITY,
    reasoning_effort: "low" as const,
    verbosity: "low" as const,
    max_completion_tokens: 4000, // Large system prompt + reasoning + response
  },
  /** Chat classification - fast topic detection for analytics */
  classify: {
    model: MODELS.QUALITY,
    reasoning_effort: "low" as const,
    verbosity: "low" as const,
    max_completion_tokens: 500, // Small structured JSON response
  },
  /** Batch classification - multiple messages at once */
  classifyBatch: {
    model: MODELS.QUALITY,
    reasoning_effort: "low" as const,
    verbosity: "low" as const,
    max_completion_tokens: 2000, // Multiple classification results
  },
} as const;
