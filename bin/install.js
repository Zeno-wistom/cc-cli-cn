#!/usr/bin/env node
/**
 * cc-cli-cn 安装器
 * 三种显示模式：bilingual（双语，默认）/ cn（纯中文）/ en（关闭）
 * License: MIT
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
const os = require('os');
const readline = require('readline');

const MAGENTA = '\x1b[38;5;206m';
const GREEN   = '\x1b[0;32m';
const YELLOW  = '\x1b[0;33m';
const RED     = '\x1b[0;31m';
const CYAN    = '\x1b[0;36m';
const BOLD    = '\x1b[1m';
const NC      = '\x1b[0m';
const IS_WIN  = process.platform === 'win32';

const homeDir      = os.homedir();
const claudeDir    = path.join(homeDir, '.claude');
const hooksDir     = path.join(claudeDir, 'hooks');
const settingsFile = path.join(claudeDir, 'settings.json');
const modeFile     = path.join(claudeDir, 'cc-cli-cn-mode');

let pkgDir;
try { pkgDir = path.dirname(require.resolve('cc-cli-cn/package.json')); }
catch(e) { pkgDir = path.resolve(__dirname, '..'); }

function log(color, msg) { console.log(`${color}${msg}${NC}`); }
function ensureDir(d) { if (!fs.existsSync(d)) { fs.mkdirSync(d,{recursive:true}); log(GREEN, `已创建: ${d}`); } }

function ensureLF(fp) {
  const buf = fs.readFileSync(fp);
  if (buf.includes(Buffer.from('\r\n'))) {
    fs.writeFileSync(fp, buf.toString('utf8').replace(/\r\n/g,'\n'), 'utf8');
    log(GREEN, `已修复换行符: ${path.basename(fp)}`);
  }
}

function findGitBash() {
  if (!IS_WIN) return null;
  if (process.env.CLAUDE_CODE_GIT_BASH_PATH && fs.existsSync(process.env.CLAUDE_CODE_GIT_BASH_PATH))
    return process.env.CLAUDE_CODE_GIT_BASH_PATH;
  try {
    const g = execSync('where git.exe',{encoding:'utf8',timeout:5000}).trim().split('\n')[0].trim();
    for (const p of [path.join(g,'..','bin','bash.exe'), path.join(g,'..','..','bin','bash.exe')]) {
      const r = path.resolve(p); if (fs.existsSync(r)) return r;
    }
  } catch(e){}
  const common = [
    'C:\\Program Files\\Git\\bin\\bash.exe',
    'C:\\Program Files (x86)\\Git\\bin\\bash.exe',
  ];
  for (const p of common) if (fs.existsSync(p)) return p;
  return null;
}

function verifyHook(hookPath) {
  const testInput = JSON.stringify({tool_name:'Read',file_path:'test.py'});
  let shell, args;
  if (IS_WIN) {
    const bash = findGitBash();
    if (!bash) return {ok:false, error:'找不到 Git Bash'};
    shell = bash; args = [hookPath.replace(/\\/g,'/')];
  } else { shell='/bin/bash'; args=[hookPath]; }
  const proc = spawnSync(shell, args, {input:testInput,encoding:'utf8',timeout:10000,windowsHide:true});
  if (proc.error) return {ok:false,error:proc.error.message};
  const out = (proc.stdout||'').trim();
  return out.includes('"systemMessage"') && out.includes('test.py')
    ? {ok:true,output:out} : {ok:false,error:`输出异常: ${out.slice(0,120)}`};
}

function setMode(mode) {
  ensureDir(claudeDir);
  fs.writeFileSync(modeFile, mode, 'utf8');
  log(GREEN, `显示模式已设为: ${mode}`);
}

function updateSettings(hookPath) {
  if (fs.existsSync(settingsFile))
    fs.copyFileSync(settingsFile, settingsFile+'.bak');

  let settings = {};
  if (fs.existsSync(settingsFile)) {
    try { settings = JSON.parse(fs.readFileSync(settingsFile,'utf8')); }
    catch(e) { log(RED,`settings.json 格式错误: ${e.message}`); return false; }
  }
  if (!settings.hooks) settings.hooks = {};
  if (!settings.hooks.PostToolUse) settings.hooks.PostToolUse = [];

  const normalizedPath = hookPath.replace(/\\/g,'/');
  const matcher = 'Bash|Read|Write|Edit|Glob|Grep|mcp__*';
  const hookEntry = { matcher, hooks:[{type:'command',command:normalizedPath}] };
  const idx = settings.hooks.PostToolUse.findIndex(h=>h.matcher===matcher);
  if (idx>=0) settings.hooks.PostToolUse[idx]=hookEntry;
  else settings.hooks.PostToolUse.push(hookEntry);

  fs.writeFileSync(settingsFile, JSON.stringify(settings,null,2),'utf8');
  log(GREEN, `settings.json 已更新`);
  return true;
}

function installHook(mode) {
  ensureDir(hooksDir);
  const src  = path.join(pkgDir,'tool-tips-post.sh');
  const dest = path.join(hooksDir,'tool-tips-post.sh');
  if (!fs.existsSync(src)) { log(RED,`找不到 hook 脚本: ${src}`); return false; }
  fs.copyFileSync(src, dest);
  ensureLF(dest);
  if (!IS_WIN) { try { fs.chmodSync(dest,'755'); } catch(e){} }
  setMode(mode);
  updateSettings(dest);

  log(CYAN, '\n验证 hook 脚本...');
  const v = verifyHook(dest);
  if (v.ok) log(GREEN, `验证通过！示例: ${v.output.slice(0,80)}...`);
  else      log(RED,   `验证失败: ${v.error}`);
  return v.ok;
}

function showMenu() {
  console.log(`\n${MAGENTA}${'═'.repeat(46)}${NC}`);
  console.log(`${MAGENTA}${BOLD}     🌸 cc-cli-cn 安装向导 🌸${NC}`);
  console.log(`${MAGENTA}${'═'.repeat(46)}${NC}`);
  console.log(`${CYAN}  显示模式说明:${NC}`);
  console.log(`    bilingual  英文命令 + 中文解释（推荐）`);
  console.log(`               git push`);
  console.log(`               └─ 把本地代码上传到远程仓库`);
  console.log(`    cn         纯中文提示`);
  console.log(`    en         关闭提示`);
  console.log(`${MAGENTA}${'─'.repeat(46)}${NC}`);
  console.log(`  [1] 安装 — 双语模式 bilingual  ${CYAN}← 推荐${NC}`);
  console.log(`  [2] 安装 — 纯中文模式 cn`);
  console.log(`  [3] 仅切换显示模式（已安装时用）`);
  console.log(`  [4] 卸载 / 关闭提示`);
  console.log(`${MAGENTA}${'═'.repeat(46)}${NC}\n`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args[0] === 'bilingual') { installHook('bilingual'); return; }
  if (args[0] === 'cn')        { installHook('cn');        return; }
  if (args[0] === 'en' || args[0] === 'uninstall') { setMode('en'); log(YELLOW,'提示已关闭，重启 Claude Code 生效'); return; }
  if (args[0] === 'mode')      { setMode(args[1]||'bilingual'); return; }

  showMenu();

  const rl = readline.createInterface({input:process.stdin,output:process.stdout});
  rl.question('请输入选项 [1-4]: ', (choice) => {
    rl.close();
    switch(choice.trim()) {
      case '1': installHook('bilingual'); break;
      case '2': installHook('cn');        break;
      case '3':
        const rl2 = readline.createInterface({input:process.stdin,output:process.stdout});
        console.log('\n切换模式: [1] bilingual  [2] cn  [3] en（关闭）');
        rl2.question('请输入 [1-3]: ', (c) => {
          rl2.close();
          const m = c==='1'?'bilingual':c==='2'?'cn':'en';
          setMode(m);
          log(YELLOW, '请重启 Claude Code 使更改生效');
        });
        return;
      case '4':
        setMode('en');
        log(YELLOW,'提示已关闭，重启 Claude Code 生效');
        break;
      default:
        log(RED,'无效选项');
    }
    if (['1','2'].includes(choice.trim())) {
      console.log(`\n${MAGENTA}安装完成！请重启 Claude Code 生效${NC}`);
      console.log(`${CYAN}切换模式: cc-cli-cn-mode bilingual|cn|en${NC}\n`);
    }
  });
}

main();
