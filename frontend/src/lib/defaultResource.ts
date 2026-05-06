export function shouldAutoCreate(
  isLoading: boolean,
  items: unknown[] | undefined,
  isCreating: boolean,
  wasCreated: boolean,
): boolean {
  return !isLoading && (items?.length ?? 0) === 0 && !isCreating && !wasCreated
}
