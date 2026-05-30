#!/usr/bin/env bash
# check-ima-creds.sh — 检查 IMA OpenAPI 凭证是否已配置
# 返回：0=已配置，1=未配置
# 输出：若未配置，stderr 提示引导信息

if [ -f "$HOME/.config/ima/client_id" ] && [ -f "$HOME/.config/ima/api_key" ]; then
    echo "✅ IMA credentials configured"
    exit 0
else
    echo "⚠️ IMA credentials missing — visit https://ima.qq.com/agent-interface to get Client ID and API Key" >&2
    exit 1
fi
