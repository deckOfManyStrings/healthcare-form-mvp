// src/lib/security.ts - Application-level security checks
import { supabase } from './supabase'
import type { UserRole } from './database.types'

// Get current user's business and role
export async function getCurrentUserProfile() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile, error } = await supabase
    .from('users')
    .select(`
      id,
      email,
      business_id,
      role,
      first_name,
      last_name,
      businesses!inner(id, name)
    `)
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Profile load error:', error)
    return null
  }

  return profile
}

// Check if user has required role
export function hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole)
}

// Check if user can manage team (owner or manager)
export function canManageTeam(userRole: UserRole): boolean {
  return hasRole(userRole, ['owner', 'manager'])
}

// Check if user can create forms (owner or manager)
export function canCreateForms(userRole: UserRole): boolean {
  return hasRole(userRole, ['owner', 'manager'])
}

// Secure team data fetching with business filtering
export async function getTeamData(businessId: string) {
  const profile = await getCurrentUserProfile()
  
  // Verify user belongs to this business
  if (!profile || profile.business_id !== businessId) {
    throw new Error('Unauthorized: User not in business')
  }

  // Verify user can manage team
  if (!canManageTeam(profile.role)) {
    throw new Error('Unauthorized: Insufficient permissions')
  }

  // Fetch team members for this business
  const { data: members, error: membersError } = await supabase
    .from('users')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })

  if (membersError) throw membersError

  // Fetch pending invitations for this business
  const { data: invitations, error: invitationsError } = await supabase
    .from('user_invitations')
    .select('*')
    .eq('business_id', businessId)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (invitationsError) throw invitationsError

  return {
    members: members || [],
    invitations: invitations || []
  }
}

// Secure invitation creation
export async function createInvitation(
  businessId: string,
  email: string,
  role: UserRole,
  firstName: string,
  lastName: string
) {
  const profile = await getCurrentUserProfile()
  
  // Verify user belongs to this business and can manage team
  if (!profile || profile.business_id !== businessId || !canManageTeam(profile.role)) {
    throw new Error('Unauthorized: Cannot create invitations')
  }

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('email')
    .eq('email', email)
    .single()

  if (existingUser) {
    throw new Error('A user with this email already exists')
  }

  // Check for existing pending invitation
  const { data: existingInvite } = await supabase
    .from('user_invitations')
    .select('id')
    .eq('business_id', businessId)
    .eq('email', email)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (existingInvite) {
    throw new Error('An invitation has already been sent to this email')
  }

  // Generate secure token
  const token = crypto.randomUUID() + '-' + Date.now()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

  // Create invitation
  const { error: inviteError } = await supabase
    .from('user_invitations')
    .insert({
      business_id: businessId,
      email,
      role,
      invited_by: profile.id,
      token,
      expires_at: expiresAt.toISOString()
    })

  if (inviteError) throw inviteError

  return { token, expires_at: expiresAt.toISOString() }
}