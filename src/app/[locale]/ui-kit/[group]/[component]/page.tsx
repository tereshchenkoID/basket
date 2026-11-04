import { notFound } from 'next/navigation'

import { Grid } from '@/components/Grid'
import { Heading } from '@/components/Heading'
import { Text } from '@/components/Text'

import { Demo } from '../../_demo'
import { Code } from '../../_demo/Code'
import { catalog } from '../../catalog'
import { examples } from '../../examples'

const ComponentPage = async ({ params }: { params: Promise<{ group: string; component: string }> }) => {
  const { group, component } = await params
  const entry = catalog.find(value => value.group === group && value.slug === component)

  if (!entry) notFound()

  return (
    <Grid
      key={entry.name}
      gap={4}
    >
      <Heading as="h1">{entry.name}</Heading>
      <Text
        size="sm"
        color="muted"
      >
        {entry.props}
      </Text>
      <Demo
        name={entry.name}
      />
      <Heading
        as="h2"
        size="xl"
      >
        Usage
      </Heading>
      <Code>{examples[entry.name]}</Code>
    </Grid>
  )
}

export default ComponentPage
