---
name: novel-kb-manager
description: >
  网络小说知识库管理器：连接 GitHub 或本地知识库，读取/写入/初始化小说 Bible、
  角色档案、伏笔追踪、章节索引等知识库文件。当用户提及"知识库"、"KB"、
  "bible"、"设定管理"、"章节索引"、"伏笔追踪"、"角色档案"、"保存设定"
  或要求"读取知识库"/"更新知识库"/"初始化知识库"时触发。自动管理跨会话的
  小说一致性数据，防止"写到后面忘了前面"。
---

# 小说知识库管理器

管理小说创作知识库的统一接口。支持 GitHub 仓库和本地文件两种存储后端。

## 快速开始

首次使用需要配置连接。提供以下任一方式：

**方式一：环境变量（推荐）**
```bash
export GITHUB_TOKEN="你的 GitHub Token"
export KB_REPO="ZhouNQQQ/moshi1"   # owner/repo
export KB_BRANCH="main"
```

**方式二：对话中提供**
直接告诉我："我的知识库在 GitHub，仓库是 ZhouNQQQ/moshi1，Token 是 github_pat_xxx"

## 核心操作

| 操作 | 触发语 | 功能 |
|------|--------|------|
| 读取知识库 | "读取知识库" | 下载全部文件，展示状态摘要 |
| 写入知识库 | "保存知识库"/"同步知识库" | 上传变更，展示变更摘要 |
| 初始化知识库 | "初始化知识库" | 创建全部模板文件 |
| 查看伏笔 | "查看伏笔" | 读取 foreshadowing-log.md |
| 查看角色 | "查看角色状态" | 读取 characters.md |
| 查看章节 | "查看章节索引" | 读取 chapter-index.md |
| 查看设定 | "查看设定" | 读取 worldbuilding.md 冻结区 |
| 记录bug | "发现bug" | 记录到 consistency-log.md |
| 记录决策 | "做了重要决策" | 在 decisions/ 创建 D000N |

## 工作流集成

本 skill 不直接产生小说正文，而是为 `novel-writing-master` 提供数据服务：

```
novel-writing-master 创作正文
       ↓
novel-kb-manager 同步设定/角色/伏笔到知识库
       ↓
下次会话 novel-kb-manager 读取知识库 → novel-writing-master 继续创作
```

两个 skill 常组合使用：
- **启动新项目**：kb-manager 初始化 → novel-writing-master 创作
- **继续已有项目**：kb-manager 读取 → novel-writing-master 创作 → kb-manager 同步
- **卡文**：kb-manager 查伏笔/查角色 → novel-writing-master 续写
- **检查一致性**：kb-manager 查设定 → novel-writing-master 检查 → kb-manager 记录

## 输出标准

每次操作后展示：
1. **操作摘要**：读了哪些文件 / 写了哪些文件
2. **状态快照**：当前进度、活跃伏笔数、待处理一致性问题数
3. **下一步建议**：基于知识库状态给出创作建议

---

## 配置管理

### 存储后端选择

| 后端 | 配置方式 | 优点 |
|------|----------|------|
| **GitHub** | `GITHUB_TOKEN` + `KB_REPO` + `KB_BRANCH` | 版本历史、多设备同步 |
| **本地** | `KB_LOCAL_PATH` 环境变量 | 零配置、离线可用 |

### Token 安全

- Token 只通过环境变量或对话输入提供
- 不存储到 skill 文件或任何持久化位置
- 每次会话独立获取，会话结束即丢弃
- **提醒用户**：Fine-grained PAT 无法创建仓库，需手动在 GitHub 创建

→ GitHub API 详细操作指南见 [references/github-api.md](references/github-api.md)
→ 知识库文件模板见 [references/templates.md](references/templates.md)
