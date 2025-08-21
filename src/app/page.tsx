// src/app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Container, Stack, Center, Loader, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

// Import components
import { LandingSection } from '@/components/sections/LandingSection'
import { LoginSection } from '@/components/sections/LoginSection'
import { RegisterSection } from '@/components/sections/RegisterSection'
import { OnboardingSection } from '@/components/sections/OnboardingSection'
import { DashboardSection } from '@/components/sections/DashboardSection'

type AppState = 'loading' | 'landing' | 'login' | 'register' | 'onboarding' | 'dashboard'

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

export default function HomePage() {
  const [appState, setAppState] = useState<AppState>('loading')
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // Check authentication status on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser(session.user)
          // Check if user has completed business setup
          const { data: profile } = await supabase
            .from('users')
            .select('business_id')
            .eq('id', session.user.id)
            .single()
          
          if (profile?.business_id) {
            setAppState('dashboard')
          } else {
            setAppState('onboarding')
          }
        } else {
          setAppState('landing')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setAppState('landing')
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        setAppState('onboarding')
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
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
        setAuthError(businessError.message)
        return
      }

      // Update user with business_id and role
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: user!.id,
          email: user!.email!,
          business_id: business.id,
          role: 'owner',
          first_name: user!.user_metadata?.first_name,
          last_name: user!.user_metadata?.last_name,
        })

      if (userError) {
        setAuthError(userError.message)
        return
      }

      notifications.show({
        title: 'Business setup complete!',
        message: 'Welcome to your Healthcare Forms dashboard.',
        color: 'green',
      })

      setAppState('dashboard')
    } catch (err) {
      setAuthError('An unexpected error occurred. Please try again.')
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

  // Dashboard page
  if (appState === 'dashboard') {
    return (
      <DashboardSection
        onSignOut={handleLogout}
        userEmail={user?.email}
        businessName="Your Business" // We'll fetch this from the database later
      />
    )
  }

  return null
}