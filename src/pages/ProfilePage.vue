<template>
  <q-page class="profile-page">
    <div class="user-info">
      <div class="avatar">
        <q-avatar size="80px">
          <img src="https://cdn.quasar.dev/img/avatar.png">
        </q-avatar>
      </div>
      <h2 class="username">用户名</h2>
    </div>

    <q-list bordered separator>
      <q-item clickable v-ripple @click="goToSettings">
        <q-item-section avatar>
          <q-icon name="settings" />
        </q-item-section>
        <q-item-section>设置</q-item-section>
      </q-item>

      <q-item clickable v-ripple>
        <q-item-section avatar>
          <q-icon name="help" />
        </q-item-section>
        <q-item-section>帮助与反馈</q-item-section>
      </q-item>

      <q-item clickable v-ripple>
        <q-item-section avatar>
          <q-icon name="info" />
        </q-item-section>
        <q-item-section>关于我们</q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup lang="ts">
import { navigateTo } from 'src/utils/navigation'

const goToSettings = () => {
  navigateTo('/settings')
}
</script>

<style scoped>
.profile-page {
  padding: 16px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}

.avatar {
  margin-bottom: 16px;
}

.username {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}
</style>
