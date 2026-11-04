'use client'

import { Grid } from '@/components/Grid'
import { Heading } from '@/components/Heading'
import { Text } from '@/components/Text'

import { Demo } from '../../../_view/_demo'
import { Code } from '../../../_view/_demo/Code'

import type { CatalogComponentViewProps } from './types'

const Section = ({ entry, example }: CatalogComponentViewProps) => {
  return (
    <Grid
      key={entry.name}
      gap={4}
    >
      <Heading
        as="h1"
        size={6}
      >
        {entry.name}
      </Heading>
      <Grid gap={2}>
        <Heading
          as="h2"
          size={4}
        >
          Props
        </Heading>
        <Text
          size={2}
          color="muted"
        >
          {entry.props}
        </Text>
      </Grid>
      <Grid gap={3}>
        <Heading
          as="h2"
          size={4}
        >
          Preview
        </Heading>
        <Text
          size={2}
          color="muted"
        >
          Interactive examples. Hover or use Tab to inspect focus.
        </Text>
        <Demo name={entry.name} />
      </Grid>
      <Heading
        as="h2"
        size={4}
      >
        Usage
      </Heading>
      <Code>{example}</Code>
    </Grid>
  )
}

export default Section
