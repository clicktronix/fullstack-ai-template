import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Center,
  Divider,
  Group,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  IconBolt,
  IconBrain,
  IconChevronRight,
  IconMessageCircle,
  IconRobot,
  IconSearch,
  IconSparkles,
  IconStar,
  IconUser,
} from '@tabler/icons-react'
import type { ReactNode } from 'react'
import styles from './ThemePalette.stories.module.css'

type ThemeScheme = 'dark' | 'light'

type PaletteColors = {
  shell: string
  shellText: string
  shellMuted: string
  surface: string
  surfaceRaised: string
  surfaceHover: string
  text: string
  muted: string
  brand: string
  brandFilled: string
  info: string
  ai: string
  success: string
  warning: string
  danger: string
}

type PaletteCandidate = {
  name: string
  description: string
  reference?: string
  modes: Record<ThemeScheme, PaletteColors>
}

type ResolvedPalette = {
  name: string
  description: string
  reference?: string
  colors: PaletteColors
}

type BenchShell = {
  shell: string
  shellMuted: string
  shellText: string
  surfaceRaised: string
}

function createPalette(
  name: string,
  description: string,
  reference: string | undefined,
  dark: PaletteColors,
  light: PaletteColors
): PaletteCandidate {
  return {
    name,
    description,
    reference,
    modes: { dark, light },
  }
}

function resolvePalette(candidate: PaletteCandidate, scheme: ThemeScheme): ResolvedPalette {
  return {
    name: candidate.name,
    description: candidate.description,
    reference: candidate.reference,
    colors: candidate.modes[scheme],
  }
}

const benchShellByScheme: Record<ThemeScheme, BenchShell> = {
  dark: {
    shell: '#101113',
    shellMuted: '#A4A7AE',
    shellText: '#F5F5F3',
    surfaceRaised: '#17181A',
  },
  light: {
    shell: '#FFFFFF',
    shellMuted: '#686B73',
    shellText: '#171717',
    surfaceRaised: '#FFFFFF',
  },
}

const currentTheme = createPalette(
  'Current Theme',
  'Warm graphite base with rose, sky, violet and amber accents.',
  undefined,
  {
    shell: '#111214',
    shellText: '#FFFFFF',
    shellMuted: '#A8AFB8',
    surface: '#1C1C1C',
    surfaceRaised: '#242424',
    surfaceHover: '#2E2F31',
    text: '#F0EFED',
    muted: '#7D7A75',
    brand: '#F06292',
    brandFilled: '#D63672',
    info: '#0EA5E9',
    ai: '#845EF7',
    success: '#2FB344',
    warning: '#F59F00',
    danger: '#E03131',
  },
  {
    shell: '#FFFFFF',
    shellText: '#1C1917',
    shellMuted: '#6B7280',
    surface: '#FFF4F8',
    surfaceRaised: '#FFFFFF',
    surfaceHover: '#FDEBF2',
    text: '#1C1917',
    muted: '#7C6F74',
    brand: '#E75480',
    brandFilled: '#B83262',
    info: '#1677D8',
    ai: '#6D4EE8',
    success: '#2F9E44',
    warning: '#E67700',
    danger: '#D92D20',
  }
)

const sunsetTech = createPalette(
  'Sunset Tech',
  'Warm action color, sharp blue information, mint AI. Brighter than the current mix.',
  'Inspired by warm commerce dashboards and modern product UIs.',
  {
    shell: '#111214',
    shellText: '#FFF8F3',
    shellMuted: '#B8AEA7',
    surface: '#1C1C1C',
    surfaceRaised: '#242424',
    surfaceHover: '#303136',
    text: '#F4F1EC',
    muted: '#9B968E',
    brand: '#FF7A59',
    brandFilled: '#D95D39',
    info: '#3A86FF',
    ai: '#00C2A8',
    success: '#2FB344',
    warning: '#F59F00',
    danger: '#E03131',
  },
  {
    shell: '#FFFFFF',
    shellText: '#201A17',
    shellMuted: '#7A6F66',
    surface: '#FFF2EC',
    surfaceRaised: '#FFFFFF',
    surfaceHover: '#FFE6DD',
    text: '#201A17',
    muted: '#7A6F66',
    brand: '#F97352',
    brandFilled: '#BD4F2A',
    info: '#2563EB',
    ai: '#0F9F8D',
    success: '#2F9E44',
    warning: '#D97706',
    danger: '#DC2626',
  }
)

