<template>
  <div class="app-wrapper">
    <van-config-provider>
      <van-nav-bar
        v-if="showHeader"
        :title="pageTitle"
        placeholder
        fixed
        :left-arrow="canGoBack"
        @click-left="navigateBack"
        safe-area-inset-top
      />

      <div class="content-wrapper">
        <router-view>
        </router-view>
      </div>

      <van-tabbar
        v-if="showTabBar"
        v-model="currentTab"
        safe-area-inset-bottom
        placeholder
        active-color="#1989fa"
        inactive-color="#999"
        fixed
      >
        <van-tabbar-item
          v-for="(tab, index) in _tabBarList"
          :key="index"
          :name="index"
          :badge="tab.badge || ''"
          @click="switchTab(tab.route)"
        >
          <template #icon="props">
            <img :src="`/icons/tab-${tab.route.meta?.icon}${props.active ? '-active' : ''}.svg`" />
          </template>
          {{ tab.route.meta?.title }}
        </van-tabbar-item>
      </van-tabbar>
    </van-config-provider>
  </div>
</template>

<script setup lang="ts">
import { tabBarList } from 'src/router/tabbar'
import { navigateBack, NavigationManager, switchTab } from 'src/utils/navigation'
import { computed, reactive, ref, watch } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { useRoute } from 'vue-router'

const route = useRoute()

const currentTab = ref<number>(0)

const _tabBarList = reactive<{
  route: RouteRecordRaw
  badge?: number | string
}[]>(tabBarList.map((tab) => {
  return {
    route: tab,
  }
}))

const pageTitle = computed(() => {
  return (route.meta.title as string) || '首页'
})

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
  return !!window.history.state?.back
})

// 是否显示底部标签栏
const showTabBar = computed(() => {
  return tabBarList.length > 1 && NavigationManager.isTabPage(route.name as string)
})

// 监听路由变化，更新当前选中的 tab
watch(() => route.name, (newName) => {
  if (newName) {
    currentTab.value = _tabBarList.findIndex(tab => tab.route.name === newName)
  }
}, { immediate: true })
</script>

<style lang="less" scoped>
@import "src/styles/mixin.less";

.app-wrapper {
  .clearfix();
  position: relative;
  height: 100%;
  width: 100%;
}

.content-wrapper {
  height: 100%;
}
</style>
