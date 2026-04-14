import { Container, Divider, Group, Skeleton, Stack } from '@mantine/core'

/**
 * Loading skeleton for Profile page
 *
 * Matches the layout of ProfileView:
 * - Icon + Title header
 * - User info card
 * - Link Telegram button
 * - Investment profile form
 */
export default function ProfileLoading() {
  return (
    <Container size="md" py="xl" role="status" aria-live="polite">
      <Stack gap="lg">
        {/* Header: Icon + Title */}
        <Group align="center" gap="md">
          <Skeleton height={32} width={32} circle />
          <Skeleton height={32} width={150} />
        </Group>

        {/* User info card skeleton */}
        <Skeleton height={120} radius="md" />

        {/* Link Telegram button skeleton */}
        <Skeleton height={36} width={180} radius="md" />

        <Divider />

        {/* Investment profile form skeleton */}
        <Stack gap="md">
          <Skeleton height={28} width={200} />
          <Skeleton height={320} radius="md" />
        </Stack>

        {/* Version text skeleton */}
        <Skeleton height={16} width={100} mx="auto" />
      </Stack>
    </Container>
  )
}
