<template>
  <q-page class="settings-page">
    <q-list padding>
      <q-item-label header>通用设置</q-item-label>

      <q-item tag="label">
        <q-item-section>
          <q-item-label>深色模式</q-item-label>
          <q-item-label caption>切换应用的深色/浅色主题</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle v-model="darkMode" />
        </q-item-section>
      </q-item>

      <q-item tag="label">
        <q-item-section>
          <q-item-label>消息通知</q-item-label>
          <q-item-label caption>接收应用的推送通知</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle v-model="notifications" />
        </q-item-section>
      </q-item>

      <q-separator spaced />

      <q-item-label header>隐私设置</q-item-label>

      <q-item clickable v-ripple>
        <q-item-section>
          <q-item-label>修改密码</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" />
        </q-item-section>
      </q-item>

      <q-item clickable v-ripple>
        <q-item-section>
          <q-item-label>隐私政策</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" />
        </q-item-section>
      </q-item>

      <q-separator spaced />

      <q-item-label header>其他</q-item-label>

      <q-item>
        <q-item-section>
          <q-item-label>清除缓存</q-item-label>
          <q-item-label caption>{{ cacheSize }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn flat color="primary" label="清除" @click="clearCache" />
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section>
          <q-item-label>当前版本</q-item-label>
          <q-item-label caption>v1.0.0</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

    <div class="logout-section q-pa-md">
      <q-btn
        color="negative"
        class="full-width"
        label="退出登录"
        @click="handleLogout"
      />
    </div>
  </q-page>
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
  background-color: #f5f5f5;
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
