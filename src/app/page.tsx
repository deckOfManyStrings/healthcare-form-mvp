// src/app/page.tsx
import Link from 'next/link'
import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Grid,
  Card,
  List,
  ThemeIcon,
  Center,
  Group,
  Badge,
  Box
} from '@mantine/core'
import {
  IconHeart,
  IconShield,
  IconForms,
  IconUsers,
  IconChartBar,
  IconCheck,
  IconCloudLock,
  IconDeviceTablet
} from '@tabler/icons-react'

export default function LandingPage() {
  return (
    <Box>
      {/* Hero Section */}
      <Container size="lg" py={80}>
        <Center mb="xl">
          <Stack align="center" gap="md">
            <IconHeart size={64} color="var(--mantine-color-blue-6)" />
            <Badge size="lg" variant="light" color="blue">
              HIPAA Compliant
            </Badge>
          </Stack>
        </Center>

        <Stack align="center" gap="lg" mb={60}>
          <Title
            order={1}
            size={48}
            fw={900}
            ta="center"
            c="blue"
          >
            Healthcare Forms Platform
          </Title>
          
          <Text
            size="xl"
            ta="center"
            c="dimmed"
            maw={600}
          >
            Streamline your healthcare facility's form management with our 
            HIPAA-compliant platform. Create custom forms, collect submissions, 
            and maintain secure records - all in one place.
          </Text>

          <Group justify="center" gap="md">
            <Button
              component={Link}
              href="/auth/register"
              size="lg"
              radius="md"
            >
              Start Free Trial
            </Button>
            <Button
              component={Link}
              href="/auth/login"
              variant="outline"
              size="lg"
              radius="md"
            >
              Sign In
            </Button>
          </Group>

          <Text size="sm" c="dimmed">
            ✨ Free tier includes up to 5 users and 100 form submissions per month
          </Text>
        </Stack>

        {/* Features Grid */}
        <Grid gutter="lg" mb={80}>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card shadow="sm" radius="md" h="100%" p="lg">
              <Stack align="center" gap="md">
                <ThemeIcon size={60} radius="md" color="blue">
                  <IconShield size={30} />
                </ThemeIcon>
                <Title order={3} size="h4" ta="center">
                  HIPAA Compliant
                </Title>
                <Text ta="center" c="dimmed">
                  End-to-end encryption, audit logging, and secure data handling 
                  to meet all HIPAA requirements for healthcare data.
                </Text>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card shadow="sm" radius="md" h="100%" p="lg">
              <Stack align="center" gap="md">
                <ThemeIcon size={60} radius="md" color="green">
                  <IconForms size={30} />
                </ThemeIcon>
                <Title order={3} size="h4" ta="center">
                  Custom Forms
                </Title>
                <Text ta="center" c="dimmed">
                  Build custom forms with drag-and-drop interface. Include 
                  signatures, file uploads, and conditional logic.
                </Text>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card shadow="sm" radius="md" h="100%" p="lg">
              <Stack align="center" gap="md">
                <ThemeIcon size={60} radius="md" color="orange">
                  <IconUsers size={30} />
                </ThemeIcon>
                <Title order={3} size="h4" ta="center">
                  Team Management
                </Title>
                <Text ta="center" c="dimmed">
                  Invite staff members with role-based permissions. Owners, 
                  managers, and staff have different access levels.
                </Text>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card shadow="sm" radius="md" h="100%" p="lg">
              <Stack align="center" gap="md">
                <ThemeIcon size={60} radius="md" color="violet">
                  <IconChartBar size={30} />
                </ThemeIcon>
                <Title order={3} size="h4" ta="center">
                  Analytics & Reports
                </Title>
                <Text ta="center" c="dimmed">
                  Generate PDF reports, track form submissions, and analyze 
                  trends to improve your facility's operations.
                </Text>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card shadow="sm" radius="md" h="100%" p="lg">
              <Stack align="center" gap="md">
                <ThemeIcon size={60} radius="md" color="teal">
                  <IconCloudLock size={30} />
                </ThemeIcon>
                <Title order={3} size="h4" ta="center">
                  Secure Cloud Storage
                </Title>
                <Text ta="center" c="dimmed">
                  All data is encrypted at rest and in transit. Regular backups 
                  ensure your data is always safe and accessible.
                </Text>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card shadow="sm" radius="md" h="100%" p="lg">
              <Stack align="center" gap="md">
                <ThemeIcon size={60} radius="md" color="red">
                  <IconDeviceTablet size={30} />
                </ThemeIcon>
                <Title order={3} size="h4" ta="center">
                  Mobile Friendly
                </Title>
                <Text ta="center" c="dimmed">
                  Access and fill forms on any device. Responsive design works 
                  perfectly on tablets, phones, and desktop computers.
                </Text>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Benefits Section */}
        <Card shadow="md" radius="md" p="xl" mb={80}>
          <Grid align="center">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="md">
                <Title order={2} size="h3">
                  Perfect for Healthcare Facilities
                </Title>
                <Text c="dimmed">
                  Whether you run a small clinic, nursing home, or large hospital, 
                  our platform scales with your needs while maintaining the highest 
                  security standards.
                </Text>
                
                <List
                  spacing="sm"
                  size="md"
                  icon={
                    <ThemeIcon size={20} radius="xl" color="green">
                      <IconCheck size={12} />
                    </ThemeIcon>
                  }
                >
                  <List.Item>Incident reporting and tracking</List.Item>
                  <List.Item>Patient assessment forms</List.Item>
                  <List.Item>Staff scheduling and notes</List.Item>
                  <List.Item>Medication administration records</List.Item>
                  <List.Item>Quality assurance checklists</List.Item>
                  <List.Item>Regulatory compliance documentation</List.Item>
                </List>
              </Stack>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Box ta="center">
                <Title order={3} c="blue" mb="md">
                  Start Your Free Trial Today
                </Title>
                <Text mb="lg">
                  No credit card required. Set up your account in minutes.
                </Text>
                <Button
                  component={Link}
                  href="/auth/register"
                  size="xl"
                  radius="md"
                  w={250}
                >
                  Get Started Free
                </Button>
              </Box>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Footer */}
        <Stack align="center" gap="xs">
          <Text size="sm" c="dimmed" ta="center">
            Trusted by healthcare facilities nationwide for secure, compliant form management.
          </Text>
          <Text size="xs" c="dimmed" ta="center">
            © 2025 Healthcare Forms Platform. All rights reserved. 
            This platform meets all HIPAA compliance requirements.
          </Text>
        </Stack>
      </Container>
    </Box>
  )
}