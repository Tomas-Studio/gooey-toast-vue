<script setup lang="ts">
import { toastTypes, typeColors } from '../composables/useExamples'
import {
  bPosition, bType, bTitle, bHasDesc, bDesc,
  bHasAction, bActionLabel, bFillColor, bHasBorder, bBorderColor, bBorderWidth,
  bDisplayDuration, bSpring, bBounce, bPreset, bTheme,
  bShowProgress, bCloseOnEscape, bShowTimestamp, bCloseButton,
  positions, presetNames, closeButtonPositions,
  fireBuilderToast, generatedCode,
} from '../composables/useBuilder'
import ToggleSwitch from './shared/ToggleSwitch.vue'
import CodeBlock from './shared/CodeBlock.vue'

const pillBase = 'inline-flex items-center justify-center px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-all cursor-pointer'
const pillInactive = 'bg-card text-text-secondary hover:bg-card-hover hover:text-text'
const pillActive = 'bg-accent text-surface'
</script>

<template>
  <div id="builder" class="flex flex-col gap-5">
    <h2 class="font-display text-xl font-bold">Toast Builder</h2>

    <div class="bg-surface border border-border rounded-[14px] p-6 max-sm:p-4 shadow-sm flex flex-col gap-5">

      <div class="flex flex-col gap-2">
        <label class="text-[13px] font-medium text-text-secondary">Position</label>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="p in positions" :key="p"
            :class="[pillBase, bPosition === p ? pillActive : pillInactive]"
            @click="bPosition = p"
          >{{ p }}</button>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-[13px] font-medium text-text-secondary">Type</label>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="t in toastTypes" :key="t"
            :class="[pillBase, bType === t ? '' : pillInactive]"
            :style="bType === t ? { background: typeColors[t].bg, color: typeColors[t].fg } : {}"
            @click="bType = t"
          >{{ t }}</button>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-[13px] font-medium text-text-secondary">Title</label>
        <input
          v-model="bTitle"
          type="text"
          class="bg-card rounded-[10px] border border-transparent outline-none px-3 py-2 text-[13.5px] transition-all focus:bg-surface focus:border-border focus:shadow-[0_0_0_3px_rgba(0,0,0,0.04)]"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-[13px] font-medium text-text-secondary flex items-center gap-2">
          Description
          <ToggleSwitch v-model="bHasDesc" />
        </label>
        <textarea
          v-if="bHasDesc"
          v-model="bDesc"
          rows="2"
          class="bg-card rounded-[10px] border border-transparent outline-none px-3 py-2 text-[13.5px] transition-all focus:bg-surface focus:border-border focus:shadow-[0_0_0_3px_rgba(0,0,0,0.04)] resize-y"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-[13px] font-medium text-text-secondary flex items-center gap-2">
          Action Button
          <ToggleSwitch v-model="bHasAction" />
        </label>
        <input
          v-if="bHasAction"
          v-model="bActionLabel"
          type="text"
          placeholder="Button label"
          class="bg-card rounded-[10px] border border-transparent outline-none px-3 py-2 text-[13.5px] transition-all focus:bg-surface focus:border-border focus:shadow-[0_0_0_3px_rgba(0,0,0,0.04)]"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-[13px] font-medium text-text-secondary">Style</label>
        <div class="flex items-center gap-4 flex-wrap">
          <div class="flex items-center gap-2">
            <span class="text-[12px] text-text-muted">Fill</span>
            <input v-model="bFillColor" type="color" class="size-5.5" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[12px] text-text-muted">Border</span>
            <ToggleSwitch v-model="bHasBorder" />
          </div>
          <template v-if="bHasBorder">
            <div class="flex items-center gap-2">
              <span class="text-[12px] text-text-muted">Color</span>
              <input v-model="bBorderColor" type="color" class="size-5.5" />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[12px] text-text-muted">Width</span>
              <input
                v-model.number="bBorderWidth"
                type="number"
                min="1" max="5"
                class="w-14 bg-card rounded-lg border border-transparent outline-none px-2 py-1 text-[13px] text-center focus:bg-surface focus:border-border"
              />
            </div>
          </template>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <label class="text-[13px] font-medium text-text-secondary">
          Display Duration <span class="font-mono text-text-muted ml-1">{{ bDisplayDuration }}s</span>
        </label>
        <input v-model.number="bDisplayDuration" type="range" min="1" max="20" step="1" class="range-input flex-1" />
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-[13px] font-medium text-text-secondary">Animation Preset</label>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="p in presetNames" :key="p"
            :class="[pillBase, bPreset === p ? pillActive : pillInactive]"
            @click="bPreset = p"
          >{{ p }}</button>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <label class="text-[13px] font-medium text-text-secondary flex items-center gap-2">
          Spring Effect
          <ToggleSwitch v-model="bSpring" />
          <span v-if="bSpring" class="text-[12px] text-text-muted font-mono">Bounce {{ bBounce }}</span>
        </label>
        <div v-if="bSpring" class="flex items-center gap-3">
          <input v-model.number="bBounce" type="range" min="0.05" max="0.8" step="0.05" class="range-input flex-1" />
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-[13px] font-medium text-text-secondary">Theme</label>
        <div class="flex flex-wrap gap-1.5">
          <button :class="[pillBase, bTheme === 'light' ? pillActive : pillInactive]" @click="bTheme = 'light'">Light</button>
          <button :class="[pillBase, bTheme === 'dark' ? pillActive : pillInactive]" @click="bTheme = 'dark'">Dark</button>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <label class="text-[13px] font-medium text-text-secondary">Show Progress</label>
        <ToggleSwitch v-model="bShowProgress" />
      </div>

      <div class="flex items-center gap-2">
        <label class="text-[13px] font-medium text-text-secondary">Close on Escape</label>
        <ToggleSwitch v-model="bCloseOnEscape" />
      </div>

      <div class="flex items-center gap-2">
        <label class="text-[13px] font-medium text-text-secondary">Show Timestamp</label>
        <ToggleSwitch v-model="bShowTimestamp" />
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-[13px] font-medium text-text-secondary">Close Button</label>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="opt in closeButtonPositions" :key="String(opt.value)"
            :class="[pillBase, bCloseButton === opt.value ? pillActive : pillInactive]"
            @click="bCloseButton = opt.value"
          >{{ opt.label }}</button>
        </div>
      </div>

      <button
        class="w-full bg-accent text-surface rounded-[10px] flex items-center justify-center gap-2 py-3 px-6 text-sm font-semibold transition-all hover:bg-[#333] hover:shadow-md active:scale-[0.98] cursor-pointer"
        @click="fireBuilderToast"
      >
        Fire Toast
      </button>

      <CodeBlock :code="generatedCode" label="Generated Code" />
    </div>
  </div>
</template>

<style>
.range-input {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  height: 4px;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.range-input::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(to right, #ddd 0%, #ddd 100%);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.range-input::-moz-range-track {
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(to right, #ddd 0%, #ddd 100%);
  border: none;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-top: -5px;
  background: #333;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.range-input::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: none;
  background: #333;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}
</style>
