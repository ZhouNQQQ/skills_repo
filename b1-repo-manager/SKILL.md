---
name: b1-repo-manager
description: >
  B1量化交易策略代码仓库管理Skill。当用户要求推送、提交、更新、上传、保存
  B1策略的Python代码到GitHub仓库时自动触发。管理ZhouNQQQ/trading仓库的
  代码同步、版本控制和GitHub推送工作流。适用于所有涉及B1策略代码变更后
  需要保存到远程仓库的场景。
---

# B1 Repo Manager

管理B1量化交易策略代码在GitHub仓库（ZhouNQQQ/trading，main分支）中的版本控制与同步。

## 触发条件

以下任意场景自动激活本skill：

1. 用户说"把代码提交到仓库"、"推送到GitHub"、"更新代码"
2. 用户说"保存代码"、"上传代码"、"提交代码"且上下文涉及B1策略
3. 用户在代码修改后要求"同步"、"备份"、"存档"
4. 任何涉及 `ZhouNQQQ/trading` 仓库的操作请求

## 仓库配置（固定）

| 配置项 | 值 | 说明 |
|--------|-----|------|
| 仓库所有者 | `ZhouNQQQ` | 固定，不可变更 |
| 仓库名称 | `trading` | 固定，不可变更 |
| 默认分支 | `main` | 固定 |
| 代码目录 | `/mnt/agents/output/b1_scorer/` | 本地工作目录 |

**用户需要自行配置**：GitHub Personal Access Token（PAT），用于推送权限。

## Token配置方法（用户必须完成一次）

### 方式1：环境变量（推荐）

```bash
export GITHUB_TOKEN=ghp_your_token_here
```

### 方式2：配置文件

```bash
echo '{"token":"ghp_your_token_here"}' > ~/.b1_repo_config
```

### 方式3：命令行参数（临时）

```bash
python scripts/git_push.py --token ghp_your_token_here
```

### Token权限要求

- **Classic Token**: 创建时勾选 `repo` 范围（完整仓库读写）
- **Fine-grained Token**: 授予 `ZhouNQQQ/trading` 仓库的 **Contents** 读写权限
- 如果推送返回 `403 Forbidden`，说明token权限不足，需要重新创建

## 核心工作流

### 工作流A：自动推送当前代码变更

当用户要求"推送代码"时执行：

```bash
cd /mnt/agents/output/b1_scorer/

# 1. 检查变更
git status --short

# 2. 如有变更，自动提交并推送
python /mnt/agents/output/b1-repo-manager/scripts/git_push.py \
    --repo-dir /mnt/agents/output/b1_scorer \
    --commit-msg "Update B1 strategy code via agent"
```

### 工作流B：完整Git操作（带用户确认）

当用户要求"提交代码"且需要展示变更明细时：

1. **展示变更摘要**：
   ```bash
   cd /mnt/agents/output/b1_scorer/
   git status
   git diff --stat
   ```

2. **询问用户确认**：展示变更文件列表，询问提交信息

3. **执行提交和推送**：
   ```bash
   git add .
   git commit -m "用户指定的提交信息"
   git push origin main
   ```

### 工作流C：初始化新仓库（首次使用）

如果本地目录尚未关联远程仓库：

```bash
cd /mnt/agents/output/b1_scorer/
git init
git branch -M main

# 添加远程（需要token）
git remote add origin https://<TOKEN>@github.com/ZhouNQQQ/trading.git

# 首次推送
git push -u origin main
```

## 脚本工具

### `scripts/git_push.py`

自动化推送脚本，处理以下场景：

| 场景 | 行为 |
|------|------|
| 无代码变更 | 提示无需提交，正常退出 |
| 正常推送 | 自动add→commit→push，输出成功信息 |
| 403 Forbidden | 提示token权限不足，给出修复指引 |
| 401 Unauthorized | 提示token无效/过期，给出修复指引 |
| 网络超时 | 提示网络问题，建议重试 |
| 冲突 | 提示需要手动解决，暂停自动推送 |

## 与B1策略开发工作流的整合

代码修改的典型流程：

```
1. 用户要求修改B1策略代码（评分逻辑、指标计算等）
   ↓
2. Agent修改 /mnt/agents/output/b1_scorer/ 下的Python文件
   ↓
3. 验证修改（语法检查、模块导入测试）
   ↓
4. 【本Skill】Agent自动执行: python scripts/git_push.py
   ↓
5. 向用户报告: 代码已提交到GitHub，链接 https://github.com/ZhouNQQQ/trading
```

## 注意事项

1. **Token安全**：绝不将用户的真实token写入skill文件或聊天记录。始终通过环境变量或配置文件传递。
2. **首次推送**：如果用户从未成功推送过，可能需要先验证token权限。
3. **网络问题**：GitHub在中国大陆访问可能不稳定，推送失败时建议重试或提醒用户手动操作。
4. **冲突处理**：如果远程仓库有本地没有的变更，自动推送会失败。此时需要引导用户手动 pull → merge → push。
5. **提交信息**：自动推送使用默认提交信息 `"Update B1 strategy code via agent"`。如果用户有指定，使用用户指定的信息。
