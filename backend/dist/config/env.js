"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.coerce.number().default(5000),
    SUPABASE_URL: zod_1.z.string().default('https://frhqfyrrjliekxkuiuxm.supabase.co'),
    SUPABASE_ANON_KEY: zod_1.z.string().default('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.mock_key_for_development'),
    SUPABASE_SERVICE_ROLE_KEY: zod_1.z.string().optional(),
    JWT_SECRET: zod_1.z.string().default('usps-super-secure-jwt-secret-key-production-2026'),
    JWT_EXPIRES_IN: zod_1.z.string().default('15m'),
    REFRESH_TOKEN_EXPIRES_IN: zod_1.z.string().default('7d'),
    CORS_ORIGIN: zod_1.z.string().default('http://localhost:5173'),
    STORAGE_DIR: zod_1.z.string().default('./uploads'),
});
const parseEnv = () => {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
        console.error('❌ Invalid environment variables:', result.error.format());
        return envSchema.parse({});
    }
    return result.data;
};
exports.env = parseEnv();
