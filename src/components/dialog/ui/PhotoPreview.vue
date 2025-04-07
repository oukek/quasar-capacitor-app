<script lang="ts" setup>
defineProps({
  imgUrl: {
    type: String,
    default: '',
  },
})
defineEmits(['close'])
</script>

<template>
  <img :src="imgUrl" class="preview-image" @click="$emit('close')">
</template>

<style lang="less" scoped>
.preview-image {
  min-width: 40vw;
  min-height: 40vw;
  max-width: 60vw;
  max-height: 60vh;
}
</style>
