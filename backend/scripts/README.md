# Database Setup and Migration Scripts

This directory contains scripts for managing database setup, migrations, and seeding across different environments.

## Overview

The database management system uses a unified approach with a single `DATABASE_URL` environment variable for all environments. The system automatically detects the environment and handles database creation and migrations appropriately.

## Environment Variables

### Required
- `DATABASE_URL`: Database connection string for the current environment
  - **Development**: `postgresql://postgres:password@localhost:5432/tilanet_dev`
  - **Test**: `postgresql://postgres:password@localhost:5432/tilanet_test`
  - **Production**: `postgresql://user:password@host:5432/tilanet_prod`

### Optional
- `NODE_ENV`: Environment name (`development`, `test`, `production`)
- `GITHUB_ACTIONS`: Set to `true` when running in GitHub Actions (automatically detected)

## Scripts

### `setup-db.ts` - Unified Database Setup

This is the main script that handles database setup for all environments.

**Features:**
- ✅ Automatic environment detection
- ✅ Database creation (if needed)
- ✅ Schema migration using Drizzle Kit
- ✅ GitHub Actions compatibility
- ✅ Error handling and logging

**Usage:**
```bash
# For development/production
npm run db:migrate

# For test environment
npm run db:setup-test
```

**How it works:**
1. **Environment Detection**: Determines if running in GitHub Actions, test, or production
2. **Database Creation**: Creates database if it doesn't exist (skipped in GitHub Actions)
3. **Schema Migration**: Runs Drizzle Kit push to update schema
4. **Error Handling**: Provides clear error messages and troubleshooting tips

### `seed-test-data.ts` - Test Data Seeding

Populates the test database with sample data for testing.

**Usage:**
```bash
npm run db:seed-test
```

## GitHub Actions Integration

The scripts are designed to work seamlessly with GitHub Actions:

1. **Service Container**: PostgreSQL service container provides the database
2. **Automatic Detection**: Script detects GitHub Actions environment
3. **Skip Database Creation**: Database already exists in service container
4. **Schema Updates Only**: Runs only schema migrations

## Best Practices

### 1. Environment Configuration
- Use a single `DATABASE_URL` for all environments
- Set environment-specific URLs in your CI/CD pipeline
- Never commit sensitive credentials to version control

### 2. Migration Strategy
- Use `drizzle-kit push` for development and testing
- Use `drizzle-kit migrate` for production (if needed)
- Always test migrations in staging first

### 3. Error Handling
- Scripts provide clear error messages
- Include troubleshooting tips for common issues
- Log important operations for debugging

### 4. Security
- Use environment variables for all credentials
- Rotate database passwords regularly
- Use connection pooling in production

## Troubleshooting

### Common Issues

**1. Authentication Failed**
```
error: password authentication failed for user "postgres"
```
**Solution**: Check your `DATABASE_URL` and ensure PostgreSQL is running with correct credentials.

**2. Database Does Not Exist**
```
error: database "tilanet_test" does not exist
```
**Solution**: The script should create the database automatically. Check if you have admin privileges.

**3. Connection Refused**
```
error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Ensure PostgreSQL is running and accessible on the specified port.

### Debug Mode

To enable verbose logging, set the `DEBUG` environment variable:
```bash
DEBUG=true npm run db:setup-test
```

## File Structure

```
scripts/
├── setup-db.ts          # Main database setup script
├── seed-test-data.ts    # Test data seeding
└── README.md           # This documentation
```

## Migration History

The system uses Drizzle Kit for schema management:
- Schema definition: `src/db/schema.ts`
- Migration files: `drizzle/`
- Configuration: `drizzle.config.ts`

For more information about Drizzle Kit, see the [official documentation](https://orm.drizzle.team/). 