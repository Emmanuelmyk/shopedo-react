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
  supabase = createClient(supabaseUrl, supabaseKey);
}

export { supabase };
