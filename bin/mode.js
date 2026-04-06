#!/usr/bin/env node
/**
 * cc-cli-cn-mode — 快速切换显示模式
 * 用法:
 *   cc-cli-cn-mode bilingual   英文 + 中文（默认）
 *   cc-cli-cn-mode cn          纯中文
 *   cc-cli-cn-mode en          关闭提示
 *   cc-cli-cn-mode             显示当前模式
 */
const fs   = require('fs');
const path = require('path');
const os   = require('os');

const modeFile = path.join(os.homedir(), '.claude', 'cc-cli-cn-mode');
const VALID    = ['bilingual','cn','en'];
const GREEN    = '\x1b[0;32m';
const CYAN     = '\x1b[0;36m';
const RED      = '\x1b[0;31m';
const NC       = '\x1b[0m';

const arg = process.argv[2];

if (!arg) {
  const cur = fs.existsSync(modeFile) ? fs.readFileSync(modeFile,'utf8').trim() : 'bilingual';
  console.log(`${CYAN}当前模式: ${cur}${NC}`);
  console.log(`可用: bilingual（双语）| cn（纯中文）| en（关闭）`);
  process.exit(0);
}

if (!VALID.includes(arg)) {
  console.log(`${RED}无效模式: ${arg}${NC}`);
  console.log(`可用: bilingual | cn | en`);
  process.exit(1);
}

const dir = path.join(os.homedir(), '.claude');
if (!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(modeFile, arg, 'utf8');

const labels = {bilingual:'双语模式（英文命令 + 中文说明）', cn:'纯中文模式', en:'关闭提示'};
console.log(`${GREEN}已切换: ${labels[arg]}${NC}`);
console.log(`重启 Claude Code 后生效`);
