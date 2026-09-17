<template>
  <section class="jsec jsec-cta">
    <div class="jc-band">
      <div class="jc-left">
        <p class="jc-kicker">START TODAY</p>
        <h3 class="jc-title">今天就开始第一课</h3>
        <p class="jc-sub">
          不用买课、不用报班&mdash;&mdash;从 48 个音素开始，每一步都有中文讲解和练习答案。
        </p>
      </div>
      <div class="jc-right">
        <a class="jc-btn" :href="base + 'course/'">
          <span class="jc-btn-cmd">开始上课</span>
          <span class="jc-btn-arr" aria-hidden="true">&rarr;</span>
        </a>
        <p class="jc-note">当前进度：启蒙课 第 1 课</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useData } from 'vitepress'

const base = useData().site.value.base
</script>
