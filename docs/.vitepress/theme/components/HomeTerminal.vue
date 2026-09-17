<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

/**
 * 终端视觉锚点：一台「英语练习台」的造句练习对话流，循环播放。
 * - cmd / agent 两行做逐字符打字机（ghost span 占位防抖动）
 * - 其余行整行浮现，节奏 380ms
 * - prefers-reduced-motion 时直接静态呈现全部内容
 */

interface Line {
  tag: 'cmd' | 'sys' | 'you' | 'plan' | 'tool' | 'done' | 'agent'
  text: string
}

const SCRIPT: Line[] = [
  { tag: 'cmd', text: 'practice every morning' },
  { tag: 'you', text: '你说："I get up at seven o\'clock."' },
  { tag: 'sys', text: '提示 · 主语换成 she？一般现在时三单，动词要 +s' },
  { tag: 'you', text: '你说："She reads books every day."' },
  { tag: 'done', text: '正确！read → reads · 经验 +1' },
  { tag: 'plan', text: '今日任务：Anki 30 分钟 + 跟读 10 分钟' },
  { tag: 'agent', text: '框架提示：材料 95% 看得懂才有效' }
]

const LABELS: Record<string, string> = {
  cmd: '$',
  sys: '提示',
  you: '你说',
  plan: '任务',
  tool: 'TOOL',
  done: '结果',
  agent: '框架'
}

const TYPE_TAGS = ['cmd', 'agent']

const cur = ref(-2) // -2 = 初始空白（SSR），-1 = 起始暂停
const chars = ref(0)
const allDone = ref(false)
const started = ref(false)

let stopped = false
let timer: ReturnType<typeof setTimeout> | null = null

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    timer = setTimeout(resolve, ms)
  })

function label(tag: string): string {
  return LABELS[tag] ?? ''
}

function typedText(line: Line, index: number): string {
  if (index !== cur.value) return line.text
  return line.text.slice(0, chars.value)
}

async function play() {
  while (!stopped) {
    cur.value = -1
    chars.value = 0
    allDone.value = false
    await wait(600)

    for (let i = 0; i < SCRIPT.length; i++) {
      if (stopped) return
      cur.value = i
      const line = SCRIPT[i]

      if (TYPE_TAGS.includes(line.tag)) {
        chars.value = 0
        for (let c = 1; c <= line.text.length; c++) {
          if (stopped) return
          chars.value = c
          await wait(26 + Math.random() * 34)
        }
        await wait(300)
      } else {
        await wait(380)
      }
    }

    cur.value = SCRIPT.length - 1
    allDone.value = true
    await wait(4200)
  }
}

onMounted(() => {
  started.value = true
  const reduce =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) {
    // 静态呈现：全部行可见，不播放
    cur.value = SCRIPT.length - 1
    chars.value = SCRIPT[SCRIPT.length - 1].text.length
    allDone.value = true
    return
  }
  play()
})

onBeforeUnmount(() => {
  stopped = true
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <div class="jt-wrap" aria-label="英语练习台演示（终端动画）">
    <div class="jt-term">
      <div class="jt-bar">
        <span class="jt-dots" aria-hidden="true"><i></i><i></i><i></i></span>
        <span class="jt-title">jerry@english — ~/practice</span>
        <span class="jt-shell">zsh</span>
      </div>

      <div class="jt-body">
        <div
          v-for="(l, i) in SCRIPT"
          :key="i"
          class="jt-line"
          :class="[
            'jt-t-' + l.tag,
            {
              on: started && (i <= cur || allDone),
              'jt-is-typed': TYPE_TAGS.includes(l.tag),
              cur:
                started &&
                ((i === cur && !allDone) ||
                  (allDone && i === SCRIPT.length - 1))
            }
          ]"
        >
          <span class="jt-tag" aria-hidden="true">{{ label(l.tag) }}</span>
          <span class="jt-tx">
            <template v-if="TYPE_TAGS.includes(l.tag)">
              <span class="jt-ghost" aria-hidden="true">{{ l.text }}</span>
              <span class="jt-typed">{{ typedText(l, i) }}</span>
            </template>
            <template v-else>{{ l.text }}</template>
          </span>
        </div>
      </div>

      <div class="jt-status">
        <span class="jt-status-left">
          <i class="jt-led" :class="{ ok: allDone }" aria-hidden="true"></i>
          {{ allDone ? 'done · 今日练习 +1' : 'practicing…' }}
        </span>
        <span class="jt-status-right">启蒙课 · 第 1 课</span>
      </div>
    </div>
  </div>
</template>
