import type { Router, RouteLocationRaw, RouteLocationNamedRaw } from 'vue-router'
import { defaultNavigation } from 'src/config/navigation'

// 获取所有 tab 页面的路由名称
const tabPageNames = defaultNavigation.tabs.map(tab => tab.route.name as string)

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

    await this.router.replace(route)
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

    await this.router.push(route)
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

    this.router.back()
  }

  // 重定向到页面
  async redirectTo(route: RouteLocationRaw) {
    if (!this.router) {
      console.error('NavigationManager 未初始化')
      return
    }

    await this.router.replace(route)
  }
}

// 创建单例实例
export const NavigationManager = new NavigationManagerClass()

// 导出常用方法
export const switchTab = NavigationManager.switchTab.bind(NavigationManager)
export const navigateTo = NavigationManager.navigateTo.bind(NavigationManager)
export const navigateBack = NavigationManager.navigateBack.bind(NavigationManager)
export const redirectTo = NavigationManager.redirectTo.bind(NavigationManager)
