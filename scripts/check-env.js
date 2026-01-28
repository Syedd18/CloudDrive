#!/usr/bin/env node

/**
 * Environment Variables Checker for Vercel Deployment
 * 
 * This script validates that all required environment variables are set
 * Run before deployment to catch configuration issues early
 */

console.log('\n🔍 Checking Vercel Deployment Environment Variables...\n');

// Required environment variables
const requiredVars = {
  'Database': {
    'DATABASE_URL': {
      description: 'PostgreSQL connection string (port 6543 with pgbouncer)',
      example: 'postgresql://postgres:pass@db.xxx.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1',
      validate: (val) => {
        if (!val) return 'Missing';
        if (!val.includes(':6543')) return 'Warning: Should use port 6543 for connection pooling';
        if (!val.includes('pgbouncer=true')) return 'Warning: Should include pgbouncer=true';
        return 'OK';
      }
    },
    'DIRECT_URL': {
      description: 'Direct PostgreSQL connection (port 5432)',
      example: 'postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres',
      validate: (val) => {
        if (!val) return 'Missing';
        if (!val.includes(':5432')) return 'Warning: Should use port 5432';
        return 'OK';
      }
    },
  },
  'Supabase Storage': {
    'NEXT_PUBLIC_SUPABASE_URL': {
      description: 'Supabase project URL',
      example: 'https://xxx.supabase.co',
      validate: (val) => val ? 'OK' : 'Missing'
    },
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': {
      description: 'Supabase anon/public key',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      validate: (val) => val ? 'OK' : 'Missing'
    },
    'SUPABASE_SERVICE_ROLE_KEY': {
      description: 'Supabase service role key (secret)',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      validate: (val) => val ? 'OK' : 'Missing'
    },
    'SUPABASE_STORAGE_BUCKET': {
      description: 'Storage bucket name',
      example: 'files',
      validate: (val) => val ? 'OK' : 'Missing (will default to "files")'
    },
  },
  'Authentication': {
    'NEXTAUTH_SECRET': {
      description: 'NextAuth secret for session encryption',
      example: '[run: openssl rand -base64 32]',
      validate: (val) => {
        if (!val) return 'Missing';
        if (val.length < 32) return 'Warning: Should be at least 32 characters';
        return 'OK';
      }
    },
    'JWT_SECRET': {
      description: 'JWT secret for token signing',
      example: '[run: openssl rand -base64 32]',
      validate: (val) => {
        if (!val) return 'Missing';
        if (val.length < 32) return 'Warning: Should be at least 32 characters';
        return 'OK';
      }
    },
    'NEXTAUTH_URL': {
      description: 'Production URL of your app',
      example: 'https://your-app.vercel.app',
      validate: (val) => {
        if (!val) return 'Missing';
        if (!val.startsWith('http')) return 'Warning: Should start with https://';
        return 'OK';
      }
    },
  },
};

// Check each category
let hasErrors = false;
let hasWarnings = false;

for (const [category, vars] of Object.entries(requiredVars)) {
  console.log(`\n📦 ${category}:`);
  console.log('─'.repeat(80));
  
  for (const [varName, config] of Object.entries(vars)) {
    const value = process.env[varName];
    const status = config.validate(value);
    
    let icon = '✅';
    if (status === 'Missing') {
      icon = '❌';
      hasErrors = true;
    } else if (status.startsWith('Warning')) {
      icon = '⚠️ ';
      hasWarnings = true;
    }
    
    console.log(`${icon} ${varName}`);
    console.log(`   Description: ${config.description}`);
    console.log(`   Status: ${status}`);
    
    if (status === 'Missing') {
      console.log(`   Example: ${config.example}`);
    }
    
    if (value && !status.startsWith('Warning') && status !== 'Missing') {
      // Show first/last 10 chars for security
      const display = value.length > 20 
        ? `${value.substring(0, 10)}...${value.substring(value.length - 10)}`
        : value;
      console.log(`   Value: ${display}`);
    }
    
    console.log();
  }
}

// Summary
console.log('\n' + '='.repeat(80));
console.log('📊 Summary:');
console.log('='.repeat(80));

if (hasErrors) {
  console.log('❌ FAILED - Missing required environment variables');
  console.log('   Action: Add missing variables to Vercel Dashboard → Settings → Environment Variables');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  WARNING - Some variables may need attention');
  console.log('   Review the warnings above and fix if necessary');
  console.log('   Deployment may work but could have issues');
  process.exit(0);
} else {
  console.log('✅ SUCCESS - All required environment variables are set correctly');
  console.log('   Ready for deployment!');
  process.exit(0);
}
