// Create this file: src/lib/debug.ts
import { supabase } from './supabase'

export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...')
    
    // Test 1: Basic connection
    const { data, error } = await supabase.from('businesses').select('count').limit(1)
    
    if (error) {
      console.error('Supabase connection error:', error)
      return false
    }
    
    console.log('✅ Supabase connection successful')
    
    // Test 2: Auth status
    const { data: { session } } = await supabase.auth.getSession()
    console.log('Current session:', session ? 'Active' : 'None')
    
    // Test 3: Current user profile if logged in
    if (session?.user) {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      if (profileError) {
        console.error('Profile load error:', profileError)
      } else {
        console.log('User profile:', profile)
      }
    }
    
    return true
  } catch (err) {
    console.error('Connection test failed:', err)
    return false
  }
}