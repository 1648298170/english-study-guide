<script setup lang="ts">
import { onMounted, ref } from 'vue'

const stats = [
  { n: 6, unit: '门', label: '中文课程' },
  { n: 60, unit: '+ 节', label: '互动课程页' },
  { n: 7, unit: '个', label: '学习阶段' },
  { n: 0, unit: '元', label: '起步成本' }
]

const display = ref<number[]>(stats.map(() => 0))

onMounted(() => {
  const reduce =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) {
    display.value = stats.map((s) => s.n)
    return
  }
  const dur = 1100
  const t0 = performance.now()
  const tick = (t: number) => {
    const p = Math.min(1, (t - t0) / dur)
    const e = 1 - Math.pow(1 - p, 3)
    display.value = stats.map((s) => Math.round(s.n * e))
    if (p < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
})
</script>

<template>
  <div class="jstats">
    <div v-for="(s, i) in stats" :key="i" class="jstats-cell">
      <div class="jstats-num">
        <span class="jstats-n">{{ display[i] }}</span>
        <span class="jstats-unit">{{ s.unit }}</span>
      </div>
      <div class="jstats-label">{{ s.label }}</div>
    </div>
  </div>
</template>
