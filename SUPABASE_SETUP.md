# 🚀 Supabase PostgreSQL Setup Guide

## What is Supabase?

Supabase is an open-source Firebase alternative that provides:
- PostgreSQL database (managed)
- Real-time subscriptions
- Authentication
- File storage
- Vector/Embeddings support

## ✅ Quick Start with Supabase

### Step 1: Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub or Email
4. Create a new organization

### Step 2: Create New Project

1. Click "New project"
2. Fill in project details:
   - **Name**: `eschool` or similar
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to you (e.g., `us-east-1` or `eu-west-1`)
3. Click "Create new project"

⏳ Wait 2-5 minutes for project initialization

### Step 3: Get Connection String

1. In Supabase Dashboard, go to **Settings > Database**
2. Find "Connection strings"
3. Select **URI** (not Psql)
4. Copy the connection string

Example format:
```
postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?schema=public
```

### Step 4: Update Backend .env

**File: `eschool-api/.env`**

```env
# Replace the DATABASE_URL with your Supabase connection string
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@[YOUR_HOST]:5432/postgres?schema=public

# Keep other settings
NODE_ENV=development
PORT=3001
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
```

Replace:
- `[YOUR_PASSWORD]` - The password you created
- `[YOUR_HOST]` - Your Supabase host (format: `xxx.supabase.co`)

### Step 5: Run Migrations

```bash
cd /home/ramseys/Documents/DEV/web/eschool-api

# Generate Prisma Client
npm run prisma:generate

# Run migrations to create all tables
npm run prisma:migrate:deploy

# Seed database with demo data
npm run prisma:seed
```

### Step 6: Verify in Supabase Dashboard

1. Go to Supabase Dashboard
2. Click **SQL Editor** (left sidebar)
3. Run a quick test:
   ```sql
   SELECT COUNT(*) FROM "users";
   ```
4. You should see tables like: `users`, `students`, `teachers`, etc.

## 📊 Database Tables in Supabase

After running migrations, you'll have:

```
✓ users                    - All user accounts
✓ admins                   - Admin profiles
✓ teachers                 - Teacher information
✓ students                 - Student information
✓ parents                  - Parent information
✓ schoolYears             - Academic years
✓ classes                 - Classes/courses
✓ subjects                - Subjects
✓ lessons                 - Lesson records
✓ grades                  - Grade records
✓ gradeReports           - Grade reports
✓ attendance             - Attendance records
✓ payments               - Payment records
✓ transactions           - Transaction details
✓ assignments            - Assignment records
✓ submissions            - Assignment submissions
✓ messages               - Message records
✓ timetable              - Class timetables
```

## 🔑 Security Best Practices

### 1. Database Password

✅ Do:
- Use strong passwords (12+ characters)
- Mix uppercase, lowercase, numbers, special chars
- Change periodically in production

❌ Don't:
- Commit passwords to Git
- Use simple passwords
- Share passwords

### 2. Connection String

✅ Do:
- Store in `.env` (not in git)
- Use `.env.example` for template
- Rotate in production

❌ Don't:
- Commit to Git
- Share on Slack/Email
- Use in frontend code

### 3. API Keys

For future auth setup:
1. Go to **Authentication > Providers** in Supabase
2. Generate API keys
3. Store them securely in `.env`

## 🚀 Accessing Supabase Dashboard Features

### SQL Editor
- Write custom SQL queries
- Test database structure
- Debug data issues

### Table Editor
- View/edit data visually
- Add new records
- Filter and search

### Logs
- Monitor database queries
- Check error logs
- Performance insights

### Backups
- Automatic backups every 24h
- Manual backups available
- Point-in-time recovery

## 📱 Connecting from Different Environments

### Local Development
```
postgresql://postgres:PASSWORD@HOST:5432/postgres?schema=public
```

### Production Backend (e.g., Railway, Render)
```
Same connection string (but set in production .env)
```

### Frontend Direct Access (NOT RECOMMENDED)
The frontend should NOT connect directly to database.
Always go through the backend API for security.

## ⚠️ Troubleshooting Supabase Connection

### "Connection refused"
1. Check connection string is correct
2. Verify password doesn't have special chars (if it does, URL encode it)
3. Check region matches project

### "Password authentication failed"
1. Verify password in connection string
2. Reset password in Supabase Settings > Database
3. Update .env

### "Database does not exist"
1. Ensure migrations have run: `npm run prisma:migrate:deploy`
2. Check no errors in migration output

### "Port 5432 blocked"
1. Check firewall settings
2. Supabase should allow all IPs by default
3. Contact Supabase support if issue persists

## 🔄 Migrating from Local to Supabase

### Step 1: Export Local Data (if needed)
```bash
# Dump local PostgreSQL
pg_dump -U postgres eschool > backup.sql
```

### Step 2: Run Supabase Migrations
```bash
# Point .env to Supabase
npm run prisma:migrate:deploy

# Seed with fresh data
npm run prisma:seed
```

### Step 3: Verify Data
```bash
# Query Supabase
npm run prisma:studio
# Then browse tables in the GUI
```

## 💰 Supabase Pricing

### Free Tier (Great for Development)
- Up to 500MB database
- 2GB file storage
- Authentication included
- Real-time capabilities

### Paid Tiers
- Additional storage
- Increased bandwidth
- Priority support
- Custom domains

For eSchool development, Free Tier is perfect!

## 🔗 Useful Links

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Dashboard](https://app.supabase.com)
- [Prisma + Supabase Guide](https://www.prisma.io/docs/guides/database/supabase)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

## ✅ Verification Checklist

- [ ] Supabase account created
- [ ] Project created in Supabase
- [ ] Database password saved
- [ ] Connection string copied
- [ ] .env updated with DATABASE_URL
- [ ] `npm run prisma:generate` successful
- [ ] `npm run prisma:migrate:deploy` successful
- [ ] `npm run prisma:seed` successful
- [ ] Tables visible in Supabase Dashboard
- [ ] Backend connects successfully: `npm run start:dev`

## 🎉 Next Steps

1. ✅ Supabase configured
2. 🚀 Run: `npm run start:dev`
3. 📚 Visit: `http://localhost:3001/api/docs`
4. 🔗 Connect frontend to backend
5. 🧪 Test all endpoints

You're all set! Your eSchool backend is now connected to a production-ready PostgreSQL database! 🎊
