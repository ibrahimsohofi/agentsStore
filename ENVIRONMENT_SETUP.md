# Environment Setup Guide

This guide helps you configure the AI Agent Marketplace with the necessary environment variables for different features.

## Quick Start

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update the required variables in `.env`:
```bash
# Required for basic functionality
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-unique-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Required for payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

3. Install dependencies and run:
```bash
bun install
bun run dev
```

## Environment Variables Reference

### 🔐 Required Variables

These variables are essential for the application to function:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `file:./dev.db` |
| `NEXTAUTH_SECRET` | Secret for JWT encryption | `your-unique-secret-here` |
| `NEXTAUTH_URL` | Application base URL | `http://localhost:3000` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key | `pk_test_...` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_...` |

### 🔑 Authentication Providers (Optional)

Enable social login with OAuth providers:

| Variable | Description | How to Get |
|----------|-------------|------------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | [Google Cloud Console](https://console.cloud.google.com/) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Google Cloud Console |
| `GITHUB_ID` | GitHub OAuth app ID | [GitHub Developer Settings](https://github.com/settings/developers) |
| `GITHUB_SECRET` | GitHub OAuth app secret | GitHub Developer Settings |

### 🤖 AI Features (Optional)

| Variable | Description | How to Get |
|----------|-------------|------------|
| `OPENAI_API_KEY` | OpenAI API key for recommendations | [OpenAI API Keys](https://platform.openai.com/api-keys) |

### 📧 Email Notifications (Optional)

| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username | `your-email@gmail.com` |
| `SMTP_PASS` | SMTP password/app password | `your-app-password` |
| `FROM_EMAIL` | From email address | `noreply@yourdomain.com` |

### 📁 File Upload (Optional)

Choose between Cloudinary or AWS S3:

#### Cloudinary
| Variable | Description | How to Get |
|----------|-------------|------------|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | [Cloudinary Dashboard](https://cloudinary.com/console) |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Cloudinary Dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Cloudinary Dashboard |

#### AWS S3
| Variable | Description | How to Get |
|----------|-------------|------------|
| `AWS_ACCESS_KEY_ID` | AWS access key | [AWS IAM Console](https://console.aws.amazon.com/iam/) |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | AWS IAM Console |
| `AWS_REGION` | AWS region | `us-east-1` |
| `AWS_S3_BUCKET` | S3 bucket name | [AWS S3 Console](https://console.aws.amazon.com/s3/) |

## Feature Configuration

### Payments with Stripe

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your test keys from the Stripe Dashboard
3. Set up webhooks pointing to `/api/webhooks/stripe`
4. Add the webhook secret to your environment variables

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### AI Recommendations with OpenAI

1. Sign up at [OpenAI](https://platform.openai.com/)
2. Create an API key
3. Add to environment variables:

```env
OPENAI_API_KEY="sk-..."
```

### Social Authentication

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

#### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth app
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

## Development vs Production

### Development
- Use test keys for all services
- Database can be SQLite (`file:./dev.db`)
- NEXTAUTH_SECRET can be any string
- Optional services can be commented out

### Production
- Use production keys for all services
- Switch to PostgreSQL database
- Use a secure, random NEXTAUTH_SECRET
- Enable monitoring and analytics
- Set up proper CORS and security headers

### Production Environment Variables

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/database"

# Security
NEXTAUTH_SECRET="very-secure-random-string-here"
NEXTAUTH_URL="https://yourdomain.com"

# Monitoring
SENTRY_DSN="https://..."

# Analytics
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
```

## Troubleshooting

### Common Issues

1. **Database connection errors**: Ensure DATABASE_URL is correct
2. **Stripe webhook errors**: Verify webhook secret matches Stripe dashboard
3. **OAuth login failures**: Check redirect URIs match exactly
4. **Build failures**: Ensure all required environment variables are set

### Testing Configuration

Run the configuration validator:
```bash
bun run build
```

This will validate all required environment variables and show helpful error messages.

### Feature Flags

The application automatically detects which features are available based on configured environment variables:

- **Google Auth**: Available if `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- **GitHub Auth**: Available if `GITHUB_ID` and `GITHUB_SECRET` are set
- **AI Recommendations**: Available if `OPENAI_API_KEY` is set
- **Email Notifications**: Available if SMTP variables are configured
- **File Upload**: Available if Cloudinary or AWS variables are set

## Security Notes

- Never commit `.env` files to version control
- Use different keys for development and production
- Regularly rotate API keys and secrets
- Use environment-specific configurations
- Enable 2FA on all service accounts

## Support

For additional help:
1. Check the configuration validator output
2. Review the application logs
3. Ensure all services are properly configured
4. Contact support if issues persist
