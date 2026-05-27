---
name: review-and-improve-skill
description: >
  审查并优化 Agent Skill 的 meta-skill。对已有 skill 进行结构化质量检查，
  识别问题并按严重程度分级，输出可执行的改进方案。触发场景：
  (1) 创建新 skill 后需要 review 验证质量，
  (2) 用户反馈 skill 表现不佳需要诊断改进，
  (3) 迭代现有 skill 前做差距分析，
  (4) 批量审查多个 skill 的一致性，
  (5) 学习优秀 skill 的设计模式时做反向工程分析，
  (6) 任何提到 "review skill"、"审查技能"、"优化技能"、"技能质量检查" 的场景。
---

# 审查与优化技能

对 skill 进行系统性质量审查与优化。核心目标：SKILL.md 保持在 100 行以内，详细内容下沉到 references/，消除冗余和反模式。

## 快速开始

1. 确定要审查的技能路径
2. 运行分析脚本：`node scripts/analyze-skill.js <技能路径>`
3. 查看分析结果和建议
4. 在用户确认后运行优化脚本：`node scripts/improve-skill.js <技能路径> --apply`

## 审查工作流

1. **结构扫描** — 检查目录结构、frontmatter、文件组织
   - 读取 SKILL.md 和 references/ 下所有文件
   - 对照 [references/review-checklist.md](references/review-checklist.md) 逐项检查
   - 标记问题并按严重程度分类

2. **问题诊断** — 分析问题根因
   - 参见 [references/severity-definitions.md](references/severity-definitions.md) 了解 P1/P2/P3 分级标准
   - 参见 [references/time-sensitive-patterns.md](references/time-sensitive-patterns.md) 识别时间敏感内容污染
   - 识别反模式：SKILL.md 超过 100 行、内联最佳实践、重复内容、模糊的 description

3. **制定修复方案** — 输出结构化的改进计划
   - 按 P1 > P2 > P3 优先级排序
   - 明确每个修复动作：精简、迁移、拆分、补充

4. **执行修复** — 应用改进
   - SKILL.md 精简：溢出内容移至 references/
   - REFERENCE.md 拆分：独立主题拆为单独 reference 文件
   - Description 优化：增加缺失的触发场景
   - 清理 AIGC 头部污染，保留标准 YAML frontmatter

5. **重新分析验证** — 闭环检查改进效果
   - 重新运行 analyze-skill.js 检查修改后的文件
   - 逐项验证原问题是否解决
   - 检查是否引入新问题（回归测试）
   - 输出验证报告：修复完成度 + 遗留问题 + 建议迭代方向

## 决策分支

**SKILL.md > 100 行？** → 将详细最佳实践移至 references/，示例移至 EXAMPLES.md

**REFERENCE.md > 200 行？** → 按主题拆分为独立 reference 文件

**description < 3 个触发场景？** → 补充 "创建后 review"、"性能诊断"、"批量一致性检查" 等场景

**发现 AIGC 头部污染（ReservedCode/ProduceID）？** → 清理为标准的 `---` YAML frontmatter

## 脚本使用

```bash
# 分析技能（输出 JSON 报告）
node scripts/analyze-skill.js <技能路径>

# 优化技能（--dry-run 预览，--apply 应用）
node scripts/improve-skill.js <技能路径> [--apply] [--dry-run]
```

## 详细最佳实践

参见 [references/best-practices.md](references/best-practices.md) 获取完整的审查标准、反模式清单和输出模板。
