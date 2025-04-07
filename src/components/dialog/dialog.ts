import { eventBus } from 'src/utils/eventBus'
import { type ComponentInternalInstance, reactive } from 'vue'

import { rawState, state } from './state'
import type { UseDialog } from './type'

/**
 * Dialog 类用于创建和管理弹窗
 * 支持全局弹窗和局部弹窗，可以单例模式或多实例模式
 */
export class Dialog {
  // 响应式数据，用于弹窗渲染和状态管理
  private state: UseDialog.DialogData = reactive({
    uuid: '', // 弹窗唯一标识
    name: '', // 弹窗名称
    componentName: '', // 弹窗对应的组件名
    props: {}, // 传递给弹窗组件的属性
    opts: {
      maskClose: true, // 是否允许点击遮罩关闭弹窗
      animName: 'bounce', // 弹窗动画名称
      maskAnimName: 'fade', // 遮罩动画名称
      maskBgColor: 'rgba(0, 0, 0, 0.8)', // 遮罩背景颜色
    },
    isLocal: false, // 是否为局部组件
    isShowing: false, // 弹窗是否正在显示
  })

  // 如果是局部组件，这个是获取到的局部组件的配置，不需要放进监听，需要的时候再注册即可
  // 具体注册方式看MiddleComponent.vue
  public componentOptions: any = null
  // 当前弹窗实例，具体获取方式看DialogApp.vue
  public el: any = null
  // 局部弹窗的话，会有一个父节点，就是这个
  public parent: ComponentInternalInstance | null = null
  // 创建弹窗时传入的默认配置
  public cacheOpts: UseDialog.DialogOpt = {}
  // 注册弹窗时设置的默认配置
  public componentRegisterOpts: UseDialog.DialogOpt = {}
  // 是否单实例模式（单例模式下，同一类型的弹窗只能存在一个实例）
  private isSingle = false

  // 关闭前的回调函数，返回true则阻止关闭
  public beforeCloseFn = async () => false

  /**
   * 构造函数
   * @param isSingle 是否单例模式
   * @param parent 父组件实例（局部弹窗时使用）
   * @param name 弹窗名称
   * @param opts 弹窗配置选项
   */
  constructor(isSingle: boolean, parent: ComponentInternalInstance | null, name: string, opts?: UseDialog.DialogOpt) {
    // 注册事件总线
    eventBus.register(this)
    this.isSingle = isSingle
    // 生成唯一ID
    this.state.uuid = `Dialog-${new Date().getTime()}-${Math.floor(Math.random() * 1000000)}`
    this.state.name = name
    this.state.componentName = name
    // 缓存配置
    Object.assign(this.cacheOpts, opts)
    this.parent = parent

    // 优先获取局部组件，不存在就获取全局组件
    // useDialogs是自定义在父组件上的一个对象，用于注册局部组件，类型为UseDialog.DialogRegisterType
    const localConfig
      = (this.parent as any)?.localDialog?.[this.state.name] || (this.parent?.type as any)?.useDialogs?.[this.state.name]

    if (localConfig) {
      // 处理局部组件
      this.state.isLocal = true
      if (!localConfig.component) {
        // 属于组件（非配置）形式的局部组件
        this.componentRegisterOpts = localConfig.props?.dialogOptions?.default() || localConfig.dialogOptions || {}
        this.componentOptions = localConfig
        return
      }
      // 配置形式的局部组件
      this.state.componentName = localConfig.componentName || this.state.name
      this.componentRegisterOpts = localConfig.opts || localConfig.component.dialogOptions || {}
      // 合并配置，优先级：传入opts > 缓存opts > 组件注册opts
      Object.assign(this.state.opts, this.componentRegisterOpts, this.cacheOpts, opts)
      this.componentOptions = localConfig.component
    }
    else {
      // 处理全局组件
      const globalConfig = rawState.globalDialogMap.get(this.state.name)
      console.log(this.state.name, globalConfig)
      if (!globalConfig) {
        return
      }
      if (!('component' in globalConfig)) {
        // 属于组件（非配置）形式的局部组件
        this.componentRegisterOpts = (globalConfig as any).props?.dialogOptions?.default() || (globalConfig as any).dialogOptions || {}
        this.componentOptions = globalConfig
        return
      }
      // 配置形式的局部组件
      this.state.componentName = globalConfig.componentName || this.state.name
      this.componentRegisterOpts = globalConfig.opts || globalConfig.component.dialogOptions || {}
      // 合并配置，优先级：传入opts > 缓存opts > 组件注册opts
      Object.assign(this.state.opts, this.componentRegisterOpts, this.cacheOpts, opts)
      this.componentOptions = globalConfig.component
    }
  }

