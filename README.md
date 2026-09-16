# 英语学习框架 · 从零基础到精通

面向中国成人自学者的英语学习完整指南站点：**学习框架（路线图）+ 零基础课程（真教学内容）**，基于二语习得（SLA）科学研究。

在线访问：https://<你的用户名>.github.io/english-study-guide/ （部署完成后替换此链接）

## 站点内容

| 板块 | 内容 |
|---|---|
| 📘 **零基础课程** | 启蒙课（音标与拼读 9 课）+ A1 课程（入门语法词汇 9 课），中文讲解、生词表、练习与答案 |
| 🗺️ **学习框架** | 阶段 0~6 完整路线：目标、工具、每周模板、可量化毕业标准 |
| 📚 **词汇战略** | 高频词 → 挖矿 → 词根词缀三层递进（把"死记"变成"理解记忆"） |
| 🧰 **工具与专题** | 资源工具箱、大陆无障碍方案、七大失败模式防御、检测与记录 |

## 本地开发

```bash
# 安装依赖（npm 或 pnpm 均可）
npm install        # 或 pnpm install

# 开发预览（热更新）→ http://localhost:5173
npm run docs:dev

# 构建产物 → docs/.vitepress/dist
npm run docs:build

# 本地预览构建产物
npm run docs:preview
```

## 免费部署（GitHub Pages）

本仓库已配置 GitHub Actions 自动部署（`.github/workflows/deploy.yml`）：

- 推送到 `main` 分支 → 自动构建并发布到 GitHub Pages
- 也可在 Actions 页手动触发（workflow_dispatch）

**首次启用步骤**：仓库 `Settings → Pages → Source` 选择 **GitHub Actions**。

部署地址：`https://<用户名>.github.io/english-study-guide/`
（构建配置中的 `base` 已按仓库名 `english-study-guide` 设置；若仓库改名，请同步修改 `docs/.vitepress/config.ts` 的 base）

## 目录结构

```
├── docs/                        # VitePress 站点
│   ├── index.md                 # 首页
│   ├── course/                  # 零基础课程
│   │   ├── stage0/              #   启蒙课：音标与拼读（9 课）
│   │   └── a1/                  #   A1 课程：入门语法（9 课）
│   ├── guide/                   # 学习框架（阶段 0~6 + 专题）
│   └── .vitepress/              # 站点配置与主题
├── 英语学习框架.md               # 框架母本（单文件完整版）
├── data/                        # 学习日志（你的进度记录放这里）
└── .github/workflows/deploy.yml # GitHub Pages 自动部署
```

## 怎么开始学

首页点「**开始上课（零基础）**」→ 从启蒙课第 1 课开始，每课 3~4 天。
课程负责"学懂"，框架负责"进度与材料"，两条线并行。
