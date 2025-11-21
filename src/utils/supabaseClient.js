import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

let supabase;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Missing Supabase configuration. Please check your environment variables."
  );
  console.error("Required: VITE_SUPABASE_URL and VITE_SUPABASE_KEY");

  // Create a dummy client to prevent crashes
  const dummyClient = {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () =>
        Promise.resolve({
          data: null,
          error: { message: "Supabase not configured" },
        }),
      update: () =>
        Promise.resolve({
          data: null,
          error: { message: "Supabase not configured" },
        }),
      delete: () =>
        Promise.resolve({
          data: null,
          error: { message: "Supabase not configured" },
        }),
      eq: function () {
        return this;
      },
      single: function () {
        return this;
      },
      order: function () {
        return this;
      },
      range: function () {
        return this;
      },
      or: function () {
        return this;
      },
      neq: function () {
        return this;
      },
    }),
    storage: {
      from: () => ({
        getPublicUrl: () => ({ data: { publicUrl: "/assets/emptypics.png" } }),
      }),
    },
  };

  supabase = dummyClient;
} else {
  // Create Supabase client with proper auth configuration
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
      storageKey: "supabase.auth.token",
    },
  });

  console.log("✅ Supabase client initialized");
  console.log("📍 URL:", supabaseUrl);
  console.log(
    "🔑 Key type:",
    supabaseKey.includes("anon") ? "anon (correct)" : "Check key type"
  );
}

export { supabase };
