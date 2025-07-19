# Database Scripts

This directory contains database-related scripts that follow modern best practices using Drizzle ORM.

## 🎯 **Best Practices We Follow**

✅ **Single Source of Truth**: All schema definitions are in `src/db/schema.ts`  
✅ **Type-Safe Migrations**: Drizzle generates migrations from TypeScript schema  
✅ **Version Control**: Automatic migration tracking and history  
✅ **Consistency**: All schema changes go through the same workflow  
✅ **Environment Agnostic**: Single script works for all environments  

## 📁 **Scripts**

### `setup-db.ts` (Unified Database Script)
Handles database setup and migrations for any environment.

```bash
# For test environment
npm run db:setup-test

# For any environment (development, staging, production)
npm run db:migrate
```

**What it does:**
- **Test Environment**: Creates test database + runs migrations
- **Other Environments**: Runs migrations on existing database
- Uses `DATABASE_URL` environment variable
- Handles connection errors gracefully

### `seed-test-data.ts`
Seeds the test database with sample data for testing.

```bash
npm run db:seed-test
```

## 🚀 **Database Workflow**

### **For Development:**
1. **Modify Schema**: Edit `src/db/schema.ts`
2. **Generate Migration**: `npm run db:generate`
3. **Apply Migration**: `npm run db:migrate`

### **For Testing:**
1. **Setup Test DB**: `npm run db:setup-test`
2. **Seed Test Data**: `npm run db:seed-test` (optional)
3. **Run Tests**: `npm test`

### **For Production:**
1. **Generate Migration**: `npm run db:generate`
2. **Review Migration**: Check generated SQL in `drizzle/` folder
3. **Apply Migration**: `npm run db:migrate` (uses production DATABASE_URL)

## 🔧 **Available Commands**

```bash
# Generate new migration from schema changes
npm run db:generate

# Apply migrations to current environment database
npm run db:migrate

# Setup test database (create + migrate)
npm run db:setup-test

# Seed test database with sample data
npm run db:seed-test

# Open Drizzle Studio for database inspection
npm run db:studio
```

## 🌍 **Environment Configuration**

The scripts automatically detect the environment from `NODE_ENV`:

- **`NODE_ENV=test`**: Creates test database + runs migrations
- **`NODE_ENV=development`**: Runs migrations on development database
- **`NODE_ENV=production`**: Runs migrations on production database
- **No NODE_ENV**: Defaults to development

**Environment Variables:**
- `DATABASE_URL`: Primary database connection string
- `TEST_DATABASE_URL`: Test database connection string (optional)
- `NODE_ENV`: Environment identifier

## 📝 **Migration Best Practices**

1. **Always generate migrations** when changing schema
2. **Review generated SQL** before applying
3. **Test migrations** on test database first
4. **Commit migration files** to version control
5. **Never edit migration files** manually

## 🗂️ **File Structure**

```
backend/
├── src/db/
│   └── schema.ts          # Single source of truth for schema
├── drizzle/
│   ├── 0000_*.sql        # Generated migrations
│   ├── 0001_*.sql        # Generated migrations
│   └── meta/             # Migration metadata
├── scripts/
│   ├── setup-db.ts  # Unified database setup/migration
│   ├── seed-test-data.ts # Test data seeding
│   └── README.md         # This file
└── drizzle.config.ts     # Drizzle configuration
```

## ❌ **What We Don't Do**

- ❌ Create manual SQL files
- ❌ Track migrations manually
- ❌ Mix TypeScript and raw SQL
- ❌ Duplicate schema definitions
- ❌ Create environment-specific scripts

## 🎉 **Benefits**

- **Type Safety**: Full TypeScript support
- **Consistency**: Single workflow for all environments
- **Maintainability**: Less code to maintain
- **Reliability**: Automated migration tracking
- **Developer Experience**: Better tooling and IDE support
- **Simplicity**: One script for all environments 