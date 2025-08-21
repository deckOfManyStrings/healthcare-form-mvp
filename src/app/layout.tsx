import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/dropzone/styles.css';

import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { theme } from '../lib/theme';

export const metadata = {
  title: 'Healthcare Forms Platform',
  description: 'HIPAA-compliant form management for healthcare facilities',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
      </head>
      <body suppressHydrationWarning>
        <MantineProvider theme={theme}>
          <Notifications />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}