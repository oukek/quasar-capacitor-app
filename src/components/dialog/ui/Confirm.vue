<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  message: {
    type: [String, Function],
    default: '',
  },
  showConfirmButton: {
    type: Boolean,
    default: true,
  },
  showCancelButton: {
    type: Boolean,
    default: false,
  },
  confirmButtonText: {
    type: String,
    default: '确认',
  },
  cancelButtonText: {
    type: String,
    default: '取消',
  },
  confirmButtonColor: {
    type: String,
    default: '#ee0a24',
  },
  cancelButtonColor: {
    type: String,
    default: '#323233',
  },
})
const emits = defineEmits(['close', 'confirm', 'cancel'])

const messageContent = computed(() => {
  if (typeof props.message === 'function') {
    return props.message()
  }
  return props.message
})

const isMessageFunction = computed(() => {
  return typeof props.message === 'function'
})

function handleCancel() {
  emits('cancel')
}

function handleConfirm() {
  emits('confirm')
}
</script>

<template>
  <div class="custom-dialog__content">
    <!-- 标题 -->
    <div v-if="title" class="custom-dialog__header">
      {{ title }}
    </div>

    <!-- 内容 -->
    <div class="custom-dialog__message" v-if="message">
      <div v-if="isMessageFunction" class="custom-dialog__message-text">
        <component :is="messageContent" />
      </div>
      <div v-else-if="typeof message === 'string'" class="custom-dialog__message-text" v-html="message"></div>
    </div>
    <div class="custom-dialog__message" v-else>
      <slot></slot>
    </div>

    <!-- 底部按钮 -->
    <div class="custom-hairline--top custom-dialog__footer" v-if="showCancelButton || showConfirmButton">
      <button
        v-if="showCancelButton"
        class="custom-dialog__cancel custom-button"
        @click="handleCancel"
        :style="{color: cancelButtonColor}"
      >
        {{ cancelButtonText }}
      </button>
      <button
        v-if="showConfirmButton"
        class="custom-dialog__confirm custom-button"
        @click="handleConfirm"
        :style="{color: confirmButtonColor}"
      >
        {{ confirmButtonText }}
      </button>
    </div>
  </div>
</template>

<style lang="less" scoped>
.custom-dialog {
  &__header {
    padding: 26px 16px 0;
    font-weight: 500;
    line-height: 24px;
    text-align: center;
    font-size: 16px;
  }

  &__content {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-size: 14px;
    background-color: #fff;
    border-radius: 16px;
    width: 320px;
    max-width: 85vw;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    &--isolated {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 104px;
    }
  }

  &__message {
    flex: 1;
    padding: 26px 16px;
    overflow-y: auto;
    text-align: center;
    -webkit-overflow-scrolling: touch;

    &-text {
      line-height: 20px;
    }
  }

  &__footer {
    display: flex;
    overflow: hidden;
    position: relative;

    .custom-button {
      flex: 1;
      height: 48px;
      font-size: 16px;
      border: none;
      background-color: transparent;
      cursor: pointer;
      padding: 0;
      margin: 0;
      border-radius: 0;
      appearance: none;
      -webkit-appearance: none;
    }

    .custom-dialog__cancel {
      position: relative;
      &::after {
        position: absolute;
        box-sizing: border-box;
        content: ' ';
        pointer-events: none;
        top: 0;
        bottom: 0;
        right: 0;
        border-right: 1px solid #ebedf0;
        transform: scaleX(0.5);
      }
    }
  }

  .custom-hairline--top::after {
    border-top: 1px solid #ebedf0;
  }
}

.custom-hairline--top::after {
  border-top: 1px solid #ebedf0;
  position: absolute;
  box-sizing: border-box;
  content: ' ';
  pointer-events: none;
  top: 0;
  right: 0;
  left: 0;
  transform: scaleY(0.5);
}
</style>
