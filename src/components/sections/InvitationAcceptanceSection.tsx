// src/components/sections/InvitationAcceptanceSection.tsx
import { useState, useEffect } from 'react'
import {
  Container,
  Card,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Stack,
  Alert,
  Group,
  ThemeIcon,
  Divider,
  Badge,
  Progress
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { IconHeart, IconAlertCircle, IconX } from '@tabler/icons-react'
import { supabase } from '@/lib/supabase'
import type { UserRole } from '@/lib/database.types'

interface AcceptanceForm {
  firstName: string
  lastName: string
  password: string
  confirmPassword: string
}

interface InvitationDetails {
  id: string
  email: string
  role: UserRole
  business_name: string
  invited_by_name: string
  expires_at: string
}

interface InvitationAcceptanceSectionProps {
  token: string
  onSuccess: () => void
  onError: (error: string) => void
}

function getPasswordStrength(password: string) {
  let strength = 0
  if (password.length >= 8) strength += 25
  if (password.match(/[a-z]+/)) strength += 25
  if (password.match(/[A-Z]+/)) strength += 25
  if (password.match(/[0-9]+/)) strength += 25
  return strength
}

export function InvitationAcceptanceSection({
  token,
  onSuccess,
  onError
}: InvitationAcceptanceSectionProps) {
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [acceptLoading, setAcceptLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<AcceptanceForm>({
    initialValues: {
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      firstName: (val) => (val.length < 2 ? 'First name must be at least 2 characters' : null),
      lastName: (val) => (val.length < 2 ? 'Last name must be at least 2 characters' : null),
      password: (val) => {
        if (val.length < 8) return 'Password must be at least 8 characters'
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(val)) {
          return 'Password must contain uppercase, lowercase, and number'
        }
        return null
      },
      confirmPassword: (val, values) => 
        val !== values.password ? 'Passwords do not match' : null,
    },
  })

  const passwordStrength = getPasswordStrength(form.values.password)
  const passwordColor = passwordStrength === 100 ? 'green' : passwordStrength > 50 ? 'yellow' : 'red'

  useEffect(() => {
    loadInvitationDetails()
  }, [token])

  const loadInvitationDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get invitation details with business and inviter info
      const { data: inviteData, error: inviteError } = await supabase
        .from('user_invitations')
        .select(`
          id,
          email,
          role,
          expires_at,
          business_id,
          invited_by,
          businesses!inner(name),
          users!invited_by(first_name, last_name)
        `)
        .eq('token', token)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (inviteError || !inviteData) {
        throw new Error('Invalid or expired invitation')
      }

      const inviterName = inviteData.users?.first_name && inviteData.users?.last_name
        ? `${inviteData.users.first_name} ${inviteData.users.last_name}`
        : 'Team Administrator'

      setInvitation({
        id: inviteData.id,
        email: inviteData.email,
        role: inviteData.role,
        business_name: inviteData.businesses.name,
        invited_by_name: inviterName,
        expires_at: inviteData.expires_at
      })

    } catch (err: any) {
      setError(err.message)
      onError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptInvitation = async (values: AcceptanceForm) => {
    if (!invitation) return

    try {
      setAcceptLoading(true)
      setError(null)

      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation.email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
          }
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to create user account')

      // Get business_id from invitation
      const { data: inviteDetails, error: inviteError } = await supabase
        .from('user_invitations')
        .select('business_id')
        .eq('id', invitation.id)
        .single()

      if (inviteError || !inviteDetails) throw new Error('Invitation not found')

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: invitation.email,
          business_id: inviteDetails.business_id,
          role: invitation.role,
          first_name: values.firstName,
          last_name: values.lastName,
        })

      if (profileError) throw profileError

      // Mark invitation as accepted
      const { error: updateError } = await supabase
        .from('user_invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invitation.id)

      if (updateError) throw updateError

      notifications.show({
        title: 'Welcome to the team!',
        message: 'Your account has been created successfully.',
        color: 'green',
      })

      onSuccess()

    } catch (err: any) {
      setError(err.message)
    } finally {
      setAcceptLoading(false)
    }
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'owner': return 'grape'
      case 'manager': return 'blue'
      case 'staff': return 'green'
      default: return 'gray'
    }
  }

  if (loading) {
    return (
      <Container size={420} my={40}>
        <Card shadow="md" radius="md" p="xl">
          <Stack align="center" gap="md">
            <ThemeIcon size={60} radius="md" color="blue">
              <IconHeart size={30} />
            </ThemeIcon>
            <Title order={2}>Loading invitation...</Title>
          </Stack>
        </Card>
      </Container>
    )
  }

  if (error || !invitation) {
    return (
      <Container size={420} my={40}>
        <Card shadow="md" radius="md" p="xl">
          <Stack align="center" gap="md">
            <ThemeIcon size={60} radius="md" color="red">
              <IconX size={30} />
            </ThemeIcon>
            <Title order={2} c="red">Invalid Invitation</Title>
            <Text ta="center" c="dimmed">
              This invitation link is invalid or has expired. 
              Please contact your administrator for a new invitation.
            </Text>
          </Stack>
        </Card>
      </Container>
    )
  }

  return (
    <Container size={500} my={40}>
      <Stack align="center" gap="lg">
        <ThemeIcon size={60} radius="md" color="blue">
          <IconHeart size={30} />
        </ThemeIcon>
        <Title order={1} ta="center">Join Your Healthcare Team</Title>
        <Text ta="center" c="dimmed" maw={400}>
          You've been invited to join {invitation.business_name}. 
          Complete your profile to get started.
        </Text>

        <Card shadow="md" radius="md" p="xl" w="100%">
          <Stack gap="md">
            {/* Invitation Details */}
            <Group justify="space-between" mb="md">
              <Stack gap="xs">
                <Text size="sm" c="dimmed">Invited to join</Text>
                <Text fw={600}>{invitation.business_name}</Text>
              </Stack>
              <Badge variant="light" color={getRoleBadgeColor(invitation.role)}>
                {invitation.role}
              </Badge>
            </Group>

            <Group justify="space-between" mb="md">
              <Stack gap="xs">
                <Text size="sm" c="dimmed">Email</Text>
                <Text>{invitation.email}</Text>
              </Stack>
              <Stack gap="xs" align="flex-end">
                <Text size="sm" c="dimmed">Invited by</Text>
                <Text>{invitation.invited_by_name}</Text>
              </Stack>
            </Group>

            <Divider />

            {error && (
              <Alert 
                icon={<IconAlertCircle size="1rem" />} 
                title="Error" 
                color="red"
              >
                {error}
              </Alert>
            )}

            <form onSubmit={form.onSubmit(handleAcceptInvitation)}>
              <Stack gap="md">
                <Title order={3} size="h4">Create Your Account</Title>

                <Group grow>
                  <TextInput
                    required
                    label="First Name"
                    placeholder="John"
                    value={form.values.firstName}
                    onChange={(event) => form.setFieldValue('firstName', event.currentTarget.value)}
                    error={form.errors.firstName}
                  />

                  <TextInput
                    required
                    label="Last Name"
                    placeholder="Doe"
                    value={form.values.lastName}
                    onChange={(event) => form.setFieldValue('lastName', event.currentTarget.value)}
                    error={form.errors.lastName}
                  />
                </Group>

                <PasswordInput
                  required
                  label="Password"
                  placeholder="Create a secure password"
                  value={form.values.password}
                  onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
                  error={form.errors.password}
                />

                {form.values.password && (
                  <Stack gap="xs">
                    <Text size="sm" c="dimmed">Password strength:</Text>
                    <Progress 
                      value={passwordStrength} 
                      color={passwordColor} 
                      size="sm" 
                      radius="md"
                    />
                  </Stack>
                )}

                <PasswordInput
                  required
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={form.values.confirmPassword}
                  onChange={(event) => form.setFieldValue('confirmPassword', event.currentTarget.value)}
                  error={form.errors.confirmPassword}
                />

                <Alert color="blue" variant="light">
                  <Text size="sm">
                    By accepting this invitation, you'll have access to the healthcare 
                    forms platform with {invitation.role} permissions.
                  </Text>
                </Alert>

                <Button 
                  type="submit" 
                  loading={acceptLoading}
                  disabled={!form.isValid()}
                  size="md"
                  fullWidth
                >
                  Accept Invitation & Create Account
                </Button>
              </Stack>
            </form>
          </Stack>
        </Card>

        <Text c="dimmed" size="xs" ta="center" maw={400}>
          This invitation will expire on {new Date(invitation.expires_at).toLocaleDateString()}.
          Your data is encrypted and HIPAA compliant.
        </Text>
      </Stack>
    </Container>
  )
}