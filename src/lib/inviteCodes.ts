// src/lib/inviteCodes.ts - Updated with URL generation utilities
import { supabase } from "./supabase";
import type { UserRole } from "./database.types";

export interface InviteCode {
  id: string;
  code: string;
  role: UserRole;
  email?: string;
  business_id: string;
  business_name?: string;
  created_by?: string;
  used_by?: string;
  used_at?: string;
  expires_at: string;
  created_at: string;
}

// NEW: Generate invite URL
export function generateInviteUrl(code: string, baseUrl?: string): string {
  const base =
    baseUrl || (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/?invite=${code}`;
}

// NEW: Extract invite code from URL
export function extractInviteCodeFromUrl(url?: string): string | null {
  try {
    const urlString =
      url || (typeof window !== "undefined" ? window.location.href : "");
    const urlObj = new URL(urlString);
    const inviteParam = urlObj.searchParams.get("invite");
    return inviteParam ? inviteParam.toUpperCase() : null;
  } catch {
    return null;
  }
}

// NEW: Clean invite parameter from current URL
export function cleanInviteFromUrl(): void {
  if (typeof window !== "undefined") {
    const url = new URL(window.location.href);
    if (url.searchParams.has("invite")) {
      url.searchParams.delete("invite");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }
}

// NEW: Validate invite code format
export function isValidInviteCodeFormat(code: string): boolean {
  // Must be exactly 8 characters: 4 letters + 4 numbers
  const inviteCodeRegex = /^[A-Z]{4}[0-9]{4}$/;
  return inviteCodeRegex.test(code.toUpperCase());
}

export async function createInviteCode(
  businessId: string,
  role: UserRole,
  email?: string,
  expiryDays: number = 7
): Promise<string> {
  console.log("🔄 Creating invite code...", {
    businessId,
    role,
    email,
    expiryDays,
  });

  // Get current user
  console.log("👤 Getting current user...");
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    console.error("❌ Auth error:", userError);
    throw new Error(`Authentication failed: ${userError.message}`);
  }

  if (!user) {
    console.error("❌ No authenticated user");
    throw new Error("Not authenticated");
  }

  console.log("✅ User authenticated:", user.id);

  // Verify user has permission
  console.log("🔍 Verifying user permissions...");
  const { data: userProfile, error: profileError } = await supabase
    .from("users")
    .select("business_id, role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("❌ Profile lookup error:", profileError);
    throw new Error(`Profile lookup failed: ${profileError.message}`);
  }

  if (!userProfile || userProfile.business_id !== businessId) {
    console.error("❌ Unauthorized: business mismatch");
    throw new Error("Unauthorized: Cannot create codes for this business");
  }

  if (!["owner", "manager"].includes(userProfile.role)) {
    console.error("❌ Unauthorized: insufficient role");
    throw new Error(
      "Unauthorized: Only owners and managers can create invite codes"
    );
  }

  console.log("✅ User permissions verified");

  // Generate unique code
  console.log("🎲 Generating unique code...");
  let code: string;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    code = generateCode();
    attempts++;

    console.log(
      `🔍 Checking if code ${code} is unique (attempt ${attempts})...`
    );

    // Check if code already exists
    const { data: existing, error: checkError } = await supabase
      .from("invite_codes")
      .select("id")
      .eq("code", code)
      .maybeSingle(); // Use maybeSingle instead of single

    if (checkError) {
      console.error("❌ Code uniqueness check failed:", checkError);
      throw new Error(`Code uniqueness check failed: ${checkError.message}`);
    }

    if (!existing) {
      console.log("✅ Unique code found:", code);
      break;
    }

    console.log("⚠️ Code already exists, generating new one...");

    if (attempts >= maxAttempts) {
      console.error("❌ Max attempts reached for unique code");
      throw new Error("Failed to generate unique invite code");
    }
  } while (true);

  // Set expiry date
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiryDays);

  console.log("📅 Code expires at:", expiresAt.toISOString());

  // Create the invite code
  console.log("💾 Inserting invite code into database...");
  const { data: insertedCode, error: insertError } = await supabase
    .from("invite_codes")
    .insert({
      business_id: businessId,
      code,
      role,
      email: email || null,
      created_by: user.id,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    console.error("❌ Failed to create invite code:", insertError);
    throw new Error(`Failed to create invite code: ${insertError.message}`);
  }

  console.log("✅ Invite code created successfully:", insertedCode);
  console.log("✅ Returning code:", code);

  return code;
}

// Helper function to generate code (make sure this exists)
function generateCode(): string {
  // Generate a 8-character code: 4 letters + 4 numbers
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";

  let code = "";

  // 4 random letters
  for (let i = 0; i < 4; i++) {
    code += letters[Math.floor(Math.random() * letters.length)];
  }

  // 4 random numbers
  for (let i = 0; i < 4; i++) {
    code += numbers[Math.floor(Math.random() * numbers.length)];
  }

  return code;
}

// Validate and get invite code details
export async function validateInviteCode(code: string): Promise<InviteCode> {
  console.log("🔍 Validating invite code:", code);

  // First check code format
  if (!isValidInviteCodeFormat(code)) {
    throw new Error(
      "Invalid invite code format. Codes must be 8 characters (4 letters + 4 numbers)"
    );
  }

  const { data: inviteCode, error } = await supabase
    .from("invite_codes")
    .select(
      `
      *,
      businesses!inner(name)
    `
    )
    .eq("code", code.toUpperCase())
    .single();

  if (error || !inviteCode) {
    console.error("❌ Invite code not found:", error);
    throw new Error("Invalid invite code");
  }

  // Check if already used
  if (inviteCode.used_at) {
    throw new Error("This invite code has already been used");
  }

  // Check if expired
  const now = new Date();
  const expiresAt = new Date(inviteCode.expires_at);
  if (now > expiresAt) {
    throw new Error("This invite code has expired");
  }

  // Check if email-specific and email matches
  if (inviteCode.email) {
    // This will be checked during account creation
    console.log("📧 Code is email-specific:", inviteCode.email);
  }

  return {
    id: inviteCode.id,
    code: inviteCode.code,
    role: inviteCode.role,
    email: inviteCode.email,
    business_id: inviteCode.business_id,
    business_name: inviteCode.businesses.name,
    created_by: inviteCode.created_by,
    used_by: inviteCode.used_by,
    used_at: inviteCode.used_at,
    expires_at: inviteCode.expires_at,
    created_at: inviteCode.created_at,
  };
}

// Use invite code to create account
export async function useInviteCode(
  code: string,
  userData: {
    email: string
    password: string
    firstName: string
    lastName: string
  }
): Promise<{ userId: string; businessId: string }> {
  console.log('🔄 Using invite code:', code)

  // First validate the code
  const inviteCode = await validateInviteCode(code)

  // If code is email-specific, verify email matches
  if (inviteCode.email && inviteCode.email.toLowerCase() !== userData.email.toLowerCase()) {
    throw new Error('This invite code is for a different email address')
  }

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', userData.email)
    .maybeSingle()

  if (existingUser) {
    throw new Error('An account with this email already exists')
  }

  try {
    // Create user account (trigger will auto-create basic profile)
    console.log('🔄 Creating user account...')
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
        }
      }
    })

    if (authError) {
      console.error('❌ Auth error:', authError)
      throw new Error(`Account creation failed: ${authError.message}`)
    }

    if (!authData.user) {
      throw new Error('Failed to create user account')
    }

    console.log('✅ User account created:', authData.user.id)

    // Wait for trigger to complete
    await new Promise(resolve => setTimeout(resolve, 300))

    // UPSERT user profile with business context (this is the key fix)
    console.log('👤 Upserting user profile with business context...')
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .upsert({
        id: authData.user.id,
        email: userData.email,
        business_id: inviteCode.business_id,
        role: inviteCode.role,
        first_name: userData.firstName,
        last_name: userData.lastName,
        is_active: true
      }, {
        onConflict: 'id'
      })
      .select()
      .single()

    if (profileError) {
      console.error('❌ Profile upsert error:', profileError)
      throw new Error(`Profile creation failed: ${profileError.message}`)
    }

    console.log('✅ User profile upserted successfully:', userProfile)

    // Mark invite code as used
    console.log('🎫 Marking invite code as used...')
    const { error: codeUpdateError } = await supabase
      .from('invite_codes')
      .update({
        used_by: authData.user.id,
        used_at: new Date().toISOString()
      })
      .eq('id', inviteCode.id)

    if (codeUpdateError) {
      console.error('⚠️ Failed to mark code as used (non-critical):', codeUpdateError)
    } else {
      console.log('✅ Invite code marked as used')
    }

    console.log('🎉 Account creation completed successfully!')

    return {
      userId: authData.user.id,
      businessId: inviteCode.business_id
    }

  } catch (error) {
    console.error('💥 Failed to use invite code:', error)
    throw error
  }
}

// Get all invite codes for a business
export async function getBusinessInviteCodes(
  businessId: string
): Promise<InviteCode[]> {
  console.log("🔍 Loading invite codes for business:", businessId);

  try {
    const { data: codes, error } = await supabase
      .from("invite_codes")
      .select(
        `
        *,
        created_by_user:users!invite_codes_created_by_fkey(first_name, last_name),
        used_by_user:users!invite_codes_used_by_fkey(first_name, last_name)
      `
      )
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Invite codes query error:", error);
      throw new Error(`Failed to load invite codes: ${error.message}`);
    }

    console.log(
      "✅ Invite codes query successful:",
      codes?.length || 0,
      "codes found"
    );
    return codes || [];
  } catch (err: any) {
    console.error("💥 getBusinessInviteCodes exception:", err);
    throw err;
  }
}

// NEW: Generate shareable invite message
export function generateInviteMessage(
  code: string,
  businessName: string,
  role: string,
  senderName?: string
): string {
  const inviteUrl = generateInviteUrl(code);
  const roleText = role === "manager" ? "manager" : "staff member";

  return `Hi! ${
    senderName ? senderName + " has" : "You've been"
  } invited you to join ${businessName} as a ${roleText}.

Click this link to get started:
${inviteUrl}

This invitation will expire in 7 days.

---
Healthcare Forms Platform - HIPAA Compliant`;
}

// NEW: Share invite via Web Share API or clipboard
export async function shareInviteCode(
  code: string,
  businessName: string,
  role: string,
  senderName?: string
): Promise<boolean> {
  const inviteUrl = generateInviteUrl(code);
  const message = generateInviteMessage(code, businessName, role, senderName);

  // Try Web Share API first (mobile)
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({
        title: `Join ${businessName} Team`,
        text: message,
        url: inviteUrl,
      });
      return true;
    } catch (err) {
      // User cancelled or share failed, fall back to clipboard
    }
  }

  // Fallback: copy to clipboard
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      return true;
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  }

  return false;
}
