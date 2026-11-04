import { Box } from '@/components/Box'
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
      surface="paper"
      border
      radius="large"
    >
      <Text>Aligned start</Text>
      <Text>Aligned end</Text>
    </Box>
    <Box
      p={3}
      surface="soft"
      radius="small"
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
          surface="paper"
          radius="small"
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
          size={as === 'h1' ? 'title' : as === 'h2' ? 'xl' : 'lg'}
        >
          {as} · Shopping together
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
      (['xs', 'sm', 'md', 'lg', 'xl', 'title', 'hero'] as const).map(size =>
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
    <Text family="accent">Accent font family</Text>
    <Text weight={700}>Bold text</Text>
    <Text align="end">Aligned end</Text>
  </Grid>
)
