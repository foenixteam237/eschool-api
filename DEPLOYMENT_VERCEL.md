# Guide de Déploiement Vercel via GitHub — eSchool API

Ce guide détaille pas à pas la méthode pour héberger l'API **eSchool** (NestJS + Prisma + PostgreSQL) sur **Vercel** en passant par **GitHub**.

---

## 📋 Architecture de Déploiement

- **Code source** : GitHub (`main` branch)
- **Hébergement API** : Vercel Serverless Functions (configuré via `vercel.json` et `api/index.ts`)
- **Base de données** : PostgreSQL hébergé dans le Cloud (ex: Supabase ou Neon)

---

## Étape 1 : Préparer la base de données PostgreSQL Cloud

Vercel fonctionnant en mode *serverless* sans disque persistant, l'API nécessite une base PostgreSQL accessible en ligne.

### Option recommandée : Supabase (Gratuit)
1. Rendez-vous sur [supabase.com](https://supabase.com) et créez un compte ou connectez-vous.
2. Cliquez sur **New Project** :
   - **Name** : `eschool-db`
   - **Database Password** : Définissez un mot de passe fort (conservez-le !).
   - **Region** : Choisissez la plus proche (ex: *Frankfurt* ou *London*).
3. Une fois le projet prêt, allez dans **Project Settings** > **Database** > **Connection string** :
   - Sélectionnez l'onglet **URI** et le mode **Transaction Pooler** (port `6543`), recommandé pour le serverless Vercel :
     ```text
     postgresql://postgres.[PROJECT_REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
     ```
4. **Appliquer les tables dans Supabase** depuis votre machine locale :
   ```bash
   DATABASE_URL="votre_chaine_supabase" npx prisma db push
   ```
   *(Optionnel)* Insérer les données de démonstration initiales (administrateurs, écoles, élèves) :
   ```bash
   DATABASE_URL="votre_chaine_supabase" npm run prisma:seed
   ```

---

## Étape 2 : Initialiser le dépôt Git et pousser sur GitHub

1. Créez un nouveau dépôt sur [GitHub](https://github.com/new) :
   - Nom du dépôt : `eschool-api` (ou le nom de votre choix).
   - Laissez-le en **Public** ou **Private**.
   - Ne cochez **pas** "Initialize with README", car le projet existe déjà.

2. Sur votre terminal, dans le dossier du projet :
   ```bash
   # 1. Initialiser git si ce n'est pas déjà fait
   git init

   # 2. Vérifier les fichiers suivis
   git status

   # 3. Ajouter tous les fichiers
   git add .

   # 4. Enregistrer le commit initial
   git commit -m "feat: complete eSchool API with Vercel serverless adapter"

   # 5. Définir la branche principale
   git branch -M main

   # 6. Associer votre dépôt GitHub (remplacez USERNAME et REPO)
   git remote add origin https://github.com/<VOTRE_NOM_UTILISATEUR>/<VOTRE_DEPOT>.git

   # 7. Pousser le code vers GitHub
   git push -u origin main
   ```

---

## Étape 3 : Importer et Déployer sur Vercel

1. Connectez-vous sur [vercel.com](https://vercel.com).
2. Cliquez sur le bouton **Add New...** en haut à droite > **Project**.
3. Dans la liste **Import Git Repository**, trouvez votre dépôt `eschool-api` et cliquez sur **Import**.
4. Dans l'écran de configuration du projet :
   - **Framework Preset** : `Other` (la détection automatique utilisera le fichier `vercel.json` présent à la racine).
   - **Root Directory** : `./` (laissez vide / par défaut).
   - **Build and Output Settings** :
     - *Build Command* : `npm run build` (génère le client Prisma et compile l'app NestJS).
     - *Output Directory* : laissez vide.
     - *Install Command* : laissez par défaut (`npm install`).

5. **Variables d'Environnement (Environment Variables)** :
   Dépliez la section **Environment Variables** et ajoutez les clés suivantes :

   | Clé | Valeur exemple | Description |
   |---|---|---|
   | `DATABASE_URL` | `postgresql://postgres.[REF]:[PASS]@aws-0-[REG].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1` | URL PostgreSQL Cloud |
   | `JWT_SECRET` | `eschool_super_secret_jwt_key_2026_prod` | Clé secrète pour signer les JWT |
   | `JWT_EXPIRATION` | `7d` | Durée de validité des tokens |
   | `NODE_ENV` | `production` | Environnement d'exécution |
   | `CORS_ORIGIN` | `*` | Origines autorisées pour le frontend |

6. Cliquez sur **Deploy**.

---

## Étape 4 : Vérification du Déploiement

Une fois le déploiement terminé (environ 1 minute) :
1. Vercel vous fournit une URL de production (ex: `https://eschool-api-xxx.vercel.app`).
2. Testez les endpoints principaux :
   - **Documentation Swagger interactive** : `https://<votre-app>.vercel.app/api/v1/docs`
   - **Racine (Redirection automatique vers Swagger)** : `https://<votre-app>.vercel.app/`
   - **Liste des établissements** : `https://<votre-app>.vercel.app/api/v1/schools`
   - **Connexion Auth** : `POST https://<votre-app>.vercel.app/api/v1/auth/login`

---

## 🛠️ Points clés résolus dans ce projet

1. **Page blanche Swagger sur Vercel résolue** :
   - En environnement serverless Vercel, les fichiers statiques de `swagger-ui-dist` (`.css`, `.js`) ne sont pas inclus dans le bundle de la fonction.
   - Nous avons configuré Swagger (`src/swagger.config.ts`) pour charger automatiquement les scripts et feuilles de style depuis le CDN Cloudflare cdnjs (`customCssUrl` et `customJs`).
   - Un intercepteur de secours dans `api/index.ts` redirige automatiquement toute requête statique locale résiduelle vers le CDN.
2. **Conflit de dépendances Vercel résolu (`ERESOLVE`)** :
   - `@nestjs/swagger` est verrouillé en version `^7.4.2` pour s'aligner parfaitement avec `@nestjs/common` v10.
3. **Entrée Serverless (`api/index.ts`)** :
   - Un adaptateur Express optimise les démarrages à froid (cold starts) en réutilisant l'instance NestJS entre les requêtes.
4. **Règles de réécriture (`vercel.json`)** :
   - Toutes les requêtes HTTP sont redirigées sans perte vers le gestionnaire serverless.

