import { Box } from '@/components/Box'
import { Container } from '@/components/Container'
import { Grid } from '@/components/Grid'
import { Heading } from '@/components/Heading'
import { Text } from '@/components/Text'

export const Boxes = () => (
  <Grid gap={3}>
    <Box
      display="flex"
      wrap="wrap"
      justify="between"
      gap={3}
      p={4}
      surface="default"
      border
      radius="lg"
    >
      <Text>Aligned start</Text>
      <Text>Aligned end</Text>
    </Box>
    <Box
      p={3}
      surface="soft"
      radius="sm"
    >
      <Text>Soft surface</Text>
    </Box>
    <Box
      display="flex"
      gap={3}
      direction={{ initial: 'column', tabS: 'row' }}
    >
      <Text>Responsive</Text>
      <Text>Direction</Text>
    </Box>
  </Grid>
)

export const Grids = () => (
  <Grid
    columns={{ initial: 1, mobM: 2, tabM: 3 }}
    gap={3}
  >
    {
      [1, 2, 3, 4, 5, 6].map(number =>
        <Box
          key={number}
          border
          surface="default"
          radius="sm"
          p={3}
        >
          <Text>Column {number}</Text>
        </Box>
      )
    }
  </Grid>
)

export const Headings = () => (
  <Grid gap={3}>
    {
      (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const).map(as =>
        <Heading
          key={as}
          as={as === 'h1' ? 'h2' : as}
          size={as === 'h1' ? 6 : as === 'h2' ? 5 : 4}
        >
          {as} · Shopping together
        </Heading>
      )
    }
    {
      (['regular', 'medium', 'semibold', 'bold'] as const).map(weight =>
        <Heading
          key={weight}
          weight={weight}
        >
          {weight} heading
        </Heading>
      )
    }
    {
      (['none', 'uppercase', 'lowercase', 'capitalize'] as const).map(transform =>
        <Heading
          key={transform}
          transform={transform}
        >
          {transform} heading
        </Heading>
      )
    }
    <Heading
      family="accent"
      color="accent"
    >
      Accent family
    </Heading>
  </Grid>
)

export const Texts = () => (
  <Grid gap={3}>
    {
      ([1, 2, 3, 4, 5, 6, 7] as const).map(size =>
        <Text
          key={size}
          size={size}
        >
          {size} · Basket
        </Text>
      )
    }
    {
      (['default', 'muted', 'accent', 'success', 'error'] as const).map(color =>
        <Text
          key={color}
          color={color}
        >
          {color}
        </Text>
      )
    }
    {
      (['regular', 'medium', 'semibold', 'bold'] as const).map(weight =>
        <Text
          key={weight}
          weight={weight}
        >
          {weight} text
        </Text>
      )
    }
    {
      (['none', 'uppercase', 'lowercase', 'capitalize'] as const).map(transform =>
        <Text
          key={transform}
          transform={transform}
        >
          {transform} text
        </Text>
      )
    }
    <Text family="accent">Accent font family</Text>
    <Text weight="bold">Bold text</Text>
    <Text align="end">Aligned end</Text>
  </Grid>
)

export const Containers = () => (
  <Container
    as="section"
    py={4}
    surface="soft"
    radius="sm"
  >
    <Text>Shared content width and responsive gutters.</Text>
  </Container>
)
