# AI Agents Store - Project Overview

## 🚀 Project Status
✅ **Successfully cloned and running!**
- Repository: `https://github.com/ibrahimsohofi/agentsStore.git`
- Server running on: `http://localhost:3000`
- Database: SQLite (seeded with sample data)

## 🏗️ Architecture & Tech Stack

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** components with Radix UI primitives
- **Framer Motion** for animations
- **Zustand** for state management

### Backend & Database
- **Prisma ORM** with SQLite (development)
- **NextAuth.js** for authentication
- **Socket.io** for real-time features
- **Stripe** integration for payments

### AI & ML Features
- **OpenAI API** integration for recommendations
- **Natural language processing** for search
- **ML Matrix** for recommendation algorithms
- **Tiktoken** for AI token management

### Testing & Quality
- **Jest** for unit testing
- **Playwright** for E2E testing
- **Biome** for linting and formatting
- **TypeScript** for type checking

## 🎯 Key Features

### 🛒 Marketplace
- Browse and search AI agents
- Advanced filtering and categorization
- Featured and recommended agents
- Agent preview and documentation

### 👥 User Management
- Multi-role system (Buyer, Seller, Admin)
- User profiles and preferences
- Seller onboarding and verification
- User reviews and ratings

### 💰 Commerce
- Stripe payment integration
- Order management and tracking
- Download tracking and limits
- Revenue analytics for sellers

### 🤖 AI-Powered Features
- Intelligent recommendations
- Smart search with ML
- Agent quality scoring
- Automated testing framework

### 📊 Analytics & Insights
- Seller dashboard with analytics
- Agent performance metrics
- Revenue tracking
- User behavior insights

### 🔧 Admin Features
- Agent approval workflow
- User management
- Content moderation
- System analytics

### 🔄 Real-time Features
- Live chat support
- Real-time notifications
- Socket-based updates
- Activity feeds

## 📂 Project Structure

```
agentsStore/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # User dashboard
│   │   ├── marketplace/       # Main marketplace
│   │   ├── admin/             # Admin panel
│   │   └── ...
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   └── ...               # Feature components
│   ├── lib/                   # Utility libraries
│   ├── hooks/                 # Custom React hooks
│   └── types/                 # TypeScript definitions
├── prisma/                    # Database schema & migrations
├── tests/                     # E2E tests
└── ...
```

## 🗄️ Database Schema

The application uses a comprehensive database schema with:

### Core Entities
- **Users** - Multi-role with seller profiles
- **Agents** - AI agent listings with metadata
- **Orders** - Purchase and download tracking
- **Reviews** - Rating and feedback system

### Analytics & Insights
- **Analytics** - Platform-wide metrics
- **AgentInsight** - Per-agent performance data
- **AgentTest** - Quality assurance tracking

### System Features
- **Notifications** - User messaging system
- **AdminActions** - Audit trail for admin activities
- **UserPreferences** - Personalization settings

## 🔧 Environment Configuration

### Required Variables
- `DATABASE_URL` - Database connection
- `NEXTAUTH_SECRET` - JWT encryption key
- `NEXTAUTH_URL` - Application base URL
- `STRIPE_*` - Payment processing keys

### Optional Integrations
- `OPENAI_API_KEY` - AI recommendations
- `GOOGLE_CLIENT_*` / `GITHUB_*` - OAuth login
- `SMTP_*` - Email notifications
- Cloud storage (Cloudinary/AWS S3)

## 🚦 Current Setup Status

### ✅ Completed
- [x] Repository cloned
- [x] Dependencies installed
- [x] Environment configured for development
- [x] Database schema migrated
- [x] Sample data seeded
- [x] Development server running

### 🔄 Available for Development
- [ ] Custom Stripe integration setup
- [ ] OpenAI API configuration
- [ ] OAuth providers setup
- [ ] Email service configuration
- [ ] Production deployment setup

## 🛠️ Development Commands

```bash
# Development
bun run dev              # Start development server
bun run build           # Build for production
bun run start           # Start production server

# Database
bun run seed            # Seed database with sample data
bunx prisma studio      # Open database GUI
bunx prisma migrate dev # Create new migration

# Testing
bun run test            # Run unit tests
bun run test:e2e        # Run E2E tests
bun run lint            # Lint and format code
```

## 📈 Next Steps

The marketplace is fully functional and ready for:
1. **Custom branding and styling**
2. **Payment system integration**
3. **AI service configuration**
4. **Content management**
5. **Production deployment**

## 🎉 Success!

The AI Agents Store has been successfully cloned and is running with:
- Full marketplace functionality
- User authentication system
- Database with sample data
- Modern development setup
- Comprehensive testing framework
