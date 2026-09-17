<template>
  <section class="jsec jsec-pillars">
    <header class="jsec-head">
      <p class="jsec-kicker">METHODOLOGY &middot; 为什么这样学</p>
      <h2 class="jsec-title">五大核心原则</h2>
    </header>

    <div class="jp-grid">
      <a v-for="(p, i) in pillars" :key="i" class="jp-item" :href="base + p.to">
        <span class="jp-no" aria-hidden="true">{{ p.no }}</span>
        <div class="jp-body">
          <h3 class="jp-title">{{ p.title }}</h3>
          <p class="jp-desc">{{ p.desc }}</p>
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

// 锚点对应 /guide/principles 的五个 h2 小节
const pillars = [
  {
    no: '01',
    title: '可理解输入（i+1）',
    desc: '材料 95% 看得懂才有效——选对难度，输入才能变成习得，而不是煎熬。',
    to: 'guide/principles#原则-1-可理解输入是习得的引擎-krashen-输入假说'
  },
  {
    no: '02',
    title: '间隔重复',
    desc: 'Anki 每日新学 + 复习，赶在遗忘曲线之前，把生词从「见过」锁进长期记忆。',
    to: 'guide/principles#原则-2-间隔重复锁住词汇-srs'
  },
  {
    no: '03',
    title: '技能级联',
    desc: '先读 → 再听 → 后说：上一级稳定了，再攻下一级，不跳级、不硬撑。',
    to: 'guide/principles#原则-3-技能阶梯——先输入、后输出-逐级爬升-技能级联'
  },
  {
    no: '04',
    title: '输出必纠错',
    desc: '写和说都要有反馈、有纠错，防止中式英语越说越顺、固化成石化。',
    to: 'guide/principles#原则-4-输出必须被-推动-并纠错-swain-输出假说'
  },
  {
    no: '05',
    title: '低焦虑自学',
    desc: '没人嘲笑你、没人打分——把情绪过滤器调低，习得才会真正发生。',
    to: 'guide/principles#原则-5-调低情绪过滤器-affective-filter'
  }
]
</script>
