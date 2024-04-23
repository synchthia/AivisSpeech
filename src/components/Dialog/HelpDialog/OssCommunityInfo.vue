<!-- eslint-disable vue/no-v-html -->
<template>
  <QPage class="relative-absolute-wrapper scroller bg-background">
    <div
      class="q-pa-md markdown markdown-body"
      v-html="ossCommunityInfos"
    ></div>
  </QPage>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useStore } from "@/store";
import { useMarkdownIt } from "@/plugins/markdownItPlugin";

const store = useStore();
const ossCommunityInfos = ref("");
const md = useMarkdownIt();
onMounted(async () => {
  ossCommunityInfos.value = md.render(
    await store.dispatch("GET_OSS_COMMUNITY_INFOS"),
  );
});
</script>

<style scoped lang="scss">
.root {
  .scroller {
    width: 100%;
    overflow: auto;
  }
}
</style>
