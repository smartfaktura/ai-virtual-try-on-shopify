

# Fix: Add Admin Authentication to generate-style-previews

## Problem
The `generate-style-previews` edge function has no authentication. Anyone can call it to consume AI credits and overwrite landing-asset images.

## Fix
Add JWT verification + admin role check at the top of the handler, using `getClaims()` for JWT validation and a `user_roles` table lookup for admin authorization.

### File: `supabase/functions/generate-style-previews/index.ts`

After the CORS preflight check, add:

```typescript
// 1. Require Authorization header
const authHeader = req.headers.get("Authorization");
if (!authHeader?.startsWith("Bearer ")) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

// 2. Verify JWT via anon client
const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
  global: { headers: { Authorization: authHeader } }
});
const token = authHeader.replace("Bearer ", "");
const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
if (claimsError || !claimsData?.claims) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
const userId = claimsData.claims.sub;

// 3. Check admin role via service-role client
const { data: roleData } = await supabase
  .from("user_roles").select("role")
  .eq("user_id", userId).eq("role", "admin").maybeSingle();
if (!roleData) {
  return new Response(JSON.stringify({ error: "Admin access required" }), {
    status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
```

Move the `supabaseUrl` / `supabase` client creation before the auth block so it's available for the role check.

### Security finding
Mark `style_previews_no_auth` as resolved after applying the fix.

