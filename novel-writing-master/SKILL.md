---
name: novel-writing-master
description: >
  网络小说创作全栈大师：拆书学习、世界观搭建、角色塑造、情节架构、开篇钩子、叙事技巧、文笔润色、对话设计、连载规划、完本收尾、小说知识库维护一站式覆盖。Use when 用户提及写小说、网文创作、角色设定、战力设定、情节大纲、冲突设计、爽点、伏笔、悬念、世界观、修炼体系、势力分布、叙事视角、黄金三章、留存、文笔润色、白描、对话张力、卡文、完本、拆书、仿写、末世、种田流、小说设定、设定冲突、剧情bug、人物ooc、伏笔追踪、章节索引、知识库、设定管理，或任何网络小说写作需求时触发。自动识别创作阶段并路由到对应模块，自动维护小说知识库防止创作失忆。
---

# 网络小说创作全栈大师

一站式网络小说创作指导，覆盖从拆书学习到完本收尾的全流程。

## 创作阶段速查

按网文创作流程排列：

| 阶段 | 核心任务 | 文件 |
|------|---------|------|
| **拆书学习** | 拆解爆款、学习技巧、仿写内化 | [references/01-chaishu.md](references/01-chaishu.md) |
| **世界观** | 力量体系、势力分布、渐进揭示 | [references/02-worldbuilding.md](references/02-worldbuilding.md) |
| **角色** | 人设档案、成长弧线、一致性检查 | [references/03-characters.md](references/03-characters.md) |
| **情节** | LOCK系统、三幕结构、冲突升级、伏笔 | [references/04-plot.md](references/04-plot.md) |
| **开篇** | 黄金三章、钩子设计、留存策略 | [references/05-opening.md](references/05-opening.md) |
| **叙事** | 视角控制、信息透露、感官沉浸 | [references/06-narrative.md](references/06-narrative.md) |
| **文笔** | 白描、去冗余、五感、排版 | [references/07-prose.md](references/07-prose.md) |
| **词汇** | 精词优选、五感描写、修辞技法 | [references/08-lexicon.md](references/08-lexicon.md) |
| **对话** | 议程+冲突、声口设计、潜文本 | [references/09-dialogue.md](references/09-dialogue.md) |
| **女性描写** | 六维描写、情境动作、避免刻板 | [references/10-female.md](references/10-female.md) |
| **连载** | 日更规划、伏笔回收、卡文急救 | [references/11-serialization.md](references/11-serialization.md) |
| **末世** | 灾变设定、种田流、移动基地 | [references/12-apocalyptic.md](references/12-apocalyptic.md) |
| **知识库** | Bible维护、决策记录、章节索引、一致性保障 | [references/13-knowledge-base.md](references/13-knowledge-base.md) |
| **节奏调配** | 单章节奏、信息阶梯、悬置冲突、情绪曲线 | [references/14a-plot-pressure-model.md](references/14a-plot-pressure-model.md) + [references/14b-plot-foreshadowing.md](references/14b-plot-foreshadowing.md) + [references/14c-plot-execution.md](references/14c-plot-execution.md) |
| **雪花大纲** | 故事核→五句段→详细大纲→场景清单 | [references/outline.md](references/outline.md) |

## 知识库系统

防止"写到后面忘了前面"的核心机制。知识库文件放在小说项目目录下，技能通过读写这些 Markdown 文件保持跨会话一致性。所有长篇创作必须维护。

→ 详细模板、更新时机、各文件格式见 [references/13-knowledge-base.md](references/13-knowledge-base.md)

## 组合使用指南

| 场景 | 推荐组合 | 执行顺序 |
|------|---------|---------|
| 启动新项目 | knowledge-base → worldbuilding → characters → plot | 先搭知识库骨架，再填内容 |
| 继续写第N章 | read-kb → write → sync-kb | 先读知识库，再创作，最后同步 |
| "帮我写一本末世小说" | worldbuilding + apocalyptic + plot | 先世界观→再末世细节→最后情节 |
| "设计主角并写开篇" | characters + opening | 先定人设→再定开篇 |
| "卡文了" | read-kb(foreshadowing) + serialization + plot | 先读伏笔表找素材→再诊断→再补情节 |
| "检查一下有没有bug" | read-kb(all) → consistency check | 对照知识库逐项检查 |
| "写一场情感爆发戏" | plot + dialogue + female | 先情节→再对白→最后表情动作 |
| "调整某章节奏" | plot-rhythm + narrative | 先诊断三线权重→再执行调配 |

## 执行规范

1. **先读知识库，再创作**：没有读取知识库之前，不产出正文内容
2. **边写边记**：产生新设定、新决策、新伏笔时，立即更新知识库
3. **先诊断再输出**：修改类需求先指出问题，再给出修订版
4. **保持连贯**：组合使用时确保输出之间的逻辑一致性
5. **输出标准**：必须提供可直接执行的表格/清单/模板，附带示例

## 验证与回溯（会话结束前必做）

每次创作会话结束前执行，防止引入设定冲突、剧情bug或伏笔断裂：

1. **设定一致性检查**：对照知识库验证新内容是否与已有设定冲突（战力体系、地理、时间线）
2. **剧情bug扫描**：检查人物行为逻辑、势力关系、因果关系一致性
3. **伏笔回收状态**：标记本次回收的伏笔，记录新增的未回收伏笔及其预期回收位置
4. **输出变更摘要**：列出本次所有知识库更新项，提醒用户保存
5. **角色一致性确认**：对照角色档案检查新对话/行为是否符合既定人设

→ 各检查项的详细操作标准见 [references/13-knowledge-base.md](references/13-knowledge-base.md)
