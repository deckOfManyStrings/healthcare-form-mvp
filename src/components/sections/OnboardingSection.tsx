import { useEffect, useState } from 'react'
import {
  Container,
  Card,
  TextInput,
  Textarea,
  Button,
  Title,
  Text,
  Stack,
  Alert,
  Group,
  Select,
  Progress
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconHeart, IconAlertCircle } from '@tabler/icons-react'

interface BusinessForm {
  businessName: string
  businessType: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  description: string
}

interface OnboardingSectionProps {
  onSubmit: (values: BusinessForm) => void
  onSignOut: () => void
  loading: boolean
  error: string | null
  userEmail?: string
}

const businessTypes = [
  'Hospital',
  'Clinic',
  'Nursing Home',
  'Assisted Living',
  'Home Health Agency',
  'Physical Therapy',
  'Mental Health Facility',
  'Dental Office',
  'Other Healthcare Facility'
]

const states = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

export function OnboardingSection({ 
  onSubmit, 
  onSignOut, 
  loading, 
  error,
  userEmail 
}: OnboardingSectionProps) {
  const form = useForm<BusinessForm>({
    initialValues: {
      businessName: '',
      businessType: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      description: '',
    },
    validate: {
      businessName: (val) => (val.length < 2 ? 'Business name must be at least 2 characters' : null),
      businessType: (val) => (!val ? 'Please select a business type' : null),
      phone: (val) => {
        const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
        return !phoneRegex.test(val) ? 'Please enter a valid phone number' : null
      },
      address: (val) => (val.length < 5 ? 'Please enter a valid address' : null),
      city: (val) => (val.length < 2 ? 'Please enter a valid city' : null),
      state: (val) => (!val ? 'Please select a state' : null),
      zipCode: (val) => {
        const zipRegex = /^\d{5}(-\d{4})?$/
        return !zipRegex.test(val) ? 'Please enter a valid ZIP code' : null
      },
    },
  })

  // Calculate completion percentage (excluding optional description field)
  const requiredFields = [
    'businessName', 'businessType', 'phone', 'address', 'city', 'state', 'zipCode'
  ]
  const completedRequiredFields = requiredFields.filter(field => 
    form.values[field as keyof BusinessForm]?.trim() !== ''
  ).length
  const completionPercentage = Math.round((completedRequiredFields / requiredFields.length) * 100)

  // Force re-render when form values change for progress bar updates
  const [, forceUpdate] = useState({})
  useEffect(() => {
    forceUpdate({})
  }, [form.values])

  return (
    <Container size={800} my={40}>
      <Stack align="center" gap="lg">
        <IconHeart size={48} color="var(--mantine-color-blue-6)" />
        <Title order={1} ta="center">Welcome to Healthcare Forms!</Title>
        <Text ta="center" c="dimmed" maw={600}>
          Let&#39;s set up your healthcare facility. This information will help us 
          customize your experience and ensure HIPAA compliance.
        </Text>
        
        <Card shadow="md" radius="md" p="xl" w="100%">
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Title order={2} size="h3">Business Setup</Title>
              <Text size="sm" c="dimmed">
                Signed in as: {userEmail}
              </Text>
            </Group>

            {/* Progress indicator */}
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" fw={500}>Profile Completion</Text>
                <Text size="sm" c="dimmed">{completionPercentage}%</Text>
              </Group>
              <Progress value={completionPercentage} color="blue" size="sm" radius="md" />
            </Stack>

            {error && (
              <Alert 
                icon={<IconAlertCircle size="1rem" />} 
                title="Setup Error" 
                color="red"
              >
                {error}
              </Alert>
            )}

            <form onSubmit={form.onSubmit(onSubmit)}>
              <Stack gap="md">
                {/* Business Information */}
                <Title order={3} size="h4" mt="md">Business Information</Title>
                
                <Group grow>
                  <TextInput
                    required
                    label="Business/Facility Name"
                    placeholder="Sunshine Healthcare Center"
                    value={form.values.businessName}
                    onChange={(event) => form.setFieldValue('businessName', event.currentTarget.value)}
                    error={form.errors.businessName}
                    radius="md"
                  />

                  <Select
                    required
                    label="Facility Type"
                    placeholder="Select type"
                    data={businessTypes}
                    value={form.values.businessType}
                    onChange={(value) => form.setFieldValue('businessType', value || '')}
                    error={form.errors.businessType}
                    radius="md"
                  />
                </Group>

                <TextInput
                  required
                  label="Phone Number"
                  placeholder="(555) 123-4567"
                  value={form.values.phone}
                  onChange={(event) => form.setFieldValue('phone', event.currentTarget.value)}
                  onBlur={() => form.validate()} // Trigger validation on blur for progress update
                  error={form.errors.phone}
                  radius="md"
                />

                {/* Address Information */}
                <Title order={3} size="h4" mt="md">Address</Title>
                
                <TextInput
                  required
                  label="Street Address"
                  placeholder="123 Main Street"
                  value={form.values.address}
                  onChange={(event) => form.setFieldValue('address', event.currentTarget.value)}
                  error={form.errors.address}
                  radius="md"
                />

                <Group grow>
                  <TextInput
                    required
                    label="City"
                    placeholder="Springfield"
                    value={form.values.city}
                    onChange={(event) => form.setFieldValue('city', event.currentTarget.value)}
                    onBlur={() => form.validate()} // Trigger validation on blur for progress update
                    error={form.errors.city}
                    radius="md"
                  />

                  <Select
                    required
                    label="State"
                    placeholder="Select state"
                    data={states}
                    value={form.values.state}
                    onChange={(value) => {
                      form.setFieldValue('state', value || '')
                      form.validate() // Trigger validation for progress update
                    }}
                    error={form.errors.state}
                    radius="md"
                    searchable
                  />

                  <TextInput
                    required
                    label="ZIP Code"
                    placeholder="12345"
                    value={form.values.zipCode}
                    onChange={(event) => form.setFieldValue('zipCode', event.currentTarget.value)}
                    onBlur={() => form.validate()} // Trigger validation on blur for progress update
                    error={form.errors.zipCode}
                    radius="md"
                  />
                </Group>

                <Textarea
                  label="Description (Optional)"
                  placeholder="Brief description of your facility and services..."
                  value={form.values.description}
                  onChange={(event) => form.setFieldValue('description', event.currentTarget.value)}
                  error={form.errors.description}
                  radius="md"
                  minRows={3}
                  maxRows={5}
                />

                <Group justify="space-between" mt="xl">
                  <Button variant="outline" onClick={onSignOut}>
                    Sign Out
                  </Button>
                  <Button 
                    type="submit" 
                    loading={loading}
                    disabled={!form.isValid()}
                    size="md"
                  >
                    Complete Setup
                  </Button>
                </Group>
              </Stack>
            </form>
          </Stack>
        </Card>

        <Text c="dimmed" size="xs" ta="center" maw={600}>
          Your information is encrypted and secure. We use this data only to 
          customize your experience and ensure HIPAA compliance requirements.
        </Text>
      </Stack>
    </Container>
  )
}