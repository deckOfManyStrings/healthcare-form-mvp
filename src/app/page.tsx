// src/app/page.tsx - Updated with team management integration
'use client'

import { useState, useEffect } from 'react'
import { Container, Stack, Center, Loader, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { UserRole } from '@/lib/database.types'

// Import existing components
import { LandingSection } from '@/components/sections/LandingSection'
import { LoginSection } from '@/components/sections/LoginSection'
import { RegisterSection } from '@/components/sections/RegisterSection'
import { OnboardingSection } from '@/components/sections/OnboardingSection'
import { DashboardSection } from '@/components/sections/DashboardSection'

// Import new team management components
import { TeamManagementSection } from '@/components/sections/TeamManagementSection'
import { InvitationAcceptanceSection } from '@/components/sections/InvitationAcceptanceSection'

// Extended app state to include team management
type AppState = 'loading' | 'landing' | 'login' | 'register' | 'onboarding' | 'dashboard' | 'team-management' | 'invitation-acceptance'

interface LoginForm {
  email: string
  password: string
}

interface RegisterForm {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

interface BusinessForm {
  businessName: string
  businessType: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  description: string
}

interface UserProfile {
  id: string
  email: string
  business_id: string | null
  role: UserRole
  first_name: string | null
  last_name: string | null
  business?: {
    id: string
    name: string
  }
}

export default function HomePage() {
  const [appState, setAppState] = useState<AppState>('loading')
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [invitationToken, setInvitationToken] = useState<string | null>(null)

  // Check for invitation token in URL on page load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token')
      if (token) {
        setInvitationToken(token)
        setAppState('invitation-acceptance')
        return
      }
    }
    // If no invitation token, proceed with normal auth check
    checkAuth()
  }, [])

  // Check authentication status
  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUser(session.user)
        await loadUserProfile(session.user.id)
      } else {
        setAppState('landing')
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setAppState('landing')
    }
  }

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select(`
          *,
          business:businesses(id, name)
        `)
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Profile load error:', error)
        setAppState('onboarding')
        return
      }

      setUserProfile(profile)
      
      if (profile?.business_id) {
        setAppState('dashboard')
      } else {
        setAppState('onboarding')
      }
    } catch (error) {
      console.error('Profile load error:', error)
      setAppState('onboarding')
    }
  }

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        await loadUserProfile(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setUserProfile(null)
        setAppState('landing')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Existing auth handlers (keeping them the same)
  const handleLogin = async (values: LoginForm) => {
    setAuthLoading(true)
    setAuthError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) {
        setAuthError(error.message)
      } else {
        notifications.show({
          title: 'Welcome back!',
          message: 'You have been successfully logged in.',
          color: 'green',
        })
      }
    } catch (err) {
      setAuthError('An unexpected error occurred. Please try again.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleRegister = async (values: RegisterForm) => {
    setAuthLoading(true)
    setAuthError(null)

    try {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
          }
        }
      })

      if (error) {
        setAuthError(error.message)
      } else {
        notifications.show({
          title: 'Account created!',
          message: 'Please check your email to confirm your account.',
          color: 'green',
        })
      }
    } catch (err) {
      setAuthError('An unexpected error occurred. Please try again.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleBusinessSetup = async (values: BusinessForm) => {
  setAuthLoading(true)
  setAuthError(null)

  try {
    console.log('🔄 Starting business setup...', values)
    console.log('🔄 Current user:', user)

    if (!user) {
      throw new Error('No authenticated user found')
    }

    // Create business
    console.log('🔄 Creating business...')
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .insert({
        name: values.businessName,
        phone: values.phone,
        address: {
          street: values.address,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode
        }
      })
      .select()
      .single()

    if (businessError) {
      console.error('❌ Business creation error:', businessError)
      setAuthError(`Business creation failed: ${businessError.message}`)
      return
    }

    console.log('✅ Business created:', business)

    // Update user with business_id and role
    console.log('🔄 Updating user profile...')
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email!,
        business_id: business.id,
        role: 'owner' as UserRole,
        first_name: user.user_metadata?.first_name,
        last_name: user.user_metadata?.last_name,
      })

    if (userError) {
      console.error('❌ User update error:', userError)
      setAuthError(`User profile update failed: ${userError.message}`)
      return
    }

    console.log('✅ User profile updated')

    notifications.show({
      title: 'Business setup complete!',
      message: 'Welcome to your Healthcare Forms dashboard.',
      color: 'green',
    })

    console.log('🔄 Loading user profile...')
    await loadUserProfile(user.id)

  } catch (err: any) {
    console.error('❌ Business setup failed:', err)
    setAuthError(`Setup failed: ${err.message}`)
  } finally {
    setAuthLoading(false)
  }
}

  const handleLogout = async () => {
    await supabase.auth.signOut()
    notifications.show({
      title: 'Signed out',
      message: 'You have been successfully signed out.',
      color: 'blue',
    })
  }

  // NEW: Invitation handlers
  const handleInvitationSuccess = async () => {
    // Clear invitation token from URL
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, document.title, window.location.pathname)
    }
    setInvitationToken(null)
    
    // Check auth status after successful invitation acceptance
    await checkAuth()
  }

  const handleInvitationError = (error: string) => {
    setAuthError(error)
    setAppState('landing')
  }

  // NEW: Navigation handlers for team management
  const handleTeamManagement = () => {
    setAppState('team-management')
  }

  const handleBackToDashboard = () => {
    setAppState('dashboard')
  }

  // Loading state
  if (appState === 'loading') {
    return (
      <Container size="lg" py={80}>
        <Center>
          <Stack align="center" gap="md">
            <Loader size="xl" />
            <Text>Loading...</Text>
          </Stack>
        </Center>
      </Container>
    )
  }

  // NEW: Invitation acceptance page
  if (appState === 'invitation-acceptance' && invitationToken) {
    return (
      <InvitationAcceptanceSection
        token={invitationToken}
        onSuccess={handleInvitationSuccess}
        onError={handleInvitationError}
      />
    )
  }

  // Landing page
  if (appState === 'landing') {
    return (
      <LandingSection 
        onLoginClick={() => setAppState('login')}
        onRegisterClick={() => setAppState('register')}
      />
    )
  }

  // Login page
  if (appState === 'login') {
    return (
      <LoginSection
        onSubmit={handleLogin}
        onRegisterClick={() => setAppState('register')}
        onBackClick={() => setAppState('landing')}
        loading={authLoading}
        error={authError}
      />
    )
  }

  // Register page
  if (appState === 'register') {
    return (
      <RegisterSection
        onSubmit={handleRegister}
        onLoginClick={() => setAppState('login')}
        onBackClick={() => setAppState('landing')}
        loading={authLoading}
        error={authError}
      />
    )
  }

  // Onboarding page
  if (appState === 'onboarding') {
    return (
      <OnboardingSection
        onSubmit={handleBusinessSetup}
        onSignOut={handleLogout}
        loading={authLoading}
        error={authError}
        userEmail={user?.email}
      />
    )
  }

  // NEW: Team management page
  if (appState === 'team-management') {
    return (
      <TeamManagementSection
        onBackToDashboard={handleBackToDashboard}
        userEmail={user?.email}
        businessId={userProfile?.business_id || undefined}
        currentUserRole={userProfile?.role}
      />
    )
  }

  // Updated dashboard page with team management navigation
  if (appState === 'dashboard') {
    return (
      <DashboardSection
        onSignOut={handleLogout}
        onTeamManagement={handleTeamManagement}
        userEmail={user?.email}
        businessName={userProfile?.business?.name}
        userRole={userProfile?.role}
      />
    )
  }

  return null
}