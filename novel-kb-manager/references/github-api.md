# GitHub API 操作指南

使用 GitHub REST API 读写知识库文件的完整操作手册。

---

## 前置条件

1. **GitHub Token**：Personal Access Token（Classic 或 Fine-grained）
   - Classic Token：需要勾选 `repo` 权限
   - Fine-grained Token：需要仓库的 Contents 读写权限
   - **注意**：Fine-grained PAT 不支持通过 API 创建仓库，需手动创建

2. **已存在的仓库**：`owner/repo-name` 格式（默认配置：`ZhouNQQQ/moshi1`）
3. **已存在的分支**：通常是 `main` 或 `master`（默认：`main`）

---

## Token 配置

### 环境变量方式（推荐）

```bash
export GITHUB_TOKEN="github_pat_xxxxxxxxxxxx"
export KB_REPO="ZhouNQQQ/moshi1"
export KB_BRANCH="main"
```

### 对话中提供

用户直接提供："我的 Token 是 github_pat_xxx，仓库是 ZhouNQQQ/moshi1"

---

## 读取操作

### 读取单个文件

```bash
# 直接通过 Raw API（无需 SHA，最快）
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
  "https://raw.githubusercontent.com/$KB_REPO/$KB_BRANCH/novel-bible.md"

# 或通过 GitHub API（可获取元数据）
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/$KB_REPO/contents/novel-bible.md?ref=$KB_BRANCH"
```

返回的 API 响应中，`content` 字段是 Base64 编码的文件内容：

```bash
# 解码 Base64 内容（注意：GitHub API 返回的 base64 有换行符，需处理）
echo "Q29udGVudCBoZXJl" | tr '_-' '/+' | base64 -d
```

### 列目录内容

```bash
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/$KB_REPO/contents/?ref=$KB_BRANCH"
```

### 获取目录下的所有文件

```bash
# 使用 GitHub Trees API 递归获取目录结构
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/$KB_REPO/git/trees/$KB_BRANCH?recursive=1"
```

### 读取文件列表（批量）

```bash
# 定义要读取的文件列表
FILES=("novel-bible.md" "worldbuilding.md" "characters.md" "plot.md" \
       "chapter-index.md" "foreshadowing-log.md" "consistency-log.md")

for f in "${FILES[@]}"; do
  echo "=== $f ==="
  curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
    "https://raw.githubusercontent.com/$KB_REPO/$KB_BRANCH/$f"
  echo ""
done
```

---

## 写入操作

### 创建新文件

```bash
# 1. 将内容转为 Base64
CONTENT=$(base64 -w 0 novel-bible.md)

# 2. 提交到 GitHub
curl -s -X PUT \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/$KB_REPO/contents/novel-bible.md" \
  -d "{
    \"message\": \"init: create novel-bible\",
    \"content\": \"$CONTENT\",
    \"branch\": \"$KB_BRANCH\"
  }"
```

### 更新已有文件（两步：先获取 SHA，再提交）

```bash
# 1. 获取文件当前 SHA
SHA=$(curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/$KB_REPO/contents/novel-bible.md?ref=$KB_BRANCH" \
  | grep -o '"sha":"[^"]*"' | head -1 | cut -d'"' -f4)

echo "Current SHA: $SHA"

# 2. 提交更新
CONTENT=$(base64 -w 0 novel-bible.md)

curl -s -X PUT \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/$KB_REPO/contents/novel-bible.md" \
  -d "{
    \"message\": \"update: chapter 6 summary and foreshadowing\",
    \"content\": \"$CONTENT\",
    \"sha\": \"$SHA\",
    \"branch\": \"$KB_BRANCH\"
  }"
```

### 批量更新多个文件

由于 GitHub Contents API 每次只能更新一个文件，批量更新需要逐个处理：

