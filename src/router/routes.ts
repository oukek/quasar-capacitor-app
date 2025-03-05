import type { RouteRecordRaw } from 'vue-router'
import { defaultNavigation } from 'src/config/navigation'

// 从导航配置中提取路由
const tabRoutes = defaultNavigation.tabs.map(tab => tab.route)

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      ...tabRoutes,
      {
        path: '/settings',
        name: 'settings',
        component: () => import('pages/SettingsPage.vue'),
        meta: {
          title: '设置',
          showHeader: true,
          showBack: true
        }
      },
      // 添加更多路由...
    ]
  }
]

export default routes

