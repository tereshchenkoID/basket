export const NAVIGATION = {
  home: {
    text: 'home',
    icon: 'house',
    url: '/',
  },
  login: {
    text: 'signIn',
    icon: 'log-in',
    url: '/login',
  },
} as const

export const ROUTES_USER = {
  dashboard: {
    text: 'dashboard',
    icon: 'layout-dashboard',
    url: '/dashboard',
  },
  group: {
    text: 'openGroup',
    url: (groupId: string) => `/groups/${encodeURIComponent(groupId)}`,
  },
  list: {
    text: 'openList',
    url: (groupId: string, listId: string) => `/groups/${encodeURIComponent(groupId)}/lists/${encodeURIComponent(listId)}`,
  },
  invite: {
    url: (token: string) => `/invite/${encodeURIComponent(token)}`,
  },
} as const

export const ROUTES_AUTH = {
  callback: {
    url: '/auth/callback',
  },
} as const

export const ROUTES_DEV = {
  uiKit: {
    text: 'Overview',
    url: '/ui-kit',
  },
  group: {
    url: (group: string) => `/ui-kit/${encodeURIComponent(group)}`,
  },
  component: {
    url: (group: string, component: string) => `/ui-kit/${encodeURIComponent(group)}/${encodeURIComponent(component)}`,
  },
} as const
