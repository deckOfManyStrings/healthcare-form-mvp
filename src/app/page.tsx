// src/app/page.tsx - Clean version with invite codes only
'use client'

import { useState, useEffect } from 'react'
import { Container, Stack, Center, Loader, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { UserRole } from '@/lib/database.types'

// Import components
import { LandingSection } from '@/components/sections/LandingSection'
import { LoginSection } from '@/components/sections/LoginSection'
import { RegisterSection } from '@/components/sections/RegisterSection'
import { OnboardingSection } from '@/components/sections/OnboardingSection'
import { DashboardSection } from '@/components/sections/DashboardSection'
import { TeamManagementSection } from '@/components/sections/TeamManagementSection'
import { InviteCodeSection } from '@/components/sections/InviteCodeSection'

type AppState = 'loading' | 'landing' | 'login' | 'register' | 'invite-code' | 'onboarding' | 'dashboard' | 'team-management'

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

  // Check authentication status on page load
  useEffect(() => {
    checkAuth()
  }, [])

  // Check authentication status
  const checkAuth = async () => {
    try {
      console.log('🔍 Checking authentication status...')
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        console.log('✅ User session found:', session.user.id)
        setUser(session.user)
        await loadUserProfile(session.user.id)
      } else {
        console.log('ℹ️ No user session found')
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

  // Auth handlers
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

      if (!user) {
        throw new Error('No authenticated user found')
      }

      // Create business
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
        setAuthError(`Business creation failed: ${businessError.message}`)
        return
      }

      // Update user with business_id and role
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
        setAuthError(`User profile update failed: ${userError.message}`)
        return
      }

      notifications.show({
        title: 'Business setup complete!',
        message: 'Welcome to your Healthcare Forms dashboard.',
        color: 'green',
      })

      await loadUserProfile(user.id)

    } catch (err: any) {
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

  // Navigation handlers
  const handleTeamManagement = () => {
    setAppState('team-management')
  }

  const handleBackToDashboard = () => {
    setAppState('dashboard')
  }

  const handleInviteCodeSuccess = async () => {
    // After successful invite code usage, check auth status
    await checkAuth()
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

  // Landing page
  if (appState === 'landing') {
    return (
      <LandingSection 
        onLoginClick={() => setAppState('login')}
        onRegisterClick={() => setAppState('register')}
        onInviteCodeClick={() => setAppState('invite-code')}
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

  // Invite code page
  if (appState === 'invite-code') {
    return (
      <InviteCodeSection
        onSuccess={handleInviteCodeSuccess}
        onBackClick={() => setAppState('landing')}
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

  // Team management page
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

  // Dashboard page
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