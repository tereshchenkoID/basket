import type { FC } from 'react'
import { CircleHelp } from 'lucide-react'

import { getIconName, ICON_COMPONENTS } from './helpers'
import type { IconProps } from './types'

const Icon: FC<IconProps> = ({ name, size = 24, className, ...props }) => {
  if (!name) return null

  const IconComponent = ICON_COMPONENTS[getIconName(name)] ?? CircleHelp

  return (
    <IconComponent
      size={size}
      className={className}
      {...props}
    />
  )
}

export default Icon
