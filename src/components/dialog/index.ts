// 从Vue框架中导入Component类型，用于类型声明
import type { Component } from 'vue'
import { createApp, getCurrentInstance } from 'vue'

// 导入相关的模块和组件
import { Dialog } from './dialog' // 导入Dialog核心类，负责对话框实例的创建和生命周期管理
import DialogApp from './DialogApp.vue' // 导入对话框的Vue主组件，作为所有对话框的容器
import registerList, { register } from './register' // 导入预设对话框列表和注册函数
import { rawState, state } from './state' // 导入状态管理对象，rawState为原始状态，state为响应式状态
import type { UseDialog } from './type' // 导入类型定义，包含对话框相关的接口和类型

// 创建独立的Vue应用实例用于管理对话框，与主应用分离
const dialogApp = createApp(DialogApp) // 创建专用的Vue应用实例，用于渲染所有弹窗
let dom = document.getElementById('app-dialog')
if (!dom) {
  dom = document.createElement('div')
  dom.id = 'app-dialog'
  document.body.appendChild(dom)
}
dialogApp.mount('#app-dialog') // 将应用挂载到DOM中id为app-dialog的元素，此元素应该在HTML中预先定义
register(dialogApp) // 向对话框应用注册全局组件，使这些组件在所有对话框中可用

/**
 * 注册对话框配置到系统中
 * 显示对话框前必须先注册，系统才能找到对应的组件和配置信息
 *
 * @param dialog 对话框配置对象，包含名称、组件和其他配置信息
 */
function registerDialog(key: string, dialog: Component | { componentName?: string, component: Component, opts?: UseDialog.DialogOpt }) {
  // 将对话框配置存储到全局映射表中
  // dialogName为优先使用的名称，如果未提供则使用name属性
  // 这允许在注册时使用不同的标识符
  rawState.globalDialogMap.set(key, dialog)
}

// 遍历预定义的对话框列表并注册每一个
// registerList可能包含系统默认的通用对话框，如确认框、警告框等
Object.entries(registerList).forEach(([key, value]) => {
  registerDialog(key, value)
})

/**
 * 创建对话框管理Hook，用于在Vue组件中使用对话框功能
 * 支持全局对话框和局部对话框
 *
 * @param localDialog 局部对话框配置映射表，可以是组件直接引用或带有附加配置的对象
 *                    - 键为对话框名称
 *                    - 值可以是Vue组件或包含组件和配置的对象
 * @returns 返回一组对话框操作函数和状态
 */
export function useDialog<
  T extends string,
  C extends Component | { componentName?: string, component: Component, opts?: UseDialog.DialogOpt },
>(
  localDialog?: Record<T, C>,
) {
  // 获取当前组件实例，用于局部对话框的上下文管理
  // 如果在setup外部调用，可能为null
  const parent = getCurrentInstance()

  // 如果有父组件实例且提供了局部对话框配置，将配置附加到父组件上
  // 这使得局部对话框可以访问所在组件的上下文
  if (parent && localDialog) {
    // 前面的分号是为了防止JavaScript的自动分号插入机制导致的问题
    ;(parent as any).localDialog = localDialog
  }

  // 返回对话框管理工具集，提供一系列操作对话框的方法
  return {
    registerDialog, // 导出注册函数，允许动态注册新的对话框
    app: dialogApp, // 导出对话框应用实例，允许进行高级定制
    state, // 导出响应式状态，用于监听对话框状态变化
    rawState, // 导出原始状态，用于直接操作状态

    /**
     * 创建并获取一个新的对话框实例
     * 每次调用都会创建新实例，适合需要多个同类型对话框同时显示的场景
     *
     * @param name 对话框名称，可以是泛型T定义的名称或者系统内置的'PhotoPreview'
     * @param opts 对话框配置选项，可自定义对话框行为和样式
     * @returns 返回新创建的对话框实例，可以调用其方法控制对话框
     */
    get: (name: T | 'PhotoPreview', opts?: UseDialog.DialogOpt) => {
      return new Dialog(false, parent, name, opts)
    },

    /**
     * 获取单例对话框实例
     * 如果同名对话框已存在则返回现有实例，否则创建新实例
     * 保证同一时间只有一个指定名称的对话框存在，适合系统级别的对话框
     *
     * @param name 对话框名称，可以是泛型T定义的名称或者系统内置的'PhotoPreview'
     * @param opts 对话框配置选项
     * @returns 返回对话框单例实例
     */
    getSingle: (name: T | 'PhotoPreview', opts?: UseDialog.DialogOpt) => {
      const singleDialog = rawState.singleDialogMap.get(name)
      return singleDialog as Dialog || new Dialog(true, parent, name, opts)
    },

    /**
     * 通过UUID获取已创建的对话框实例
     * UUID是对话框创建时自动生成的唯一标识符
     *
     * @param uuid 对话框的唯一标识符
     * @returns 返回对应UUID的对话框实例，不存在则返回undefined
     */
    getInstance: (uuid: string) => rawState.dialogMap.get(uuid),

    /**
     * 关闭所有当前打开的对话框
     * 适用于需要重置UI状态或在路由切换时清理对话框的场景
     */
    closeAll: () => {
      // 当显示列表中还有对话框时持续执行
      while (state.showList.length) {
        // 从显示列表末尾取出对话框数据
        const item = state.showList.pop() as UseDialog.DialogData
        // 尝试关闭普通对话框实例（可能不存在，所以使用可选链调用）
        rawState.dialogMap.get(item.uuid)?.close()
        // 尝试关闭单例对话框实例（可能不存在，所以使用可选链调用）
        rawState.singleDialogMap.get(item.name)?.close()
      }
    },
  }
}
