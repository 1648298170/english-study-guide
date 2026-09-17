<template>
  <div class="jhi">
    <p class="jhi-eyebrow">
      <span class="jhi-eyebrow-dot" aria-hidden="true"></span>
      ENGLISH STUDY &middot; 零基础到精通
    </p>

    <h1 class="jhi-title">
      零基础到精通的<br />
      <span class="jhi-grad">英语学习框架</span>
    </h1>

    <p class="jhi-tagline">
      基于二语习得科学的成人自学路线&mdash;&mdash;六门中文课程 +
      完整学习框架，手把手从音标教到 C1。
    </p>

    <div class="jhi-actions">
      <a class="jbtn jbtn-primary" :href="base + 'course/'">
        开始上课（零基础） <span aria-hidden="true">&rarr;</span>
      </a>
      <a class="jbtn jbtn-ghost" :href="base + 'guide/roadmap'">查看全程路线图</a>
      <a class="jbtn jbtn-ghost" :href="base + 'guide/principles'">学习方法</a>
    </div>

    <p class="jhi-status">
      <span class="jhi-pulse" aria-hidden="true"></span>
      每天 1.5~2 小时 &middot; 2 年到 B2 &middot; 3~4 年到 C1
    </p>
  </div>
</template>

<script setup lang="ts">
// 站点可能部署在子路径（如 GitHub Pages 的 /english-study-guide/），
// 组件内的链接必须用 site.base 拼接，否则部署后路由解析失败
import { useData } from 'vitepress'

const base = useData().site.value.base
</script>
