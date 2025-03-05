<template>
  <q-layout view="lHh Lpr lFf">
    <q-header v-if="showHeader" class="header bg-white text-black">
      <div class="safe-area-top" />
      <q-toolbar>
        <q-btn
          v-if="canGoBack"
          flat
          dense
          :icon="'img:' + backIcon"
          @click="navigateBack()"
          class="back-button"
        />
        <q-toolbar-title class="text-center">
          {{ currentRoute.meta.title || '首页' }}
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer v-if="showTabBar" bordered class="bg-white">
      <q-tabs
        v-model="currentTab"
        active-color="primary"
        inactive-color="#999"
        indicator-color="transparent"
        class="ios-tabs"
        :breakpoint="0"
        align="justify"
        narrow-indicator
      >
        <q-tab
          v-for="tab in navigation.tabs"
          :key="tab.name"
          :name="String(tab.route.name)"
          :icon="getTabIcon(tab)"
          :label="tab.name"
          @click="switchTab({ name: tab.route.name })"
        >
          <q-badge
            v-if="tab.badge"
            color="red"
            floating
            class="badge-ios"
          >
            {{ tab.badge }}
          </q-badge>
        </q-tab>
      </q-tabs>
      <div class="safe-area-bottom" />
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { defaultNavigation, type TabItem } from 'src/config/navigation'
import { switchTab, navigateBack, NavigationManager } from 'src/utils/navigation'

const route = useRoute()
const navigation = defaultNavigation

const currentTab = ref<string>(String(route.name))
const currentRoute = computed(() => route)
const backIcon = '/icons/back.svg'

const showHeader = computed(() => {
  return route.meta.showHeader !== false
})

const canGoBack = computed(() => {
  // 如果路由配置明确指定了不显示返回按钮，则不显示
  if (route.meta.showBack === false) {
    return false
  }
  // 如果是 tab 页面，则不显示返回按钮
  if (NavigationManager.isTabPage(route.name as string)) {
    return false
  }
  // 其他情况下，如果有返回历史则显示返回按钮
  return window.history.state?.back
})

// 是否显示底部标签栏
const showTabBar = computed(() => {
  return NavigationManager.isTabPage(route.name as string)
})

// 获取tab图标
const getTabIcon = (tab: TabItem) => {
  return `img:/icons/tab-${tab.icon}${currentTab.value === String(tab.route.name) ? '-active' : ''}.svg`
}

// 监听路由变化，更新当前选中的 tab
watch(() => route.name, (newName) => {
  if (newName) {
    currentTab.value = String(newName)
  }
})
</script>

<style lang="scss" scoped>
.header {
  border-bottom: 1px solid #ebedf0;

  .safe-area-top {
    height: constant(safe-area-inset-top); /* iOS 11.0 */
    height: env(safe-area-inset-top); /* iOS 11.2 */
  }

  .q-toolbar {
    min-height: 44px;
    padding: 0 16px;
  }

  .q-toolbar-title {
    font-size: 17px;
    font-weight: 600;
  }

  .back-button {
    padding: 8px;
    margin-left: -8px;
  }
}

.q-footer {
  border-top: 1px solid #ebedf0;

  .safe-area-bottom {
    height: constant(safe-area-inset-bottom); /* iOS 11.0 */
    height: env(safe-area-inset-bottom); /* iOS 11.2 */
  }

  .ios-tabs {
    height: 49px;
    padding: 0;
  }
}

:deep(.q-tab) {
  padding: 4px 0;
  min-height: 49px;
  min-width: auto;
  flex: 1;
}

:deep(.q-tabs__content) {
  width: 100%;
}

:deep(.q-tab__icon) {
  height: 24px;
  width: 24px;
  margin-bottom: 2px;
}

:deep(.q-tab__label) {
  font-size: 10px;
  line-height: 1.2;
  opacity: 1 !important;
}

:deep(.q-tab--inactive) {
  .q-tab__label {
    color: #999;
    opacity: 1 !important;
  }
}

.badge-ios {
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  font-size: 12px;
  border-radius: 8px;
}
</style>