```bash
#!/bin/bash
# 定义要更新的文件和提交信息
FILES=("chapter-index.md" "foreshadowing-log.md" "characters.md")
COMMIT_MSG="update: session 2024-01-15 chapter 6-8"

for f in "${FILES[@]}"; do
  if [ -f "$f" ]; then
    # 获取 SHA
    SHA=$(curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
      -H "Accept: application/vnd.github+json" \
      "https://api.github.com/repos/$KB_REPO/contents/$f?ref=$KB_BRANCH" \
      | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('sha',''))")
    
    # 编码内容
    CONTENT=$(base64 -w 0 "$f")
    
    # 提交
    curl -s -X PUT \
      -H "Authorization: Bearer $GITHUB_TOKEN" \
      -H "Accept: application/vnd.github+json" \
      "https://api.github.com/repos/$KB_REPO/contents/$f" \
      -d "{
        \"message\": \"$COMMIT_MSG\",
        \"content\": \"$CONTENT\",
        \"sha\": \"$SHA\",
        \"branch\": \"$KB_BRANCH\"
      }"
    
    echo "Updated: $f"
    sleep 1  # 避免触发速率限制
done
```

---

## 使用 GitHub CLI（如果环境中已安装）

如果环境中有 `gh` 命令，操作更简洁：

### 读取文件

```bash
# 认证
export GH_TOKEN="$GITHUB_TOKEN"
gh auth login --with-token <<< "$GH_TOKEN"

# 读取文件内容
gh api repos/$KB_REPO/contents/novel-bible.md \
  --jq '.content' | base64 -d
```

### 更新文件

```bash
# 获取 SHA
SHA=$(gh api repos/$KB_REPO/contents/novel-bible.md \
  --jq '.sha')

# 读取本地文件并编码
CONTENT=$(base64 -w 0 novel-bible.md)

# 提交
gh api repos/$KB_REPO/contents/novel-bible.md \
  -X PUT \
  -F message="update: session summary" \
  -F content="$CONTENT" \
  -F sha="$SHA" \
  -F branch="$KB_BRANCH"
```

---

## 提交信息规范

每次更新知识库时，使用以下提交信息前缀：

| 前缀 | 使用场景 | 示例 |
|------|----------|------|
| `init:` | 首次创建文件 | `init: create novel-bible and templates` |
| `update:` | 常规更新 | `update: chapter 6-8 summaries` |
| `fix:` | 修复一致性问题 | `fix: character power level (C0003)` |
| `add:` | 新增伏笔/设定 | `add: foreshadowing F0005 for later reveal` |
| `decision:` | 记录决策 | `decision: D0006 why villain chooses dark path` |
| `reveal:` | 已揭示信息更新 | `reveal: chapter 30 truth about protagonist` |

---

## 错误处理

| 状态码 | 含义 | 解决 |
|--------|------|------|
| 401 | Token 无效或过期 | 重新生成 Token |
| 403 | 权限不足 | 检查 Token 是否有 repo 权限；Fine-grained PAT 需确认 Contents 读写权限 |
| 404 | 文件/仓库/分支不存在 | 检查路径；确认仓库和分支已存在 |
| 409 | 冲突（SHA 不匹配） | 重新获取文件 SHA 再提交 |
| 422 | 内容验证失败 | 检查 Base64 编码是否正确 |

---

## 速率限制

GitHub API 对认证用户限制为每小时 5000 次请求。知识库操作通常不会触发限制。

如需检查剩余配额：

```bash
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/rate_limit" \
  | grep -o '"remaining":[0-9]*'
```

---

## 本地文件模式（无 GitHub 时）

如果用户不使用 GitHub，通过本地文件系统管理：

```bash
# 设置本地路径
export KB_LOCAL_PATH="/path/to/my-novel/kb"

# 读取
ls $KB_LOCAL_PATH
cat $KB_LOCAL_PATH/novel-bible.md

# 写入
echo "updated content" > $KB_LOCAL_PATH/novel-bible.md
```

本地模式不需要 Token，零配置，适合单机创作。缺点是缺乏版本历史和多设备同步。