const oceanSignal = createPalette(
  'Ocean Signal',
  'Blue-cyan operating system. Cleaner, colder and more analytical.',
  'Influenced by GitHub/Primer dark UI structure and cool infra tooling palettes.',
  {
    shell: '#0F1318',
    shellText: '#F3F7FA',
    shellMuted: '#98A6B3',
    surface: '#181A1D',
    surfaceRaised: '#20242A',
    surfaceHover: '#2A3038',
    text: '#F3F7FA',
    muted: '#98A6B3',
    brand: '#12B5EA',
    brandFilled: '#0077B6',
    info: '#52A8FF',
    ai: '#00D4C7',
    success: '#2FB344',
    warning: '#F59F00',
    danger: '#E03131',
  },
  {
    shell: '#FFFFFF',
    shellText: '#0F172A',
    shellMuted: '#64748B',
    surface: '#F1F7FD',
    surfaceRaised: '#FFFFFF',
    surfaceHover: '#E7F0FA',
    text: '#0F172A',
    muted: '#64748B',
    brand: '#0EA5E9',
    brandFilled: '#0369A1',
    info: '#2563EB',
    ai: '#0F766E',
    success: '#2F9E44',
    warning: '#D97706',
    danger: '#DC2626',
  }
)

const solarLedger = createPalette(
  'Solar Ledger',
  'Ochre action, cobalt info and verdigris AI on editorial neutrals.',
  'Loosely inspired by Solarized color relationships.',
  {
    shell: '#071D24',
    shellText: '#EAF2F0',
    shellMuted: '#8EA7A3',
    surface: '#0B222B',
    surfaceRaised: '#12313C',
    surfaceHover: '#173B47',
    text: '#E6F0EE',
    muted: '#8CA2A0',
    brand: '#D8A21A',
    brandFilled: '#A37A0A',
    info: '#3E8BC9',
    ai: '#2AA198',
    success: '#4CAF50',
    warning: '#D8A21A',
    danger: '#DC5A41',
  },
  {
    shell: '#FFFBF2',
    shellText: '#073642',
    shellMuted: '#657B83',
    surface: '#FFF7E7',
    surfaceRaised: '#FFFFFF',
    surfaceHover: '#F9EED1',
    text: '#073642',
    muted: '#657B83',
    brand: '#B58900',
    brandFilled: '#8A6B00',
    info: '#268BD2',
    ai: '#2AA198',
    success: '#2F9E44',
    warning: '#CA8A04',
    danger: '#D94841',
  }
)

const copperCircuit = createPalette(
  'Copper Circuit',
  'Burnt copper brand with ultramarine info and sea-glass AI. Warmer and more premium.',
  'Built from editorial copper and cobalt pairings common in premium data products.',
  {
    shell: '#141316',
    shellText: '#FFF4EE',
    shellMuted: '#B7A59C',
    surface: '#1E1B1A',
    surfaceRaised: '#2A2523',
    surfaceHover: '#362F2C',
    text: '#F9F0EB',
    muted: '#A89084',
    brand: '#E76F51',
    brandFilled: '#B84D2F',
    info: '#4361EE',
    ai: '#2A9D8F',
    success: '#2FB344',
    warning: '#F4A261',
    danger: '#E03131',
  },
  {
    shell: '#FFFFFF',
    shellText: '#2B1D18',
    shellMuted: '#7C6B64',
    surface: '#FDF0EA',
    surfaceRaised: '#FFFFFF',
    surfaceHover: '#F7E4DC',
    text: '#2B1D18',
    muted: '#7C6B64',
    brand: '#D6684D',
    brandFilled: '#A94B31',
    info: '#3554D1',
    ai: '#1F8A7D',
    success: '#2F9E44',
    warning: '#DD8A2E',
    danger: '#C92A2A',
  }
)

