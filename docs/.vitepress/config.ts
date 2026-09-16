import { defineConfig } from 'vitepress'

export default defineConfig({
  // GitHub Pages 部署在仓库子路径下；本地开发保持根路径
  base: process.env.GITHUB_ACTIONS ? '/english-study-guide/' : '/',
  lang: 'zh-CN',
  title: '英语学习框架',
  description:
    '面向中国成人自学者的英语学习完整路线图：基于二语习得（SLA）科学研究，从零基础到 B2/C1 的多年期可执行计划，含七个学习阶段、词汇战略、语法顺序、资源工具箱与大陆无障碍方案。',
  themeConfig: {
    siteTitle: '英语学习框架',
    nav: [
      { text: '首页', link: '/' },
      { text: '零基础课程', link: '/course/' },
      { text: '开始之前', link: '/guide/start' },
      { text: '学习阶段', link: '/guide/stage-0' },
      { text: '工具与专题', link: '/guide/toolbox' }
    ],
    sidebar: [
      {
        text: '零基础课程',
        items: [
          { text: '课程总览', link: '/course/' },
          {
            text: '启蒙课 · 音标与拼读',
            collapsed: false,
            items: [
              { text: '课程说明', link: '/course/stage0/' },
              { text: '第 1 课 · 字母与发音入门', link: '/course/stage0/01-alphabet' },
              { text: '第 2 课 · 短元音', link: '/course/stage0/02-short-vowels' },
              { text: '第 3 课 · 长元音', link: '/course/stage0/03-long-vowels' },
              { text: '第 4 课 · 双元音', link: '/course/stage0/04-diphthongs' },
              { text: '第 5 课 · 爆破音与摩擦音', link: '/course/stage0/05-consonants-stop-fricative' },
              { text: '第 6 课 · 破擦音、鼻音与其他辅音', link: '/course/stage0/06-consonants-rest' },
              { text: '第 7 课 · 自然拼读规则（上）', link: '/course/stage0/07-phonics-rules-1' },
              { text: '第 8 课 · 自然拼读规则（下）与音节', link: '/course/stage0/08-phonics-rules-2' },
              { text: '第 9 课 · 总复习与毕业自测', link: '/course/stage0/09-review' }
            ]
          },
          {
            text: 'A1 课程 · 入门英语',
            collapsed: false,
            items: [
              { text: '课程说明', link: '/course/a1/' },
              { text: '第 1 课 · be 动词', link: '/course/a1/unit-01' },
              { text: '第 2 课 · 人称与物主代词', link: '/course/a1/unit-02' },
              { text: '第 3 课 · 单复数与 a/an', link: '/course/a1/unit-03' },
              { text: '第 4 课 · there be 存在句', link: '/course/a1/unit-04' },
              { text: '第 5 课 · 一般现在时', link: '/course/a1/unit-05' },
              { text: '第 6 课 · can', link: '/course/a1/unit-06' },
              { text: '第 7 课 · 疑问句', link: '/course/a1/unit-07' },
              { text: '第 8 课 · 数字、时间与星期', link: '/course/a1/unit-08' },
              { text: '第 9 课 · 综合复习与毕业自测', link: '/course/a1/unit-09' }
            ]
          }
        ]
      },
      {
        text: '开始之前',
        items: [
          { text: '如何使用本文档', link: '/guide/start' },
          { text: '总览：全程路线图', link: '/guide/roadmap' },
          { text: '五大核心原则', link: '/guide/principles' }
        ]
      },
      {
        text: '学习阶段',
        items: [
          { text: '阶段 0 · 启蒙期', link: '/guide/stage-0' },
          { text: '阶段 1 · 地基期', link: '/guide/stage-1' },
          { text: '阶段 2 · 积累期', link: '/guide/stage-2' },
          { text: '阶段 3 · 成长期', link: '/guide/stage-3' },
          { text: '阶段 4 · 突破期', link: '/guide/stage-4' },
          { text: '阶段 5 · 精进期', link: '/guide/stage-5' },
          { text: '阶段 6 · 精通期', link: '/guide/stage-6' }
        ]
      },
      {
        text: '工具与专题',
        items: [
          { text: '词汇习得战略', link: '/guide/vocabulary' },
          { text: '语法学习顺序', link: '/guide/grammar' },
          { text: '资源工具箱', link: '/guide/toolbox' },
          { text: '大陆无障碍方案', link: '/guide/china' },
          { text: '常见失败模式与对策', link: '/guide/failure-modes' },
          { text: '检测、记录与调整', link: '/guide/tracking' },
          { text: '常见问题 FAQ', link: '/guide/faq' },
          { text: '附录：研究依据', link: '/guide/research' }
        ]
      }
    ],
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档'
          },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭'
            }
          }
        }
      }
    }
  }
})
