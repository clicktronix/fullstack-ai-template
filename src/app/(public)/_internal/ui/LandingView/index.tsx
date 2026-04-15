'use client'

import type { MantineColor } from '@mantine/core'
import {
  Container,
  Stack,
  Button,
  SimpleGrid,
  Paper,
  Box,
  Group,
  Anchor,
  ThemeIcon,
} from '@mantine/core'
import {
  IconUsers,
  IconBrain,
  IconLayoutKanban,
  IconChartBar,
  IconArrowRight,
} from '@tabler/icons-react'
import Link from 'next/link'
import { TranslationText } from '@/ui/components/TranslationText'
import { TranslationTitle } from '@/ui/components/TranslationTitle'
import messages from './messages.json'
import styles from './styles.module.css'

type FeatureItem = {
  titleMessage: (typeof messages)['featureSliceTitle']
  descriptionMessage: (typeof messages)['featureSliceDescription']
  icon: React.ReactNode
  color: MantineColor
}

const features: FeatureItem[] = [
  {
    titleMessage: messages.featureSliceTitle,
    descriptionMessage: messages.featureSliceDescription,
    icon: <IconUsers size={28} aria-hidden="true" />,
    color: 'sky',
  },
  {
    titleMessage: messages.featureSupabaseTitle,
    descriptionMessage: messages.featureSupabaseDescription,
    icon: <IconBrain size={28} aria-hidden="true" />,
    color: 'teal',
  },
  {
    titleMessage: messages.featureGuardrailsTitle,
    descriptionMessage: messages.featureGuardrailsDescription,
    icon: <IconLayoutKanban size={28} aria-hidden="true" />,
    color: 'teal',
  },
  {
    titleMessage: messages.featureTestingTitle,
    descriptionMessage: messages.featureTestingDescription,
    icon: <IconChartBar size={28} aria-hidden="true" />,
    color: 'amber',
  },
]

export function LandingView() {
  return (
    <Container size="lg">
      {/* Hero Section */}
      <Box className={styles.heroSection}>
        <Stack gap="xl" align="center">
          <TranslationTitle {...messages.title} order={1} className={styles.title} ta="center" />
          <TranslationText
            {...messages.subtitle}
            size="xl"
            c="dimmed"
            ta="center"
            className={styles.subtitle}
          />
          <Button
            component={Link}
            href="/login"
            size="xl"
            radius="md"
            rightSection={<IconArrowRight size={20} aria-hidden="true" />}
            variant="gradient"
            gradient={{ from: 'rose', to: 'sky', deg: 135 }}
          >
            <TranslationText {...messages.cta} />
          </Button>
        </Stack>
      </Box>

      {/* Features Section */}
      <Box className={styles.featuresSection}>
        <TranslationTitle
          {...messages.featuresTitle}
          order={2}
          ta="center"
          className={styles.featuresTitle}
        />
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
          {features.map((feature) => (
            <Paper
              key={feature.titleMessage.id}
              p="lg"
              radius="md"
              withBorder
              className={styles.featureCard}
            >
              <ThemeIcon
                className={styles.featureIcon}
                variant="light"
                color={feature.color}
                radius="md"
              >
                {feature.icon}
              </ThemeIcon>
              <TranslationTitle {...feature.titleMessage} order={4} mb="xs" />
              <TranslationText {...feature.descriptionMessage} size="sm" c="dimmed" />
            </Paper>
          ))}
        </SimpleGrid>
      </Box>

      {/* Footer Section */}
      <Box className={styles.footerSection}>
        <Group justify="center" gap="xs">
          <TranslationText {...messages.footerText} c="dimmed" />
          <Anchor component={Link} href="/login" fw={500}>
            <TranslationText {...messages.footerLogin} />
          </Anchor>
        </Group>
      </Box>
    </Container>
  )
}
