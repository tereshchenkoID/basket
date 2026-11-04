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
      <Heading as="h1">{entry.name}</Heading>
      <Text
        size={2}
        color="muted"
      >
        {entry.props}
      </Text>
      <Demo
        name={entry.name}
      />
      <Heading
        as="h2"
        size={5}
      >
        Usage
      </Heading>
      <Code>{example}</Code>
    </Grid>
  )
}

export default Section
