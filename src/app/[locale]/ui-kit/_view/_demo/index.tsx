import type { ReactNode } from 'react'

import type { ComponentName } from '../../catalog'

import {
  Actions, Checks, FieldExample, Fields, Selects, TabExamples
} from './form'
import { DropdownExample, IconExample } from './overlay'
import {
  Boxes, Containers, Grids, Headings, Texts
} from './primitives'
import type { DemoProps } from './types'

const DEMOS: Record<ComponentName, ReactNode> = {
  Container: <Containers />,
  Tabs: <TabExamples />,
  Box: <Boxes />,
  Grid: <Grids />,
  Heading: <Headings />,
  Text: <Texts />,
  Action: <Actions />,
  Field: <FieldExample />,
  Input: <Fields kind="Input" />,
  Textarea: <Fields kind="Textarea" />,
  Select: <Selects />,
  Checkbox: <Checks kind="Checkbox" />,
  Toggle: <Checks kind="Toggle" />,
  Icon: <IconExample />,
  Dropdown: <DropdownExample />,
}

export const Demo = ({ name }: DemoProps) => DEMOS[name]
