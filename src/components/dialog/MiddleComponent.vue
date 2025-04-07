<script lang="ts" setup>
import { getCurrentInstance, onMounted, provide, reactive, ref, watch } from 'vue'

import { useDialog } from '.'
import { rawState } from './state'

const props = defineProps({
  uuid: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  },
  componentName: {
    type: String,
    default: '',
  },
  isLocal: {
    type: Boolean,
    default: false,
  },
  componentProps: {
    type: Object,
    default: () => {},
  },
})

const emits = defineEmits(['createRef', 'close'])

const instance = getCurrentInstance()
const hadInit = ref(!props.isLocal)
provide('uuid', props.uuid)

const dialog = useDialog()

function registerLocalComponent() {
  if (!(instance as any).components) {
    ;(instance as any).components = {}
  }
  ;(instance as any).components[props.componentName] = rawState.dialogMap.get(props.uuid)?.componentOptions
  hadInit.value = true
}

watch(
  () => props.isLocal,
  () => {
    hadInit.value = false
    if (props.isLocal) {
      registerLocalComponent()
    }
    else {
      delete (instance as any)?.components?.[props.componentName]
      hadInit.value = true
    }
  },
)

onMounted(() => {
  if (props.isLocal) {
    hadInit.value = false
    registerLocalComponent()
  }
})

// 创建事件转发函数
function handleEvent(eventName: string, ...args: any[]) {
  if (eventName === 'close') {
    emits('close')
    return
  }
  dialog.getInstance(props.uuid)?.emit(eventName, ...args, dialog.getInstance(props.uuid))
}

// 创建事件处理对象
const eventHandlers = reactive<Record<string, (...args: any[]) => void>>({})

// 挂载时动态获取组件可能的事件
onMounted(() => {
  // 如果有可能，获取组件定义的 emits 选项
  const component = rawState.dialogMap.get(props.uuid)?.componentOptions
  if (component && component.emits) {
    // 为每个声明的事件创建处理函数
    if (Array.isArray(component.emits)) {
      component.emits.forEach((event: string) => {
        eventHandlers[event] = (...args: any[]) => handleEvent(event, ...args)
      })
    }
    else if (typeof component.emits === 'object') {
      Object.keys(component.emits).forEach((event: string) => {
        eventHandlers[event] = (...args: any[]) => handleEvent(event, ...args)
      })
    }
  }
})

function createRef(el: any) {
  emits('createRef', el)
}
</script>

<template>
  <component
    :is="componentName"
    v-if="hadInit"
    :ref="createRef"
    v-bind="componentProps"
    v-on="eventHandlers"
  />
</template>
