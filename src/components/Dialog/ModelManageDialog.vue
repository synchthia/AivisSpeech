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
        <QPage class="row">
          <div class="col-4">
            _
          </div>
          <div class="col-8 no-wrap text-no-wrap">
            _
          </div>
        </QPage>
      </QPageContainer>
    </QLayout>
  </QDialog>
</template>
<script setup lang="ts">

import { computed } from "vue";

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

</script>
<style lang="scss" scoped>

@use "@/styles/colors" as colors;
@use "@/styles/variables" as vars;

</style>