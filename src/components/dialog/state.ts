import type { Component } from 'vue'
import { reactive } from 'vue'

import type { Dialog } from './dialog'
import type { UseDialog } from './type'

/**
 * 对话框状态管理的原始数据
 * 这些数据不会被响应式系统监听，用于存储对话框相关的引用和映射关系
 */
export const rawState: {
  /** 存储对话框组件引用的Map集合 */
  refs: Map<string, any>
  /** 存储全局对话框实例的Map集合，key为对话框uuid，value为对话框实例 */
  dialogMap: Map<string, Dialog>
  /** 存储单例对话框实例的Map集合，key为对话框名称，value为对话框实例 */
  singleDialogMap: Map<string, Dialog>
  /** 存储全局对话框注册信息的Map集合，key为对话框名称，value为对话框注册信息 */
  globalDialogMap: Map<string, Component | { componentName?: string, component: Component, opts?: UseDialog.DialogOpt }>
} = {
  refs: new Map(),
  dialogMap: new Map(),
  singleDialogMap: new Map(),
  globalDialogMap: new Map(),
}

/**
 * 响应式状态对象
 * 用于管理当前显示的对话框列表，会触发视图更新
 */
export const state = reactive<{
  /** 当前正在显示的对话框数据列表 */
  showList: UseDialog.DialogData[]
}>({
  showList: [],
})
