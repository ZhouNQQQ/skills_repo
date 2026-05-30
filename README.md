# Skills Repository — 自定义 Agent 技能库

本仓库托管自定义的 Agent 技能（Skills），供 AI 助手按需加载使用。

---

## 活跃技能 (Active Skills)

| 技能名称 | 功能定位 | 触发场景 | 路径 |
|---------|---------|---------|------|
| **article-value-inspector** | 文章价值五维评估框架 | 评估文章是否值得阅读、信息筛选、批判性阅读 | `article-value-inspector/` |
| **deep-reading** | AI辅助深度阅读与知识内化 | 读书、理解复杂内容、学习材料、知识提取 | `deep-reading/` |
| **learning-complete-suite** | 一站式学习完整体系 | 设计学习计划、深度理解、科学记忆、动力习惯、克服焦虑 | `learning-complete-suite/` |
| **novel-writing-master** | 网络小说创作全栈大师 | 写小说、网文创作、角色设定、情节架构、世界观搭建 | `novel-writing-master/` |
| **personal-learning-coach** | 私人学习教练 | 上传学习资料、督促学习、考试演练、笔记管理、进度追踪 | `personal-learning-coach/` |
| **review-and-improve-skill** | Skill质量审查与优化 | 审查skill质量、识别问题、输出改进方案 | `review-and-improve-skill/` |
| **skill-creator-assistant** | Agent技能创建引导 | 创建技能、设计SKILL.md、技能结构规划 | `skill-creator-assistant/` |

---

## 技能详情

### article-value-inspector
使用 AVIM（Article Value Inspection Methodology）五维框架快速评估任何文章、博客、新闻是否值得阅读。

**核心能力**：
- 五维过滤框架（原创性、深度、实用性、可信度、可读性）
- 逻辑谬误快速识别
- 四本书方法论融合

---

### deep-reading
将被动阅读转化为主动学习的三步系统：结构映射→问题驱动阅读→主动回忆。

**核心能力**：
- 结构性阅读框架
- 问题驱动的深度理解
- 知识内化与提取练习

---

### learning-complete-suite
整合费曼学习法、科学学习底层逻辑、学习动力系统三大方法论，提供从计划设计到深度理解、科学记忆、动力养成的完整学习系统。

**七步工作流**：需求分析→内容拆解→策略选择→深度理解(费曼法)→科学记忆→动力习惯→评估迭代

**参考文献**：
- `references/feynman-workflow.md` — 费曼五步法与三次复述工作法
- `references/science-tactics.md` — 认知科学六大记忆战术
- `references/cognitive-science-principles.md` — 科学学习核心原理
- `references/learning-power-habits.md` — 动力系统与六大习惯模块
- `references/plan-templates.md` — 场景模板、执行示例、输出格式

---

### novel-writing-master
网络小说创作全栈大师，覆盖拆书学习到完本收尾的完整创作链路。

**核心模块**：
- 拆书学习、世界观搭建、角色塑造
- 情节架构、开篇钩子、叙事技巧
- 文笔润色、对话设计、连载规划
- 小说知识库维护（13-knowledge-base.md）

---

### personal-learning-coach
你的私人学习教练，基于上传的学习资料和学习计划，负责路线管理、进度督促、内容讲解、考试演练、笔记管理。

**首次配置**（6项引导）：
1. 学习资料（支持多文件/链接/ima知识库）
2. 学习计划（可自动生成）
3. 督促形式（消息推送/学习日报/考试触发/混合）
4. 督促频率（每天/每周/模块完成/进度落后时）
5. 笔记格式（Markdown/思维导图/纯文本/JSON）
6. 笔记存放位置（本地workspace或ima知识库）

**13项能力模块**：
📚 资料库管理 | 🗺️ 计划解析 | 📊 进度追踪 | ⏰ 智能督促 | 🎓 内容速讲 | 📖 原始知识 | 🔍 详细版 | 📝 考试模式 | 📒 笔记管理 | 🔎 跨资料检索 | 🏁 里程碑检查 | 🔄 动态调参 | 📈 学习报告

**脚本**：`scripts/check-ima-creds.sh` — IMA OpenAPI 凭证检查

---

### review-and-improve-skill
审查并优化 Agent Skill 的 meta-skill。对已有 skill 进行结构化质量检查，识别问题并按严重程度分级，输出可执行的改进方案。

**审查维度**：
- 结构检查（目录规范、行数限制）
- Frontmatter 检查（YAML规范、触发条件）
- 内容质量（工作流清晰度、祈使语气）
- 反馈闭环（验证步骤、修复前后对比）

**脚本**：`scripts/analyze-skill.js` | `scripts/improve-skill.js`

---

### skill-creator-assistant
引导用户创建高质量的 Agent 技能。收集需求、设计技能结构、起草 SKILL.md 和 references/。

**核心流程**：
1. 需求收集与分析
2. 技能结构设计
3. SKILL.md 起草
4. references/ 编写
5. 质量审查与迭代

---

## 归档技能 (Archived Skills)

以下技能已归档，内容被合并或保留历史版本：

| 技能名称 | 归档原因 | 路径 |
|---------|---------|------|
| `learning-design-suite` | 合并入 learning-complete-suite | `skill-archive/learning-design-suite/` |
| `feynman-learning` | 合并入 learning-complete-suite | `skill-archive/feynman-learning/` |
| `science-learning-core` | 合并入 learning-complete-suite | `skill-archive/science-learning-core/` |
| `learning-power-habits` | 合并入 learning-complete-suite | `skill-archive/learning-power-habits/` |
| `novel-kb-manager` | 合并入 novel-writing-master | `skill-archive/novel-kb-manager/` |

---

## 使用方式

```
技能加载格式: https://github.com/ZhouNQQQ/skills_repo/tree/main/<skill-name>
```

**示例**：
- `https://github.com/ZhouNQQQ/skills_repo/tree/main/personal-learning-coach`
- `https://github.com/ZhouNQQQ/skills_repo/tree/main/learning-complete-suite`

---

*本仓库共有 7 个活跃技能 + 5 个归档技能，持续维护中。*
