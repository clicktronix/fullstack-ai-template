export function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === 'production'
}

export function isDevelopmentEnvironment(): boolean {
  return process.env.NODE_ENV === 'development'
}

export function isTestEnvironment(): boolean {
  return process.env.NODE_ENV === 'test'
}
