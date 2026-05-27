# Skill 审查清单

## 结构检查

- [ ] 目录结构符合规范：`SKILL.md` + 可选的 `scripts/`、`references/`、`assets/`
- [ ] 无冗余文件（README.md、CHANGELOG.md、INSTALLATION_GUIDE.md 等）
- [ ] SKILL.md 行数 <= 100 行
- [ ] references/ 文件按主题拆分，单个文件 <= 200 行

## Frontmatter 检查

- [ ] 存在标准的 `---` YAML frontmatter（无 AIGC 污染）
- [ ] 包含 `name` 字段，与目录名一致（kebab-case）
- [ ] 包含 `description` 字段，>= 3 个触发场景
- [ ] description <= 1024 字符
- [ ] 无 ReservedCode、ProduceID、ContentProducer 等非标准字段
- [ ] 无多余字段（如 `version`、`date`、`author`）

## 内容质量检查

- [ ] SKILL.md 只包含核心工作流和决策分支
- [ ] 详细最佳实践已移至 references/
- [ ] 示例已移至 EXAMPLES.md 或 references/examples.md
- [ ] 无时间敏感内容（日期、版本号、临时标记）
- [ ] 无 SKILL.md 与 references/ 之间的内容重复
- [ ] 使用祈使语气（非"你应该..."）
- [ ] 明确的进入/退出条件
- [ ] 包含"在...之前不要继续"的检查点

## 反馈闭环检查

- [ ] 审查流程包含验证/确认步骤
- [ ] 修复后有重新分析的明确步骤（步骤 5）
- [ ] 输出包含修复前后对比

## 脚本检查（如适用）

- [ ] 脚本位于 skill 级 `scripts/` 目录下
- [ ] 脚本已实际运行验证通过
- [ ] 脚本有明确的输入/输出约定
- [ ] 脚本支持 `--dry-run` 和 `--apply` 模式
