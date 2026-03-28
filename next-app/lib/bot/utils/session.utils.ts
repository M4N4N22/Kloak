export function safeSessionData<T>(data: unknown): T {
  if (typeof data === "object" && data !== null) {
    return data as T
  }
  return {} as T
}