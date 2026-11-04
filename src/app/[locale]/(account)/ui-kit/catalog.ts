export const GROUPS = ['layout', 'typography', 'form', 'overlay', 'modules'] as const

export const CATALOG = [
  { group: 'layout', name: 'Container', slug: 'container', props: 'Box props · shared content width · responsive gutters · safe area padding' },
  { group: 'layout', name: 'Box', slug: 'box', props: 'as · display · direction · wrap · align · justify · gap · p · m · full · grow · surface · border · radius: sm | lg' },
  { group: 'layout', name: 'Grid', slug: 'grid', props: 'Box props · columns: number | string | Responsive' },
  { group: 'typography', name: 'Heading', slug: 'heading', props: 'as: h1–h6 · size: 1–7 · weight: regular | medium | semibold | bold · transform: none | uppercase | lowercase | capitalize · color · align · family · spacing' },
  { group: 'typography', name: 'Text', slug: 'text', props: 'as · size: 1–7 · weight: regular | medium | semibold | bold · transform: none | uppercase | lowercase | capitalize · color · align · family · spacing' },
  { group: 'form', name: 'Action', slug: 'action', props: 'variant · href · isLoading · disabled · iconOnly · native button/link props' },
  { group: 'form', name: 'Field', slug: 'field', props: 'id · label · hint · error · children' },
  { group: 'form', name: 'Input', slug: 'input', props: 'label · hint · error · isLoading · native input props' },
  { group: 'form', name: 'Textarea', slug: 'textarea', props: 'label · hint · error · isLoading · native textarea props' },
  { group: 'form', name: 'Select', slug: 'select', props: 'options · value · defaultValue · onChange · label · ariaLabel · disabled · required · error · hint · isLoading' },
  { group: 'form', name: 'Checkbox', slug: 'checkbox', props: 'label · checked · defaultChecked · onChange · disabled · error' },
  { group: 'form', name: 'Toggle', slug: 'toggle', props: 'label · checked · defaultChecked · onChange · disabled · error' },
  { group: 'modules', name: 'Breadcrumbs', slug: 'breadcrumbs', props: 'items: { label, href? }[]' },
  { group: 'overlay', name: 'Icon', slug: 'icon', props: 'name: kebab-case | PascalCase · size: 24 by default · color · strokeWidth · className · SVG props · unknown-name fallback' },
  { group: 'overlay', name: 'Dropdown', slug: 'dropdown', props: 'label · plain · open · children · native details props' },
  { group: 'modules', name: 'Connection', slug: 'connection', props: 'status: connecting | live | offline' },
  { group: 'overlay', name: 'Toastify', slug: 'toastify', props: 'Global container in layout · toast.success(message) · toast.error(message) · useMutation feedback' },
  { group: 'overlay', name: 'Confirm', slug: 'confirm', props: 'label · description · onConfirm · disabled · variant · icon · iconOnly · ariaLabel · isLoading' },
  { group: 'modules', name: 'Empty', slug: 'empty', props: 'title · description · error? · heading · children' },
  { group: 'modules', name: 'Avatar', slug: 'avatar', props: 'name · url' },
  { group: 'modules', name: 'Loading', slug: 'loading', props: 'No props; localized route loading state' },
  { group: 'modules', name: 'Theme', slug: 'theme', props: 'initialTheme: light | dark | system' },
  { group: 'modules', name: 'GroupForm', slug: 'group-form', props: 'group? · locale · onSuccess(id)' },
  { group: 'modules', name: 'ListForm', slug: 'list-form', props: 'groupId · list? · onSuccess(id)' },
  { group: 'modules', name: 'Form', slug: 'form', props: 'item · onSuccess()' },
  { group: 'modules', name: 'Add', slug: 'add', props: 'listId · onSuccess() · sticky below header' },
  { group: 'modules', name: 'Mutation', slug: 'mutation', props: 'label · operation · onSuccess · confirmation · variant · icon · iconOnly · ariaLabel · disabled · compact' },
  { group: 'modules', name: 'Google', slug: 'google', props: 'locale · configured · next?' },
  { group: 'modules', name: 'Logout', slug: 'logout', props: 'locale' },
  { group: 'modules', name: 'Languages', slug: 'language', props: 'No props; current pathname and locale are preserved' },
] as const

export type CatalogEntry = typeof CATALOG[number]

export type ComponentName = CatalogEntry['name']
