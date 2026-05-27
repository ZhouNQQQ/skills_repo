#!/usr/bin/env node

/**
 * 技能优化脚本
 * 基于最佳实践自动应用改进到技能
 */

const fs = require('fs');
const path = require('path');

const MAX_SKILL_LINES = 100;
const TRIGGER_PATTERN = /Use when/i;
const DEFAULT_TRIGGER_PHRASE = 'Use when';

function improveSkill(skillPath, options = {}) {
  const dryRun = options.dryRun || false;
  const apply = options.apply || false;

  const changes = [];

  if (!fs.existsSync(skillPath)) {
    return {
      success: false,
      error: `技能路径不存在: ${skillPath}`
    };
  }

  const skillMdPath = path.join(skillPath, 'SKILL.md');

  if (!fs.existsSync(skillMdPath)) {
    return {
      success: false,
      error: '缺少 SKILL.md 文件'
    };
  }

  let content = fs.readFileSync(skillMdPath, 'utf-8');
  const originalContent = content;

  // 1. 修复描述 - 确保存在 "Use when..." 子句
  content = fixDescription(content, changes);

  // 2. 移除时间敏感内容
  content = removeTimeSensitiveContent(content, changes);

  // 3. 如果太长则拆分内容
  if (content.split('\n').length > MAX_SKILL_LINES) {
    const splitResult = splitContent(skillPath, content, dryRun);
    changes.push(...splitResult.changes);
    content = splitResult.content;
  }

  // 4. 确保有正确的 YAML frontmatter
  content = ensureYamlFrontmatter(content, changes);

  // 应用更改
  if (content !== originalContent) {
    if (dryRun) {
      changes.push({
        type: 'preview',
        action: '将修改 SKILL.md',
        before: originalContent,
        after: content
      });
    } else if (apply) {
      fs.writeFileSync(skillMdPath, content, 'utf-8');
      changes.push({
        type: 'applied',
        action: '已修改 SKILL.md'
      });
    }
  }

  return {
    success: true,
    changes,
    dryRun,
    applied: apply && content !== originalContent
  };
}

