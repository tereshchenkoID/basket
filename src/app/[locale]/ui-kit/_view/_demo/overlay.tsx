import { Dropdown } from '@/components/Dropdown'
import { Grid } from '@/components/Grid'
import Icon from '@/components/Icon'
import { Text } from '@/components/Text'

export const DropdownExample = () => (
  <Grid gap={3}>
    <Dropdown label="Closed section"><Text>Section content</Text></Dropdown>
    <Dropdown
      label="Open section"
      open
    >
      <Text>Visible content</Text>
    </Dropdown>
    <Dropdown
      label="Plain section"
      plain
    >
      <Text>Nested content</Text>
    </Dropdown>
  </Grid>
)

export const IconExample = () => (
  <Grid
    columns={4}
    gap={3}
  >
    <Icon
      name="shopping-basket"
      aria-label="Basket icon"
      role="img"
    />
    <Icon
      name="ArrowLeft"
      size={32}
      aria-label="Arrow icon"
      role="img"
    />
    <Icon
      name="google"
      size={24}
      aria-label="Google icon"
      role="img"
    />
    <Icon
      name="unknown-icon"
      aria-label="Fallback icon"
      role="img"
    />
  </Grid>
)
