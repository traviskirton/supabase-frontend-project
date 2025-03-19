export function getEnv(key: string, defaultValue = ""): string {
  // Check browser-injected ENV object first
  if (typeof window !== "undefined" && window.ENV && window.ENV[key]) {
    return window.ENV[key]
  }

  // Then check process.env
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key] as string
  }

  // Fall back to default value
  return defaultValue
}

// Type declaration for window.ENV
declare global {
  interface Window {
    ENV?: Record<string, string>
  }
}

