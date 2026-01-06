---
name: gpt-5-implementation
description: Guides proper OpenAI GPT-5 API usage with correct parameters. Use when implementing GPT-5 API calls, configuring reasoning.effort, text.verbosity, or troubleshooting parameter errors.
---

# GPT-5 Implementation Guide

## Model Selection (Simple)

| Need | Model | Why |
|------|-------|-----|
| Best quality | `gpt-5.2` | Latest, smartest, supports temperature |
| Budget-friendly | `gpt-5-mini` | 10x cheaper, good for bulk content |

---

## Core Parameters (Flat Strings for Chat Completions)

### reasoning_effort

Controls thinking depth before responding. **Use as flat string, NOT nested object.**

| Value | Use Case | Latency |
|-------|----------|---------|
| `"none"` | Fast responses, enables temperature (5.2 only) | ~1-2s |
| `"low"` | Chat, light tasks | ~3-5s |
| `"medium"` | General purpose (default for mini) | ~5-10s |
| `"high"` | Complex analysis | ~10-20s |

**Model support:**
- `gpt-5.2`: `none`, `low`, `medium`, `high` (default: `none`)
- `gpt-5-mini`: `low`, `medium`, `high` (default: `medium`) - NO `none`!

### verbosity

Controls response detail level. **Use as flat string, NOT nested under `text`.**

| Value | Best For |
|-------|----------|
| `"low"` | Mobile apps, chat, short answers |
| `"medium"` | General use |
| `"high"` | Documentation, education |

### max_completion_tokens

Replaces `max_tokens`. Sets maximum response length.

---

## Temperature Rules

**Temperature ONLY works with gpt-5.2 when `reasoning.effort: "none"`**

```typescript
// ERROR - gpt-5-mini doesn't support temperature
{ model: "gpt-5-mini", temperature: 0.7 }

// ERROR - need effort: "none" for temperature
{ model: "gpt-5.2", reasoning: { effort: "low" }, temperature: 0.7 }

// CORRECT
{ model: "gpt-5.2", reasoning: { effort: "none" }, temperature: 0.7 }
```

---

## Implementation Patterns

### Pattern 1: Quality Chat (Recommended for Stella)

```typescript
{
  model: "gpt-5.2",
  reasoning_effort: "low",
  verbosity: "low",
  max_completion_tokens: 250,
  messages: [...]
}
```

### Pattern 2: Budget Content Generation

```typescript
{
  model: "gpt-5-mini",
  reasoning_effort: "medium",
  verbosity: "low",
  max_completion_tokens: 500,
  messages: [...]
}
```

### Pattern 3: Creative with Randomness

Only when you specifically need temperature control:

```typescript
{
  model: "gpt-5.2",
  reasoning_effort: "none",
  temperature: 0.8,
  max_completion_tokens: 500,
  messages: [...]
}
```

---

## TypeScript Handling

SDK may not have GPT-5 types yet. Use assertion:

```typescript
const response = await openai.chat.completions.create({
  model: "gpt-5.2",
  reasoning_effort: "low",
  verbosity: "low",
  max_completion_tokens: 250,
  messages: [...],
} as Parameters<typeof openai.chat.completions.create>[0]);
```

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| "temperature not supported" | Using temp with gpt-5-mini | Remove temperature, use reasoning/verbosity |
| "temperature requires effort none" | Using temp with effort > none | Set `reasoning: { effort: "none" }` |
| "effort none not supported" | Using `none` with gpt-5-mini | Use `low` or higher |

---

## Quick Config Reference

```typescript
const GENERATION_SETTINGS = {
  // Stella chat - wise, mobile-friendly
  chat: {
    model: "gpt-5.2",
    reasoning_effort: "low",
    verbosity: "low",
    max_completion_tokens: 250,
  },

  // Daily content - budget, concise
  daily: {
    model: "gpt-5-mini",
    reasoning_effort: "medium",
    verbosity: "low",
    max_completion_tokens: 500,
  },

  // Detailed content - budget, more detail
  detailed: {
    model: "gpt-5-mini",
    reasoning_effort: "medium",
    verbosity: "medium",
    max_completion_tokens: 1500,
  },
};
```

---

## Best Practices

1. **Use gpt-5.2** for user-facing chat experiences
2. **Use gpt-5-mini** for background content generation
3. **Set `verbosity: "low"`** for mobile interfaces
4. **Only use temperature** if you specifically need randomness
5. **Start with `reasoning: "low"`** for chat, `"medium"` for content
