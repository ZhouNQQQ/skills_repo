#!/usr/bin/env python3
"""
git_push.py - B1策略代码自动推送到GitHub仓库脚本

使用方式：
    python git_push.py [--commit-msg "更新说明"]

环境变量（推荐）：
    export GITHUB_TOKEN=ghp_xxxxxxx   # 你的GitHub PAT

或配置文件 ~/.b1_repo_config：
    {"token": "ghp_xxxxxxx"}

功能：
    1. 自动检测代码变更
    2. git add + commit + push 到 origin main
    3. 处理常见git错误（权限、冲突、网络）
"""

import json
import os
import subprocess
import sys
from pathlib import Path

# 默认仓库配置（用户可修改）
REPO_OWNER = "ZhouNQQQ"
REPO_NAME = "trading"
BRANCH = "main"
DEFAULT_REMOTE = f"https://github.com/{REPO_OWNER}/{REPO_NAME}.git"


def get_token() -> str:
    """获取GitHub Token（优先级：环境变量 > 配置文件）"""
    # 1. 环境变量
    token = os.environ.get("GITHUB_TOKEN", os.environ.get("GH_TOKEN", ""))
    if token:
        return token

    # 2. 配置文件
    config_path = Path.home() / ".b1_repo_config"
    if config_path.exists():
        try:
            with open(config_path) as f:
                cfg = json.load(f)
                return cfg.get("token", "")
        except Exception:
            pass

    return ""


def run_cmd(cmd: list, cwd: str = None, check: bool = True) -> tuple:
    """运行shell命令，返回 (stdout, stderr, returncode)"""
    try:
        result = subprocess.run(
            cmd, cwd=cwd, capture_output=True, text=True, timeout=60
        )
        if check and result.returncode != 0:
            return result.stdout, result.stderr, result.returncode
        return result.stdout, result.stderr, result.returncode
    except subprocess.TimeoutExpired:
        return "", "命令超时", 1
    except Exception as e:
        return "", str(e), 1


def push_to_github(repo_dir: str, commit_msg: str, token: str) -> bool:
    """推送代码到GitHub仓库"""

    # 1. 检查是否有变更
    out, err, code = run_cmd(["git", "status", "--short"], cwd=repo_dir, check=False)
    if not out.strip():
        print("✅ 没有检测到代码变更，无需提交")
        return True

    print(f"检测到变更:\n{out}")

    # 2. 配置远程URL（带token）
    remote_url = f"https://{token}@github.com/{REPO_OWNER}/{REPO_NAME}.git"
    run_cmd(["git", "remote", "set-url", "origin", remote_url], cwd=repo_dir, check=False)

    # 3. git add
    out, err, code = run_cmd(["git", "add", "."], cwd=repo_dir)
    if code != 0:
        print(f"❌ git add 失败: {err}")
        return False

    # 4. git commit
    out, err, code = run_cmd(["git", "commit", "-m", commit_msg], cwd=repo_dir)
    if code != 0:
        # 可能没有变更可以提交
        if "nothing to commit" in out or "nothing to commit" in err:
            print("✅ 没有需要提交的变更")
            return True
        print(f"❌ git commit 失败: {err}")
        return False

    print(f"✅ 已提交: {commit_msg}")

    # 5. git push
    print("🚀 正在推送到GitHub...")
    out, err, code = run_cmd(["git", "push", "-u", "origin", BRANCH], cwd=repo_dir, timeout=120)

    if code != 0:
        if "403" in err or "403" in out:
            print("❌ 推送失败: 403 Forbidden")
            print("   原因: GitHub Token没有写权限")
            print("   解决: 请前往 GitHub Settings → Developer settings → Personal access tokens")
            print("          创建新的 Classic Token，勾选 'repo' 权限范围")
            print("          或使用 Fine-grained Token，授予该仓库的 Contents 读写权限")
            return False
        elif "401" in err or "401" in out:
            print("❌ 推送失败: 401 Unauthorized")
            print("   原因: Token无效或已过期")
            print("   解决: 请检查 token 是否正确，或重新生成")
            return False
        elif "timeout" in err.lower() or "timed out" in err.lower():
            print("❌ 推送失败: 网络超时")
            print("   解决: 网络不稳定，请稍后重试")
            return False
        else:
            print(f"❌ 推送失败: {err}")
            return False

    print(f"✅ 推送成功! https://github.com/{REPO_OWNER}/{REPO_NAME}/tree/{BRANCH}")
    return True


def main():
    import argparse
    parser = argparse.ArgumentParser(description="B1策略代码推送到GitHub")
    parser.add_argument("--repo-dir", type=str, default="/mnt/agents/output/b1_scorer",
                        help="代码仓库目录路径")
    parser.add_argument("--commit-msg", type=str, default="Update B1 strategy code",
                        help="提交信息")
    parser.add_argument("--token", type=str, default="",
                        help="GitHub Personal Access Token（也可通过环境变量 GITHUB_TOKEN 设置）")
    args = parser.parse_args()

    # 获取token
    token = args.token or get_token()
    if not token:
        print("❌ 未找到GitHub Token")
        print("   请通过以下方式之一设置:")
        print("   1. 环境变量: export GITHUB_TOKEN=ghp_xxxxxxx")
        print("   2. 配置文件: echo '{\"token\":\"ghp_xxxxxxx\"}' > ~/.b1_repo_config")
        print("   3. 命令行参数: --token ghp_xxxxxxx")
        sys.exit(1)

    # 检查目录
    repo_dir = Path(args.repo_dir)
    if not (repo_dir / ".git").exists():
        print(f"❌ {repo_dir} 不是git仓库，请先运行 git init")
        sys.exit(1)

    # 推送
    success = push_to_github(str(repo_dir), args.commit_msg, token)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