const auroraMint = createPalette(
  'Aurora Mint',
  'Acid mint brand, glacier blue info and deep teal AI. More experimental, more memorable.',
  'Borrowed from sci-fi terminal palettes and modern fintech motion graphics.',
  {
    shell: '#0F1414',
    shellText: '#F0FFFB',
    shellMuted: '#99B6AE',
    surface: '#151C1C',
    surfaceRaised: '#1F2727',
    surfaceHover: '#293333',
    text: '#E8FBF7',
    muted: '#93AAA3',
    brand: '#A3E635',
    brandFilled: '#4D7C0F',
    info: '#60A5FA',
    ai: '#14B8A6',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
  },
  {
    shell: '#FFFFFF',
    shellText: '#10231F',
    shellMuted: '#5C6F69',
    surface: '#F0FFF7',
    surfaceRaised: '#FFFFFF',
    surfaceHover: '#DFF8EC',
    text: '#10231F',
    muted: '#5C6F69',
    brand: '#8FD11C',
    brandFilled: '#4D7C0F',
    info: '#3B82F6',
    ai: '#0F766E',
    success: '#16A34A',
    warning: '#D97706',
    danger: '#DC2626',
  }
)

const nordCurrent = createPalette(
  'Nord Current',
  'Cold slate surfaces, icy blue info and berry AI. More restrained than Ocean Signal.',
  'Inspired by cool Nordic terminal palettes.',
  {
    shell: '#0F1117',
    shellText: '#ECEFF4',
    shellMuted: '#94A3B8',
    surface: '#171A22',
    surfaceRaised: '#202531',
    surfaceHover: '#293041',
    text: '#ECEFF4',
    muted: '#94A3B8',
    brand: '#88C0D0',
    brandFilled: '#3B82F6',
    info: '#5E81AC',
    ai: '#BF7FBF',
    success: '#8FBC8F',
    warning: '#EBCB8B',
    danger: '#BF616A',
  },
  {
    shell: '#FFFFFF',
    shellText: '#2E3440',
    shellMuted: '#6B7280',
    surface: '#F4F7FB',
    surfaceRaised: '#FFFFFF',
    surfaceHover: '#EAF0F8',
    text: '#2E3440',
    muted: '#6B7280',
    brand: '#5E81AC',
    brandFilled: '#3B5B8A',
    info: '#4C84C4',
    ai: '#A855F7',
    success: '#5A9B5A',
    warning: '#CA8A04',
    danger: '#C2414D',
  }
)

const blossomGrid = createPalette(
  'Blossom Grid',
  'Magenta action, royal blue info and jade AI. More fashion-editorial than operational.',
  'Closer to modern commerce/editorial products than infra dashboards.',
  {
    shell: '#151116',
    shellText: '#FFF1F7',
    shellMuted: '#B59CAA',
    surface: '#1F1821',
    surfaceRaised: '#2B202D',
    surfaceHover: '#38273B',
    text: '#FFF1F7',
    muted: '#B59CAA',
    brand: '#EC4899',
    brandFilled: '#BE185D',
    info: '#4F46E5',
    ai: '#10B981',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
  },
  {
    shell: '#FFFFFF',
    shellText: '#2B1624',
    shellMuted: '#7A6673',
    surface: '#FFF3F8',
    surfaceRaised: '#FFFFFF',
    surfaceHover: '#FFE4F0',
    text: '#2B1624',
    muted: '#7A6673',
    brand: '#DB2777',
    brandFilled: '#A21C56',
    info: '#4338CA',
    ai: '#0F9D77',
    success: '#16A34A',
    warning: '#D97706',
    danger: '#DC2626',
  }
)

const citrusPunch = createPalette(
  'Citrus Punch',
  'Lemon-lime brand, cobalt info and peacock AI. Loud, high-energy, hard to ignore.',
  'Pulled toward energetic product launch palettes for AI tooling.',
  {
    shell: '#121311',
    shellText: '#F7F9EC',
    shellMuted: '#A8B096',
    surface: '#1A1E16',
    surfaceRaised: '#24291E',
    surfaceHover: '#303728',
    text: '#F7F9EC',
    muted: '#A8B096',
    brand: '#C9F31D',
    brandFilled: '#6E9A00',
    info: '#2563EB',
    ai: '#06B6D4',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
  },
  {
    shell: '#FFFFFF',
    shellText: '#1E2815',
    shellMuted: '#68735C',
    surface: '#F7FFE5',
    surfaceRaised: '#FFFFFF',
    surfaceHover: '#EAF8C5',
    text: '#1E2815',
    muted: '#68735C',
    brand: '#9AC100',
    brandFilled: '#5F7F00',
    info: '#1D4ED8',
    ai: '#0E7490',
    success: '#16A34A',
    warning: '#D97706',
    danger: '#DC2626',
  }
)

