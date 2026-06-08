"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
// Backend Server 
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const http_1 = require("http");
const data_source_1 = require("./database/data-source");
const SocketManager_1 = require("./websocket/SocketManager");
const RegistrationRoutes_1 = __importDefault(require("./routes/RegistrationRoutes"));
const MembershipRoutes_1 = __importDefault(require("./routes/MembershipRoutes"));
const StaffRoutes_1 = __importDefault(require("./routes/StaffRoutes"));
const AuthRoutes_1 = __importDefault(require("./routes/AuthRoutes"));
const SportRoutes_1 = __importDefault(require("./routes/SportRoutes"));
const SportSubscriptionRoutes_1 = __importDefault(require("./routes/SportSubscriptionRoutes"));
const MemberSubscriptionRoutes_1 = __importDefault(require("./routes/MemberSubscriptionRoutes"));
const TeamMemberRoutes_1 = __importDefault(require("./routes/TeamMemberRoutes"));
const TeamMemberCRUDRoutes_1 = __importDefault(require("./routes/TeamMemberCRUDRoutes"));
const TeamMemberSubscriptionRoutes_1 = __importDefault(require("./routes/TeamMemberSubscriptionRoutes"));
const TeamRoutes_1 = __importDefault(require("./routes/TeamRoutes"));
const FieldRoutes_1 = __importDefault(require("./routes/FieldRoutes"));
const BookingRoutes_1 = __importDefault(require("./routes/BookingRoutes"));
const MemberBookingRoutes_1 = __importDefault(require("./routes/MemberBookingRoutes"));
const TeamMemberBookingRoutes_1 = __importDefault(require("./routes/TeamMemberBookingRoutes"));
const MemberAdminRoutes_1 = __importDefault(require("./routes/MemberAdminRoutes"));
const TeamSubscriptionRoutes_1 = __importDefault(require("./routes/TeamSubscriptionRoutes"));
const TaskRoutes_1 = __importDefault(require("./routes/TaskRoutes"));
const SeedRoutes_1 = __importDefault(require("./routes/SeedRoutes"));
const AuditLogRoutes_1 = __importDefault(require("./routes/AuditLogRoutes"));
const MediaPostRoutes_1 = __importDefault(require("./routes/MediaPostRoutes"));
const FacultyRoutes_1 = __importDefault(require("./routes/FacultyRoutes"));
const BranchRoutes_1 = __importDefault(require("./routes/BranchRoutes"));
const BranchSportRoutes_1 = __importDefault(require("./routes/BranchSportRoutes"));
const ProfessionRoutes_1 = __importDefault(require("./routes/ProfessionRoutes"));
const publicRoutes_1 = __importDefault(require("./routes/publicRoutes"));
const MemberTeamRoutes_1 = require("./routes/MemberTeamRoutes");
const participantRegistration_1 = __importDefault(require("./routes/participantRegistration"));
const AttendanceRoutes_1 = __importDefault(require("./routes/AttendanceRoutes"));
const PaymobRoutes_1 = __importDefault(require("./routes/PaymobRoutes"));
const localFileStorage_1 = require("./utils/localFileStorage");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '3000', 10);
const ensureMediaPostsTable = async () => {
    await data_source_1.AppDataSource.query(`
    CREATE TABLE IF NOT EXISTS media_posts (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NULL,
      category VARCHAR(50) NOT NULL,
      images TEXT NULL,
      "videoUrl" VARCHAR(500) NULL,
      "videoDuration" VARCHAR(20) NULL,
      "date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};
const ensureAuditLogsTable = async () => {
    await data_source_1.AppDataSource.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await data_source_1.AppDataSource.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      "userName" VARCHAR(100) NOT NULL,
      role VARCHAR(50) NOT NULL,
      action VARCHAR(50) NOT NULL,
      module VARCHAR(50) NOT NULL,
      description TEXT NULL,
      status VARCHAR(20) NOT NULL,
      "ipAddress" VARCHAR(45) NULL,
      "oldValue" JSONB NULL,
      "newValue" JSONB NULL,
      "dateTime" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};
// ==================== CORS CONFIGURATION ====================
/**
 * Configure allowed origins based on environment:
 * - Environment variable: ALLOWED_ORIGINS (comma-separated)
 * - Default (development): localhost and LAN IP
 * - Production: should be explicitly set via environment
 */
const getDefaultOrigins = () => {
    const env = process.env.NODE_ENV || 'development';
    if (env === 'production') {
        // Production: only allow explicitly configured origins
        return [];
    }
    // Development: allow localhost and LAN access
    return [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
        'http://localhost',
        'http://10.100.104.157:8080',
        'http://10.100.104.157',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        'http://127.0.0.1:5175',
        'http://127.0.0.1:5176',
    ];
};
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : getDefaultOrigins();
console.log('✅ CORS Allowed Origins:', allowedOrigins);
// CORS middleware configuration
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman Desktop, curl, etc.)
        if (!origin) {
            callback(null, true);
            return;
        }
        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            console.warn(`⚠️  CORS blocked request from: ${origin}`);
            callback(new Error(`CORS Error: Origin ${origin} not allowed`));
        }
    },
    credentials: true, // Allow cookies and Authorization headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // Cache preflight for 24 hours
};
app.use((0, cors_1.default)(corsOptions));
// ==================== END CORS CONFIGURATION ====================
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Avoid noisy favicon 404s from browsers hitting the backend directly
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});
// Serve static files from uploads folder
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
console.log('📁 Static files served from: /uploads');
// Logging middleware to debug 404s
app.use((req, res, next) => {
    console.log(`[DEBUG] ${req.method} ${req.url}`);
    next();
});
// Routes
app.use('/api/public', publicRoutes_1.default);
app.use('/api/member-subscriptions', MemberSubscriptionRoutes_1.default);
app.use('/api/bookings', BookingRoutes_1.default); // NEW: Unified booking system (must be before participantRegistrationRoutes)
app.use('/api/bookings', participantRegistration_1.default); // Participant registration via invitation links
app.use('/api/register', TeamMemberRoutes_1.default);
app.use('/api/register', RegistrationRoutes_1.default);
app.use('/api/teams', TeamRoutes_1.default);
app.use('/api/fields', FieldRoutes_1.default);
app.use('/api/members', MemberBookingRoutes_1.default);
app.use('/api/team-members-booking', TeamMemberBookingRoutes_1.default);
app.use('/api/team-members', TeamMemberCRUDRoutes_1.default);
app.use('/api/team-members', TeamMemberSubscriptionRoutes_1.default);
app.use('/api/team-member-subscriptions', TeamMemberSubscriptionRoutes_1.default);
app.use('/api/team-subscriptions', TeamSubscriptionRoutes_1.default);
app.use('/api/member-teams', MemberTeamRoutes_1.memberTeamRouter);
app.use('/api/memberships', MembershipRoutes_1.default);
app.use('/api/attendance', AttendanceRoutes_1.default);
app.use('/api', MemberAdminRoutes_1.default);
app.use('/api/auth', AuthRoutes_1.default);
app.use('/api/staff', StaffRoutes_1.default);
app.use('/api/sports', SportRoutes_1.default);
app.use('/api/sports', SportSubscriptionRoutes_1.default);
// Test route
app.get('/api/test-route', (req, res) => {
    res.json({ message: 'Backend is reachable and updating' });
});
app.use('/api/tasks', TaskRoutes_1.default);
app.use('/api/audit-logs', AuditLogRoutes_1.default);
app.use('/api/media-posts', MediaPostRoutes_1.default);
app.use('/api/faculties', FacultyRoutes_1.default);
app.use('/api/branches', BranchRoutes_1.default);
app.use('/api', BranchSportRoutes_1.default);
app.use('/api/professions', ProfessionRoutes_1.default);
app.use('/api/seed', SeedRoutes_1.default);
app.use('/api/paymob', PaymobRoutes_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Club System Backend is running' });
});
// Initialize database and start server
data_source_1.AppDataSource.initialize()
    .then(async () => {
    console.log('✅ Database connected successfully');
    await ensureMediaPostsTable();
    await ensureAuditLogsTable();
    console.log('✅ media_posts table is ready');
    // Initialize upload folder structure
    await (0, localFileStorage_1.initializeFolderStructure)();
    console.log('✅ Upload folder structure initialized');
    // NOTE: legacy default plans disabled — official plans now come from the seed
    // (see Backend/src/scripts/full-reseed.ts and the SQL in scripts/update-membership-plans.sql).
    // const { initializeDefaultPlans } = await import('./utils/initializePlans');
    // await initializeDefaultPlans();
    // Create HTTP server with Express app
    const httpServer = (0, http_1.createServer)(app);
    // Initialize WebSocket server
    SocketManager_1.socketManager.initialize(httpServer, allowedOrigins);
    // Start server
    httpServer.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
        console.log(`🔌 WebSocket ready at ws://0.0.0.0:${PORT}`);
    });
})
    .catch((error) => {
    console.error('❌ Error during Data Source initialization:', error);
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=index.js.map