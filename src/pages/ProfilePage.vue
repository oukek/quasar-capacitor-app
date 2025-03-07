<template>
  <div class="profile-page">
    <div class="user-info">
      <div class="avatar">
        <van-image
          round
          width="10rem"
          height="10rem"
          src="https://cdn.quasar.dev/img/avatar.png"
        />
      </div>
      <h2 class="username">用户名</h2>
    </div>

    <van-cell-group inset>
      <van-cell title="设置" icon="setting-o" is-link @click="goToSettings" />
      <van-cell title="帮助与反馈" icon="service-o" is-link />
      <van-cell title="关于我们" icon="info-o" is-link >
        <template #right-icon></template>
      </van-cell>
    </van-cell-group>
  </div>
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
  background-color: var(--color-background-2);
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
