// src/components/sections/TeamManagementSection.tsx - Updated with proper security
import { useState, useEffect } from 'react'
import {
  Container,
  Stack,
  Title,
  Text,
  Button,
  Card,
  Table,
  Badge,
  Group,
  ActionIcon,
  Modal,
  TextInput,
  Select,
  Alert,
  Loader,
  Center,
  Paper,
  ThemeIcon,
  Divider
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import {
  IconPlus,
  IconTrash,
  IconMail,
  IconUsers,
  IconClock,
  IconArrowLeft,
  IconAlertCircle
} from '@tabler/icons-react'
import type { UserRole } from '@/lib/database.types'
import { getTeamData, createInvitation, getCurrentUserProfile } from '@/lib/security'
import { supabase } from '@/lib/supabase'

interface TeamMember {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  role: UserRole
  is_active: boolean
  created_at: string
}

interface PendingInvitation {
  id: string
  email: string
  role: UserRole
  invited_by: string | null
  expires_at: string
  created_at: string
}

interface InviteForm {
  email: string
  role: UserRole
  firstName: string
  lastName: string
}

interface TeamManagementSectionProps {
  onBackToDashboard: () => void
  userEmail?: string
  businessId?: string
  currentUserRole?: UserRole
}

export function TeamManagementSection({
  onBackToDashboard,
  userEmail,
  businessId,
  currentUserRole = 'owner'
}: TeamManagementSectionProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inviteForm = useForm<InviteForm>({
    initialValues: {
      email: '',
      role: 'staff',
      firstName: '',
      lastName: ''
    },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      firstName: (val) => (val.length < 2 ? 'First name must be at least 2 characters' : null),
      lastName: (val) => (val.length < 2 ? 'Last name must be at least 2 characters' : null),
    },
  })

  // Load team data using secure function
  useEffect(() => {
    loadTeamData()
  }, [businessId])

  const loadTeamData = async () => {
    if (!businessId) return

    try {
      setLoading(true)
      setError(null)

      // Use secure function that includes permission checks
      const teamData = await getTeamData(businessId)
      setTeamMembers(teamData.members)
      setPendingInvitations(teamData.invitations)

    } catch (err: any) {
      setError(err.message)
      console.error('Team data load error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSendInvitation = async (values: InviteForm) => {
  console.log('🔄 STARTING invitation send...', values)
  
  if (!businessId) {
    console.error('❌ No business ID available')
    setError('No business ID available')
    return
  }

  try {
    setInviteLoading(true)
    setError(null)

    console.log('🔄 Step 1: Checking for existing user...')
    
    // Check if user already exists
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('email')
      .eq('email', values.email)
      .single()

    console.log('🔄 User check result:', { existingUser, userCheckError })

    if (existingUser) {
      throw new Error('A user with this email already exists')
    }

    console.log('🔄 Step 2: Getting current user...')
    
    // Get current user ID
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('🔄 Auth user result:', { user: user?.id, authError })
    
    if (!user) throw new Error('Not authenticated')

    console.log('🔄 Step 3: Creating invitation token...')
    
    // Generate secure token
    const token = crypto.randomUUID() + '-' + Date.now()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

    console.log('🔄 Step 4: Inserting invitation...', {
      business_id: businessId,
      email: values.email,
      role: values.role,
      invited_by: user.id,
      token,
      expires_at: expiresAt.toISOString()
    })

    // Create invitation
    const { error: inviteError } = await supabase
      .from('user_invitations')
      .insert({
        business_id: businessId,
        email: values.email,
        role: values.role,
        invited_by: user.id,
        token,
        expires_at: expiresAt.toISOString()
      })

    console.log('🔄 Invitation insert result:', { inviteError })

    if (inviteError) {
      console.error('❌ Invitation creation error:', inviteError)
      throw new Error(`Failed to create invitation: ${inviteError.message}`)
    }

    console.log('✅ Invitation created successfully!')

    notifications.show({
      title: 'Invitation sent!',
      message: `An invitation has been sent to ${values.email}`,
      color: 'green',
    })

    // Reset form and close modal
    inviteForm.reset()
    setInviteModalOpen(false)
    
    // Reload data
    loadTeamData()

  } catch (err: any) {
    console.error('❌ FULL ERROR:', err)
    setError(err.message)
    notifications.show({
      title: 'Error',
      message: err.message,
      color: 'red',
    })
  } finally {
    setInviteLoading(false)
  }
}

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      // Verify user has permission before allowing cancellation
      const profile = await getCurrentUserProfile()
      if (!profile || profile.business_id !== businessId) {
        throw new Error('Unauthorized')
      }

      const { error } = await supabase
        .from('user_invitations')
        .delete()
        .eq('id', invitationId)
        .eq('business_id', businessId) // Extra security check

      if (error) throw error

      notifications.show({
        title: 'Invitation cancelled',
        message: 'The invitation has been cancelled',
        color: 'blue',
      })

      loadTeamData()
    } catch (err: any) {
      notifications.show({
        title: 'Error',
        message: err.message,
        color: 'red',
      })
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
      <Container size="lg" py={40}>
        <Center>
          <Stack align="center" gap="md">
            <Loader size="xl" />
            <Text>Loading team...</Text>
          </Stack>
        </Center>
      </Container>
    )
  }

  return (
    <Container size="lg" py={40}>
      {/* Header */}
      <Group justify="space-between" mb="xl">
        <Group>
          <ActionIcon variant="outline" onClick={onBackToDashboard}>
            <IconArrowLeft size={16} />
          </ActionIcon>
          <Stack gap="xs">
            <Title order={1}>Team Management</Title>
            <Text c="dimmed">Manage your healthcare facility team</Text>
          </Stack>
        </Group>
        
        {(currentUserRole === 'owner' || currentUserRole === 'manager') && (
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setInviteModalOpen(true)}
          >
            Invite Team Member
          </Button>
        )}
      </Group>

      {error && (
        <Alert 
          icon={<IconAlertCircle size="1rem" />} 
          title="Error" 
          color="red" 
          mb="md"
        >
          {error}
        </Alert>
      )}

      {/* Team Stats */}
      <Group justify="center" mb="xl">
        <Paper shadow="sm" radius="md" p="md" withBorder>
          <Stack gap="xs" align="center">
            <ThemeIcon size={30} radius="md" color="blue">
              <IconUsers size={16} />
            </ThemeIcon>
            <Text size="xl" fw={700}>{teamMembers.length}</Text>
            <Text size="sm" c="dimmed">Team Members</Text>
          </Stack>
        </Paper>

        <Paper shadow="sm" radius="md" p="md" withBorder>
          <Stack gap="xs" align="center">
            <ThemeIcon size={30} radius="md" color="orange">
              <IconClock size={16} />
            </ThemeIcon>
            <Text size="xl" fw={700}>{pendingInvitations.length}</Text>
            <Text size="sm" c="dimmed">Pending Invites</Text>
          </Stack>
        </Paper>
      </Group>

      {/* Team Members Table */}
      <Card shadow="sm" radius="md" p="lg" mb="xl">
        <Group justify="space-between" mb="md">
          <Title order={2} size="h3">Team Members</Title>
          <Badge variant="light" color="blue">
            {teamMembers.filter(m => m.is_active).length} Active
          </Badge>
        </Group>

        {teamMembers.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            No team members yet. Invite your first team member to get started!
          </Text>
        ) : (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Joined</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {teamMembers.map((member) => (
                <Table.Tr key={member.id}>
                  <Table.Td>
                    <Text fw={500}>
                      {member.first_name && member.last_name 
                        ? `${member.first_name} ${member.last_name}`
                        : 'Not provided'
                      }
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Text>{member.email}</Text>
                      {member.email === userEmail && (
                        <Badge size="xs" variant="light" color="blue">You</Badge>
                      )}
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" color={getRoleBadgeColor(member.role)}>
                      {member.role}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" color={member.is_active ? 'green' : 'red'}>
                      {member.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {new Date(member.created_at).toLocaleDateString()}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <Card shadow="sm" radius="md" p="lg">
          <Group justify="space-between" mb="md">
            <Title order={2} size="h3">Pending Invitations</Title>
            <Badge variant="light" color="orange">
              {pendingInvitations.length} Pending
            </Badge>
          </Group>

          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Email</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Sent</Table.Th>
                <Table.Th>Expires</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {pendingInvitations.map((invitation) => (
                <Table.Tr key={invitation.id}>
                  <Table.Td>
                    <Group gap="xs">
                      <IconMail size={16} color="var(--mantine-color-orange-6)" />
                      <Text>{invitation.email}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" color={getRoleBadgeColor(invitation.role)}>
                      {invitation.role}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {new Date(invitation.created_at).toLocaleDateString()}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {new Date(invitation.expires_at).toLocaleDateString()}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <ActionIcon
                      variant="light"
                      color="red"
                      size="sm"
                      onClick={() => handleCancelInvitation(invitation.id)}
                    >
                      <IconTrash size={12} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      )}

      {/* Invite Modal - Same as before */}
      <Modal
        opened={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite Team Member"
        size="md"
      >
        <form onSubmit={inviteForm.onSubmit(handleSendInvitation)}>
          <Stack gap="md">
            <Group grow>
              <TextInput
                required
                label="First Name"
                placeholder="John"
                value={inviteForm.values.firstName}
                onChange={(event) => inviteForm.setFieldValue('firstName', event.currentTarget.value)}
                error={inviteForm.errors.firstName}
              />

              <TextInput
                required
                label="Last Name"
                placeholder="Doe"
                value={inviteForm.values.lastName}
                onChange={(event) => inviteForm.setFieldValue('lastName', event.currentTarget.value)}
                error={inviteForm.errors.lastName}
              />
            </Group>

            <TextInput
              required
              label="Email Address"
              placeholder="john.doe@healthcare.com"
              value={inviteForm.values.email}
              onChange={(event) => inviteForm.setFieldValue('email', event.currentTarget.value)}
              error={inviteForm.errors.email}
            />

            <Select
              required
              label="Role"
              placeholder="Select role"
              data={[
                { value: 'manager', label: 'Manager - Can create and manage forms' },
                { value: 'staff', label: 'Staff - Can fill out forms' }
              ]}
              value={inviteForm.values.role}
              onChange={(value) => inviteForm.setFieldValue('role', value as UserRole)}
            />

            <Alert color="blue" variant="light">
              <Text size="sm">
                An invitation email will be sent to the provided address. 
                The invitation will expire in 7 days.
              </Text>
            </Alert>

            <Group justify="flex-end" gap="md">
              <Button variant="outline" onClick={() => setInviteModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={inviteLoading}>
                Send Invitation
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  )
}