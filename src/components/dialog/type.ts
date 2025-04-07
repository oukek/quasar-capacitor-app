import type { useDialog } from './index'

/**
 * UseDialog 命名空间定义了与对话框相关的类型
 * 提供了对话框的配置选项和数据结构
 */
export declare namespace UseDialog {
  /** useDialog hook的类型定义 */
  export type useDialogType = typeof useDialog

  /** 对话框选项，用于配置对话框的行为和外观 */
  export type DialogOpt = Partial<{
    /** 是否可以点击背景触发关闭弹窗 */
    maskClose: boolean
    /** 弹窗内容显示时的动画名称 */
    animName: string
    /** 弹窗背景蒙版显示的动画名称（黑色遮罩） */
    maskAnimName: string
    /** 弹窗蒙版的背景颜色 */
    maskBgColor: string
  }>

  /**
   * 对话框数据接口，包含对话框的所有属性和状态
   * @template Props 传递给对话框组件的属性类型，默认为任意键值对
   */
  export interface DialogData<Props = Record<string, any>> {
    /** 唯一标识ID */
    uuid: string
    /** 对话框名称 */
    name: string
    /** 对话框组件名称 */
    componentName: string
    /** 传递给对话框组件的属性 */
    props: Props
    /** 对话框配置选项 */
    opts: DialogOpt
    /** 是否为局部弹窗（而非全局弹窗） */
    isLocal: boolean
    /** 对话框是否正在显示 */
    isShowing: boolean
  }

  /**
   * 对话框注册类型，用于注册新的对话框
   */
  export type DialogRegisterType = Record<string, any> & {
    /** 对话框名称 */
    name: string
    /** 对话框显示名称（可选） */
    dialogName?: string
    /** 对话框组件名称（可选） */
    componentName?: string
    /** 对话框配置选项 */
    opts: DialogOpt
  }
}
