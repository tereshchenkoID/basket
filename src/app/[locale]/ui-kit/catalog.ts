export const groups = ['layout', 'typography', 'form', 'overlay', 'modules'] as const

export const catalog = [
  { group: 'layout', name: 'Box', slug: 'box', props: 'as · display · direction · wrap · align · justify · gap · p · m · full · grow · container · surface · border · radius' },
  { group: 'layout', name: 'Grid', slug: 'grid', props: 'Box props · columns: number | string | Responsive' },
  { group: 'typography', name: 'Heading', slug: 'heading', props: 'as: h1–h6 · size · weight · color · align · family · spacing' },
  { group: 'typography', name: 'Text', slug: 'text', props: 'as · size · weight · color · align · family · spacing' },
  { group: 'form', name: 'Action', slug: 'action', props: 'variant · href · isLoading · disabled · iconOnly · native button/link props' },
  { group: 'form', name: 'Field', slug: 'field', props: 'id · label · hint · error · children' },
  { group: 'form', name: 'Input', slug: 'input', props: 'label · hint · error · isLoading · native input props' },
  { group: 'form', name: 'Textarea', slug: 'textarea', props: 'label · hint · error · isLoading · native textarea props' },
  { group: 'form', name: 'Select', slug: 'select', props: 'options · value · defaultValue · onChange · label · ariaLabel · disabled · required · error · hint · isLoading' },
  { group: 'form', name: 'Checkbox', slug: 'checkbox', props: 'label · checked · defaultChecked · onChange · disabled · error' },
  { group: 'form', name: 'Toggle', slug: 'toggle', props: 'label · checked · defaultChecked · onChange · disabled · error' },
  { group: 'overlay', name: 'Confirm', slug: 'confirm', props: 'label · description · onConfirm · disabled' },
  { group: 'modules', name: 'Empty', slug: 'empty', props: 'title · description · error? · heading · children' },
  { group: 'modules', name: 'Avatar', slug: 'avatar', props: 'name · url' },
  { group: 'modules', name: 'Loading', slug: 'loading', props: 'No props; localized route loading state' },
  { group: 'modules', name: 'ThemeSwitcher', slug: 'theme', props: 'initialTheme: light | dark | system' },
  { group: 'modules', name: 'GroupForm', slug: 'group-form', props: 'group? · locale · onSuccess(id)' },
  { group: 'modules', name: 'ListForm', slug: 'list-form', props: 'groupId · list? · onSuccess(id)' },
  { group: 'modules', name: 'ItemForm', slug: 'item-form', props: 'item · onSuccess()' },
  { group: 'modules', name: 'QuickAdd', slug: 'quick-add', props: 'listId · onSuccess() · sticky below header' },
  { group: 'modules', name: 'Mutation', slug: 'mutation', props: 'label · operation · onSuccess · confirmation · compact' },
  { group: 'modules', name: 'GoogleLoginButton', slug: 'google', props: 'locale · configured · next?' },
  { group: 'modules', name: 'LogoutButton', slug: 'logout', props: 'locale' },
  { group: 'modules', name: 'LanguageSwitcher', slug: 'language', props: 'No props; current pathname and locale are preserved' },
] as const

export type CatalogEntry = typeof catalog[number]

export type ComponentName = CatalogEntry['name']
