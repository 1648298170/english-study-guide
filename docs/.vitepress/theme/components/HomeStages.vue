<template>
  <section class="jsec jsec-stages">
    <header class="jsec-head">
      <p class="jsec-kicker">ROADMAP &middot; 全程路线</p>
      <h2 class="jsec-title">阶段 0 &rarr; C1</h2>
    </header>

    <!-- 阶段 0~6 进度条：阶段 0 已开始，A2 / B2 / C1 为里程碑 -->
    <div class="jst-prog">
      <div class="jst-cells">
        <span
          v-for="c in 7"
          :key="c"
          class="jst-cell"
          :class="{
            done: c === 1,
            mile: MILESTONE[c - 1] !== undefined
          }"
          :title="
            '阶段 ' + (c - 1) + ' · ' + CELL_TITLE[c - 1] +
            (MILESTONE[c - 1] !== undefined ? ' · 里程碑 ' + MILESTONE[c - 1] : '')
          "
        >
          <i v-if="c === 1" aria-hidden="true">起</i>
        </span>
      </div>
      <div class="jst-meta">
        <span class="jst-meta-item"><b>阶段 0</b> · 从这里开始</span>
        <span class="jst-legend">
          <span><i class="l-done"></i>已开始</span>
          <span><i class="l-mile"></i>里程碑 A2 / B2 / C1</span>
          <span><i class="l-todo"></i>待解锁</span>
        </span>
        <span class="jst-meta-item"><b>2 年</b>到 B2 · <b>3~4 年</b>到 C1</span>
      </div>
    </div>

    <!-- 7 阶段卡 -->
    <div class="jst-grid">
      <a
        v-for="s in stages"
        :key="s.no"
        class="jst-stage"
        :class="{ live: s.live }"
        :href="base + s.to"
      >
        <div class="jst-top">
          <span class="jst-no">{{ s.no }}</span>
          <span class="jst-status">{{ s.live ? '现在开始' : '内容已就绪' }}</span>
        </div>
        <div class="jst-weeks">{{ s.weeks }}</div>
        <h3 class="jst-title">{{ s.title }}</h3>
        <div class="jst-tags">
          <span v-for="t in s.tags" :key="t">{{ t }}</span>
        </div>
        <div class="jst-mile">
          <svg
            viewBox="0 0 24 24"
            width="12"
            height="12"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M4 22V4" />
            <path d="M4 4c3-2 6 2 10 0v9c-4 2-7-2-10 0" />
          </svg>
          <span>{{ s.mile }}</span>
        </div>
      </a>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useData } from 'vitepress'

// to 为相对路径（不带开头斜杠），渲染时拼接 site.base，
// 以兼容部署在子路径（GitHub Pages /english-study-guide/）的情况
const base = useData().site.value.base

// 进度条第 1 格 = 阶段 0（起点，已开始）；第 3/5/7 格 = A2/B2/C1 里程碑
const MILESTONE: Record<number, string> = { 2: 'A2', 4: 'B2', 6: 'C1' }
const CELL_TITLE = [
  '启蒙期 · 音标与拼读',
  '地基期 · A1 语法地基',
  '积累期 · 过去与未来',
  '成长期 · 开口说英语',
  '突破期 · 看剧自由',
  '精进期 · 精准自然',
  '精通期 · 终身'
]

const stages = [
  {
    no: '阶段 0',
    weeks: '1~2 周',
    title: '启蒙期 · 音标与拼读',
    tags: ['9 课', '免费'],
    mile: '起点 · 拿下 48 个音素',
    live: true,
    to: 'guide/stage-0'
  },
  {
    no: '阶段 1',
    weeks: '2~3 个月',
    title: '地基期 · A1 语法地基',
    tags: ['9 课', '免费'],
    mile: '达成 A1',
    live: false,
    to: 'guide/stage-1'
  },
  {
    no: '阶段 2',
    weeks: '4~6 个月',
    title: '积累期 · 过去与未来',
    tags: ['9 课'],
    mile: '达成 A2',
    live: false,
    to: 'guide/stage-2'
  },
  {
    no: '阶段 3',
    weeks: '8~12 个月',
    title: '成长期 · 开口说英语',
    tags: ['11 课'],
    mile: '达成 B1',
    live: false,
    to: 'guide/stage-3'
  },
  {
    no: '阶段 4',
    weeks: '10~14 个月',
    title: '突破期 · 看剧自由',
    tags: ['8 课'],
    mile: '达成 B2',
    live: false,
    to: 'guide/stage-4'
  },
  {
    no: '阶段 5',
    weeks: '12~18 个月',
    title: '精进期 · 精准自然',
    tags: ['7 课'],
    mile: '达成 C1',
    live: false,
    to: 'guide/stage-5'
  },
  {
    no: '阶段 6',
    weeks: '持续终身',
    title: '精通期 · 用起来，别停下',
    tags: ['终身'],
    mile: '终点 · 英语自由',
    live: false,
    to: 'guide/stage-6'
  }
]
</script>
