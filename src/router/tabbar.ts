import type { RouteRecordRaw } from 'vue-router'

export interface TabItem {
  name: string
  icon: string
  route: RouteRecordRaw
}

export const tabBarList: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('pages/IndexPage.vue'),
    meta: {
      title: '首页',
      icon: 'home',
    }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('pages/ProfilePage.vue'),
    meta: {
      title: '我的',
      icon: 'person',
    }
  }
]
