<template>
  <div class="settings-page">
    <van-cell-group inset title="通用设置">
      <van-cell title="深色模式" label="切换应用的深色/浅色主题">
        <template #right-icon>
          <van-switch v-model="darkMode" />
        </template>
      </van-cell>
      <van-cell title="消息通知" label="接收应用的推送通知">
        <template #right-icon>
          <van-switch v-model="notifications" />
        </template>
      </van-cell>
    </van-cell-group>

    <van-cell-group inset title="隐私设置">
      <van-cell title="修改密码" is-link />
      <van-cell title="隐私政策" is-link />
    </van-cell-group>

    <van-cell-group inset title="其他">
      <van-cell title="清除缓存" :value="cacheSize">
        <template #right-icon>
          <van-button size="small" type="primary" @click="clearCache">清除</van-button>
        </template>
      </van-cell>
      <van-cell title="当前版本" value="v1.0.0" />
    </van-cell-group>

    <div class="logout-section">
      <van-button
        type="danger"
        block
        @click="handleLogout"
      >退出登录</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const darkMode = ref(false)
const notifications = ref(true)
const cacheSize = ref('23.5MB')

const clearCache = () => {
  // 实现清除缓存的逻辑
}

const handleLogout = () => {
  // 实现退出登录的逻辑
}
</script>

<style scoped>
.settings-page {
  background-color: var(--color-background-2);
  min-height: 100vh;
}

.logout-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background-color: white;
}
</style>
