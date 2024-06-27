<template>
  <QDialog v-model="engineManageDialogOpenedComputed" maximized transitionShow="jump-up" transitionHide="jump-down"
    class="setting-dialog transparent-backdrop">
    <QLayout container view="hHh Lpr fFf" class="bg-background">
      <QPageContainer>
        <QHeader class="q-py-sm">
          <QToolbar>
            <!-- close button -->
            <QBtn round flat icon="close" color="display" @click="toDialogClosedState" />
            <QToolbarTitle class="text-display">
              音声合成モデルの管理
            </QToolbarTitle>
            <QBtn outline icon="add" label="追加" textColor="display" class="text-bold" @click="() => ''" />
          </QToolbar>
        </QHeader>
        <QPage class="row no-wrap">
          <div style="width: 245px; flex-shrink: 0; border-right: solid 1px var(--color-surface);">
            <QList>
              <QItem v-for="aivmInfo in Object.values(aivmInfoDict)" :key="aivmInfo.manifest.uuid" v-ripple clickable>
                  <QItemSection avatar>
                    <QAvatar rounded color="primary">
                      <img :src="aivmInfo.manifest.speakers[0].styles[0].icon" />
                    </QAvatar>
                  </QItemSection>
                  <QItemSection>
                    <QItemLabel class="text-display">{{ aivmInfo.manifest.name }}</QItemLabel>
                    <QItemLabel caption class="engine-path">
                      {{ aivmInfo.manifest.speakers.length }} Speakers / Version {{ aivmInfo.manifest.version }}
                    </QItemLabel>
                </QItemSection>
              </QItem>
            </QList>
          </div>
          <div style="width: 100%;">
            _
          </div>
        </QPage>
      </QPageContainer>
    </QLayout>
  </QDialog>
</template>
<script setup lang="ts">

import { computed, ref, watch } from "vue";
import { AivmInfo } from "@/openapi";
import { useStore } from "@/store";

const store = useStore();

const props = defineProps<{
  modelValue: boolean;
}>();
const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void;
}>();

const engineManageDialogOpenedComputed = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// ダイアログが閉じている状態
const toDialogClosedState = () => {
  engineManageDialogOpenedComputed.value = false;
};

// デフォルトエンジンの ID
const defaultEngineId = computed(() => {
  for (const engineInfo of store.getters.GET_SORTED_ENGINE_INFOS) {
    if (engineInfo.type === "default") {
      return engineInfo.uuid;
    }
  }
  throw new Error("default engine not found");
});


// API インスタンスを取得する関数
// VOICEVOX のお作法ではこうやらないと API を呼べないっぽい…
const getApiInstance = async () => {
  return await store.dispatch("INSTANTIATE_ENGINE_CONNECTOR", { engineId: defaultEngineId.value });
};

// インストール済み AIVM 音声合成モデルの情報
const aivmInfoDict = ref<{ [key: string]: AivmInfo }>({});

// インストール済み AIVM 音声合成モデルの情報を取得する関数
const getAivmInfos = async () => {
  const res = await getApiInstance().then((instance) => instance.invoke("getInstalledAivmInfosAivmModelsGet")({}));
  aivmInfoDict.value = res;
};

// ダイヤログが開かれた時
watch(engineManageDialogOpenedComputed, () => {
  if (engineManageDialogOpenedComputed.value) {
    getAivmInfos();
  }
});

</script>
<style lang="scss" scoped>

@use "@/styles/colors" as colors;
@use "@/styles/variables" as vars;

</style>