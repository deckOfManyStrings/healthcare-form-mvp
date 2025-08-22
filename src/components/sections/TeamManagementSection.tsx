// src/components/sections/TeamManagementSection.tsx - Updated with invite codes
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
  Divider,
  CopyButton,
  Tooltip,
  Code
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import {
  IconPlus,
  IconTrash,
  IconUsers,
  IconClock,
  IconArrowLeft,
  IconAlertCircle,
  IconKey,
  IconCopy,
  IconCheck,
  IconMail
} from '@tabler/icons-react'
import type { UserRole } from '@/lib/database.types'
import { createInviteCode, getBusinessInviteCodes } from '@/lib/inviteCodes'
import type { InviteCode } from '@/lib/inviteCodes'
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

interface InviteCodeForm {
  role: UserRole
  email: string
  expiryDays: number
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
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([])
  const [loading, setLoading] = useState(true)
  const [createCodeModalOpen, setCreateCodeModalOpen] = useState(false)
  const [createCodeLoading, setCreateCodeLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inviteForm = useForm<InviteCodeForm>({
    initialValues: {
      role: 'staff',
      email: '',
      expiryDays: 7
    },
    validate: {
      email: (val) => val && !/^\S+@\S+$/.test(val) ? 'Invalid email' : null,
    },
  })

  // Load team data
  useEffect(() => {
    if (businessId) {
      loadTeamData()
    }
  }, [businessId])

  const loadTeamData = async () => {
    if (!businessId) return

    try {
      setLoading(true)
      setError(null)

      // Load team members
      const { data: members, error: membersError } = await supabase
        .from('users')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })

      if (membersError) throw membersError

      // Load invite codes
      const codes = await getBusinessInviteCodes(businessId)

      setTeamMembers(members || [])
      setInviteCodes(codes)

    } catch (err: any) {
      setError(err.message)
      console.error('Team data load error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateInviteCode = async (values: InviteCodeForm) => {
    if (!businessId) return

    try {
      setCreateCodeLoading(true)
      setError(null)

      console.log('🔄 Creating invite code...', values)

      const code = await createInviteCode(
        businessId,
        values.role,
        values.email || undefined,
        values.expiryDays
      )

      notifications.show({
        title: 'Invite code created!',
        message: `Code ${code} has been created and is ready to share.`,
        color: 'green',
      })

      // Reset form and close modal
      inviteForm.reset()
      setCreateCodeModalOpen(false)
      
      // Reload data
      loadTeamData()

    } catch (err: any) {
      setError(err.message)
      notifications.show({
        title: 'Error',
        message: err.message,
        color: 'red',
      })
    } finally {
      setCreateCodeLoading(false)
    }
  }

  const handleDeleteInviteCode = async (codeId: string) => {
    try {
      const { error } = await supabase
        .from('invite_codes')
        .delete()
        .eq('id', codeId)
        .eq('business_id', businessId) // Extra security check

      if (error) throw error

      notifications.show({
        title: 'Invite code deleted',
        message: 'The invite code has been deleted',
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

  const formatCodeForDisplay = (code: string) => {
    // Display as ABCD-1234 for better readability
    return code.slice(0, 4) + '-' + code.slice(4)
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
            <Text c="dimmed">Manage your healthcare facility team with invite codes</Text>
          </Stack>
        </Group>
        
        {(currentUserRole === 'owner' || currentUserRole === 'manager') && (
          <Button
            leftSection={<IconKey size={16} />}
            onClick={() => setCreateCodeModalOpen(true)}
          >
            Create Invite Code
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
            <ThemeIcon size={30} radius="md" color="green">
              <IconCheck size={16} />
            </ThemeIcon>
            <Text size="xl" fw={700}>{inviteCodes.filter(c => c.used_at).length}</Text>
            <Text size="sm" c="dimmed">Used Codes</Text>
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
            No team members yet. Create an invite code to get started!
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

      {/* Invite Codes */}
      <Card shadow="sm" radius="md" p="lg">
        <Group justify="space-between" mb="md">
          <Title order={2} size="h3">Invite Codes</Title>
          <Badge variant="light" color="orange">
            {inviteCodes.filter(c => !c.used_at && new Date(c.expires_at) > new Date()).length} Active
          </Badge>
        </Group>

        {inviteCodes.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            No invite codes created yet. Create your first invite code to start adding team members!
          </Text>
        ) : (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Code</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Expires</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {inviteCodes.map((code) => {
                const isExpired = new Date() > new Date(code.expires_at)
                const isUsed = !!code.used_at
                const isActive = !isUsed && !isExpired

                return (
                  <Table.Tr key={code.id}>
                    <Table.Td>
                      <Group gap="xs">
                        <Code>{formatCodeForDisplay(code.code)}</Code>
                        {isActive && (
                          <CopyButton value={code.code}>
                            {({ copied, copy }) => (
                              <Tooltip label={copied ? 'Copied!' : 'Copy code'}>
                                <ActionIcon variant="subtle" size="sm" onClick={copy}>
                                  {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                                </ActionIcon>
                              </Tooltip>
                            )}
                          </CopyButton>
                        )}
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color={getRoleBadgeColor(code.role)}>
                        {code.role}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        {code.email ? (
                          <>
                            <IconMail size={14} color="var(--mantine-color-blue-6)" />
                            <Text size="sm">{code.email}</Text>
                          </>
                        ) : (
                          <Text size="sm" c="dimmed">Any email</Text>
                        )}
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge 
                        variant="light" 
                        color={isUsed ? 'gray' : isExpired ? 'red' : 'green'}
                      >
                        {isUsed ? 'Used' : isExpired ? 'Expired' : 'Active'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {new Date(code.expires_at).toLocaleDateString()}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      {isActive && (
                        <ActionIcon
                          variant="light"
                          color="red"
                          size="sm"
                          onClick={() => handleDeleteInviteCode(code.id)}
                        >
                          <IconTrash size={12} />
                        </ActionIcon>
                      )}
                    </Table.Td>
                  </Table.Tr>
                )
              })}
            </Table.Tbody>
          </Table>
        )}
      </Card>

      {/* Create Invite Code Modal */}
      <Modal
        opened={createCodeModalOpen}
        onClose={() => setCreateCodeModalOpen(false)}
        title="Create Invite Code"
        size="md"
      >
        <form onSubmit={inviteForm.onSubmit(handleCreateInviteCode)}>
          <Stack gap="md">
            <Alert color="blue" variant="light">
              <Text size="sm">
                Create a secure invite code that team members can use to join your organization. 
                Codes can be shared via email, text, or any other method.
              </Text>
            </Alert>

            <Select
              required
              label="Role"
              placeholder="Select role for new team member"
              data={[
                { value: 'manager', label: 'Manager - Can create and manage forms' },
                { value: 'staff', label: 'Staff - Can fill out forms' }
              ]}
              value={inviteForm.values.role}
              onChange={(value) => inviteForm.setFieldValue('role', value as UserRole)}
            />

            <TextInput
              label="Email Address (Optional)"
              placeholder="john.doe@email.com"
              description="Leave empty to allow any email address to use this code"
              value={inviteForm.values.email}
              onChange={(event) => inviteForm.setFieldValue('email', event.currentTarget.value)}
              error={inviteForm.errors.email}
            />

            <Select
              required
              label="Expires After"
              data={[
                { value: '1', label: '1 day' },
                { value: '3', label: '3 days' },
                { value: '7', label: '7 days' },
                { value: '14', label: '14 days' },
                { value: '30', label: '30 days' }
              ]}
              value={inviteForm.values.expiryDays.toString()}
              onChange={(value) => inviteForm.setFieldValue('expiryDays', parseInt(value || '7'))}
            />

            <Group justify="flex-end" gap="md">
              <Button variant="outline" onClick={() => setCreateCodeModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={createCodeLoading}>
                Create Code
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  )
}