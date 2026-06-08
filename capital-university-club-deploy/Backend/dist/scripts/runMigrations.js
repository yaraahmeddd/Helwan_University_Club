"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Migration runner script
const pg_1 = require("pg");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:wxgdY75MzZVWcDSc@db.mnpdqpguszjgnpzvhotr.supabase.co:5432/postgres';
async function runMigrations() {
    const client = new pg_1.Client({
        connectionString: DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
    try {
        console.log('🔄 Connecting to database...');
        await client.connect();
        console.log('✅ Connected to database');
        // Migration 1: Create payments table
        console.log('\n📝 Running migration 1: create_payments_table.sql');
        const migration1Path = path.join(__dirname, '../../migrations/create_payments_table.sql');
        const migration1SQL = fs.readFileSync(migration1Path, 'utf-8');
        await client.query(migration1SQL);
        console.log('✅ Migration 1 completed: Payments table created');
        // Migration 2: Update team subscription payment flow
        console.log('\n📝 Running migration 2: add_team_subscription_payment_flow_v2.sql');
        const migration2Path = path.join(__dirname, '../../migrations/add_team_subscription_payment_flow_v2.sql');
        const migration2SQL = fs.readFileSync(migration2Path, 'utf-8');
        await client.query(migration2SQL);
        console.log('✅ Migration 2 completed: Team subscription payment flow updated');
        console.log('\n🎉 All migrations completed successfully!');
        console.log('\n📊 Summary:');
        console.log('  ✅ payments table created');
        console.log('  ✅ teams.approval_required added');
        console.log('  ✅ teams.subscription_price added');
        console.log('  ✅ member_teams.payment_id added');
        console.log('  ✅ team_member_teams.payment_id added');
        console.log('  ✅ Foreign key constraints added');
        console.log('  ✅ Indexes created for performance');
    }
    catch (error) {
        console.error('\n❌ Migration failed:', error);
        throw error;
    }
    finally {
        await client.end();
        console.log('\n🔌 Database connection closed');
    }
}
// Run migrations
runMigrations()
    .then(() => {
    console.log('\n✨ Migration script completed successfully');
    process.exit(0);
})
    .catch((error) => {
    console.error('\n💥 Migration script failed:', error);
    process.exit(1);
});
//# sourceMappingURL=runMigrations.js.map