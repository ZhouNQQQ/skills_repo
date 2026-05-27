#!/usr/bin/env node

/**
 * 技能分析脚本
 * 基于 mattpocock/skills 最佳实践分析技能以寻找优化机会
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_FILES = ['SKILL.md'];
const OPTIONAL_FILES = ['REFERENCE.md', 'EXAMPLES.md'];
const YAML_FRONTmatter_REGEX = /^---\n([\s\S]*?)\n---\n/;
const MAX_DESCRIPTION_LENGTH = 1024;
const MAX_SKILL_LINES = 100;
const TRIGGER_PATTERN = /Use when/i;

function analyzeSkill(skillPath) {
  const result = {
    structure: { passed: true, checks: [] },
    description: { passed: true, score: 10, issues: [] },
    content: { passed: true, lineCount: 0, sections: [], issues: [] },
    organization: { passed: true, issues: [] },
    overall: { score: 0, passed: false, issues: [], recommendations: [] }
  };

  // 检查路径是否存在
  if (!fs.existsSync(skillPath)) {
    result.structure.passed = false;
    result.structure.checks.push({
      name: 'path_exists',
      passed: false,
      message: `技能路径不存在: ${skillPath}`
    });
    result.overall.passed = false;
    result.overall.score = 0;
    return result;
  }

  // 检查结构
  result.structure = checkStructure(skillPath);

  // 检查 SKILL.md 中的描述
  if (result.structure.checks.find(c => c.name === 'has_skill_md' && c.passed)) {
    result.description = checkDescription(path.join(skillPath, 'SKILL.md'));
  }

  // 检查内容
  if (result.structure.checks.find(c => c.name === 'has_skill_md' && c.passed)) {
    result.content = checkContent(path.join(skillPath, 'SKILL.md'));
  }

  // 检查组织
  result.organization = checkOrganization(skillPath);

  // 计算整体分数
  const structureScore = result.structure.checks.filter(c => c.passed).length;
  const structureMax = result.structure.checks.length;
  const descriptionScore = result.description.score;
  const contentScore = result.content.lineCount <= MAX_SKILL_LINES ? 10 : Math.max(0, 10 - Math.floor((result.content.lineCount - MAX_SKILL_LINES) / 20));
  const orgScore = result.organization.issues.length === 0 ? 10 : 5;

  result.overall.score = Math.round((structureScore / structureMax * 0.25 + descriptionScore / 10 * 0.35 + contentScore / 10 * 0.25 + orgScore / 10 * 0.15) * 10);
  result.overall.passed = result.overall.score >= 7 && result.structure.passed && result.description.issues.length === 0;
  result.overall.issues = [
    ...result.description.issues.map(i => ({ severity: '高', ...i })),
    ...result.content.issues.map(i => ({ severity: '中', ...i })),
    ...result.organization.issues.map(i => ({ severity: '低', ...i }))
  ];

  // 生成建议
  result.overall.recommendations = generateRecommendations(result);

  return result;
}

function checkStructure(skillPath) {
  const checks = [];
  let passed = true;

  // 检查 SKILL.md
  const hasSkillMd = fs.existsSync(path.join(skillPath, 'SKILL.md'));
  checks.push({
    name: 'has_skill_md',
    passed: hasSkillMd,
    message: hasSkillMd ? 'SKILL.md 存在' : '缺少 SKILL.md'
  });
  if (!hasSkillMd) passed = false;

  // 检查目录结构
  const entries = fs.readdirSync(skillPath, { withFileTypes: true });
  const hasSubdirs = entries.some(e => e.isDirectory());
  checks.push({
    name: 'has_directory_structure',
    passed: hasSubdirs || entries.some(e => e.name.endsWith('.md')),
    message: hasSubdirs ? '有目录结构' : '扁平结构（可能需要组织）'
  });

  // 检查 scripts 目录
  const hasScripts = fs.existsSync(path.join(skillPath, 'scripts'));
  checks.push({
    name: 'has_scripts_dir',
    passed: true, // 可选
    message: hasScripts ? '有 scripts 目录' : '无 scripts 目录（可选）'
  });

  return { passed, checks };
}

function checkDescription(skillMdPath) {
  const issues = [];
  let score = 10;
  let content = '';

  try {
    content = fs.readFileSync(skillMdPath, 'utf-8');
  } catch (e) {
    issues.push({ field: 'description', message: '无法读取 SKILL.md' });
    return { passed: false, score: 0, issues };
  }

  // 提取 YAML frontmatter
  const match = content.match(YAML_FRONTmatter_REGEX);
  if (!match) {
    issues.push({ field: 'description', message: '缺少 YAML frontmatter' });
    score -= 3;
  } else {
    const yaml = match[1];
    // 处理带引号和不带引号的描述值
    // 首先尝试提取整个 YAML 内容中所有可能的 description 行
    const yamlLines = yaml.split('\n');
    let description = '';

    for (const line of yamlLines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('description:')) {
        // 提取 description 值
        const colonIndex = trimmed.indexOf(':');
        let value = trimmed.substring(colonIndex + 1).trim();

        // 移除引号
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }

        description = value;
        break;
      }
    }

    if (!description) {
      issues.push({ field: 'description', message: 'YAML 中缺少 description 字段' });
      score -= 3;
    } else {
      // 检查长度
      if (description.length > MAX_DESCRIPTION_LENGTH) {
        issues.push({
          field: 'description',
          message: `描述超过 ${MAX_DESCRIPTION_LENGTH} 个字符（当前 ${description.length} 个）`
        });
        score -= 2;
      }

      // 检查触发模式
      if (!TRIGGER_PATTERN.test(description)) {
        issues.push({
          field: 'description',
          message: '缺少 "Use when..." 触发子句'
        });
        score -= 3;
      }

      // 检查是否太模糊
      if (description.length < 30) {
        issues.push({
          field: 'description',
          message: '描述太模糊 - 需要更多细节'
        });
        score -= 2;
      }
    }
  }

  return { passed: issues.length === 0, score: Math.max(0, score), issues };
}

function checkContent(skillMdPath) {
  const issues = [];
  let content = '';

  try {
    content = fs.readFileSync(skillMdPath, 'utf-8');
  } catch (e) {
    issues.push({ field: 'content', message: '无法读取文件' });
    return { lineCount: 0, sections: [], issues, passed: false };
  }

  const lines = content.split('\n');
  const lineCount = lines.length;

  // 提取章节
  const sections = [];
  const sectionPattern = /^#+\s+(.+)/;
  lines.forEach((line, idx) => {
    const match = line.match(sectionPattern);
    if (match && idx > 0 && lines[idx - 1].trim() === '') {
      sections.push(match[1]);
    }
  });

  // 检查必需章节
  const requiredSections = ['快速开始', 'quick start', '工作流程', 'workflow', 'workflow', 'usage'];
  const hasRequiredSection = sections.some(s =>
    requiredSections.some(rs => s.toLowerCase().includes(rs.toLowerCase()))
  );

  if (!hasRequiredSection) {
    issues.push({
      field: 'content',
      message: '缺少快速开始或工作流程章节'
    });
  }

  // 检查时间敏感内容
  const timePatterns = [
    /\b(最新|最近|newest|now|today|current)\b/gi,
    /\b(202[0-9]|203[0-9])\b/  // 年份
  ];
  const hasTimeSensitive = timePatterns.some(p => p.test(content));
  if (hasTimeSensitive) {
    issues.push({
      field: 'content',
      message: '包含可能过时的时间敏感内容'
    });
  }

  return {
    lineCount,
    sections,
    issues,
    passed: lineCount <= MAX_SKILL_LINES && issues.length === 0
  };
}

function checkOrganization(skillPath) {
  const issues = [];

  // 根据路径检查技能是否在正确的分类中
  const parentDir = path.basename(path.dirname(skillPath));

  // 如果在 engineering/productivity/misc 中，确保有文档
  if (['engineering', 'productivity', 'misc'].includes(parentDir)) {
    // 好的组织
  } else if (parentDir !== 'deprecated' && parentDir !== 'personal') {
    issues.push({
      field: 'organization',
      message: `技能不在标准分类中（engineering/productivity/misc）。发现位置：${parentDir}`
    });
  }

  return { issues, passed: issues.length === 0 };
}

function generateRecommendations(result) {
  const recommendations = [];

  // 描述建议
  if (result.description.issues.some(i => i.message.includes('触发'))) {
    recommendations.push({
      type: '描述',
      action: '在描述中添加 "Use when..." 子句',
      example: '从 API 提取数据并返回结构化结果。Use when 用户提到 API 调用、获取数据或使用 REST 端点。'
    });
  }

  if (result.description.issues.some(i => i.message.includes('超过'))) {
    recommendations.push({
      type: '描述',
      action: '将描述缩短到 1024 个字符以下'
    });
  }

  if (result.description.issues.some(i => i.message.includes('太模糊'))) {
    recommendations.push({
      type: '描述',
      action: '添加更多具体细节到描述中'
    });
  }

  // 内容建议
  if (result.content.lineCount > MAX_SKILL_LINES) {
    recommendations.push({
      type: '内容',
      action: `将 SKILL.md 拆分为 SKILL.md + REFERENCE.md`,
      reason: `当前：${result.content.lineCount} 行，目标：<${MAX_SKILL_LINES} 行`
    });
  }

  if (!result.content.sections.includes('快速开始') && !result.content.sections.includes('quick start')) {
    recommendations.push({
      type: '内容',
      action: '添加带最小可用示例的快速开始章节'
    });
  }

  if (result.content.issues.some(i => i.message.includes('时间敏感'))) {
    recommendations.push({
      type: '内容',
      action: '移除时间敏感引用（最新、当前、具体日期）'
    });
  }

  return recommendations;
}

// CLI 接口
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('用法: node analyze-skill.js <技能路径>');
    process.exit(1);
  }

  const skillPath = path.resolve(args[0]);

  console.log(`正在分析技能: ${skillPath}\n`);

  const result = analyzeSkill(skillPath);

  console.log(JSON.stringify(result, null, 2));

  process.exit(result.overall.passed ? 0 : 1);
}

module.exports = { analyzeSkill };