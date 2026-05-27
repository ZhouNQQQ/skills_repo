# 时间敏感内容模式

## 避免这些模式

| 模式 | 示例 | 替换为 |
|------|------|--------|
| 具体年份 | "2024 年新增" | "可用功能" |
| 相对时间 | "最新版本"、"最近添加" | "当前稳定版"、"可用功能" |
| 临时标记 | "now supports"、"today announced" | 删除或泛化为 "支持" |
| 版本号声明 | "v2.3.1 起支持" | 功能描述，不含版本 |

## 标准 YAML Frontmatter

Skill 文件头部应仅包含标准的 YAML frontmatter，**不包含 AIGC 生产标记**：

```yaml
---
name: skill-name
description: >
  描述内容...
---
```

## AIGC 头部污染清理清单

- [ ] 删除 ReservedCode1、ReservedCode2 等保留码字段
- [ ] 删除 ProduceID、PropagateID 等生产标记
- [ ] 删除 ContentProducer、ContentPropagator 等生产者信息
- [ ] 删除 Label: AIGC 等标签
- [ ] 确保 `---` 分隔符前后无多余注释
- [ ] 确认 frontmatter 仅包含 `name` 和 `description` 字段

## 正确的时间无关写法

- 条件触发："当用户提到 X 时"
- 状态描述："如果项目使用框架 Y"
- 功能声明："支持 Z 功能"
