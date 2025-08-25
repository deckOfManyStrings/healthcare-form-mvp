// src/app/page.tsx - Updated with URL parameter detection for invite codes
"use client";

import { useState, useEffect } from "react";
import { Container, Stack, Center, Loader, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { UserRole } from "@/lib/database.types";

// Import components
import { LandingSection } from "@/components/sections/LandingSection";
import { LoginSection } from "@/components/sections/LoginSection";
import { RegisterSection } from "@/components/sections/RegisterSection";
import { OnboardingSection } from "@/components/sections/OnboardingSection";
import { DashboardSection } from "@/components/sections/DashboardSection";
import { TeamManagementSection } from "@/components/sections/TeamManagementSection";
import { InviteCodeSection } from "@/components/sections/InviteCodeSection";

type AppState =
  | "loading"
  | "landing"
  | "login"
  | "register"
  | "invite-code"
  | "onboarding"
  | "dashboard"
  | "team-management";

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface BusinessForm {
  businessName: string;
  businessType: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  description: string;
}

interface UserProfile {
  id: string;
  email: string;
  business_id: string | null;
  role: UserRole;
  first_name: string | null;
  last_name: string | null;
  business?: {
    id: string;
    name: string;
  };
}

export default function HomePage() {
  const [appState, setAppState] = useState<AppState>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null); // NEW: Store invite code from URL

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteParam = urlParams.get("invite");
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const type = hashParams.get("type");

    if (accessToken && type === "signup") {
      console.log("Email confirmation detected, processing...");

      // Clean the URL
      window.history.replaceState({}, "", window.location.pathname);

      notifications.show({
        title: "Email Confirmed!",
        message: "Your account has been verified. Redirecting to dashboard...",
        color: "green",
      });

      // Let Supabase handle the session automatically
      setTimeout(() => {
        checkAuth();
      }, 1000);

      return;
    }

    if (inviteParam) {
      console.log("🔗 Invite code detected in URL:", inviteParam);
      const cleanCode = inviteParam.toUpperCase().replace("-", ""); // Handle CWLK-6738 format
      setInviteCode(cleanCode);

      // Clean URL by removing the invite parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("invite");
      window.history.replaceState({}, "", newUrl.pathname);

      // Show notification about invite link detection
      notifications.show({
        title: "Invite link detected!",
        message: "Processing your team invitation...",
        color: "blue",
      });

      // IMPORTANT: Set state to invite-code immediately, don't wait for auth check
      console.log("🔄 Setting app state to invite-code");
      setAppState("invite-code");
      return; // Exit early, don't run auth check
    }

    // Only check auth if no invite code
    checkAuth();
  }, []);

  // Also update the checkAuth function to handle invite codes properly
  const checkAuth = async () => {
    try {
      console.log("🔍 Checking authentication status...");
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        console.log("✅ User session found:", session.user.id);
        setUser(session.user);
        await loadUserProfile(session.user.id);
      } else {
        console.log("ℹ️ No user session found");
        // If we have an invite code, stay on invite flow, otherwise go to landing
        if (inviteCode) {
          console.log("📧 Has invite code, staying on invite flow");
          setAppState("invite-code");
        } else {
          console.log("🏠 No invite code, going to landing");
          setAppState("landing");
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);
      // If we have an invite code, go to invite flow, otherwise landing
      if (inviteCode) {
        setAppState("invite-code");
      } else {
        setAppState("landing");
      }
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      console.log("🔍 Loading profile for user:", userId);

      const { data: profile, error } = await supabase
        .from("users")
        .select(
          `
        *,
        business:businesses(id, name)
      `
        )
        .eq("id", userId)
        .maybeSingle(); // ← Changed from .single() to .maybeSingle()

      if (error) {
        console.error("❌ Profile load error:", error);
        // If user doesn't exist in users table, they need onboarding
        setAppState("onboarding");
        return;
      }

      console.log("👤 Profile loaded:", profile);

      if (!profile) {
        // User exists in auth but not in users table - needs onboarding
        console.log("ℹ️ User has no profile, redirecting to onboarding");
        setAppState("onboarding");
        return;
      }

      setUserProfile(profile);

      if (profile?.business_id) {
        console.log("🏢 User has business, going to dashboard");
        setAppState("dashboard");
      } else {
        console.log("🔧 User needs business setup, going to onboarding");
        setAppState("onboarding");
      }
    } catch (error) {
      console.error("💥 Profile load exception:", error);
      setAppState("onboarding");
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        await loadUserProfile(session.user.id);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setUserProfile(null);
        setAppState("landing");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Auth handlers
  const handleLogin = async (values: LoginForm) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        setAuthError(error.message);
      } else {
        notifications.show({
          title: "Welcome back!",
          message: "You have been successfully logged in.",
          color: "green",
        });
      }
    } catch (err) {
      setAuthError("An unexpected error occurred. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (values: RegisterForm) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
          },
        },
      });

      if (error) {
        setAuthError(error.message);
      } else {
        notifications.show({
          title: "Account created!",
          message: "Please check your email to confirm your account.",
          color: "green",
        });
      }
    } catch (err) {
      setAuthError("An unexpected error occurred. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleBusinessSetup = async (values: BusinessForm) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      console.log("🔄 Starting business setup...", values);

      if (!user) {
        throw new Error("No authenticated user found");
      }

      console.log("✅ User authenticated:", user.id, user.email);

      // Step 1: Create business
      console.log("📊 Creating business...");
      const { data: business, error: businessError } = await supabase
        .from("businesses")
        .insert({
          name: values.businessName,
          phone: values.phone,
          address: {
            street: values.address,
            city: values.city,
            state: values.state,
            zipCode: values.zipCode,
          },
        })
        .select()
        .single();

      if (businessError) {
        console.error("❌ Business creation failed:", businessError);
        setAuthError(`Business creation failed: ${businessError.message}`);
        return;
      }

      console.log("✅ Business created successfully:", business);

      // Step 2: Update/create user profile
      console.log("👤 Creating/updating user profile...");
      const { data: updatedUser, error: userError } = await supabase
        .from("users")
        .upsert(
          {
            id: user.id,
            email: user.email!,
            business_id: business.id,
            role: "owner" as UserRole,
            first_name: user.user_metadata?.first_name || null,
            last_name: user.user_metadata?.last_name || null,
          },
          {
            onConflict: "id",
          }
        )
        .select();

      if (userError) {
        console.error("❌ User profile update failed:", userError);
        setAuthError(`User profile update failed: ${userError.message}`);
        return;
      }

      console.log("✅ User profile updated:", updatedUser);

      notifications.show({
        title: "Business setup complete!",
        message: "Welcome to your Healthcare Forms dashboard.",
        color: "green",
      });

      // Step 3: Reload user profile
      console.log("🔄 Reloading user profile...");
      await loadUserProfile(user.id);
    } catch (err: any) {
      console.error("💥 Business setup exception:", err);
      setAuthError(`Setup failed: ${err.message}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    notifications.show({
      title: "Signed out",
      message: "You have been successfully signed out.",
      color: "blue",
    });
  };

  // Navigation handlers
  const handleTeamManagement = () => {
    setAppState("team-management");
  };

  const handleBackToDashboard = () => {
    setAppState("dashboard");
  };

  const handleInviteCodeSuccess = async () => {
    console.log("🎉 Invite code success handler called");

    // Clear the stored invite code
    setInviteCode(null);

    // Show success message
    notifications.show({
      title: "Account Created!",
      message: "Please sign in with your new account credentials",
      color: "green",
      autoClose: 5000,
    });

    // Redirect to login page instead of trying to auto-authenticate
    console.log("🔄 Redirecting to login page");
    setAppState("login");
  };

  // NEW: Handle manual invite code entry
  const handleManualInviteCode = () => {
    setInviteCode(null); // Clear any URL-based code
    setAppState("invite-code");
  };

  // Loading state
  if (appState === "loading") {
    return (
      <Container size="lg" py={80}>
        <Center>
          <Stack align="center" gap="md">
            <Loader size="xl" />
            <Text>
              {inviteCode ? "Processing invite link..." : "Loading..."}
            </Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  // Landing page
  if (appState === "landing") {
    return (
      <LandingSection
        onLoginClick={() => setAppState("login")}
        onRegisterClick={() => setAppState("register")}
        onInviteCodeClick={handleManualInviteCode}
      />
    );
  }

  // Login page
  if (appState === "login") {
    return (
      <LoginSection
        onSubmit={handleLogin}
        onRegisterClick={() => setAppState("register")}
        onBackClick={() => setAppState("landing")}
        loading={authLoading}
        error={authError}
      />
    );
  }

  // Register page
  if (appState === "register") {
    return (
      <RegisterSection
        onSubmit={handleRegister}
        onLoginClick={() => setAppState("login")}
        onBackClick={() => setAppState("landing")}
        loading={authLoading}
        error={authError}
      />
    );
  }

  // Invite code page
  if (appState === "invite-code") {
    return (
      <InviteCodeSection
        onSuccess={handleInviteCodeSuccess}
        onBackClick={() => setAppState("landing")}
        initialCode={inviteCode} // NEW: Pass the detected invite code
      />
    );
  }

  // Onboarding page
  if (appState === "onboarding") {
    return (
      <OnboardingSection
        onSubmit={handleBusinessSetup}
        onSignOut={handleLogout}
        loading={authLoading}
        error={authError}
        userEmail={user?.email}
      />
    );
  }

  // Team management page
  if (appState === "team-management") {
    return (
      <TeamManagementSection
        onBackToDashboard={handleBackToDashboard}
        userEmail={user?.email}
        businessId={userProfile?.business_id || undefined}
        currentUserRole={userProfile?.role}
      />
    );
  }

  // Dashboard page
  if (appState === "dashboard") {
    return (
      <DashboardSection
        onSignOut={handleLogout}
        onTeamManagement={handleTeamManagement}
        userEmail={user?.email}
        businessName={userProfile?.business?.name}
        userRole={userProfile?.role}
      />
    );
  }

  return null;
}
