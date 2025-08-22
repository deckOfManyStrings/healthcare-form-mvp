// src/components/sections/DashboardSection.tsx - Updated with team management
import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  SimpleGrid,
  Card,
  ThemeIcon,
  Group,
  Badge,
  Paper,
  Divider
} from '@mantine/core'
import {
  IconForms,
  IconUsers,
  IconChartBar,
  IconClipboardList,
  IconSettings,
  IconHeart,
  IconPlus,
  IconEye,
  IconUserPlus
} from '@tabler/icons-react'
import type { UserRole } from '@/lib/database.types'

interface DashboardSectionProps {
  onSignOut: () => void
  onTeamManagement: () => void  // NEW: Team management navigation
  userEmail?: string
  businessName?: string
  userRole?: UserRole  // NEW: User role for conditional rendering
}

export function DashboardSection({ 
  onSignOut, 
  onTeamManagement,  // NEW
  userEmail, 
  businessName,
  userRole = 'staff'  // NEW: Default to staff role
}: DashboardSectionProps) {
  
  // NEW: Role-based permissions
  const canManageTeam = userRole === 'owner' || userRole === 'manager'
  const canCreateForms = userRole === 'owner' || userRole === 'manager'

  // NEW: Role display helpers
  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'owner': return 'Owner'
      case 'manager': return 'Manager'
      case 'staff': return 'Staff'
      default: return 'User'
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

  return (
    <Container size="lg" py={40}>
      {/* Updated Header with role badge */}
      <Group justify="space-between" mb="xl">
        <Stack gap="xs">
          <Group align="center" gap="sm">
            <IconHeart size={32} color="var(--mantine-color-blue-6)" />
            <Title order={1}>Dashboard</Title>
          </Group>
          <Group gap="sm">
            <Text c="dimmed">
              Welcome back, {userEmail}
            </Text>
            {businessName && (
              <>
                <Text c="dimmed">•</Text>
                <Text c="dimmed">{businessName}</Text>
              </>
            )}
          </Group>
        </Stack>
        <Group gap="md">
          {/* NEW: Role badge */}
          <Badge variant="light" color={getRoleBadgeColor(userRole)}>
            {getRoleDisplayName(userRole)}
          </Badge>
          <Badge variant="light" color="green">Free Tier</Badge>
          <Button variant="outline" onClick={onSignOut}>
            Sign Out
          </Button>
        </Group>
      </Group>

      {/* Quick Stats (same as before) */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg" mb="xl">
        <Paper shadow="sm" radius="md" p="md" withBorder>
          <Stack gap="xs">
            <Group justify="space-between">
              <ThemeIcon size={30} radius="md" color="blue">
                <IconForms size={16} />
              </ThemeIcon>
              <Text size="xl" fw={700}>0</Text>
            </Group>
            <Text size="sm" c="dimmed">Active Forms</Text>
          </Stack>
        </Paper>

        <Paper shadow="sm" radius="md" p="md" withBorder>
          <Stack gap="xs">
            <Group justify="space-between">
              <ThemeIcon size={30} radius="md" color="green">
                <IconClipboardList size={16} />
              </ThemeIcon>
              <Text size="xl" fw={700}>0</Text>
            </Group>
            <Text size="sm" c="dimmed">Submissions</Text>
          </Stack>
        </Paper>

        <Paper shadow="sm" radius="md" p="md" withBorder>
          <Stack gap="xs">
            <Group justify="space-between">
              <ThemeIcon size={30} radius="md" color="orange">
                <IconUsers size={16} />
              </ThemeIcon>
              <Text size="xl" fw={700}>1</Text>
            </Group>
            <Text size="sm" c="dimmed">Team Members</Text>
          </Stack>
        </Paper>

        <Paper shadow="sm" radius="md" p="md" withBorder>
          <Stack gap="xs">
            <Group justify="space-between">
              <ThemeIcon size={30} radius="md" color="violet">
                <IconChartBar size={16} />
              </ThemeIcon>
              <Text size="xl" fw={700}>0</Text>
            </Group>
            <Text size="sm" c="dimmed">Reports</Text>
          </Stack>
        </Paper>
      </SimpleGrid>

      {/* NEW: Updated Main Actions with role-based rendering */}
      <SimpleGrid cols={{ base: 1, md: canManageTeam ? 3 : 2 }} spacing="lg" mb="xl">
        {/* Forms Card - Updated text based on role */}
        <Card shadow="sm" radius="md" p="lg">
          <Stack gap="md">
            <ThemeIcon size={40} radius="md" color="blue">
              <IconForms size={20} />
            </ThemeIcon>
            <Title order={3} size="h4">Forms</Title>
            <Text c="dimmed">
              {canCreateForms 
                ? "Create and manage your custom forms. Build incident reports, assessments, and care documentation."
                : "Fill out forms assigned to you. View and complete incident reports, assessments, and care documentation."
              }
            </Text>
            <Group gap="sm">
              {canCreateForms && (
                <Button leftSection={<IconPlus size={16} />} variant="light" size="sm">
                  Create Form
                </Button>
              )}
              <Button leftSection={<IconEye size={16} />} variant="outline" size="sm">
                {canCreateForms ? 'View All' : 'My Forms'}
              </Button>
            </Group>
          </Stack>
        </Card>

        {/* NEW: Team Card - Only show for owners/managers */}
        {canManageTeam && (
          <Card shadow="sm" radius="md" p="lg">
            <Stack gap="md">
              <ThemeIcon size={40} radius="md" color="green">
                <IconUsers size={20} />
              </ThemeIcon>
              <Title order={3} size="h4">Team</Title>
              <Text c="dimmed">
                Invite and manage your team members. Assign roles and 
                permissions for different access levels.
              </Text>
              <Group gap="sm">
                <Button 
                  leftSection={<IconUserPlus size={16} />} 
                  variant="light" 
                  size="sm"
                  onClick={onTeamManagement}  // NEW: Navigate to team management
                >
                  Manage Team
                </Button>
                <Button leftSection={<IconPlus size={16} />} variant="outline" size="sm">
                  Invite User
                </Button>
              </Group>
            </Stack>
          </Card>
        )}

        {/* Reports Card - Updated text based on role */}
        <Card shadow="sm" radius="md" p="lg">
          <Stack gap="md">
            <ThemeIcon size={40} radius="md" color="orange">
              <IconChartBar size={20} />
            </ThemeIcon>
            <Title order={3} size="h4">Reports</Title>
            <Text c="dimmed">
              {canCreateForms
                ? "View analytics and generate reports. Track form submissions and facility performance metrics."
                : "View reports and analytics that you have access to based on your role."
              }
            </Text>
            <Group gap="sm">
              {canCreateForms && (
                <Button leftSection={<IconPlus size={16} />} variant="light" size="sm">
                  New Report
                </Button>
              )}
              <Button leftSection={<IconEye size={16} />} variant="outline" size="sm">
                View Reports
              </Button>
            </Group>
          </Stack>
        </Card>
      </SimpleGrid>

      {/* NEW: Role-specific Getting Started section */}
      <Card shadow="md" radius="md" p="xl">
        <Stack gap="md">
          <Group justify="space-between" align="flex-start">
            <Stack gap="xs">
              <Title order={2} size="h3">
                {userRole === 'owner' ? 'Getting Started' : `Welcome, ${getRoleDisplayName(userRole)}!`}
              </Title>
              <Text c="dimmed">
                {userRole === 'owner' 
                  ? "Welcome to your Healthcare Forms dashboard! Here's how to get started:"
                  : userRole === 'manager'
                  ? "As a manager, you can create forms and manage submissions. Here's what you can do:"
                  : "As a staff member, you can fill out forms and view your submissions. Here's how to get started:"
                }
              </Text>
            </Stack>
            <ThemeIcon size={40} radius="md" color="blue">
              <IconSettings size={20} />
            </ThemeIcon>
          </Group>

          <Divider />

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            {/* NEW: Role-specific content */}
            {userRole === 'owner' && (
              <>
                <Stack gap="sm">
                  <Text fw={500}>1. Invite Your Team</Text>
                  <Text size="sm" c="dimmed">
                    Add your staff members and assign appropriate roles. Owners can 
                    manage everything, managers can create forms, and staff can fill them out.
                  </Text>
                </Stack>

                <Stack gap="sm">
                  <Text fw={500}>2. Create Your First Form</Text>
                  <Text size="sm" c="dimmed">
                    Start by creating a custom form for your facility. Choose from 
                    templates like incident reports or patient assessments.
                  </Text>
                </Stack>

                <Stack gap="sm">
                  <Text fw={500}>3. Configure Settings</Text>
                  <Text size="sm" c="dimmed">
                    Set up your facility preferences, notification settings, and 
                    customize form templates to match your workflow.
                  </Text>
                </Stack>

                <Stack gap="sm">
                  <Text fw={500}>4. Monitor Activity</Text>
                  <Text size="sm" c="dimmed">
                    Once your team starts using forms, monitor submissions and 
                    generate reports to track your facility's performance.
                  </Text>
                </Stack>
              </>
            )}

            {userRole === 'manager' && (
              <>
                <Stack gap="sm">
                  <Text fw={500}>1. Create Forms</Text>
                  <Text size="sm" c="dimmed">
                    Design custom forms for your team. Use our drag-and-drop builder 
                    to create incident reports, assessments, and care plans.
                  </Text>
                </Stack>

                <Stack gap="sm">
                  <Text fw={500}>2. Manage Submissions</Text>
                  <Text size="sm" c="dimmed">
                    Review and approve form submissions from your team. Export data 
                    and generate reports for compliance and quality assurance.
                  </Text>
                </Stack>

                <Stack gap="sm">
                  <Text fw={500}>3. Invite Staff Members</Text>
                  <Text size="sm" c="dimmed">
                    Add staff members to your team and assign them to specific forms. 
                    Monitor their progress and provide feedback as needed.
                  </Text>
                </Stack>

                <Stack gap="sm">
                  <Text fw={500}>4. Analyze Data</Text>
                  <Text size="sm" c="dimmed">
                    Use our analytics tools to identify trends, track compliance, 
                    and improve your facility's operations over time.
                  </Text>
                </Stack>
              </>
            )}

            {userRole === 'staff' && (
              <>
                <Stack gap="sm">
                  <Text fw={500}>1. Complete Assigned Forms</Text>
                  <Text size="sm" c="dimmed">
                    Fill out forms assigned to you by your managers. These may include 
                    incident reports, patient assessments, or daily checklists.
                  </Text>
                </Stack>

                <Stack gap="sm">
                  <Text fw={500}>2. Save and Submit</Text>
                  <Text size="sm" c="dimmed">
                    Save your progress as you work and submit completed forms for 
                    review. All your data is automatically encrypted and secure.
                  </Text>
                </Stack>

                <Stack gap="sm">
                  <Text fw={500}>3. View Your History</Text>
                  <Text size="sm" c="dimmed">
                    Track your submitted forms and view feedback from your managers. 
                    Access previous submissions when needed for reference.
                  </Text>
                </Stack>

                <Stack gap="sm">
                  <Text fw={500}>4. Stay Compliant</Text>
                  <Text size="sm" c="dimmed">
                    All forms are designed to meet HIPAA and regulatory requirements. 
                    Follow the prompts to ensure complete and accurate documentation.
                  </Text>
                </Stack>
              </>
            )}
          </SimpleGrid>

          {/* NEW: Role-specific call-to-action buttons */}
          <Group justify="center" mt="md">
            {userRole === 'owner' && (
              <Button size="md" onClick={onTeamManagement}>
                Invite Your First Team Member
              </Button>
            )}
            {userRole === 'manager' && (
              <Button size="md">
                Create Your First Form
              </Button>
            )}
            {userRole === 'staff' && (
              <Button size="md">
                View Available Forms
              </Button>
            )}
          </Group>
        </Stack>
      </Card>
    </Container>
  )
}