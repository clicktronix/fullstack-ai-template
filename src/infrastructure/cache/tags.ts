import 'server-only'

export const cacheTags = {
  assistantSuggestions: {
    externalApi: 'assistant-suggestions:external-api',
    user: (userId: string) => `assistant-suggestions:user:${userId}`,
  },
  labels: {
    all: 'labels',
    list: 'labels:list',
    detail: (id: string) => `labels:${id}`,
  },
  workItems: {
    all: 'work-items',
    user: (userId: string) => `work-items:user:${userId}`,
    lists: (userId: string) => `work-items:user:${userId}:lists`,
    detail: (userId: string, id: string) => `work-items:user:${userId}:detail:${id}`,
  },
} as const
