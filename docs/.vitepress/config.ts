import { defineConfig } from 'vitepress'

export default defineConfig({
  // GitHub Pages 部署在仓库子路径下；本地开发保持根路径
  base: process.env.GITHUB_ACTIONS ? '/english-study-guide/' : '/',
  lang: 'zh-CN',
  title: '英语学习框架',
  description:
    '面向中国成人自学者的英语学习完整路线图：基于二语习得（SLA）科学研究，从零基础到 B2/C1 的多年期可执行计划，含七个学习阶段、词汇战略、语法顺序、资源工具箱与大陆无障碍方案。',

  markdown: {
    lineNumbers: true
  },

  themeConfig: {
    siteTitle: '英语学习框架',
    nav: [
      { text: '首页', link: '/' },
      { text: '英语课程', link: '/course/' },
      { text: '开始之前', link: '/guide/start' },
      { text: '学习阶段', link: '/guide/stage-0' },
      { text: '工具与专题', link: '/guide/toolbox' }
    ],
    sidebar: [
      {
        text: '英语课程',
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
            text: '词性课 · 英语的十种词',
            collapsed: false,
            items: [
              { text: '课程说明', link: '/course/pos/' },
              { text: '第 1 课 · 词类地图', link: '/course/pos/unit-01' },
              { text: '第 2 课 · 名词', link: '/course/pos/unit-02' },
              { text: '第 3 课 · 动词', link: '/course/pos/unit-03' },
              { text: '第 4 课 · 形容词', link: '/course/pos/unit-04' },
              { text: '第 5 课 · 副词', link: '/course/pos/unit-05' },
              { text: '第 6 课 · 代词与冠词', link: '/course/pos/unit-06' },
              { text: '第 7 课 · 介词与连词', link: '/course/pos/unit-07' },
              { text: '第 8 课 · 数词感叹词与总结', link: '/course/pos/unit-08' },
              { text: '第 9 课 · 构词入门：变身术', link: '/course/pos/unit-09' },
              { text: '第 10 课 · 综合实战：标注与完形', link: '/course/pos/unit-10' }
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
          },
          {
            text: 'A2 课程 · 积累期',
            collapsed: true,
            items: [
              { text: '课程说明', link: '/course/a2/' },
              { text: '第 1 课 · 现在进行时', link: '/course/a2/unit-01' },
              { text: '第 2 课 · 一般过去时（一）', link: '/course/a2/unit-02' },
              { text: '第 3 课 · 一般过去时（二）', link: '/course/a2/unit-03' },
              { text: '第 4 课 · 将来时 will 与 be going to', link: '/course/a2/unit-04' },
              { text: '第 5 课 · 频率副词', link: '/course/a2/unit-05' },
              { text: '第 6 课 · 可数与不可数', link: '/course/a2/unit-06' },
              { text: '第 7 课 · 比较级与最高级', link: '/course/a2/unit-07' },
              { text: '第 8 课 · 介词：时间与地点', link: '/course/a2/unit-08' },
              { text: '第 9 课 · A2 综合复习与毕业自测', link: '/course/a2/unit-09' }
            ]
          },
          {
            text: 'B1 课程 · 成长期',
            collapsed: true,
            items: [
              { text: '课程说明', link: '/course/b1/' },
              { text: '第 1 课 · 现在完成时（一）', link: '/course/b1/unit-01' },
              { text: '第 2 课 · 现在完成时（二）', link: '/course/b1/unit-02' },
              { text: '第 3 课 · 过去进行时', link: '/course/b1/unit-03' },
              { text: '第 4 课 · 条件句（一）', link: '/course/b1/unit-04' },
              { text: '第 5 课 · 条件句（二）', link: '/course/b1/unit-05' },
              { text: '第 6 课 · should、must、have to', link: '/course/b1/unit-06' },
              { text: '第 7 课 · 连词', link: '/course/b1/unit-07' },
              { text: '第 8 课 · 不定式与动名词', link: '/course/b1/unit-08' },
              { text: '第 9 课 · 短语动词入门', link: '/course/b1/unit-09' },
              { text: '第 10 课 · 定语从句', link: '/course/b1/unit-10' },
              { text: '第 11 课 · B1 综合复习与毕业自测', link: '/course/b1/unit-11' }
            ]
          },
          {
            text: 'B2 课程 · 突破期',
            collapsed: true,
            items: [
              { text: '课程说明', link: '/course/b2/' },
              { text: '第 1 课 · 过去完成时', link: '/course/b2/unit-01' },
              { text: '第 2 课 · 第三条件句与遗憾', link: '/course/b2/unit-02' },
              { text: '第 3 课 · 间接引语', link: '/course/b2/unit-03' },
              { text: '第 4 课 · 被动语态', link: '/course/b2/unit-04' },
              { text: '第 5 课 · 推测情态', link: '/course/b2/unit-05' },
              { text: '第 6 课 · 冠词系统', link: '/course/b2/unit-06' },
              { text: '第 7 课 · 高级不定式与动名词', link: '/course/b2/unit-07' },
              { text: '第 8 课 · B2 综合复习与毕业自测', link: '/course/b2/unit-08' }
            ]
          },
          {
            text: 'C1 课程 · 精进期',
            collapsed: true,
            items: [
              { text: '课程说明', link: '/course/c1/' },
              { text: '第 1 课 · 倒装', link: '/course/c1/unit-01' },
              { text: '第 2 课 · 分裂句', link: '/course/c1/unit-02' },
              { text: '第 3 课 · 省略与替代', link: '/course/c1/unit-03' },
              { text: '第 4 课 · 名词化', link: '/course/c1/unit-04' },
              { text: '第 5 课 · 语域控制', link: '/course/c1/unit-05' },
              { text: '第 6 课 · hedging 与话语标记', link: '/course/c1/unit-06' },
              { text: '第 7 课 · C1 综合复习与毕业自测', link: '/course/c1/unit-07' }
            ]
          },
          {
            text: '词根词缀课 · 词汇的偏旁部首',
            collapsed: true,
            items: [
              { text: '课程说明', link: '/course/roots/' },
              { text: '第 1 课 · 入门：两个世界', link: '/course/roots/unit-01' },
              { text: '第 2 课 · spect · dict · duc', link: '/course/roots/unit-02' },
              { text: '第 3 课 · port · mit · ject', link: '/course/roots/unit-03' },
              { text: '第 4 课 · struct · form · fac', link: '/course/roots/unit-04' },
              { text: '第 5 课 · vis · aud · cred · sci', link: '/course/roots/unit-05' },
              { text: '第 6 课 · mov · stat · pos · sist', link: '/course/roots/unit-06' },
              { text: '第 7 课 · cap · ten · ceive', link: '/course/roots/unit-07' },
              { text: '第 8 课 · 前缀（上）：方向位置', link: '/course/roots/unit-08' },
              { text: '第 9 课 · 前缀（下）：否定程度', link: '/course/roots/unit-09' },
              { text: '第 10 课 · 后缀：词性密码', link: '/course/roots/unit-10' },
              { text: '第 11 课 · 希腊词根', link: '/course/roots/unit-11' },
              { text: '第 12 课 · 综合实战', link: '/course/roots/unit-12' }
            ]
          },
          {
            text: '句子拆解课 · 长难句与翻译',
            collapsed: true,
            items: [
              { text: '课程说明', link: '/course/parsing/' },
              { text: '第 1 课 · 句子的骨架与血肉', link: '/course/parsing/unit-01' },
              { text: '第 2 课 · 拆句五步法', link: '/course/parsing/unit-02' },
              { text: '第 3 课 · 并列结构', link: '/course/parsing/unit-03' },
              { text: '第 4 课 · 定语从句拆解', link: '/course/parsing/unit-04' },
              { text: '第 5 课 · 状语与介词短语', link: '/course/parsing/unit-05' },
              { text: '第 6 课 · 名词性从句', link: '/course/parsing/unit-06' },
              { text: '第 7 课 · 非谓语动词', link: '/course/parsing/unit-07' },
              { text: '第 8 课 · 插入·同位·倒装', link: '/course/parsing/unit-08' },
              { text: '第 9 课 · 英译中技巧总则', link: '/course/parsing/unit-09' },
              { text: '第 10 课 · 30 句闯关实战', link: '/course/parsing/unit-10' }
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
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '目录',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
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
