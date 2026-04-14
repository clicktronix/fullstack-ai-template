'use client'

import { Title, TitleProps } from '@mantine/core'
import { MessageDescriptor, FormattedMessage } from 'react-intl'

export type ElementWithChunk = (chunks: React.ReactNode) => React.JSX.Element
export type TranslationValues = Record<string, ElementWithChunk | React.ReactNode>

export function TranslationTitle(
  props: {
    values?: TranslationValues
  } & MessageDescriptor &
    TitleProps
) {
  const { id, description, defaultMessage, values, ...rest } = props
  return (
    <Title {...rest}>
      <FormattedMessage
        id={id}
        description={description}
        defaultMessage={defaultMessage}
        values={values}
      />
    </Title>
  )
}
