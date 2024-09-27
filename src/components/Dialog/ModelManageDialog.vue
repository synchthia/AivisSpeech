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
            <QBtn outline icon="sym_r_search" label="音声合成モデルを見つける" textColor="display"
              class="text-bold q-mr-sm" @click="openAivisHub" />
            <QBtn outline icon="sym_r_add" label="インストール" textColor="display" class="text-bold" @click="() => ''" />
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
              <QTab v-for="(speaker, index) of activeAivmInfo.manifest.speakers" :key="speaker.uuid" :name="index"
                style="text-transform: none !important;">
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
                  {{ activeAivmInfo.manifest.description === '' ?
                    '（この音声合成モデルの説明は提供されていません）' :
                    activeAivmInfo.manifest.description
                  }}
                </div>
                <div class="q-mt-md" style="margin-bottom: 12px; font-size: 17px; font-weight: bold;">ボイスサンプル</div>
                <div class="row" style="gap: 12px;">
                  <div v-for="style in activeAivmInfo.manifest.speakers[activeSpeakerIndex].styles" :key="style.localId" class="col-12">
                    <div class="style-card">
                      <div class="style-content">
                        <div class="style-icon-container">
                          <img class="style-icon" :src="style.icon" />
                          <div class="style-name">{{ style.name }}</div>
                        </div>
                        <div class="voice-samples-container">
                          <div v-if="style.voiceSamples.length === 0" class="sample-transcript">
                            （このスタイルの音声サンプルは提供されていません）
                          </div>
                          <div v-for="(sample, voiceSampleIndex) in style.voiceSamples" :key="voiceSampleIndex" class="voice-sample">
                            <div
                              class="play-button"
                              :class="{ 'playing': audioPlaying[`${style.localId}-${voiceSampleIndex}`] }"
                              @click="toggleAudio(style.localId, voiceSampleIndex, sample.audio)"
                            >
                              <QIcon
                                :name="audioPlaying[`${style.localId}-${voiceSampleIndex}`] ? 'sym_r_stop' : 'sym_r_volume_up'"
                                size="25px"
                                color="white"
                              />
                            </div>
                            <div class="sample-transcript">{{ sample.transcript }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="q-mt-md q-mb-xs row">
                  <QSpace />
                  <QBtn
                    outline
                    icon="sym_r_delete"
                    label="アンインストール"
                    textColor="warning"
                    class="text-no-wrap text-bold"
                    @click="unInstallAivmModel"
                  />
                </div>
              </QTabPanel>
            </QTabPanels>
          </div>
        </QPage>
      </QPageContainer>
    </QLayout>
  </QDialog>
</template>
<script setup lang="ts">

import { computed, ref, watch, onUnmounted } from "vue";
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

// 音声再生中かどうか
const audioPlaying = ref<{ [key: string]: boolean }>({});
// 音声再生用の Audio 要素
const audioElements: { [key: string]: HTMLAudioElement } = {};

// 音声再生を切り替える
const toggleAudio = (styleId: number, sampleIndex: number, audioDataUrl: string) => {
  const key = `${styleId}-${sampleIndex}`;
  if (!audioElements[key]) {
    audioElements[key] = new Audio(audioDataUrl);
    audioElements[key].addEventListener('ended', () => {
      audioPlaying.value[key] = false;
    });
  }

  if (audioPlaying.value[key]) {
    audioElements[key].pause();
    audioElements[key].currentTime = 0;
    audioPlaying.value[key] = false;
  } else {
    Object.keys(audioPlaying.value).forEach(k => {
      if (audioPlaying.value[k]) {
        audioElements[k].pause();
        audioElements[k].currentTime = 0;
        audioPlaying.value[k] = false;
      }
    });
    audioElements[key].play();
    audioPlaying.value[key] = true;
  }
};

// AivisHub の外部リンクを開く
const openAivisHub = () => {
  window.open('https://hub.aivis-project.com/', '_blank');
};

// 音声合成モデルをアンインストールする
const unInstallAivmModel = async () => {
  if (activeAivmUuid.value == null) {
    throw new Error("aivm model is not selected");
  }
  const result = await store.dispatch("SHOW_CONFIRM_DIALOG", {
    title: "アンインストールの確認",
    message: `本当に音声合成モデル「${activeAivmInfo.value?.manifest.name}」をアンインストールしますか？<br>
              アンインストールすると、この音声合成モデル内の話者/スタイルは再度インストールするまで使えなくなります。`,
    actionName: "アンインストール",
    html: true,
  });
  if (result === "OK") {
    store.dispatch("SHOW_LOADING_SCREEN", {
      message: "アンインストールしています...",
    });
    await getApiInstance().then((instance) =>
      instance.invoke("uninstallAivmAivmModelsAivmUuidUninstallDelete")({ aivmUuid: activeAivmUuid.value! })
    ).catch((err) => {
      console.error(err);
      store.dispatch("SHOW_ALERT_DIALOG", {
        title: "アンインストールに失敗しました",
        message: `音声合成モデル「${activeAivmInfo.value?.manifest.name}」のアンインストールに失敗しました。(${err})`,
      });
    });
    store.dispatch("HIDE_ALL_LOADING_SCREEN");
    getAivmInfos();
  }
};

// コンポーネントがアンマウントされる時に音声を停止し、イベントリスナーを削除する
onUnmounted(() => {
  Object.values(audioElements).forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
    audio.removeEventListener('ended', () => {});
  });
});

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

.bg-surface {
  background: #363A3F;
}

.style-card {
  padding: 12px 20px;
  background: #363A3F;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.25);
  border-radius: 12px;
  overflow: hidden;
  border: 1px #3B3E43 solid;
}

.style-content {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.style-icon-container {
  flex-direction: column;
  justify-content: center;
  align-items: center;
  max-width: 100px;
  gap: 10px;
  display: inline-flex;
}

.style-icon {
  width: 100px;
  height: 100px;
  clip-path: vars.$squircle;
  background-color: var(--color-splitter);
}

.style-name {
  text-align: center;
  color: #FBEEEA;
  font-size: 14px;
  font-weight: 700;
  line-height: 19.20px;
  word-wrap: break-word;
}

.voice-samples-container {
  flex: 1 1 0;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 4px;
  display: inline-flex;
}

.voice-sample {
  align-self: stretch;
  background: #363A3F;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
  display: inline-flex;
  margin-bottom: 8px;
}

.play-button {
  width: 45px;
  height: 45px;
  background: #41A2EC;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.25);
  border-radius: 26px;
  overflow: hidden;
  border: 1px #3B3E43 solid;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.sample-transcript {
  flex: 1 1 0;
  color: white;
  font-size: 13.50px;
  font-weight: 400;
  line-height: 19.58px;
  word-wrap: break-word;
}
</style>