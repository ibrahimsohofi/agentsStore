/**
 * Environment Configuration
 * Centralized configuration management for environment variables
 */

interface AppConfig {
  // Database
  databaseUrl: string

  // Authentication
  nextAuthSecret: string
  nextAuthUrl: string

  // OAuth Providers
  google: {
    clientId?: string
    clientSecret?: string
  }
  github: {
    id?: string
    secret?: string
  }

  // Stripe
  stripe: {
    publishableKey: string
    secretKey: string
    webhookSecret: string
  }

  // OpenAI
  openai: {
    apiKey?: string
  }

  // Email
  email: {
    host?: string
    port?: number
    user?: string
    pass?: string
    from?: string
  }

  // File Upload
  cloudinary: {
    cloudName?: string
    apiKey?: string
    apiSecret?: string
  }
  aws: {
    accessKeyId?: string
    secretAccessKey?: string
    region?: string
    s3Bucket?: string
  }

  // App
  app: {
    url: string
    adminEmail?: string
    environment: 'development' | 'production' | 'test'
  }

  // Optional Services
  redis?: {
    url: string
  }
  analytics?: {
    googleAnalyticsId: string
    mixpanelToken: string
  }
  monitoring?: {
    sentryDsn: string
  }
}

function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

function getOptionalEnv(key: string): string | undefined {
  return process.env[key]
}

function getEnvAsNumber(key: string, defaultValue?: number): number | undefined {
  const value = process.env[key]
  if (!value) return defaultValue
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a number, got: ${value}`)
  }
  return parsed
}

export const config: AppConfig = {
  databaseUrl: getRequiredEnv('DATABASE_URL'),

  nextAuthSecret: getRequiredEnv('NEXTAUTH_SECRET'),
  nextAuthUrl: getRequiredEnv('NEXTAUTH_URL'),

  google: {
    clientId: getOptionalEnv('GOOGLE_CLIENT_ID'),
    clientSecret: getOptionalEnv('GOOGLE_CLIENT_SECRET'),
  },

  github: {
    id: getOptionalEnv('GITHUB_ID'),
    secret: getOptionalEnv('GITHUB_SECRET'),
  },

  stripe: {
    publishableKey: getRequiredEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
    secretKey: getRequiredEnv('STRIPE_SECRET_KEY'),
    webhookSecret: getRequiredEnv('STRIPE_WEBHOOK_SECRET'),
  },

  openai: {
    apiKey: getOptionalEnv('OPENAI_API_KEY'),
  },

  email: {
    host: getOptionalEnv('SMTP_HOST'),
    port: getEnvAsNumber('SMTP_PORT'),
    user: getOptionalEnv('SMTP_USER'),
    pass: getOptionalEnv('SMTP_PASS'),
    from: getOptionalEnv('FROM_EMAIL'),
  },

  cloudinary: {
    cloudName: getOptionalEnv('CLOUDINARY_CLOUD_NAME'),
    apiKey: getOptionalEnv('CLOUDINARY_API_KEY'),
    apiSecret: getOptionalEnv('CLOUDINARY_API_SECRET'),
  },

  aws: {
    accessKeyId: getOptionalEnv('AWS_ACCESS_KEY_ID'),
    secretAccessKey: getOptionalEnv('AWS_SECRET_ACCESS_KEY'),
    region: getOptionalEnv('AWS_REGION'),
    s3Bucket: getOptionalEnv('AWS_S3_BUCKET'),
  },

  app: {
    url: getOptionalEnv('APP_URL') || getRequiredEnv('NEXTAUTH_URL'),
    adminEmail: getOptionalEnv('ADMIN_EMAIL'),
    environment: (getOptionalEnv('NODE_ENV') as AppConfig['app']['environment']) || 'development',
  },

  // Optional services - only include if configured
  ...((() => {
    const redisUrl = getOptionalEnv('REDIS_URL');
    return redisUrl ? { redis: { url: redisUrl } } : {};
  })()),

  ...((() => {
    const googleAnalyticsId = getOptionalEnv('GOOGLE_ANALYTICS_ID');
    const mixpanelToken = getOptionalEnv('MIXPANEL_TOKEN');
    return googleAnalyticsId ? {
      analytics: {
        googleAnalyticsId,
        mixpanelToken: mixpanelToken || ''
      }
    } : {};
  })()),

  ...(getOptionalEnv('SENTRY_DSN') && {
    monitoring: {
      sentryDsn: getOptionalEnv('SENTRY_DSN') || '',
    },
  }),
}

// Helper functions for feature flags
export const features = {
  hasGoogleAuth: () => Boolean(config.google.clientId && config.google.clientSecret),
  hasGithubAuth: () => Boolean(config.github.id && config.github.secret),
  hasOpenAI: () => Boolean(config.openai.apiKey),
  hasEmail: () => Boolean(config.email.host && config.email.user && config.email.pass),
  hasCloudinary: () => Boolean(config.cloudinary.cloudName && config.cloudinary.apiKey),
  hasAWS: () => Boolean(config.aws.accessKeyId && config.aws.secretAccessKey),
  hasRedis: () => Boolean(config.redis?.url),
  hasAnalytics: () => Boolean(config.analytics?.googleAnalyticsId),
  hasMonitoring: () => Boolean(config.monitoring?.sentryDsn),
  isProduction: () => config.app.environment === 'production',
  isDevelopment: () => config.app.environment === 'development',
  isTest: () => config.app.environment === 'test',
}

// Validation
export function validateConfig() {
  const errors: string[] = []

  // Required for basic functionality
  if (!config.databaseUrl) errors.push('DATABASE_URL is required')
  if (!config.nextAuthSecret) errors.push('NEXTAUTH_SECRET is required')
  if (!config.nextAuthUrl) errors.push('NEXTAUTH_URL is required')

  // Stripe validation
  if (!config.stripe.publishableKey) errors.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required')
  if (!config.stripe.secretKey) errors.push('STRIPE_SECRET_KEY is required')
  if (!config.stripe.webhookSecret) errors.push('STRIPE_WEBHOOK_SECRET is required')

  // Production-specific validations
  if (features.isProduction()) {
    if (config.nextAuthSecret === 'your-nextauth-secret-here-change-in-production') {
      errors.push('NEXTAUTH_SECRET must be changed in production')
    }
    if (!config.app.adminEmail) {
      errors.push('ADMIN_EMAIL is recommended in production')
    }
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`)
  }
}

// Auto-validate on import (except in test environment)
if (typeof window === 'undefined' && !features.isTest()) {
  try {
    validateConfig()
  } catch (error) {
    console.error('Configuration validation failed:', error)
    if (features.isProduction()) {
      process.exit(1)
    }
  }
}
