import type { Router, RouteLocationRaw, RouteLocationNamedRaw } from 'vue-router'
import { tabBarList } from 'src/router/tabbar'

// 获取所有 tab 页面的路由名称
const tabPageNames = tabBarList.map(tab => tab.name as string)

// 自定义路由类型
interface CustomRouteLocation {
  name?: string
  path?: string
  params?: Record<string, string | number>
  query?: Record<string, string | number | Array<string | number>>
  meta?: {
    transition?: string
    [key: string]: string | number | boolean | undefined
  }
}

class NavigationManagerClass {
  private router: Router | null = null

  init(router: Router) {
    this.router = router
  }

  // 判断是否是 tab 页面
  isTabPage(routeName: string) {
    return tabPageNames.includes(routeName)
  }

  // 获取路由名称
  private getRouteName(route: RouteLocationRaw): string | undefined {
    if (typeof route === 'string') {
      return route
    }
    return (route as RouteLocationNamedRaw).name?.toString()
  }

  // 切换到 tab 页面
  async switchTab(route: RouteLocationRaw) {
    if (!this.router) {
      console.error('NavigationManager 未初始化')
      return
    }

    const targetName = this.getRouteName(route)
    if (!targetName || !this.isTabPage(targetName)) {
      console.warn('switchTab 只能用于 tab 页面')
      return
    }

    // Tab 切换不需要动画
    const normalizedRoute = this.normalizeRoute(route)
    await this.router.replace({
      ...normalizedRoute,
      meta: { transition: 'none' }
    } as RouteLocationRaw)
  }

  // 普通页面导航
  async navigateTo(route: RouteLocationRaw) {
    if (!this.router) {
      console.error('NavigationManager 未初始化')
      return
    }

    const targetName = this.getRouteName(route)
    if (targetName && this.isTabPage(targetName)) {
      return this.switchTab(route)
    }

    // 新页面从右往左滑入
    const normalizedRoute = this.normalizeRoute(route)
    await this.router.push({
      ...normalizedRoute,
      meta: { transition: 'slide-left' }
    } as RouteLocationRaw)
  }

  // 返回上一页
  async navigateBack() {
    if (!this.router) {
      console.error('NavigationManager 未初始化')
      return
    }

    const currentRoute = this.router.currentRoute.value
    if (this.isTabPage(currentRoute.name as string)) {
      return
    }

    // 设置返回动画
    if (currentRoute.meta.transition !== 'none') {
      currentRoute.meta.transition = 'slide-right'
    }
    this.router.back()
  }

  // 重定向到页面
  async redirectTo(route: RouteLocationRaw) {
    if (!this.router) {
      console.error('NavigationManager 未初始化')
      return
    }

    // 重定向不需要动画
    const normalizedRoute = this.normalizeRoute(route)
    await this.router.replace({
      ...normalizedRoute,
      meta: { transition: 'none' }
    } as RouteLocationRaw)
  }

  // 规范化路由对象
  private normalizeRoute(route: RouteLocationRaw): CustomRouteLocation {
    if (typeof route === 'string') {
      return { path: route }
    }
    return route as CustomRouteLocation
  }
}

// 创建单例实例
export const NavigationManager = new NavigationManagerClass()

// 导出常用方法
export const switchTab = NavigationManager.switchTab.bind(NavigationManager)
export const navigateTo = NavigationManager.navigateTo.bind(NavigationManager)
export const navigateBack = NavigationManager.navigateBack.bind(NavigationManager)
export const redirectTo = NavigationManager.redirectTo.bind(NavigationManager)
