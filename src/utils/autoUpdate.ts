import { Capacitor } from '@capacitor/core'
import { useDialog } from 'src/components/dialog'

import { checkForUpdates, openAppStore } from './appInfo'

const dialog = useDialog()

// 设置检查更新的间隔时间（12小时，单位毫秒）
const CHECK_INTERVAL = 12 * 60 * 60 * 1000
// 设置检查更新的定时器
let updateTimer: ReturnType<typeof setTimeout> | null = null
// 当前会话中用户是否拒绝更新的标识（内存变量，不持久化）
let userRejectedUpdate = false
// 当前会话中上次检查更新的时间（内存变量，不持久化）
let lastCheckTime = 0

/**
 * 初始化自动检测更新
 * 在应用启动时调用
 */
export const initAutoUpdate = () => {
  if (!Capacitor.isNativePlatform()) {
    return
  }

  // 应用每次启动时，重置拒绝状态
  userRejectedUpdate = false
  // 重置上次检查时间
  lastCheckTime = 0

  // 启动自动检查（因为每次应用启动都重置了拒绝状态）
  startAutoCheck()
}

/**
 * 开始定时检测更新
 */
export const startAutoCheck = () => {
  // 防止重复启动定时器
  if (updateTimer) {
    return
  }

  // 如果用户在本次会话中拒绝了更新，不进行检查
  if (userRejectedUpdate) {
    return
  }

  const now = Date.now()

  // 如果距离上次检查时间超过设定的间隔，立即检查
  if (now - lastCheckTime > CHECK_INTERVAL) {
    checkUpdateAndShowDialog()
  }

  // 设置定时器，每隔一段时间检查一次
  updateTimer = setInterval(() => {
    // 如果用户在本次会话中拒绝了更新，取消定时器
    if (userRejectedUpdate) {
      stopAutoCheck()
      return
    }
    checkUpdateAndShowDialog()
  }, CHECK_INTERVAL)
}

/**
 * 停止定时检测更新
 */
export const stopAutoCheck = () => {
  if (updateTimer) {
    clearInterval(updateTimer)
    updateTimer = null
  }
}

/**
 * 检查更新并显示对话框
 */
export const checkUpdateAndShowDialog = async () => {
  try {
    // 如果用户在本次会话中拒绝了更新，不进行检查
    if (userRejectedUpdate) {
      return
    }

    // 记录本次检查时间（仅在内存中）
    lastCheckTime = Date.now()

    const { hasUpdate, storeVersion, currentVersion, releaseNotes } = await checkForUpdates()

    if (hasUpdate) {
      showUpdateDialog(storeVersion, currentVersion, releaseNotes)
    }
  }
  catch (error) {
    console.error('自动检查更新失败:', error)
  }
}

/**
 * 显示更新对话框
 */
export const showUpdateDialog = (storeVersion: string, currentVersion: string, releaseNotes?: string) => {
  dialog.get('Confirm').on('confirm', (instance) => {
    openAppStore()
    instance.close()
  }).on('cancel', (instance) => {
    // 用户拒绝更新，仅在当前会话中标记，不持久化存储
    userRejectedUpdate = true
    stopAutoCheck()
    instance.close()
  }).show({
    title: '发现新版本',
    message: `<div>当前版本: ${currentVersion}<br>最新版本: ${storeVersion}<br><br>更新内容:<br>${releaseNotes?.replace(/\n/g, '<br>') || '暂无更新说明'}</div>`,
    confirmButtonText: '立即更新',
    cancelButtonText: '取消',
    showCancelButton: true,
  })
}
