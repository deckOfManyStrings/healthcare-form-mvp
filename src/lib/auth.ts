// src/lib/auth.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Database } from './database.types'

export async function getUser() {
  const supabase = createServerComponentClient<Database>({ cookies })
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export async function getUserProfile() {
  const { user } = await getUser()
  if (!user) return null

  const supabase = createServerComponentClient<Database>({ cookies })

  const { data: profile } = await supabase
    .from('users')
    .select(`
      *,
      business:businesses(*)
    `)
    .eq('id', user.id)
    .single()

  return profile
}

export async function requireAuth() {
  const { user } = await getUser()
  if (!user) {
    redirect('/auth/login')
  }
  return user
}

export async function requireBusiness() {
  const profile = await getUserProfile()
  if (!profile?.business_id) {
    redirect('/onboarding') // Redirect to business setup
  }
  return profile
}

export async function requireRole(allowedRoles: string[]) {
  const profile = await getUserProfile()
  if (!profile) {
    redirect('/auth/login')
  }
  
  if (!allowedRoles.includes(profile.role)) {
    redirect('/dashboard') // Redirect to dashboard with error
  }
  
  return profile
}