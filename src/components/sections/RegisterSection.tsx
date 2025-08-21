// src/components/sections/RegisterSection.tsx
import {
  Container,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Anchor,
  Stack,
  Alert,
  Center,
  Group,
  Progress
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconAlertCircle, IconHeart } from '@tabler/icons-react'

interface RegisterForm {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

interface RegisterSectionProps {
  onSubmit: (values: RegisterForm) => void
  onLoginClick: () => void
  onBackClick: () => void
  loading: boolean
  error: string | null
}

function getPasswordStrength(password: string) {
  let strength = 0
  if (password.length >= 8) strength += 25
  if (password.match(/[a-z]+/)) strength += 25
  if (password.match(/[A-Z]+/)) strength += 25
  if (password.match(/[0-9]+/)) strength += 25
  
  return strength
}

export function RegisterSection({ 
  onSubmit, 
  onLoginClick, 
  onBackClick, 
  loading, 
  error 
}: RegisterSectionProps) {
  const form = useForm<RegisterForm>({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      firstName: (val) => (val.length < 2 ? 'First name must be at least 2 characters' : null),
      lastName: (val) => (val.length < 2 ? 'Last name must be at least 2 characters' : null),
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
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

  return (
    <Container size={460} my={40}>
      <Center mb="xl">
        <Stack align="center" gap="xs">
          <IconHeart size={48} color="var(--mantine-color-blue-6)" />
          <Title order={1} size="h2">Healthcare Forms</Title>
          <Text c="dimmed" size="sm">Create your HIPAA-compliant account</Text>
        </Stack>
      </Center>

      <Paper radius="md" p="xl" withBorder>
        <Title order={2} size="h3" mb="md">
          Create your account
        </Title>

        {error && (
          <Alert 
            icon={<IconAlertCircle size="1rem" />} 
            title="Registration Error" 
            color="red" 
            mb="md"
          >
            {error}
          </Alert>
        )}

        <form onSubmit={form.onSubmit(onSubmit)}>
          <Stack gap="md">
            <Group grow>
              <TextInput
                required
                label="First Name"
                placeholder="John"
                value={form.values.firstName}
                onChange={(event) => form.setFieldValue('firstName', event.currentTarget.value)}
                error={form.errors.firstName}
                radius="md"
              />

              <TextInput
                required
                label="Last Name"
                placeholder="Doe"
                value={form.values.lastName}
                onChange={(event) => form.setFieldValue('lastName', event.currentTarget.value)}
                error={form.errors.lastName}
                radius="md"
              />
            </Group>

            <TextInput
              required
              label="Email"
              placeholder="john@healthcare.com"
              value={form.values.email}
              onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
              error={form.errors.email}
              radius="md"
            />

            <PasswordInput
              required
              label="Password"
              placeholder="Create a strong password"
              value={form.values.password}
              onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
              error={form.errors.password}
              radius="md"
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
              radius="md"
            />

            <Button 
              type="submit" 
              radius="md" 
              loading={loading}
              disabled={!form.isValid()}
              size="md"
            >
              Create Account
            </Button>
          </Stack>
        </form>

        <Text c="dimmed" size="sm" ta="center" mt="md">
          Already have an account?{' '}
          <Anchor onClick={onLoginClick} size="sm" style={{ cursor: 'pointer' }}>
            Sign in
          </Anchor>
        </Text>

        <Text c="dimmed" size="sm" ta="center" mt="xs">
          <Anchor onClick={onBackClick} size="sm" style={{ cursor: 'pointer' }}>
            Back to home
          </Anchor>
        </Text>
      </Paper>

      <Text c="dimmed" size="xs" ta="center" mt="xl">
        This platform is HIPAA compliant and uses end-to-end encryption 
        to protect your healthcare data.
      </Text>
    </Container>
  )
}