import { Button, Container, Title, Text } from '@mantine/core';

export default function Home() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  return (
    <Container py={40}>
      <Title>Healthcare Forms Platform</Title>
      <Text c="dimmed" mb="md">Phase 1 Test</Text>
      <Button color="blue">Mantine Button Works!</Button>
      <Text mt="md" size="sm">
        Supabase URL: {supabaseUrl ? '✅ Connected' : '❌ Not found'}
      </Text>
    </Container>
  );
}