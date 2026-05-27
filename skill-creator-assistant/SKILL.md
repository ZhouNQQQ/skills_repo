---
name: skill-creator-assistant
description: >
  引导用户创建高质量的 Agent 技能。收集需求、基于 skill-design-blueprint 方法设计技能结构、
  起草 SKILL.md 和 references/，然后审查并迭代。当用户说"写个技能"、"创建技能"、
  "设计技能"、"帮我做技能"、"技能模板"、"技能结构"、"怎么写 SKILL.md"、
  或询问如何创建 Agent 技能时触发。
---

# 技能创建助手

帮助用户创建高效、可组合的 Agent 技能，遵循经过验证的 mattpocock 风格模式。

## 流程

### 1. 收集需求

向用户提问：

- 这个技能覆盖什么任务/领域？
- 需要处理哪些具体用例？
- 是否需要脚本，还是只需要指令？
- 是否有参考材料需要包含？
- 用户可能会说什么触发词来调用这个技能？

读取用户的回答。如果不清楚，每次只追问一个问题。

### 2. 设计技能结构

根据需求，规划技能结构：

```
skill-name/
├── SKILL.md              # 核心工作流（<100 行）
└── references/           # 详细文档、模板、示例
```

需要做出的决策：
- **名称**：简短，kebab-case（短横线连接）
- **描述**：遵循 [references/description-craft.md](references/description-craft.md) 的规则
- **模式**：匹配哪种设计模式？参见 [references/patterns.md](references/patterns.md)
- **模板**：哪种模板类型？参见 [references/templates.md](references/templates.md)

### 3. 起草 SKILL.md

按照以下结构创建 SKILL.md：

1. **YAML frontmatter** — name + description（最多 1024 字符，包含触发词）
2. **一句话摘要**
3. **快速开始** — 最小可用示例
4. **工作流** — 带检查清单的逐步流程
5. **决策点** — 何时分支、何时停止
6. **参考资料** — 链接到 references/ 中的文件

需要遵守的规则：
- 保持在 100 行以内
- 使用祈使语气
- 明确的进入/退出条件
- "在……之前不要继续" 的检查点
- 不包含时间敏感信息

### 4. 起草 references/

将 SKILL.md 中溢出的详细内容移到 references/：

- 长模板或模式 -> references/templates.md
- 设计模式和反模式 -> references/patterns.md
- 工作流模式和逃生舱口 -> references/workflow-patterns.md
- 描述示例 -> references/description-craft.md
- 审查清单 -> references/review-checklist.md

### 5. 与用户审查

展示草稿，询问：

- 这是否覆盖了你的用例？
- 有什么缺失或不清晰的地方？
- 触发词是否准确？

### 6. 迭代

应用用户反馈。然后验证：

参见 [references/review-checklist.md](references/review-checklist.md) 获取完整的验证清单。

## 输出标准

始终产出：
- 可直接使用的 SKILL.md
- 包含支持文档的 references/ 文件夹
- 关于为什么选择这种结构的简短说明

绝不产出：
- 模糊或通用的描述
- 时间敏感的内容（日期、版本号）
- 第一人称指令（"你应该……"）
- 应该放在 references/ 中的内联内容
