// src/components/sections/LandingSection.tsx
import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Box,
  SimpleGrid,
  Card,
  ThemeIcon,
  Badge,
  Group,
} from '@mantine/core'
import {
  IconHeart,
  IconShield,
  IconForms,
  IconUsers,
  IconChartBar,
  IconCloudLock,
  IconCheck,
} from '@tabler/icons-react'

interface LandingSectionProps {
  onLoginClick: () => void
  onRegisterClick: () => void
}

export function LandingSection({ onLoginClick, onRegisterClick }: LandingSectionProps) {
  return (
    <Container size="lg" py={80}>
      <Stack align="center" gap="lg">
        <Stack align="center" gap="md">
          <IconHeart size={48} color="var(--mantine-color-blue-6)" />
          <Badge size="lg" variant="light" color="blue">
            HIPAA Compliant
          </Badge>
        </Stack>
        
        <Title order={1} size={48} fw={900} ta="center" c="blue">
          Healthcare Forms Platform
        </Title>
        
        <Text size="xl" ta="center" c="dimmed" maw={600}>
          Streamline your healthcare facility&#39;s form management with our 
          HIPAA-compliant platform. Create custom forms, collect submissions, 
          and maintain secure records - all in one place.
        </Text>

        <Group justify="center" gap="md">
          <Button onClick={onRegisterClick} size="lg">
            Start Free Trial
          </Button>
          <Button onClick={onLoginClick} variant="outline" size="lg">
            Sign In
          </Button>
        </Group>

        <Text size="sm" c="dimmed">
          ✨ Free tier includes up to 5 users and 100 form submissions per month
        </Text>
      </Stack>

      {/* Features Grid */}
      <Box mt={80}>
        <Title order={2} ta="center" mb="xl">Key Features</Title>
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
          <Card shadow="sm" radius="md" p="lg" h="100%">
            <Stack align="center" gap="md">
              <ThemeIcon size={60} radius="md" color="blue">
                <IconShield size={30} />
              </ThemeIcon>
              <Title order={3} size="h4" ta="center">HIPAA Compliant</Title>
              <Text ta="center" c="dimmed">
                End-to-end encryption, audit logging, and secure data handling 
                to meet all HIPAA requirements for healthcare data.
              </Text>
            </Stack>
          </Card>
          <Card shadow="sm" radius="md" p="lg" h="100%">
            <Stack align="center" gap="md">
              <ThemeIcon size={60} radius="md" color="green">
                <IconForms size={30} />
              </ThemeIcon>
              <Title order={3} size="h4" ta="center">Custom Forms</Title>
              <Text ta="center" c="dimmed">
                Build custom forms with drag-and-drop interface. Include 
                signatures, file uploads, and conditional logic.
              </Text>
            </Stack>
          </Card>
          <Card shadow="sm" radius="md" p="lg" h="100%">
            <Stack align="center" gap="md">
              <ThemeIcon size={60} radius="md" color="orange">
                <IconUsers size={30} />
              </ThemeIcon>
              <Title order={3} size="h4" ta="center">Team Management</Title>
              <Text ta="center" c="dimmed">
                Invite staff members with role-based permissions. Owners, 
                managers, and staff have different access levels.
              </Text>
            </Stack>
          </Card>
          <Card shadow="sm" radius="md" p="lg" h="100%">
            <Stack align="center" gap="md">
              <ThemeIcon size={60} radius="md" color="violet">
                <IconChartBar size={30} />
              </ThemeIcon>
              <Title order={3} size="h4" ta="center">Analytics & Reports</Title>
              <Text ta="center" c="dimmed">
                Generate PDF reports, track form submissions, and analyze 
                trends to improve your facility&#39;s operations.
              </Text>
            </Stack>
          </Card>
          <Card shadow="sm" radius="md" p="lg" h="100%">
            <Stack align="center" gap="md">
              <ThemeIcon size={60} radius="md" color="teal">
                <IconCloudLock size={30} />
              </ThemeIcon>
              <Title order={3} size="h4" ta="center">Secure Cloud Storage</Title>
              <Text ta="center" c="dimmed">
                All data is encrypted at rest and in transit. Regular backups 
                ensure your data is always safe and accessible.
              </Text>
            </Stack>
          </Card>
          <Card shadow="sm" radius="md" p="lg" h="100%">
            <Stack align="center" gap="md">
              <ThemeIcon size={60} radius="md" color="red">
                <IconHeart size={30} />
              </ThemeIcon>
              <Title order={3} size="h4" ta="center">Healthcare Focused</Title>
              <Text ta="center" c="dimmed">
                Built specifically for healthcare facilities with templates 
                for incident reports, assessments, and care documentation.
              </Text>
            </Stack>
          </Card>
        </SimpleGrid>
      </Box>

      {/* Benefits Section */}
      <Card shadow="md" radius="md" p="xl" mt={80} mb={40}>
        <Stack gap="md" align="center">
          <Title order={2} size="h3" ta="center">
            Perfect for Healthcare Facilities
          </Title>
          <Text c="dimmed" ta="center" maw={800}>
            Whether you run a small clinic, nursing home, or large hospital, 
            our platform scales with your needs while maintaining the highest 
            security standards.
          </Text>
          
          <Stack gap="sm" maw={600} align="flex-start">
            <Group gap="sm">
              <ThemeIcon size={20} radius="xl" color="green">
                <IconCheck size={12} />
              </ThemeIcon>
              <Text>Incident reporting and tracking</Text>
            </Group>
            <Group gap="sm">
              <ThemeIcon size={20} radius="xl" color="green">
                <IconCheck size={12} />
              </ThemeIcon>
              <Text>Patient assessment forms</Text>
            </Group>
            <Group gap="sm">
              <ThemeIcon size={20} radius="xl" color="green">
                <IconCheck size={12} />
              </ThemeIcon>
              <Text>Staff scheduling and notes</Text>
            </Group>
            <Group gap="sm">
              <ThemeIcon size={20} radius="xl" color="green">
                <IconCheck size={12} />
              </ThemeIcon>
              <Text>Medication administration records</Text>
            </Group>
            <Group gap="sm">
              <ThemeIcon size={20} radius="xl" color="green">
                <IconCheck size={12} />
              </ThemeIcon>
              <Text>Quality assurance checklists</Text>
            </Group>
            <Group gap="sm">
              <ThemeIcon size={20} radius="xl" color="green">
                <IconCheck size={12} />
              </ThemeIcon>
              <Text>Regulatory compliance documentation</Text>
            </Group>
          </Stack>

          <Box ta="center" mt="xl">
            <Title order={3} c="blue" mb="md">
              Start Your Free Trial Today
            </Title>
            <Text mb="lg">
              No credit card required. Set up your account in minutes.
            </Text>
            <Button onClick={onRegisterClick} size="xl" w={250}>
              Get Started Free
            </Button>
          </Box>
        </Stack>
      </Card>
    </Container>
  )
}