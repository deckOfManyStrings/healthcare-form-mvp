// src/components/sections/LoginSection.tsx
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
  Center
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconAlertCircle, IconHeart } from '@tabler/icons-react'

interface LoginForm {
  email: string
  password: string
}

interface LoginSectionProps {
  onSubmit: (values: LoginForm) => void
  onRegisterClick: () => void
  onBackClick: () => void
  loading: boolean
  error: string | null
}

export function LoginSection({ 
  onSubmit, 
  onRegisterClick, 
  onBackClick, 
  loading, 
  error 
}: LoginSectionProps) {
  const form = useForm<LoginForm>({
    initialValues: { email: '', password: '' },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      password: (val) => (val.length < 6 ? 'Password should include at least 6 characters' : null),
    },
  })

  return (
    <Container size={420} my={40}>
      <Center mb="xl">
        <Stack align="center" gap="xs">
          <IconHeart size={48} color="var(--mantine-color-blue-6)" />
          <Title order={1} size="h2">Healthcare Forms</Title>
          <Text c="dimmed" size="sm">HIPAA-Compliant Form Management</Text>
        </Stack>
      </Center>

      <Paper radius="md" p="xl" withBorder>
        <Title order={2} size="h3" mb="md">
          Welcome back
        </Title>

        {error && (
          <Alert 
            icon={<IconAlertCircle size="1rem" />} 
            title="Login Error" 
            color="red" 
            mb="md"
          >
            {error}
          </Alert>
        )}

        <form onSubmit={form.onSubmit(onSubmit)}>
          <Stack>
            <TextInput
              required
              label="Email"
              placeholder="your@email.com"
              value={form.values.email}
              onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
              error={form.errors.email}
              radius="md"
            />

            <PasswordInput
              required
              label="Password"
              placeholder="Your password"
              value={form.values.password}
              onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
              error={form.errors.password}
              radius="md"
            />

            <Button 
              type="submit" 
              radius="md" 
              loading={loading}
              disabled={!form.isValid()}
            >
              Sign in
            </Button>
          </Stack>
        </form>

        <Text c="dimmed" size="sm" ta="center" mt="md">
          Don&apos;t have an account yet?{' '}
          <Anchor onClick={onRegisterClick} size="sm" style={{ cursor: 'pointer' }}>
            Create account
          </Anchor>
        </Text>

        <Text c="dimmed" size="sm" ta="center" mt="xs">
          <Anchor onClick={onBackClick} size="sm" style={{ cursor: 'pointer' }}>
            Back to home
          </Anchor>
        </Text>
      </Paper>
    </Container>
  )
}