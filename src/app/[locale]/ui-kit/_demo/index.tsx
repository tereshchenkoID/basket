import type { ReactNode } from 'react'

import type { ComponentName } from '../catalog'

import {
  Actions, Checks, FieldExample, Fields, Selects
} from './form'
import {
  AuthExample, Avatars, EmptyExamples, LoadingExample, ModuleForm, Mutations, Themes
} from './modules'
import { ConfirmExample } from './overlay'
import {
  Boxes, Grids, Headings, Texts
} from './primitives'

const demos: Record<ComponentName, ReactNode> = {
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
  Confirm: <ConfirmExample />,
  Empty: <EmptyExamples />,
  Avatar: <Avatars />,
  Loading: <LoadingExample />,
  ThemeSwitcher: <Themes />,
  GroupForm: <ModuleForm kind="GroupForm" />,
  ListForm: <ModuleForm kind="ListForm" />,
  ItemForm: <ModuleForm kind="ItemForm" />,
  QuickAdd: <ModuleForm kind="QuickAdd" />,
  Mutation: <Mutations />,
  GoogleLoginButton: <AuthExample kind="GoogleLoginButton" />,
  LogoutButton: <AuthExample kind="LogoutButton" />,
  LanguageSwitcher: <AuthExample kind="LanguageSwitcher" />,
}

export const Demo = ({ name }: { name: ComponentName }) => demos[name]
