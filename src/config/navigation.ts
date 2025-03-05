import type { RouteRecordRaw } from 'vue-router'

export interface TabItem {
  name: string
  icon: string
  route: RouteRecordRaw
  badge?: number | string
}

export interface NavigationConfig {
  showTabBar: boolean
  tabs: TabItem[]
}

export const defaultNavigation: NavigationConfig = {
  showTabBar: true,
  tabs: [
    {
      name: '首页',
      icon: 'home',
      route: {
        path: '/',
        name: 'home',
        component: () => import('pages/IndexPage.vue')
      }
    },
    {
      name: '我的',
      icon: 'person',
      route: {
        path: '/profile',
        name: 'profile',
        component: () => import('pages/ProfilePage.vue')
      }
    }
  ]
}
