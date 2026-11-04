import type { ReactNode } from 'react'

import type { ComponentName } from '../../catalog'

import {
  Actions, Checks, FieldExample, Fields, Selects
} from './form'
import {
  AuthExample, Avatars, EmptyExamples, LoadingExample, ModuleForm, Mutations, Themes
} from './modules'
import {
  BreadcrumbExample, ConfirmExample, ConnectionExample, DropdownExample, IconExample, ToastExample
} from './overlay'
import {
  Boxes, Containers, Grids, Headings, Texts
} from './primitives'
import type { DemoProps } from './types'

const DEMOS: Record<ComponentName, ReactNode> = {
  Box: <Boxes />,
  Container: <Containers />,
  Icon: <IconExample />,
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
  Breadcrumbs: <BreadcrumbExample />,
  Confirm: <ConfirmExample />,
  Dropdown: <DropdownExample />,
  Connection: <ConnectionExample />,
  Toastify: <ToastExample />,
  Empty: <EmptyExamples />,
  Avatar: <Avatars />,
  Loading: <LoadingExample />,
  Theme: <Themes />,
  GroupForm: <ModuleForm kind="GroupForm" />,
  ListForm: <ModuleForm kind="ListForm" />,
  Form: <ModuleForm kind="Form" />,
  Add: <ModuleForm kind="Add" />,
  Mutation: <Mutations />,
  Google: <AuthExample kind="Google" />,
  Logout: <AuthExample kind="Logout" />,
  Languages: <AuthExample kind="Languages" />,
}

export const Demo = ({ name }: DemoProps) => DEMOS[name]
