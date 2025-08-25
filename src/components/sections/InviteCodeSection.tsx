// src/components/sections/InviteCodeSection.tsx - Updated for URL-based invites
import { useState, useEffect } from "react";
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
  Progress,
  Divider,
  Badge,
  Loader,
  Center,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconHeart,
  IconAlertCircle,
  IconCheck,
  IconKey,
  IconLink,
} from "@tabler/icons-react";
import { validateInviteCode, useInviteCode } from "@/lib/inviteCodes";
import type { InviteCode } from "@/lib/inviteCodes";

interface InviteCodeForm {
  inviteCode: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
}

interface InviteCodeSectionProps {
  onSuccess: () => void;
  onBackClick: () => void;
  initialCode?: string; // NEW: For URL-based invites
}

function getPasswordStrength(password: string) {
  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (password.match(/[a-z]+/)) strength += 25;
  if (password.match(/[A-Z]+/)) strength += 25;
  if (password.match(/[0-9]+/)) strength += 25;
  return strength;
}

export function InviteCodeSection({
  onSuccess,
  onBackClick,
  initialCode,
}: InviteCodeSectionProps) {
  const [step, setStep] = useState<"code" | "details" | "loading">("loading"); // Start with loading
  const [validatedCode, setValidatedCode] = useState<InviteCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const codeForm = useForm({
    initialValues: { code: initialCode || "" },
    validate: {
      code: (val) =>
        val.length !== 8 ? "Invite code must be 8 characters" : null,
    },
  });

  const detailsForm = useForm<Omit<InviteCodeForm, "inviteCode">>({
    initialValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
    },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
      firstName: (val) =>
        val.length < 2 ? "First name must be at least 2 characters" : null,
      lastName: (val) =>
        val.length < 2 ? "Last name must be at least 2 characters" : null,
      password: (val) => {
        if (val.length < 8) return "Password must be at least 8 characters";
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(val)) {
          return "Password must contain uppercase, lowercase, and number";
        }
        return null;
      },
      confirmPassword: (val, values) =>
        val !== values.password ? "Passwords do not match" : null,
    },
  });

  // NEW: Auto-validate code on component mount if initialCode exists
  useEffect(() => {
    const autoValidateCode = async () => {
      if (initialCode) {
        console.log("🔄 Auto-validating invite code from URL:", initialCode);
        try {
          const codeData = await validateInviteCode(initialCode);
          setValidatedCode(codeData);

          // If code has a pre-assigned email, populate it
          if (codeData.email) {
            detailsForm.setFieldValue("email", codeData.email);
          }

          notifications.show({
            title: "Valid invite link!",
            message: `You're invited to join ${codeData.business_name} as ${codeData.role}`,
            color: "green",
          });

          setStep("details");
        } catch (err: any) {
          console.error("❌ Auto-validation failed:", err);
          setError(err.message);
          setStep("code"); // Fall back to manual entry
        }
      } else {
        setStep("code"); // No initial code, show manual entry
      }
    };

    autoValidateCode();
  }, [initialCode]);

  const passwordStrength = getPasswordStrength(detailsForm.values.password);
  const passwordColor =
    passwordStrength === 100
      ? "green"
      : passwordStrength > 50
      ? "yellow"
      : "red";

  const handleValidateCode = async (values: { code: string }) => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Manually validating invite code:", values.code);

      const codeData = await validateInviteCode(values.code);
      setValidatedCode(codeData);

      // If code has a pre-assigned email, populate it
      if (codeData.email) {
        detailsForm.setFieldValue("email", codeData.email);
      }

      notifications.show({
        title: "Valid invite code!",
        message: `You're invited to join ${codeData.business_name} as ${codeData.role}`,
        color: "green",
      });

      setStep("details");
    } catch (err: any) {
      console.error("❌ Code validation failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (
    values: Omit<InviteCodeForm, "inviteCode">
  ) => {
    if (!validatedCode) return;

    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Creating account with invite code...");

      await useInviteCode(validatedCode.code, {
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      });

      notifications.show({
        title: "Welcome to the team!",
        message: `Your account has been created at ${validatedCode.business_name}`,
        color: "green",
      });

      // IMPORTANT: Call onSuccess to trigger app state change
      console.log("✅ Account created successfully, calling onSuccess");
      onSuccess();
    } catch (err: any) {
      console.error("❌ Account creation failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "grape";
      case "manager":
        return "blue";
      case "staff":
        return "green";
      default:
        return "gray";
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "owner":
        return "Full access to manage business, forms, and team";
      case "manager":
        return "Can create and manage forms, view all submissions";
      case "staff":
        return "Can fill out forms and view own submissions";
      default:
        return "Standard user access";
    }
  };

  // NEW: Loading state while auto-validating
  if (step === "loading") {
    return (
      <Container size={500} my={40}>
        <Center>
          <Stack align="center" gap="lg">
            <ThemeIcon size={60} radius="md" color="blue">
              <IconHeart size={30} />
            </ThemeIcon>
            <Stack align="center" gap="xs">
              <Title order={1} ta="center">
                Processing Invite
              </Title>
              <Text ta="center" c="dimmed">
                Validating your invite link...
              </Text>
            </Stack>
            <Loader size="lg" />
          </Stack>
        </Center>
      </Container>
    );
  }

  return (
    <Container size={500} my={40}>
      <Stack align="center" gap="lg">
        <ThemeIcon size={60} radius="md" color="blue">
          <IconHeart size={30} />
        </ThemeIcon>

        <Stack align="center" gap="xs">
          <Title order={1} ta="center">
            Join Healthcare Team
          </Title>
          <Text ta="center" c="dimmed" maw={400}>
            {step === "code"
              ? "Enter your invite code to get started"
              : `Complete your profile for ${validatedCode?.business_name}`}
          </Text>
        </Stack>

        <Card shadow="md" radius="md" p="xl" w="100%">
          {step === "code" && (
            <Stack gap="md">
              <Group justify="center">
                <ThemeIcon size={40} radius="md" color="blue">
                  <IconKey size={20} />
                </ThemeIcon>
              </Group>

              <Title order={2} size="h3" ta="center">
                Enter Invite Code
              </Title>

              {/* NEW: Show URL info if we came from a URL */}
              {initialCode && (
                <Alert
                  color="orange"
                  variant="light"
                  icon={<IconLink size="1rem" />}
                >
                  <Text size="sm">
                    Your invite link appears to be invalid or expired. Please
                    enter your invite code manually below.
                  </Text>
                </Alert>
              )}

              {error && (
                <Alert
                  icon={<IconAlertCircle size="1rem" />}
                  title="Error"
                  color="red"
                >
                  {error}
                </Alert>
              )}

              <form onSubmit={codeForm.onSubmit(handleValidateCode)}>
                <Stack gap="md">
                  <TextInput
                    required
                    label="Invite Code"
                    placeholder="ABCD1234"
                    value={codeForm.values.code}
                    onChange={(event) =>
                      codeForm.setFieldValue(
                        "code",
                        event.currentTarget.value.toUpperCase()
                      )
                    }
                    error={codeForm.errors.code}
                    maxLength={8}
                    size="lg"
                    styles={{
                      input: {
                        textAlign: "center",
                        fontSize: "1.2rem",
                        letterSpacing: "0.1em",
                        fontFamily: "monospace",
                      },
                    }}
                  />

                  <Text size="sm" c="dimmed" ta="center">
                    Enter the 8-character code you received from your team
                    administrator
                  </Text>

                  <Button
                    type="submit"
                    loading={loading}
                    disabled={!codeForm.isValid()}
                    size="lg"
                    fullWidth
                  >
                    Validate Code
                  </Button>

                  <Button variant="outline" onClick={onBackClick} fullWidth>
                    Back to Home
                  </Button>
                </Stack>
              </form>
            </Stack>
          )}

          {step === "details" && validatedCode && (
            <Stack gap="md">
              {/* Code validation success */}
              <Alert
                color="green"
                variant="light"
                icon={<IconCheck size="1rem" />}
              >
                <Stack gap="xs">
                  <Text size="sm" fw={500}>
                    {initialCode
                      ? "Invite link validated!"
                      : "Invite code validated!"}
                  </Text>
                  <Group justify="space-between">
                    <Text size="sm">
                      Business: {validatedCode.business_name}
                    </Text>
                    <Badge
                      variant="light"
                      color={getRoleBadgeColor(validatedCode.role)}
                    >
                      {validatedCode.role.toUpperCase()}
                    </Badge>
                  </Group>
                  <Text size="xs" c="dimmed">
                    {getRoleDescription(validatedCode.role)}
                  </Text>
                </Stack>
              </Alert>

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

              <form onSubmit={detailsForm.onSubmit(handleCreateAccount)}>
                <Stack gap="md">
                  <Title order={3} size="h4">
                    Create Your Account
                  </Title>

                  <Group grow>
                    <TextInput
                      required
                      label="First Name"
                      placeholder="John"
                      value={detailsForm.values.firstName}
                      onChange={(event) =>
                        detailsForm.setFieldValue(
                          "firstName",
                          event.currentTarget.value
                        )
                      }
                      error={detailsForm.errors.firstName}
                      disabled={loading}
                    />

                    <TextInput
                      required
                      label="Last Name"
                      placeholder="Doe"
                      value={detailsForm.values.lastName}
                      onChange={(event) =>
                        detailsForm.setFieldValue(
                          "lastName",
                          event.currentTarget.value
                        )
                      }
                      error={detailsForm.errors.lastName}
                      disabled={loading}
                    />
                  </Group>

                  <TextInput
                    required
                    label="Email Address"
                    placeholder="john.doe@email.com"
                    value={detailsForm.values.email}
                    onChange={(event) =>
                      detailsForm.setFieldValue(
                        "email",
                        event.currentTarget.value
                      )
                    }
                    error={detailsForm.errors.email}
                    disabled={loading || !!validatedCode.email} // Disable if email is pre-assigned
                  />

                  {validatedCode.email && (
                    <Text size="sm" c="dimmed">
                      Email is pre-assigned for this invite code
                    </Text>
                  )}

                  <PasswordInput
                    required
                    label="Password"
                    placeholder="Create a secure password"
                    value={detailsForm.values.password}
                    onChange={(event) =>
                      detailsForm.setFieldValue(
                        "password",
                        event.currentTarget.value
                      )
                    }
                    error={detailsForm.errors.password}
                    disabled={loading}
                  />

                  {detailsForm.values.password && (
                    <Stack gap="xs">
                      <Text size="sm" c="dimmed">
                        Password strength:
                      </Text>
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
                    value={detailsForm.values.confirmPassword}
                    onChange={(event) =>
                      detailsForm.setFieldValue(
                        "confirmPassword",
                        event.currentTarget.value
                      )
                    }
                    error={detailsForm.errors.confirmPassword}
                    disabled={loading}
                  />

                  <Group justify="space-between" gap="md">
                    <Button
                      variant="outline"
                      onClick={() => setStep("code")}
                      disabled={loading}
                    >
                      Back
                    </Button>

                    <Button
                      type="submit"
                      loading={loading}
                      disabled={!detailsForm.isValid()}
                      style={{ flex: 1 }}
                    >
                      Create Account
                    </Button>
                  </Group>
                </Stack>
              </form>
            </Stack>
          )}
        </Card>

        <Text c="dimmed" size="xs" ta="center" maw={400}>
          Your data is encrypted and HIPAA compliant. Invite links and codes
          ensure secure team access.
        </Text>
      </Stack>
    </Container>
  );
}
