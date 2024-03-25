<template>
  <QPage
    ref="scroller"
    class="relative-absolute-wrapper scroller bg-background"
  >
    <div class="q-pa-md markdown markdown-body">
      <QList v-if="detailIndex === undefined">
        <QItem
          v-for="(license, index) in props.licenses"
          :key="index"
          clickable
          @click="selectLicenseIndex(index)"
        >
          <QItemSection class="">
            <div>
              <b>{{ license.name }}</b>
              {{ license.version ? " | " + license.version : "" }}
            </div>
          </QItemSection>
        </QItem>
      </QList>
      <div v-else>
        <div class="q-mb-md">
          <QBtn
            outline
            color="primary"
            icon="keyboard_arrow_left"
            label="戻る"
            @click="selectLicenseIndex(undefined)"
          />
        </div>
        <h3>{{ licenses[detailIndex].name }}</h3>
        <pre>{{ licenses[detailIndex].text }}</pre>
      </div>
    </div>
  </QPage>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props =
  defineProps<{
    licenses: Record<string, string>[];
  }>();

const detailIndex = ref<number | undefined>(undefined);

const scroller = ref<HTMLElement>();

const selectLicenseIndex = (index: number | undefined) => {
  if (scroller.value == undefined)
    throw new Error("scroller.value == undefined");
  scroller.value.scrollTop = 0;
  detailIndex.value = index;
};
</script>

<style scoped lang="scss">
.root {
  .scroller {
    width: 100%;
    overflow: auto;
  }
}
</style>
