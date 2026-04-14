import { Menu } from '@mantine/core'
import { IconLanguage } from '@tabler/icons-react'
import { TranslationText } from '@/ui/components/TranslationText'
import { composeHooks } from '@/ui/hooks/compose-hooks'
import {
  useLocaleSelectorProps,
  type LocaleSelectorProps,
  type LocaleSelectorViewProps,
} from './lib'
import messages from './messages.json'

export function LocaleSelectorView({ onSetRussian, onSetEnglish }: LocaleSelectorViewProps) {
  return (
    <Menu
      trigger="click-hover"
      position="left-start"
      withArrow
      shadow="md"
      openDelay={100}
      closeDelay={400}
    >
      <Menu.Target>
        <Menu.Item component="div" leftSection={<IconLanguage size={14} aria-hidden="true" />}>
          <TranslationText {...messages.language} />
        </Menu.Item>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item onClick={onSetRussian}>
          <TranslationText {...messages.russian} />
        </Menu.Item>
        <Menu.Item onClick={onSetEnglish}>
          <TranslationText {...messages.english} />
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}

export const LocaleSelector = composeHooks<LocaleSelectorViewProps, LocaleSelectorProps>(
  LocaleSelectorView
)(useLocaleSelectorProps)
