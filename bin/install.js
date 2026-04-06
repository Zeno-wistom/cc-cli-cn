#!/usr/bin/env node
/**
 * cc-cli-cn 安装器
 * 直接安装，默认双语模式，无需选择
 * 安装后用 cc-cli-cn-mode 切换模式
 */
const fs   = require('fs');
const path = require('path');
const os   = require('os');

const GREEN  = '\x1b[0;32m';
const YELLOW = '\x1b[0;33m';
const RED    = '\x1b[0;31m';
const CYAN   = '\x1b[0;36m';
const PINK   = '\x1b[38;5;206m';
const NC     = '\x1b[0m';

const homeDir      = os.homedir();
const claudeDir    = path.join(homeDir, '.claude');
const hooksDir     = path.join(claudeDir, 'hooks');
const settingsFile = path.join(claudeDir, 'settings.json');
const modeFile     = path.join(claudeDir, 'cc-cli-cn-mode');

let pkgDir;
try { pkgDir = path.dirname(require.resolve('cc-cli-cn/package.json')); }
catch(e) { pkgDir = path.resolve(__dirname, '..'); }

const log = (c, m) => console.log(`${c}${m}${NC}`);
const ensureDir = d => { if (!fs.existsSync(d)) { fs.mkdirSync(d, {recursive:true}); log(GREEN, `已创建: ${d}`); } };

function updateSettings(hookPath) {
  if (fs.existsSync(settingsFile))
    fs.copyFileSync(settingsFile, settingsFile + '.bak');

  let s = {};
  if (fs.existsSync(settingsFile)) {
    try { s = JSON.parse(fs.readFileSync(settingsFile, 'utf8')); } catch(e) { log(RED, `settings.json 格式错误: ${e.message}`); return; }
  }
  if (!s.hooks) s.hooks = {};
  if (!s.hooks.PostToolUse) s.hooks.PostToolUse = [];

  const cmd = `node ${hookPath.replace(/\\/g, '/')}`;
  const matcher = 'Bash|Read|Write|Edit|Glob|Grep|mcp__*';
  const entry = { matcher, hooks: [{ type: 'command', command: cmd }] };
  const idx = s.hooks.PostToolUse.findIndex(h => h.matcher === matcher);
  if (idx >= 0) s.hooks.PostToolUse[idx] = entry;
  else s.hooks.PostToolUse.push(entry);

  fs.writeFileSync(settingsFile, JSON.stringify(s, null, 2), 'utf8');
  log(GREEN, 'settings.json 已更新');
}

function install() {
  console.log(`\n${PINK}🌸 cc-cli-cn 安装中...${NC}\n`);

  ensureDir(hooksDir);

  const src  = path.join(pkgDir, 'tool-tips-post.js');
  const dest = path.join(hooksDir, 'tool-tips-post.js');

  if (!fs.existsSync(src)) { log(RED, `找不到脚本: ${src}`); process.exit(1); }
  fs.copyFileSync(src, dest);
  log(GREEN, `已安装: ${dest}`);

  ensureDir(claudeDir);
  const existingMode = fs.existsSync(modeFile) ? fs.readFileSync(modeFile, 'utf8').trim() : '';
  if (!existingMode) {
    fs.writeFileSync(modeFile, 'bilingual', 'utf8');
    log(GREEN, '默认模式: bilingual（双语）');
  } else {
    log(CYAN, `保留已有模式: ${existingMode}`);
  }

  updateSettings(dest);

  console.log(`\n${GREEN}✅ 安装完成！重启 Claude Code 后生效。${NC}`);
  console.log(`${CYAN}切换模式: cc-cli-cn-mode bilingual|cn|en${NC}\n`);
}

install();
