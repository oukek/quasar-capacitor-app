import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { Device } from '@capacitor/device'

// 应用ID（需替换为实际的App Store ID）
const APP_STORE_ID = '6743078687'

// 当前应用版本（此处写死，可以替换为动态获取）
const CURRENT_VERSION = '1.0.3'

// 默认地区代码
const DEFAULT_COUNTRY_CODE = 'us'

/**
 * 语言标签映射到国家代码
 */
const LANGUAGE_TO_COUNTRY: Record<string, string> = {
  // 中文相关
  hans: 'cn', // 简体中文
  hant: 'tw', // 繁体中文
  zh: 'cn',

  // 英文相关
  en: 'us',

  // 日语
  ja: 'jp',

  // 韩语
  ko: 'kr',

  // 其他常见语言
  fr: 'fr',
  es: 'es',
  de: 'de',
  it: 'it',
  ru: 'ru',
}

/**
 * 获取当前设备的地区代码
 * @returns 地区代码，如 'us', 'cn' 等
 */
export const getDeviceCountry = async (): Promise<string> => {
  // 如果是在原生环境中，尝试从设备获取地区
  if (Capacitor.isNativePlatform()) {
    try {
      const localeInfo = await Device.getLanguageTag()
      const languageTag = localeInfo.value.toLowerCase()
      console.log('languageTag', languageTag)

      // 先检查是否有标准格式如 zh-cn 或 zh-hans-cn
      const parts = languageTag.split('-')

      // 对于多段式标签（如zh-hans-cn），取最后一段作为国家代码
      if (parts.length > 2 && parts.length - 1 >= 0) {
        const lastPart = parts[parts.length - 1]
        if (lastPart) {
          return lastPart.toLowerCase()
        }
      }

      // 对于两段式标签（如zh-cn），取第二段作为国家代码
      if (parts.length > 1 && parts[1]) {
        // 检查第二段是否可能是国家代码（通常是2字符）
        if (parts[1].length === 2) {
          return parts[1].toLowerCase()
        }
        // 如果存在第三段，则使用第三段
        if (parts.length > 2 && parts[2]) {
          return parts[2].toLowerCase()
        }
      }

      // 否则尝试从映射表中查找
      if (LANGUAGE_TO_COUNTRY[languageTag]) {
        return LANGUAGE_TO_COUNTRY[languageTag]
      }

      // 最后检查主语言部分
      const mainLanguage = parts[0] || ''
      if (mainLanguage && LANGUAGE_TO_COUNTRY[mainLanguage]) {
        return LANGUAGE_TO_COUNTRY[mainLanguage]
      }
    }
    catch (error) {
      console.error('获取设备地区失败:', error)
    }
  }

  // 如果获取失败或非原生环境，返回默认地区
  return DEFAULT_COUNTRY_CODE
}

/**
 * 获取当前应用版本
 * @returns 当前应用版本号
 */
export const getCurrentVersion = async (): Promise<string> => {
  // 如果是在原生环境中，尝试从设备获取版本
  if (Capacitor.isNativePlatform()) {
    try {
      const info = await App.getInfo()
      return info.version
    }
    catch (error) {
      console.error('获取应用版本失败:', error)
      return CURRENT_VERSION
    }
  }
  // 非原生环境返回写死的版本号
  return CURRENT_VERSION
}

/**
 * 查询App Store上的应用信息
 * @param appId App Store应用ID，如果不传则使用默认ID
 * @param countryCode 国家/地区代码，如果不传则自动获取设备当前地区
 * @returns 应用信息对象，包含版本号、描述等
 */
export const getAppStoreInfo = async (appId: string = APP_STORE_ID, countryCode?: string): Promise<any> => {
  try {
    // 如果没有提供国家/地区代码，则获取设备当前地区
    const country = countryCode || await getDeviceCountry()

    // 在URL中将地区代码放在域名和路径之间
    const response = await fetch(`https://www.advink.cn/api/itunes/${country}/lookup?id=${appId}`)
    const data = await response.json()

    if (data.resultCount > 0) {
      return data.results[0]
    }
    else {
      throw new Error('未找到应用信息')
    }
  }
  catch (error) {
    console.error('获取App Store信息失败:', error)
    throw error
  }
}

/**
 * 获取App Store上的应用版本号
 * @param appId App Store应用ID
 * @param countryCode 国家/地区代码，如果不传则自动获取设备当前地区
 * @returns 最新版本号
 */
export const getAppStoreVersion = async (appId: string = APP_STORE_ID, countryCode?: string): Promise<string> => {
  try {
    const appInfo = await getAppStoreInfo(appId, countryCode)
    return appInfo.version
  }
  catch (error) {
    console.error('获取App Store版本失败:', error)
    throw error
  }
}

/**
 * 检查应用是否有新版本
 * @param appId App Store应用ID
 * @param countryCode 国家/地区代码，如果不传则自动获取设备当前地区
 * @returns 是否有新版本，版本信息及更新内容
 */
export const checkForUpdates = async (appId: string = APP_STORE_ID, countryCode?: string): Promise<{
  hasUpdate: boolean
  storeVersion: string
  currentVersion: string
  releaseNotes?: string
}> => {
  const currentVersion = await getCurrentVersion()
  const appInfo = await getAppStoreInfo(appId, countryCode)
  const storeVersion = appInfo.version

  // 将版本号拆分成数组并比较
  const currentParts = currentVersion.split('.').map((part: string) => Number(part) || 0)
  const storeParts = storeVersion.split('.').map((part: string) => Number(part) || 0)

  // 确保两个数组长度相同
  const maxLength = Math.max(currentParts.length, storeParts.length)
  while (currentParts.length < maxLength) currentParts.push(0)
  while (storeParts.length < maxLength) storeParts.push(0)

  // 逐位比较版本号
  let hasUpdate = false
  for (let i = 0; i < maxLength; i++) {
    if ((storeParts[i]!) > (currentParts[i]!)) {
      hasUpdate = true
      break
    }
    else if ((storeParts[i]!) < (currentParts[i]!)) {
      break
    }
  }

  return {
    hasUpdate,
    storeVersion,
    currentVersion,
    releaseNotes: appInfo.releaseNotes,
  }
}

/**
 * 跳转到App Store的应用下载页面
 * @param appId App Store应用ID
 * @param countryCode 国家/地区代码，如果不传则自动获取设备当前地区
 */
export const openAppStore = async (appId: string = APP_STORE_ID, countryCode?: string): Promise<void> => {
  // 获取国家/地区代码
  const country = countryCode || await getDeviceCountry()

  // 使用itms-apps URL方案直接打开App Store应用
  // 在URL中添加国家/地区代码
  const url = `itms-apps://itunes.apple.com/${country}/app/id${appId}`

  if (Capacitor.isNativePlatform()) {
    // 在原生环境下，直接通过URL Scheme打开App Store应用
    window.open(url, '_system')
  }
  else {
    // 在非原生环境下，使用普通的窗口打开方法
    // 非原生环境可能无法直接打开App Store，使用网页版
    window.open(`https://apps.apple.com/${country}/app/id${appId}`, '_blank')
  }
}
