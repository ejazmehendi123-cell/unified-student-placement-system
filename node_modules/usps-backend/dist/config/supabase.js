"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSupabaseAdminClient = exports.getSupabaseClient = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("./env");
let supabaseClient = null;
let supabaseAdminClient = null;
const getSupabaseClient = () => {
    if (!supabaseClient) {
        supabaseClient = (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, env_1.env.SUPABASE_ANON_KEY, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
        });
    }
    return supabaseClient;
};
exports.getSupabaseClient = getSupabaseClient;
const getSupabaseAdminClient = () => {
    if (!env_1.env.SUPABASE_SERVICE_ROLE_KEY) {
        return null;
    }
    if (!supabaseAdminClient) {
        supabaseAdminClient = (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, env_1.env.SUPABASE_SERVICE_ROLE_KEY, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
        });
    }
    return supabaseAdminClient;
};
exports.getSupabaseAdminClient = getSupabaseAdminClient;