const linearMono = createPalette(
  'Linear Mono',
  'Near-monochrome product UI with graphite structure and only tonal separation.',
  'Inspired by stripped-down monochrome SaaS interfaces.',
  {
    shell: '#08090A',
    shellText: '#F7F7F5',
    shellMuted: '#8D8D8A',
    surface: '#111214',
    surfaceRaised: '#17181A',
    surfaceHover: '#1F2023',
    text: '#F7F7F5',
    muted: '#8D8D8A',
    brand: '#C9C9C5',
    brandFilled: '#F3F3F1',
    info: '#9B9B97',
    ai: '#B6B6B1',
    success: '#7D7D79',
    warning: '#A1A19D',
    danger: '#6F6F6C',
  },
  {
    shell: '#FFFFFF',
    shellText: '#111111',
    shellMuted: '#6B6B69',
    surface: '#FAFAF9',
    surfaceRaised: '#FFFFFF',
    surfaceHover: '#F0F0EE',
    text: '#111111',
    muted: '#6B6B69',
    brand: '#3A3A38',
    brandFilled: '#151515',
    info: '#5C5C5A',
    ai: '#767673',
    success: '#5D5D5A',
    warning: '#7A7A77',
    danger: '#4F4F4C',
  }
)

const notionPaper = createPalette(
  'Notion Paper',
  'Warm paper light mode and ink-heavy dark mode with editorial neutrality.',
  'Inspired by warm document-first tools rather than colorful dashboards.',
  {
    shell: '#151413',
    shellText: '#F1EFEB',
    shellMuted: '#9A9388',
    surface: '#1F1D1B',
    surfaceRaised: '#292623',
    surfaceHover: '#34302C',
    text: '#F1EFEB',
    muted: '#9A9388',
    brand: '#D8D3C9',
    brandFilled: '#F3EFE7',
    info: '#B4ADA1',
    ai: '#C7C0B4',
    success: '#8B877F',
    warning: '#B19E7A',
    danger: '#8C7068',
  },
  {
    shell: '#FFFFFF',
    shellText: '#37352F',
    shellMuted: '#78746D',
    surface: '#FBFAF8',
    surfaceRaised: '#FFFFFF',
    surfaceHover: '#F3F1EE',
    text: '#37352F',
    muted: '#78746D',
    brand: '#4A4741',
    brandFilled: '#37352F',
    info: '#6B665F',
    ai: '#8B857B',
    success: '#6F6B64',
    warning: '#9E8B69',
    danger: '#8C6A62',
  }
)

const brutalistMono = createPalette(
  'Brutalist Mono',
  'Hard black and white with almost no softness. More poster than app.',
  'Deliberately severe monochrome for contrast against all colorful directions.',
  {
    shell: '#000000',
    shellText: '#FFFFFF',
    shellMuted: '#8A8A8A',
    surface: '#050505',
    surfaceRaised: '#111111',
    surfaceHover: '#1E1E1E',
    text: '#FFFFFF',
    muted: '#8A8A8A',
    brand: '#FFFFFF',
    brandFilled: '#FFFFFF',
    info: '#CFCFCF',
    ai: '#9C9C9C',
    success: '#7F7F7F',
    warning: '#A3A3A3',
    danger: '#666666',
  },
  {
    shell: '#FFFFFF',
    shellText: '#000000',
    shellMuted: '#707070',
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    surfaceHover: '#F1F1F1',
    text: '#000000',
    muted: '#707070',
    brand: '#000000',
    brandFilled: '#000000',
    info: '#3D3D3D',
    ai: '#6A6A6A',
    success: '#5F5F5F',
    warning: '#7A7A7A',
    danger: '#4A4A4A',
  }
)

const candidates = [
  linearMono,
  notionPaper,
  brutalistMono,
  currentTheme,
  auroraMint,
  sunsetTech,
  oceanSignal,
  solarLedger,
  copperCircuit,
  nordCurrent,
  blossomGrid,
  citrusPunch,
]

