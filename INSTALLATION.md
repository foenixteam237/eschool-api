# 🚀 Installation & Setup Guide

## Prerequisites

- Node.js 18+ 
- PostgreSQL (or Supabase account)
- Git
- npm or yarn

## Step 1: Clone & Install

```bash
# Navigate to backend directory
cd eschool-api

# Install dependencies
npm install
```

## Step 2: Database Configuration

### Option A: Supabase (Recommended)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy the PostgreSQL connection string
4. Create `.env` file from template:

```bash
cp .env.example .env
```

5. Update `.env` with your Supabase credentials:

```env
DATABASE_URL=postgresql://user:password@db.xxxxxxxxxxxx.supabase.co:5432/postgres?schema=public

NODE_ENV=development
PORT=3001
JWT_SECRET=your-super-secret-key-change-in-production
CORS_ORIGIN=http://localhost:3000
```

### Option B: Local PostgreSQL

```bash
# Create local database
createdb eschool

# Update .env
DATABASE_URL=postgresql://postgres:password@localhost:5432/eschool
```

## Step 3: Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate:dev

# Seed database with demo data
npm run prisma:seed
```

## Step 4: Start Development Server

```bash
npm run start:dev
```

Expected output:
```
🚀 eSchool API Server Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Server URL: http://localhost:3001
📚 Swagger Docs: http://localhost:3001/api/docs
🔒 CORS Origin: http://localhost:3000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Step 5: Test the API

Visit: **http://localhost:3001/api/docs**

### Test Login

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@eschool.com",
    "password": "admin123"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "admin@eschool.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "ADMIN"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2026-01-31T10:30:00Z"
}
```

## 🛠️ Common Commands

```bash
# Development
npm run start:dev       # Start with hot reload

# Production
npm run build          # Build for production
npm run start:prod     # Run production build

# Database
npm run prisma:migrate:dev   # Create new migration
npm run prisma:seed         # Run seed script
npm run prisma:studio       # Open Prisma Studio (GUI)

# Code Quality
npm run lint           # Run ESLint
npm run format         # Format code with Prettier

# Testing
npm run test           # Run tests
npm run test:cov       # Run with coverage
npm run test:e2e       # Run e2e tests
```

## 🔄 Connecting Frontend to Backend

In your Next.js frontend (`eschool/`), update the API client:

```typescript
// src/lib/constants.ts
const API_CONFIG = {
  baseURL: 'http://localhost:3001/api/v1',
  // ...
};
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change PORT in .env
PORT=3002
```

### Database Connection Error
```bash
# Verify DATABASE_URL in .env
# Test connection:
npm run prisma:migrate:dev
```

### Prisma Issues
```bash
# Regenerate Prisma Client
npm run prisma:generate

# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Module Not Found
```bash
# Clear dist and rebuild
npm run build
```

## 📚 Next Steps

1. ✅ Backend API running
2. Next: Integrate with Next.js frontend
3. Then: Add authentication flow
4. Finally: Deploy to production

## 📞 Support

For issues:
1. Check `.env` configuration
2. Verify database connection
3. Check console logs for errors
4. Review Swagger documentation at `/api/docs`