  /**
   * 显示弹窗
   * @param props 传递给弹窗组件的属性
   * @param opts 弹窗配置选项
   * @returns Promise 延迟500ms后resolve，用于等待动画完成
   */
  public async show(props?: Record<string, any>, opts?: UseDialog.DialogOpt) {
    // 合并属性和配置
    Object.assign(this.state.props, props)
    Object.assign(this.state.opts, this.componentRegisterOpts, this.cacheOpts, opts)

    // 已经在显示中则不执行后续操作
    if (this.state.isShowing) {
      return
    }

    // 根据单例模式与否，将弹窗实例存入不同的Map中
    if (this.isSingle) {
      rawState.singleDialogMap.set(this.state.name, this)
    }
    else {
      rawState.dialogMap.set(this.state.uuid, this)
    }
    console.log('Dialog show', Array.from(rawState.dialogMap.values()))

    // 更新显示状态并添加到显示列表
    this.state.isShowing = true
    state.showList.push(this.state)

    // 返回Promise，延迟500ms后resolve，用于等待动画完成
    return new Promise((resolve) => {
      setTimeout(resolve, 500)
    })
  }

  /**
   * 关闭弹窗
   * @returns Promise 延迟后resolve，用于等待动画完成
   */
  public async close() {
    // 执行关闭前回调，如果返回true则阻止关闭
    const stop = await this.beforeCloseFn()
    if (stop) {
      return
    }

    // 更新显示状态
    this.state.isShowing = false

    return new Promise((resolve) => {
      setTimeout(() => {
        // 从显示列表中移除
        const index = state.showList.findIndex(item => item.uuid === this.state.uuid)
        if (index >= 0) {
          state.showList.splice(index, 1)
        }

        // 注销事件监听
        eventBus.unregister(this)

        // 从对应Map中移除实例
        if (this.isSingle) {
          rawState.singleDialogMap.delete(this.state.name)
        }
        else {
          rawState.dialogMap.delete(this.state.uuid)
        }

        // 延迟resolve，等待动画完成
        setTimeout(resolve, 500)
      }, 0)
    })
  }

  /**
   * 设置关闭前的回调函数
   * @param cb 回调函数，返回true则阻止关闭
   */
  public beforeClose(cb: () => Promise<boolean>) {
    this.beforeCloseFn = cb
  }

  /**
   * 注册事件监听
   * @param type 事件类型
   * @param handler 事件处理函数
   * @returns this 实例本身，支持链式调用
   */
  public on(type: string, handler: (...args: any) => any) {
    eventBus.on(type, handler, this)
    return this
  }

  /**
   * 注销事件监听
   * @param type 事件类型
   * @param handler 事件处理函数
   * @returns this 实例本身，支持链式调用
   */
  public off(type: string, handler: (...args: any) => any) {
    eventBus.off(type, handler, this)
    return this
  }

  /**
   * 触发事件
   * @param type 事件类型
   * @param params 事件参数
   * @returns this 实例本身，支持链式调用
   */
  public emit(type: string, ...params: any) {
    eventBus.emitToInstance(type, this, ...params)
    return this
  }
}
