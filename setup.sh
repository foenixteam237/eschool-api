#!/bin/bash

# eSchool Backend Setup Script

echo "╔════════════════════════════════════════════════════╗"
echo "║    eSchool API Backend Setup                       ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo ""

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ npm: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your database credentials"
    echo ""
fi

# Generate Prisma Client
echo "🔄 Generating Prisma Client..."
npm run prisma:generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi

echo "✅ Prisma Client generated"
echo ""

# Run migrations
echo "🗄️  Running database migrations..."
npm run prisma:migrate:dev

if [ $? -ne 0 ]; then
    echo "⚠️  Migration may have failed. Check your database connection."
fi

echo ""
echo "✅ Seed data created (if available)"
echo ""

echo "╔════════════════════════════════════════════════════╗"
echo "║    ✅ Setup Complete!                              ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "1. Update .env with your database credentials"
echo "2. Run: npm run start:dev"
echo "3. Visit: http://localhost:3001/api/docs"
echo ""
