'use client'

import { Text, TextProps } from '@mantine/core'
import { MessageDescriptor, FormattedMessage } from 'react-intl'

export type ElementWithChunk = (chunks: React.ReactNode) => React.JSX.Element
export type TranslationValues = Record<string, ElementWithChunk | React.ReactNode>

type TranslationTextProps = {
  values?: TranslationValues
} & MessageDescriptor &
  TextProps

export function TranslationText(props: TranslationTextProps) {
  const { id, description, defaultMessage, values, ...rest } = props
  return (
    <Text {...rest} component="span">
      <FormattedMessage
        id={id}
        description={description}
        defaultMessage={defaultMessage}
        values={values}
      />
    </Text>
  )
}
