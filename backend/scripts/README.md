# Database Scripts

This directory contains database-related scripts that follow modern best practices using Drizzle ORM.

## 🎯 **Best Practices We Follow**

✅ **Single Source of Truth**: All schema definitions are in `src/db/schema.ts`  
✅ **Type-Safe Migrations**: Drizzle generates migrations from TypeScript schema  
✅ **Version Control**: Automatic migration tracking and history  
✅ **Consistency**: All schema changes go through the same workflow  

## 📁 **Scripts**

### `setup-test-db.ts`
Creates test database and runs migrations using Drizzle.

```bash
npm run db:setup-test
```

**What it does:**
- Creates `tilanet_test` database if it doesn't exist
- Runs all Drizzle migrations on the test database
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
3. **Apply Migration**: `npm run db:migrate`

## 🔧 **Available Commands**

```bash
# Generate new migration from schema changes
npm run db:generate

# Apply migrations to development database
npm run db:migrate

# Apply migrations to test database
npm run db:migrate:test

# Setup test database (create + migrate)
npm run db:setup-test

# Seed test database with sample data
npm run db:seed-test

# Open Drizzle Studio for database inspection
npm run db:studio
```

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
│   ├── setup-test-db.ts  # Test database setup
│   ├── seed-test-data.ts # Test data seeding
│   └── README.md         # This file
└── drizzle.config.ts     # Drizzle configuration
```

## ❌ **What We Don't Do**

- ❌ Create manual SQL files
- ❌ Track migrations manually
- ❌ Mix TypeScript and raw SQL
- ❌ Duplicate schema definitions

## 🎉 **Benefits**

- **Type Safety**: Full TypeScript support
- **Consistency**: Single workflow for all environments
- **Maintainability**: Less code to maintain
- **Reliability**: Automated migration tracking
- **Developer Experience**: Better tooling and IDE support 