const meta = {
  title: 'Theme/Palette Audit',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

function SwatchRow({
  label,
  value,
  tone,
  textColor,
  borderColor,
}: {
  label: string
  value: string
  tone?: string
  textColor: string
  borderColor: string
}) {
  return (
    <Group justify="space-between" wrap="nowrap">
      <Group gap="xs" wrap="nowrap">
        <Box className={styles.swatch} bg={tone ?? value} bd={`1px solid ${borderColor}`} />
        <Text size="xs">{label}</Text>
      </Group>
      <Text size="xs" c={textColor}>
        {value}
      </Text>
    </Group>
  )
}

function HeaderBench({ palette }: { palette: ResolvedPalette }) {
  return (
    <Paper p="sm" radius="md" bg={palette.colors.surfaceRaised} c={palette.colors.text}>
      <Group justify="space-between" wrap="nowrap">
        <Group gap="xs" wrap="nowrap">
          <Box className={styles.brandDot} bg={palette.colors.brand} />
          <Text fw={700}>Template App</Text>
          <Badge
            variant="light"
            bg={`color-mix(in srgb, ${palette.colors.muted} 16%, transparent)`}
            c={palette.colors.muted}
          >
            admin
          </Badge>
        </Group>
        <Group gap="xs" wrap="nowrap">
          <Button size="xs" bg={palette.colors.brandFilled} c="white">
            New item
          </Button>
          <ActionIcon variant="subtle" c={palette.colors.text} aria-label="messages">
            <IconMessageCircle size={16} />
          </ActionIcon>
        </Group>
      </Group>
    </Paper>
  )
}

function ChatBench({ palette }: { palette: ResolvedPalette }) {
  return (
    <Stack gap="xs">
      <Paper
        p="sm"
        radius="md"
        bg={`color-mix(in srgb, ${palette.colors.info} 14%, ${palette.colors.surfaceRaised})`}
      >
        <Group align="flex-start" wrap="nowrap">
          <Box className={styles.avatar} bg={palette.colors.info}>
            <IconUser size={14} />
          </Box>
          <Box>
            <Text size="xs" fw={600}>
              User
            </Text>
            <Text size="sm">Find creators for an urban skincare launch in Almaty.</Text>
          </Box>
        </Group>
      </Paper>

      <Paper p="sm" radius="md" bg={palette.colors.surfaceRaised}>
        <Group align="flex-start" wrap="nowrap">
          <Box className={styles.avatar} bg={palette.colors.ai}>
            <IconRobot size={14} />
          </Box>
          <Box>
            <Text size="xs" fw={600}>
              Agent
            </Text>
            <Text size="sm" c={palette.colors.muted}>
              Ranking audience overlap, reach quality and content fit.
            </Text>
            <Group gap={6} mt="xs">
              <Badge
                size="xs"
                variant="light"
                bg={`color-mix(in srgb, ${palette.colors.muted} 16%, transparent)`}
                c={palette.colors.muted}
              >
                tool
              </Badge>
              <Badge
                size="xs"
                variant="light"
                bg={`color-mix(in srgb, ${palette.colors.muted} 16%, transparent)`}
                c={palette.colors.muted}
              >
                search
              </Badge>
              <Text size="xs" c={palette.colors.ai}>
                reasoning active
              </Text>
            </Group>
          </Box>
        </Group>
      </Paper>
    </Stack>
  )
}

function TableBench({ palette }: { palette: ResolvedPalette }) {
  return (
    <Paper p="sm" radius="md" bg={palette.colors.surfaceRaised}>
      <Stack gap="sm">
        <Group justify="space-between">
          <TextInput
            value="beauty creator"
            readOnly
            leftSection={<IconSearch size={14} />}
            className={styles.search}
          />
          <Button
            size="xs"
            variant="light"
            bg={`color-mix(in srgb, ${palette.colors.brand} 18%, transparent)`}
            c={palette.colors.brand}
          >
            Filters
          </Button>
        </Group>

        <Box className={styles.tableHeader} c={palette.colors.muted}>
          <Text size="xs">Item</Text>
          <Text size="xs">Status</Text>
          <Text size="xs">Owner</Text>
        </Box>

        <Paper
          p="sm"
          radius="sm"
          bg={`color-mix(in srgb, ${palette.colors.info} 10%, ${palette.colors.surfaceHover})`}
          className={styles.tableRow}
          bd={`1px solid color-mix(in srgb, ${palette.colors.muted} 18%, transparent)`}
        >
          <Group justify="space-between" wrap="nowrap">
            <Group gap="xs" wrap="nowrap">
              <IconSparkles size={14} color={palette.colors.info} />
              <Box>
                <Text size="sm" fw={600}>
                  @city_editor
                </Text>
                <Text size="xs" c={palette.colors.muted}>
                  88k followers
                </Text>
              </Box>
            </Group>
            <Badge
              variant="light"
              bg={`color-mix(in srgb, ${palette.colors.success} 16%, transparent)`}
              c={palette.colors.success}
            >
              confirmed
            </Badge>
            <Text size="sm" fw={700} c={palette.colors.brand}>
              92%
            </Text>
          </Group>
        </Paper>

        <Paper
          p="sm"
          radius="sm"
          bg={palette.colors.surfaceHover}
          className={styles.tableRow}
          bd={`1px solid color-mix(in srgb, ${palette.colors.muted} 18%, transparent)`}
        >
          <Group justify="space-between" wrap="nowrap">
            <Group gap="xs" wrap="nowrap">
              <IconStar size={14} color={palette.colors.warning} />
              <Box>
                <Text size="sm" fw={600}>
                  @north_signal
                </Text>
                <Text size="xs" c={palette.colors.muted}>
                  245k followers
                </Text>
              </Box>
            </Group>
            <Badge
              variant="light"
              bg={`color-mix(in srgb, ${palette.colors.warning} 16%, transparent)`}
              c={palette.colors.warning}
            >
              pending
            </Badge>
            <Text size="sm" fw={700} c={palette.colors.info}>
              78%
            </Text>
          </Group>
        </Paper>
      </Stack>
    </Paper>
  )
}

function SidebarBench({ palette }: { palette: ResolvedPalette }) {
  const neutralBorder = `color-mix(in srgb, ${palette.colors.muted} 24%, transparent)`

  return (
    <Paper p="sm" radius="md" bg={palette.colors.surfaceRaised}>
      <Stack gap="sm">
        <Group>
          <Center className={styles.profileAvatar} bg={palette.colors.brand}>
            <IconUser size={18} color="white" />
          </Center>
          <Box>
            <Text fw={700}>@city_editor</Text>
            <Text size="xs" c={palette.colors.muted}>
              lifestyle / skincare
            </Text>
          </Box>
        </Group>
        <Divider color={`color-mix(in srgb, ${palette.colors.muted} 18%, transparent)`} />
        <Stack gap={6}>
          <SwatchRow
            label="Primary CTA"
            value={palette.colors.brandFilled}
            tone={palette.colors.brandFilled}
            textColor={palette.colors.muted}
            borderColor={neutralBorder}
          />
          <SwatchRow
            label="Info / links"
            value={palette.colors.info}
            tone={palette.colors.info}
            textColor={palette.colors.muted}
            borderColor={neutralBorder}
          />
          <SwatchRow
            label="AI / agent"
            value={palette.colors.ai}
            tone={palette.colors.ai}
            textColor={palette.colors.muted}
            borderColor={neutralBorder}
          />
        </Stack>
        <Progress value={74} color={palette.colors.ai} size="sm" />
      </Stack>
    </Paper>
  )
}

function PaletteCard({ palette, scheme }: { palette: PaletteCandidate; scheme: ThemeScheme }) {
  const resolved = resolvePalette(palette, scheme)
  const neutralBadge = `color-mix(in srgb, ${resolved.colors.muted} 16%, transparent)`
  const neutralBorder = `color-mix(in srgb, ${resolved.colors.muted} 24%, transparent)`

  return (
    <Box
      className={styles.candidateCard}
      bg={resolved.colors.surface}
      c={resolved.colors.text}
      bd={`1px solid ${neutralBorder}`}
    >
      <Stack gap="md">
        <Box>
          <Group justify="space-between" align="flex-start">
            <Box>
              <Title order={2}>{resolved.name}</Title>
              <Text size="sm" c={resolved.colors.muted}>
                {resolved.description}
              </Text>
              {resolved.reference && (
                <Text mt={6} size="xs" c={resolved.colors.muted}>
                  {resolved.reference}
                </Text>
              )}
            </Box>
            <Group gap={6}>
              <Badge variant="light" bg={neutralBadge} c={resolved.colors.muted}>
                {scheme}
              </Badge>
              <Badge variant="light" bg={neutralBadge} c={resolved.colors.muted}>
                bench
              </Badge>
            </Group>
          </Group>
        </Box>

        <HeaderBench palette={resolved} />

        <SimpleGrid cols={{ base: 1, xl: 3 }}>
          <ChatBench palette={resolved} />
          <TableBench palette={resolved} />
          <SidebarBench palette={resolved} />
        </SimpleGrid>

        <Group>
          <Button size="xs" bg={resolved.colors.brandFilled} c="white">
            Save changes
          </Button>
          <Button
            size="xs"
            variant="light"
            bg={`color-mix(in srgb, ${resolved.colors.info} 18%, transparent)`}
            c={resolved.colors.info}
          >
            Open thread
          </Button>
          <ActionIcon
            variant="light"
            bg={`color-mix(in srgb, ${resolved.colors.danger} 14%, transparent)`}
            c={resolved.colors.danger}
            aria-label="delete"
          >
            <IconChevronRight size={16} />
          </ActionIcon>
          <Group gap={6} wrap="nowrap">
            <IconBrain size={14} color={resolved.colors.ai} />
            <Text size="sm" c={resolved.colors.ai}>
              AI reasoning cue
            </Text>
          </Group>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
          <SwatchRow
            label="Brand"
            value={resolved.colors.brand}
            textColor={resolved.colors.muted}
            borderColor={neutralBorder}
          />
          <SwatchRow
            label="Brand filled"
            value={resolved.colors.brandFilled}
            textColor={resolved.colors.muted}
            borderColor={neutralBorder}
          />
          <SwatchRow
            label="Info"
            value={resolved.colors.info}
            textColor={resolved.colors.muted}
            borderColor={neutralBorder}
          />
          <SwatchRow
            label="AI"
            value={resolved.colors.ai}
            textColor={resolved.colors.muted}
            borderColor={neutralBorder}
          />
        </SimpleGrid>
      </Stack>
    </Box>
  )
}

function CandidateRow({ children }: { children: ReactNode }) {
  return <SimpleGrid cols={{ base: 1, xl: 3 }}>{children}</SimpleGrid>
}

function PaletteAuditView({ scheme }: { scheme: ThemeScheme }) {
  const shell = benchShellByScheme[scheme]

  return (
    <Box bg={shell.shell} p="xl">
      <Stack gap="xl">
        <Box>
          <Group gap="xs" mb="xs">
            <Badge
              variant="light"
              bg={`color-mix(in srgb, ${shell.shellMuted} 16%, transparent)`}
              c={shell.shellMuted}
            >
              {scheme}
            </Badge>
            <Badge
              variant="light"
              bg={`color-mix(in srgb, ${shell.shellMuted} 16%, transparent)`}
              c={shell.shellMuted}
            >
              palette bench
            </Badge>
          </Group>
          <Title order={1} c={shell.shellText}>
            Product theme comparison
          </Title>
          <Text c={shell.shellMuted} maw={820}>
            Compare the current palette against stronger, more distinctive directions on the same
            dashboard composition. The Storybook toolbar now switches between dark and light modes.
          </Text>
        </Box>

        <CandidateRow>
          {candidates.map((palette) => (
            <PaletteCard key={palette.name} palette={palette} scheme={scheme} />
          ))}
        </CandidateRow>

        <Paper p="md" radius="md" bg={shell.surfaceRaised}>
          <Group gap="md" wrap="wrap">
            <Group gap="xs">
              <IconBolt size={16} color={candidates[1].modes[scheme].brand} />
              <Text c={shell.shellText} fw={600}>
                What to look for
              </Text>
            </Group>
            <Text c={shell.shellMuted} size="sm">
              Does CTA feel like the center of gravity? Does AI read as a separate system layer? Do
              links, selection and status colors stay legible in both dark and light modes?
            </Text>
          </Group>
        </Paper>
      </Stack>
    </Box>
  )
}

export const PaletteAudit: Story = {
  render: (_args, context) => {
    const scheme = context.globals.theme === 'light' ? 'light' : 'dark'

    return <PaletteAuditView scheme={scheme} />
  },
}
