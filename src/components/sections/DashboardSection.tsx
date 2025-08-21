// src/components/sections/DashboardSection.tsx
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
  IconEye
} from '@tabler/icons-react'

interface DashboardSectionProps {
  onSignOut: () => void
  userEmail?: string
  businessName?: string
}

export function DashboardSection({ 
  onSignOut, 
  userEmail, 
  businessName 
}: DashboardSectionProps) {
  return (
    <Container size="lg" py={40}>
      {/* Header */}
      <Group justify="space-between" mb="xl">
        <Stack gap="xs">
          <Group align="center" gap="sm">
            <IconHeart size={32} color="var(--mantine-color-blue-6)" />
            <Title order={1}>Dashboard</Title>
          </Group>
          <Text c="dimmed">
            Welcome back, {userEmail} {businessName && `• ${businessName}`}
          </Text>
        </Stack>
        <Group gap="md">
          <Badge variant="light" color="green">Free Tier</Badge>
          <Button variant="outline" onClick={onSignOut}>
            Sign Out
          </Button>
        </Group>
      </Group>

      {/* Quick Stats */}
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

      {/* Main Actions */}
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg" mb="xl">
        <Card shadow="sm" radius="md" p="lg">
          <Stack gap="md">
            <ThemeIcon size={40} radius="md" color="blue">
              <IconForms size={20} />
            </ThemeIcon>
            <Title order={3} size="h4">Forms</Title>
            <Text c="dimmed">
              Create and manage your custom forms. Build incident reports, 
              assessments, and care documentation.
            </Text>
            <Group gap="sm">
              <Button leftSection={<IconPlus size={16} />} variant="light" size="sm">
                Create Form
              </Button>
              <Button leftSection={<IconEye size={16} />} variant="outline" size="sm">
                View All
              </Button>
            </Group>
          </Stack>
        </Card>

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
              <Button leftSection={<IconPlus size={16} />} variant="light" size="sm">
                Invite User
              </Button>
              <Button leftSection={<IconEye size={16} />} variant="outline" size="sm">
                Manage Team
              </Button>
            </Group>
          </Stack>
        </Card>

        <Card shadow="sm" radius="md" p="lg">
          <Stack gap="md">
            <ThemeIcon size={40} radius="md" color="orange">
              <IconChartBar size={20} />
            </ThemeIcon>
            <Title order={3} size="h4">Reports</Title>
            <Text c="dimmed">
              View analytics and generate reports. Track form submissions 
              and facility performance metrics.
            </Text>
            <Group gap="sm">
              <Button leftSection={<IconPlus size={16} />} variant="light" size="sm">
                New Report
              </Button>
              <Button leftSection={<IconEye size={16} />} variant="outline" size="sm">
                View Reports
              </Button>
            </Group>
          </Stack>
        </Card>
      </SimpleGrid>

      {/* Getting Started */}
      <Card shadow="md" radius="md" p="xl">
        <Stack gap="md">
          <Group justify="space-between" align="flex-start">
            <Stack gap="xs">
              <Title order={2} size="h3">Getting Started</Title>
              <Text c="dimmed">
                Welcome to your Healthcare Forms dashboard! Here&#39;s how to get started:
              </Text>
            </Stack>
            <ThemeIcon size={40} radius="md" color="blue">
              <IconSettings size={20} />
            </ThemeIcon>
          </Group>

          <Divider />

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            <Stack gap="sm">
              <Text fw={500}>1. Create Your First Form</Text>
              <Text size="sm" c="dimmed">
                Start by creating a custom form for your facility. Choose from 
                templates like incident reports or patient assessments.
              </Text>
            </Stack>

            <Stack gap="sm">
              <Text fw={500}>2. Invite Your Team</Text>
              <Text size="sm" c="dimmed">
                Add your staff members and assign appropriate roles. Owners can 
                manage everything, managers can create forms, and staff can fill them out.
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
              <Text fw={500}>4. Start Collecting Data</Text>
              <Text size="sm" c="dimmed">
                Once your forms are ready, your team can start submitting data. 
                All submissions are automatically encrypted and HIPAA compliant.
              </Text>
            </Stack>
          </SimpleGrid>

          <Group justify="center" mt="md">
            <Button size="md">
              Create Your First Form
            </Button>
          </Group>
        </Stack>
      </Card>
    </Container>
  )
}