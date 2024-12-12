import env from '../config/env'

export const logError = (error) => {
  if (env.IS_DEV) {
    console.error('Error:', error)
  }
}


export const getApiUrl = (path) => {
  return `${env.API_BASE_URL}${path}`
}

export const isDevelopment = () => env.ENV === 'development'
export const isStaging = () => env.ENV === 'staging'
export const isProduction = () => env.ENV === 'production' 