function fixDescription(content, changes) {
  const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);

  if (!yamlMatch) {
    changes.push({
      type: 'error',
      action: '无法修复描述 - 没有 YAML frontmatter'
    });
    return content;
  }

  const yaml = yamlMatch[1];
  const descMatch = yaml.match(/description:\s*(["']?)(.*?)\1/);

  if (!descMatch) {
    // 如果缺少则添加描述
    const newYaml = yaml + '\ndescription: 简短描述. Use when [具体触发条件]。';
    content = content.replace(/^---\n[\s\S]*?\n---/, '---\n' + newYaml + '\n---');
    changes.push({
      type: 'fix',
      action: '添加了缺失的 description 字段',
      suggestion: '使用具体触发条件更新'
    });
    return content;
  }

  const description = descMatch[2];

  // 检查是否有 "Use when" 子句
  if (!TRIGGER_PATTERN.test(description)) {
    // 追加触发子句
    const fixedDesc = description.endsWith('.') ? description : description + '。';
    const newDesc = fixedDesc + ' Use when [具体触发条件]。';
    content = content.replace(
      /description:\s*(["']?)(.*?)\1/,
      `description: "$1${newDesc}$1"`
    );
    changes.push({
      type: 'fix',
      action: '在描述中添加了 "Use when..." 子句',
      before: description,
      after: newDesc
    });
  }

  // 检查长度
  if (description.length > 1024) {
    changes.push({
      type: 'warning',
      action: '描述超过 1024 个字符',
      current: description.length,
      target: 1024
    });
  }

  return content;
}

function removeTimeSensitiveContent(content, changes) {
  const timePatterns = [
    { pattern: /\b(最新|最近|newest)\b/gi, replacement: '当前稳定版' },
    { pattern: /\b(now|today)\b/gi, replacement: '[时间无关]' },
    { pattern: /\b(202[0-9]|203[0-9])\b/g, replacement: '[年份]' }
  ];

  let modified = false;
  let newContent = content;

  timePatterns.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      newContent = newContent.replace(pattern, replacement);
      modified = true;
    }
  });

  if (modified) {
    changes.push({
      type: 'fix',
      action: '替换了时间敏感引用'
    });
  }

  return newContent;
}

function splitContent(skillPath, content, dryRun) {
  const changes = [];

  // 识别可以移动到 REFERENCE.md 的章节
  const lines = content.split('\n');
  const sections = [];
  let currentSection = null;
  let currentLines = [];

  lines.forEach((line, idx) => {
    const headingMatch = line.match(/^(#+) (.+)/);

    if (headingMatch) {
      if (currentSection) {
        sections.push({ section: currentSection, lines: currentLines });
      }
      currentSection = headingMatch[2];
      currentLines = [line];
    } else {
      currentLines.push(line);
    }
  });

  if (currentSection) {
    sections.push({ section: currentSection, lines: currentLines });
  }

  // 识别用于拆分的高级/很少使用的章节
  const advancedKeywords = ['高级', 'advanced', '参考', 'reference', '高级功能', '技术细节', '高级用法'];
  const splitSections = sections.filter(s =>
    advancedKeywords.some(k => s.section.toLowerCase().includes(k.toLowerCase()))
  );

  if (splitSections.length > 0) {
    // 创建 REFERENCE.md
    const refContent = splitSections.map(s => s.lines.join('\n')).join('\n\n');

    if (!dryRun) {
      fs.writeFileSync(path.join(skillPath, 'REFERENCE.md'), refContent, 'utf-8');
    }

    // 更新 SKILL.md 以引用外部文件
    let newContent = content;
    splitSections.forEach(s => {
      const sectionBlock = s.lines.join('\n');
      newContent = newContent.replace(sectionBlock, `参见 [REFERENCE.md](REFERENCE.md)`);
      changes.push({
        type: 'split',
        action: `将"${s.section}"移动到 REFERENCE.md`,
        path: dryRun ? 'N/A' : path.join(skillPath, 'REFERENCE.md')
      });
    });

    return { content: newContent, changes };
  }

  // 如果没有明确的高级章节，按行数建议拆分
  const midpoint = Math.floor(lines.length / 2);
  const splitPoint = lines.slice(0, midpoint).reverse().findIndex(l => l.trim() === '');
  const actualSplit = midpoint - splitPoint;

  const mainContent = lines.slice(0, actualSplit).join('\n');
  const extendedContent = lines.slice(actualSplit).join('\n');

  if (!dryRun) {
    fs.writeFileSync(path.join(skillPath, 'SKILL.md'), mainContent, 'utf-8');
    fs.writeFileSync(path.join(skillPath, 'REFERENCE.md'), `# 参考\n\n${extendedContent}`, 'utf-8');
  }

  changes.push({
    type: 'split',
    action: `将 ${lines.length} 行拆分为 SKILL.md + REFERENCE.md`,
    mainLines: actualSplit,
    refLines: lines.length - actualSplit
  });

  return { content: mainContent, changes };
}

function ensureYamlFrontmatter(content, changes) {
  const hasFrontmatter = /^---\n/.test(content);

  if (!hasFrontmatter) {
    // 尝试从内容中提取名称
    const nameMatch = content.match(/^#\s+(.+)/m);
    const name = nameMatch ? nameMatch[1].toLowerCase().replace(/\s+/g, '-') : 'unknown-skill';

    const newContent = `---\nname: ${name}\ndescription: 简短描述. Use when [触发条件]。\n---\n\n${content}`;

    changes.push({
      type: 'fix',
      action: '添加了带有 name 和 description 的 YAML frontmatter'
    });

    return newContent;
  }

  return content;
}

// CLI 接口
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('用法: node improve-skill.js <技能路径> [--apply] [--dry-run]');
    console.error('');
    console.error('选项:');
    console.error('  --dry-run    显示将要更改的内容而不修改文件');
    console.error('  --apply      立即应用改进');
    process.exit(1);
  }

  const skillPath = path.resolve(args[0]);
  const options = {
    dryRun: args.includes('--dry-run'),
    apply: args.includes('--apply')
  };

  if (!options.dryRun && !options.apply) {
    console.log('警告: 未指定操作。使用 --dry-run 或 --apply');
    console.log('');
  }

  console.log(`正在优化技能: ${skillPath}`);
  console.log(`模式: ${options.dryRun ? 'dry-run' : options.apply ? '应用' : '仅预览'}\n`);

  const result = improveSkill(skillPath, options);

  if (!result.success) {
    console.error(`错误: ${result.error}`);
    process.exit(1);
  }

  console.log('更改:');
  result.changes.forEach((change, idx) => {
    console.log(`\n${idx + 1}. [${change.type.toUpperCase()}] ${change.action}`);
    if (change.suggestion) {
      console.log(`   建议: ${change.suggestion}`);
    }
    if (change.before && change.after) {
      console.log(`   之前: "${change.before.slice(0, 100)}..."`);
      console.log(`   之后: "${change.after.slice(0, 100)}..."`);
    }
  });

  console.log('\n---');
  console.log(`结果: ${result.applied ? '已应用更改' : result.dryRun ? 'Dry run 完成' : '未做任何更改'}`);

  process.exit(result.applied ? 0 : 1);
}

module.exports = { improveSkill };