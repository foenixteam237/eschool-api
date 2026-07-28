#!/bin/bash

# 🚀 eSchool Backend Complete Setup & Integration

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║           eSchool Backend - Complete Setup Script              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Step 1: Configuration Supabase
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 1: Configure Supabase PostgreSQL${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
fi

echo "✅ .env file exists"
echo ""
echo "📌 To use Supabase:"
echo "   1. Go to https://supabase.com"
echo "   2. Create a new project"
echo "   3. Get PostgreSQL connection string from Settings > Database"
echo "   4. Update .env DATABASE_URL with: postgresql://[user]:[password]@[host]:5432/postgres?schema=public"
echo ""
echo "For local development, we'll use SQLite (you can change later)"
echo ""

# Step 2: Install Dependencies
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 2: Install NestJS Dependencies${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm packages (this may take a few minutes)..."
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
    else
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi
echo ""

# Step 3: Setup Database
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 3: Setup Prisma Migrations${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "🔄 Generating Prisma Client..."
npm run prisma:generate

echo ""
echo "🗄️  Running database migrations..."
npm run prisma:migrate:dev -- --name init

echo ""
echo "🌱 Seeding database with demo data..."
npm run prisma:seed

echo -e "${GREEN}✅ Database setup complete${NC}"
echo ""

# Step 4: Start Development Server
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 4: Start Development Server${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "🚀 Starting NestJS development server..."
echo ""
echo -e "${GREEN}═════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}     ✅ eSchool API Backend Setup Complete!                      ${NC}"
echo -e "${GREEN}═════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📍 Server Information:${NC}"
echo "   🔗 API URL: http://localhost:3001"
echo "   📚 Swagger Docs: http://localhost:3001/api/docs"
echo "   🔐 Frontend CORS: http://localhost:3000"
echo ""
echo -e "${YELLOW}🔑 Default Admin Credentials:${NC}"
echo "   📧 Email: admin@eschool.com"
echo "   🔒 Password: admin123"
echo ""
echo -e "${YELLOW}📚 Quick Test Commands:${NC}"
echo ""
echo "   # Login and get JWT token"
echo "   curl -X POST http://localhost:3001/api/v1/auth/login \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"email\":\"admin@eschool.com\",\"password\":\"admin123\"}'"
echo ""
echo "   # Get all students (requires token)"
echo "   curl -X GET http://localhost:3001/api/v1/students \\"
echo "     -H 'Authorization: Bearer [TOKEN]'"
echo ""
echo -e "${YELLOW}📖 Documentation:${NC}"
echo "   📄 README.md - Quick start"
echo "   📋 INSTALLATION.md - Detailed setup"
echo "   🏗️  ARCHITECTURE.md - Project structure"
echo ""

npm run start:dev
