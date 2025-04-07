import type { App, Component } from 'vue'

import type { UseDialog } from './type'
import Confirm from './ui/Confirm.vue'
import PhotoPreview from './ui/PhotoPreview.vue'

// 注册全局组件，配置默认配置，如果不需要默认配置，直接全局注册即可
const list: Record<string, Component | { componentName?: string, component: Component, opts?: UseDialog.DialogOpt }> = {
  PhotoPreview,
  Confirm,
}

export default list

export function register(app: App<Element>) {
  app.component('PhotoPreview', PhotoPreview)
  app.component('Confirm', Confirm)
}
