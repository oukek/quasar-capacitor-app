import type { RouteRecordRaw } from 'vue-router'
import { tabBarList } from 'src/router/tabbar'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      ...tabBarList,
      {
        path: '/settings',
        name: 'settings',
        component: () => import('pages/SettingsPage.vue'),
        meta: {
          title: '设置',
        }
      },
    ]
  }
]

export default routes

