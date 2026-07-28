export const assistantSuggestionCacheTags = {
  externalApi: 'assistant-suggestions:external-api',
  user: (userId: string) => `assistant-suggestions:user:${userId}`,
} as const
