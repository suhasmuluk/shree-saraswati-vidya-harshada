import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Auth guard: require admin JWT
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing authorization header" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Verify the calling user is an admin
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Check admin role
  const { data: hasAdmin } = await userClient.rpc("has_role", {
    _user_id: user.id,
    _role: "admin",
  });
  if (!hasAdmin) {
    return new Response(JSON.stringify({ error: "Admin access required" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Parse request body for user data instead of hardcoding credentials
  let users: Array<{ email: string; password: string; role: string; name: string }>;
  try {
    const body = await req.json();
    users = body.users;
    if (!Array.isArray(users) || users.length === 0) {
      throw new Error("users array required");
    }
  } catch {
    return new Response(JSON.stringify({ error: "Request body must contain a 'users' array with email, password, role, name" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  const results = [];

  for (const u of users) {
    if (!u.email || !u.password || !u.role || !u.name) {
      results.push({ email: u.email, status: "error", error: "Missing required fields" });
      continue;
    }

    const { data: existing } = await supabaseAdmin.auth.admin.listUsers();
    const found = existing?.users?.find((eu: any) => eu.email === u.email);

    let userId: string;

    if (found) {
      userId = found.id;
      results.push({ email: u.email, status: "already exists", role: u.role });
    } else {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { full_name: u.name },
      });
      if (error) {
        results.push({ email: u.email, status: "error", error: error.message });
        continue;
      }
      userId = data.user.id;
      results.push({ email: u.email, status: "created", role: u.role });
    }

    await supabaseAdmin.from("user_roles").upsert(
      { user_id: userId, role: u.role },
      { onConflict: "user_id,role" }
    );
  }

  return new Response(JSON.stringify({ results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
