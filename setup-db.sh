#!/bin/bash

# Script de configuration de la base de données Supabase
# Ce script crée les tables et configure la base de données

echo "🔧 Configuration de la base de données Supabase..."

# Charger les variables d'environnement
export $(cat .env | grep DATABASE_URL)

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL non configurée dans .env"
    exit 1
fi

echo "📊 Déploiement du schéma Prisma..."
npx prisma db push

if [ $? -eq 0 ]; then
    echo "✅ Schéma Prisma déployé avec succès"
else
    echo "❌ Erreur lors du déploiement du schéma"
    exit 1
fi

echo "🔄 Génération du client Prisma..."
npx prisma generate

if [ $? -eq 0 ]; then
    echo "✅ Client Prisma généré"
else
    echo "❌ Erreur lors de la génération du client"
    exit 1
fi

echo ""
echo "✨ Configuration complète!"
echo "Les tables suivantes ont été créées:"
echo "  - users"
echo "  - admins"
echo "  - school_years"
echo "  - classes"
echo "  - teachers"
echo "  - students"
echo "  - parents"
echo "  - attendance_records"
echo "  - grades"
echo "  - payments"
