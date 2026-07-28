type MutationLike = {
  isPending: boolean
}

export function useCombinedPending(...mutations: MutationLike[]): boolean {
  return mutations.some((mutation) => mutation.isPending)
}
