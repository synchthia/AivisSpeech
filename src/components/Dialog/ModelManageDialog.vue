<template>
  <QDialog v-model="engineManageDialogOpenedComputed" maximized transitionShow="jump-up" transitionHide="jump-down"
    class="setting-dialog transparent-backdrop">
    <QLayout container view="hHh Lpr fFf" class="bg-background">
      <QPageContainer>
        <QHeader class="q-py-sm">
          <QToolbar>
            <!-- close button -->
            <QBtn round flat icon="sym_r_close" color="display" @click="toDialogClosedState" />
            <QToolbarTitle class="text-display">
              音声合成モデルの管理
            </QToolbarTitle>
            <QBtn outline icon="sym_r_add" label="追加" textColor="display" class="text-bold" @click="() => ''" />
          </QToolbar>
        </QHeader>
        <QPage class="row no-wrap">
          <div style="width: 260px; flex-shrink: 0; border-right: solid 1px var(--color-surface);">
            <QList class="model-list">
              <QItem v-for="aivmInfo in Object.values(aivmInfoDict)" :key="aivmInfo.manifest.uuid" v-ripple class="q-pr-none" clickable
                :active="activeAivmUuid === aivmInfo.manifest.uuid" @click="activeAivmUuid = aivmInfo.manifest.uuid">
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
          <div v-if="activeAivmInfo" class="model-detail" style="width: 100%;">
            <!-- タブは複数の話者がモデルに含まれる場合のみ表示する -->
            <QTabs v-if="activeAivmInfo && activeAivmInfo.manifest.speakers.length > 1" v-model="activeSpeakerIndex"
              dense activeColor="primary">
              <QTab v-for="(speaker, index) of activeAivmInfo.manifest.speakers" :key="speaker.uuid" :name="index">
                話者{{ index + 1 }} ({{ speaker.name }})
              </QTab>
            </QTabs>
            <QTabPanels v-model="activeSpeakerIndex"
              animated class="bg-background">
              <QTabPanel v-for="(speaker, index) of activeAivmInfo.manifest.speakers" :key="speaker.uuid" :name="index">
                <div class="q-mt-sm row items-center">
                  <div class="col-auto" style="font-size: 20px; font-weight: bold;">
                    <span>{{ activeAivmInfo.manifest.name }}</span>
                    <!-- 音声合成モデル名と現在の話者名が異なる場合のみ、話者名を追加する -->
                    <span v-if="activeAivmInfo.manifest.name !== speaker.name">
                      - {{ speaker.name }}
                    </span>
                  </div>
                  <div class="col-auto q-ml-auto" style="font-size: 13.5px; color: #D2D3D4;">
                    <span>{{ activeAivmInfo.manifest.speakers.length }} Speakers / Version {{ activeAivmInfo.manifest.version }}</span>
                    <!-- 音声合成モデルのバージョンと現在の話者のバージョンが一致しない場合のみ、Speaker Version を表示する -->
                    <span v-if="activeAivmInfo.manifest.version !== activeAivmInfo.manifest.speakers[activeSpeakerIndex].version">
                      (Speaker Version {{ activeAivmInfo.manifest.speakers[activeSpeakerIndex].version }})
                    </span>
                  </div>
                </div>
                <div class="q-mt-sm row items-center">
                  <div class="col-auto" style="font-size: 15px; font-weight: bold;">
                    {{ activeAivmInfo.manifest.speakers.reduce((acc, speaker) => acc + speaker.styles.length, 0) }}スタイル
                  </div>
                  <div class="col-auto q-ml-sm" style="font-size: 13.5px; font-weight: bold; color: #D2D3D4;">
                    {{ activeAivmInfo.manifest.speakers[activeSpeakerIndex].styles.map(style => style.name).join(' / ') }}
                  </div>
                </div>
                <div class="q-mt-md" style="font-size: 13.5px; color: #D2D3D4;">
                  {{ activeAivmInfo.manifest.description === '' ? '（この音声合成モデルの説明は提供されていません）' : activeAivmInfo.manifest.description }}
                </div>
                <div class="q-mt-md" style="font-size: 17px; font-weight: bold;">ボイスサンプル</div>
              </QTabPanel>
            </QTabPanels>
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


// API インスタンスを取得する関数
// VOICEVOX のお作法ではこうやらないと API を呼べないっぽい…
const getApiInstance = async () => {
  return await store.dispatch("INSTANTIATE_ENGINE_CONNECTOR", { engineId: store.getters.DEFAULT_ENGINE_ID });
};

// インストール済み AIVM 音声合成モデルの情報
const aivmInfoDict = ref<{ [key: string]: AivmInfo }>({});

// インストール済み AIVM 音声合成モデルの情報を取得する関数
const getAivmInfos = async () => {
  const res = await getApiInstance().then((instance) => instance.invoke("getInstalledAivmInfosAivmModelsGet")({}));
  aivmInfoDict.value = res;
  // アクティブな AIVM 音声合成モデルの UUID を設定
  activeAivmUuid.value = Object.values(aivmInfoDict.value)[0].manifest.uuid;
};

// ダイヤログが開かれた時
watch(engineManageDialogOpenedComputed, () => {
  if (engineManageDialogOpenedComputed.value) {
    getAivmInfos();
  }
});

// アクティブな AIVM 音声合成モデルの UUID
const activeAivmUuid = ref<string | null>(null);

// アクティブな AIVM 音声合成モデルの情報
const activeAivmInfo = computed(() => {
  return activeAivmUuid.value ? aivmInfoDict.value[activeAivmUuid.value] : null;
});

// アクティブな AIVM 音声合成モデルの話者タブのインデックス
// QTab / QTabPanel の name 属性の値と一致する
const activeSpeakerIndex = ref(0);

</script>
<style lang="scss" scoped>

@use "@/styles/colors" as colors;
@use "@/styles/variables" as vars;

.q-item--active {
  background: rgba(colors.$primary-rgb, 0.4);
}

.model-list, .model-detail {
  height: calc(
    100vh - #{vars.$menubar-height + vars.$toolbar-height +
      vars.$window-border-width}
  );
  overflow-y: auto;
}

</style>