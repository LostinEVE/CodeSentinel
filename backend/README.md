# CodeSentinel Enterprise API

## 🚀 Phase 1: Authentication & Billing System

This is the enterprise-grade backend API for CodeSentinel, implementing authentication, user management, and Stripe billing integration.

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 13+
- Redis 6+
- Stripe Account (for billing)

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
# Edit .env with your actual values
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run migrate

# Seed database (optional)
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/codesentinel` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | JWT signing secret | `your-super-secure-secret` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` |
| `AUTH0_DOMAIN` | Auth0 domain (optional) | `your-domain.auth0.com` |

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Token verification
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Teams
- `GET /api/teams` - Get user teams
- `POST /api/teams` - Create team
- `GET /api/teams/:id` - Get team details

### Billing
- `GET /api/billing/plans` - Get subscription plans
- `POST /api/billing/subscribe` - Create subscription
- `POST /api/billing/cancel` - Cancel subscription

### Scans
- `POST /api/scans/submit` - Submit scan request
- `GET /api/scans/:id` - Get scan results
- `GET /api/scans/history` - Get scan history

## 🛡️ Security Features

- **JWT Authentication** with refresh tokens
- **Rate limiting** (100 requests per 15 minutes)
- **Input validation** with express-validator
- **CORS protection** configured for frontend
- **Helmet.js** security headers
- **Request logging** with Winston
- **Error handling** middleware

## 🏗️ Database Schema

The API uses PostgreSQL with Prisma ORM:

- **Users** - User accounts and profiles
- **Teams** - Team management and permissions
- **TeamMembers** - Team membership relations
- **ApiKeys** - API key management
- **CustomPolicies** - Team-specific policies
- **ScanResults** - Scan history and results
- **AuditLogs** - Security and action logging

## 🔗 Integration Points

### VS Code Extension
The VS Code extension will authenticate with this API and submit scan requests.

### Stripe Billing
Subscription management and usage tracking integrated with Stripe.

### Frontend Dashboard
React dashboard consumes these APIs for team management and analytics.

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Configure production database
3. Set up Redis for session storage
4. Configure Stripe webhooks
5. Deploy to your cloud provider

### Docker Support
```bash
# Build image
docker build -t codesentinel-api .

# Run container
docker run -p 3001:3001 --env-file .env codesentinel-api
```

## 📈 Monitoring

- **Health check**: `GET /health`
- **Logs**: Winston logging to files and console
- **Metrics**: Request duration and error rates
- **Error tracking**: Structured error logging

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint
```

## 📄 License

MIT License - see LICENSE file for details.

---

**Next Steps**: After setup, integrate with the VS Code extension and implement Stripe billing workflows.
