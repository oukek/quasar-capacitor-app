import { storage } from './storage'

// 使用window属性来保存VConsole实例，确保全局访问
declare global {
  interface Window {
    vConsoleInstance?: any
    VConsole?: any
  }
}

/**
 * 初始化VConsole调试工具
 * @returns 初始化是否成功
 */
export function initVConsole(): boolean {
  try {
    // 如果已经初始化，则不再重复初始化
    if (window.vConsoleInstance) {
      console.log('VConsole已经初始化')
      return true
    }

    // 创建新的VConsole实例
    window.vConsoleInstance = new window.VConsole()
    console.log('VConsole初始化成功')

    // 保存状态到本地存储
    storage.save('vConsoleEnabled', true)
    return true
  }
  catch (error) {
    console.error('初始化VConsole失败:', error)
    return false
  }
}

/**
 * 销毁VConsole实例
 * @returns 销毁是否成功
 */
export function destroyVConsole(): boolean {
  try {
    console.log('尝试销毁VConsole...')

    if (window.vConsoleInstance) {
      console.log('找到VConsole实例，正在销毁...')
      window.vConsoleInstance.destroy()
      window.vConsoleInstance = undefined

      // 更新本地存储状态
      storage.save('vConsoleEnabled', false)
      console.log('VConsole已销毁')
      return true
    }

    console.log('未找到VConsole实例')
    storage.save('vConsoleEnabled', false)
    return false
  }
  catch (error) {
    console.error('销毁VConsole失败:', error)
    // 发生错误时也重置状态
    storage.save('vConsoleEnabled', false)
    return false
  }
}

/**
 * 检查VConsole是否已初始化
 * @returns 是否已初始化
 */
export function isVConsoleInitialized(): boolean {
  return !!window.vConsoleInstance
}

/**
 * 切换VConsole的启用状态
 * @returns 当前的启用状态
 */
export function toggleVConsole(): boolean {
  if (isVConsoleInitialized()) {
    const success = destroyVConsole()
    if (success) {
      showToast('调试模式已关闭')
    }
    return false
  }
  else {
    const success = initVConsole()
    if (success) {
      showToast('调试模式已启用')
    }
    return true
  }
}

/**
 * 根据存储的状态自动初始化VConsole
 * 此函数应在应用启动时调用
 * @returns 是否成功初始化
 */
export function autoInitVConsole(): boolean {
  // 如果已经初始化，直接返回true
  if (isVConsoleInitialized()) {
    return true
  }

  // 检查本地存储中是否设置为启用
  const vConsoleEnabled = storage.load<boolean>('vConsoleEnabled', false)
  if (vConsoleEnabled) {
    return initVConsole()
  }

  return false
}
