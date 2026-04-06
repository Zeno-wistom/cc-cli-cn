#!/usr/bin/env node
// tool-tips-post.js - Claude Code 工具提示（双语/中文/关闭）
// cc-cli-cn: https://github.com/Zeno-wistom/cc-cli-cn
// 模式由 ~/.claude/cc-cli-cn-mode 控制: bilingual(默认) | cn | en

const fs = require('fs');
const path = require('path');
const os = require('os');

const modeFile = path.join(os.homedir(), '.claude', 'cc-cli-cn-mode');
let MODE = 'bilingual';
try { const m = fs.readFileSync(modeFile, 'utf8').trim(); if (['bilingual','cn','en'].includes(m)) MODE = m; } catch(e){}

if (MODE === 'en') process.exit(0);

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', d => input += d);
process.stdin.on('end', () => {
  let data = {};
  try { data = JSON.parse(input); } catch(e) { process.exit(0); }

  const toolName = data.tool_name || '';
  const filePath = data.file_path || '';
  const pattern  = data.pattern  || '';
  const bashCmd  = data.command  || '';

  const shortPath = p => path.basename(p).slice(0, 50);

  const explainCmd = cmd => {
    const parts = cmd.trim().split(/\s+/);
    const first = parts[0];
    const sub   = parts[1] || '';
    const git = { status:'查看哪些文件被修改了', log:'查看提交历史记录', diff:'查看具体修改了什么内容', add:'把修改加入待提交列表（暂存）', commit:'保存一次代码变更，附带说明', push:'把本地代码上传到远程仓库', pull:'从远程仓库下载并合并最新代码', fetch:'获取远程更新但不合并', checkout:'切换到另一个分支', switch:'切换到另一个分支', branch:'查看或创建分支', merge:'把另一个分支合并进来', rebase:'整理提交历史（变基）', stash:'临时保存未提交的修改', clone:'从远程复制完整仓库', init:'初始化一个新仓库', reset:'撤销提交或取消暂存', revert:'创建新提交来撤销之前改动', 'cherry-pick':'将某个提交应用到当前分支', remote:'管理远程仓库地址', show:'查看某次提交的详细内容', tag:'管理版本标签', rm:'从仓库中删除文件', mv:'重命名仓库中的文件' };
    const npm = { install:'安装项目所需的依赖包', i:'安装项目所需的依赖包', run:'运行 package.json 里的脚本', init:'初始化新的 Node.js 项目', build:'编译/打包项目', test:'运行自动化测试', start:'启动项目服务', publish:'发布包到 npm 仓库' };
    const docker = { build:'根据 Dockerfile 构建镜像', run:'创建并启动容器', ps:'查看正在运行的容器', stop:'停止运行中的容器', rm:'删除已停止的容器', images:'查看本地镜像列表', up:'用 docker-compose 启动多容器应用' };
    const cargo = { build:'编译 Rust 项目', run:'编译并运行 Rust 程序', test:'运行 Rust 测试' };
    const go    = { build:'编译 Go 程序', run:'编译并运行 Go 程序', test:'运行 Go 测试', mod:'管理 Go 模块依赖' };
    const simple = { ls:'列出当前目录的文件', dir:'列出当前目录的文件', cat:'打印文件内容到终端', bat:'打印文件内容到终端', head:'查看文件的前几行', tail:'查看文件的最后几行', rm:'删除文件或目录（不可恢复！）', mkdir:'创建新文件夹', cp:'复制文件或目录', mv:'移动或重命名文件', touch:'创建空文件（或刷新时间戳）', chmod:'修改文件的读写执行权限', find:'在目录树里搜索文件', grep:'在文件中搜索匹配的文本', curl:'发起 HTTP 请求 / 下载资源', wget:'从网络下载文件', ping:'测试网络是否能连通目标', ssh:'远程登录服务器（加密）', scp:'通过 SSH 远程复制文件', echo:'向终端输出一段文本', cd:'切换工作目录', pwd:'显示当前所在路径', make:'按照 Makefile 编译/构建项目', python:'运行 Python 脚本', python3:'运行 Python 脚本', pytest:'运行 Python 单元测试', code:'用 VS Code 打开文件或目录', vim:'在终端编辑器里打开文件', vi:'在终端编辑器里打开文件', nano:'在终端编辑器里打开文件', tar:'打包或解压归档文件', zip:'压缩文件', unzip:'解压 zip 文件', ps:'查看当前运行的进程列表', kill:'向进程发送信号（通常是终止）', top:'实时查看系统资源占用', htop:'实时查看系统资源占用' };
    if (first === 'git' && git[sub])        return git[sub];
    if ((first === 'npm' || first === 'npx') && npm[sub]) return npm[sub];
    if (first === 'yarn') return { add:'添加一个新依赖包', install:'安装所有项目依赖', run:'运行项目脚本', build:'构建项目' }[sub] || 'Yarn 包管理操作';
    if (first === 'pnpm') return { add:'添加依赖包', install:'安装项目依赖', run:'运行脚本' }[sub] || 'pnpm 包管理操作';
    if (first === 'pip' || first === 'pip3') return { install:'安装 Python 包', uninstall:'卸载 Python 包', list:'列出已安装的包', freeze:'导出依赖列表' }[sub] || 'Python 包管理操作';
    if (first === 'docker' && docker[sub])  return docker[sub];
    if (first === 'cargo'  && cargo[sub])   return cargo[sub];
    if (first === 'go'     && go[sub])      return go[sub];
    if (simple[first]) return simple[first];
    return cmd.length <= 20 ? '执行命令' : '执行系统操作';
  };

  const makeLine = (en, zh) => MODE === 'bilingual' ? `${en}\n  └─ ${zh}` : zh;

  let tip = '';

  if (toolName === 'Read') {
    tip = filePath ? makeLine(`📖 Read: ${shortPath(filePath)}`, `读取文件内容 → ${shortPath(filePath)}`) : makeLine('📖 Read', '读取文件内容');
  } else if (toolName === 'Write') {
    tip = filePath ? makeLine(`📝 Write: ${shortPath(filePath)}`, `写入（创建/覆盖）文件 → ${shortPath(filePath)}`) : makeLine('📝 Write', '写入文件');
  } else if (toolName === 'Edit' || toolName === 'MultiEdit') {
    tip = filePath ? makeLine(`✏️  Edit: ${shortPath(filePath)}`, `精准修改文件的部分内容 → ${shortPath(filePath)}`) : makeLine('✏️  Edit', '修改文件内容');
  } else if (toolName === 'Bash') {
    if (!bashCmd) {
      tip = makeLine('🖥️  Bash', '执行 Shell 命令');
    } else {
      const realCmd = bashCmd.split('\n').find(l => l.trim() && !l.trim().startsWith('#')) || '';
      if (!realCmd) {
        tip = makeLine('🖥️  Bash', '执行 Shell 命令');
      } else {
        const cmds = realCmd.split(/ &&| \|\||; /).map(s => s.trim()).filter(Boolean);
        if (cmds.length <= 1) {
          tip = makeLine(`🖥️  ${realCmd}`, explainCmd(realCmd));
        } else {
          if (MODE === 'bilingual') {
            const lines = [`🖥️  ${cmds.length} 条命令:`];
            cmds.slice(0, 3).forEach((c, i) => { lines.push(`  ${i+1}. ${c}`); lines.push(`     └─ ${explainCmd(c)}`); });
            if (cmds.length > 3) lines.push(`  ...(还有 ${cmds.length-3} 条)`);
            tip = lines.join('\n');
          } else {
            const lines = [`🖥️ 共${cmds.length}条命令:`];
            cmds.slice(0, 3).forEach((c, i) => lines.push(`  ${i+1}. ${explainCmd(c)}`));
            tip = lines.join('\n');
          }
        }
      }
    }
  } else if (toolName === 'Glob') {
    tip = pattern ? makeLine(`🔍 Glob: "${pattern}"`, '按文件名模式搜索匹配的文件') : makeLine('🔍 Glob', '文件名模式搜索');
  } else if (toolName === 'Grep') {
    tip = pattern ? makeLine(`🔎 Grep: "${pattern}"`, '在文件内容中搜索包含该字符串的位置') : makeLine('🔎 Grep', '文本内容搜索');
  } else if (toolName === 'Agent') {
    tip = makeLine('🤖 Agent', '派出子 AI 助手独立处理一个子任务');
  } else if (toolName === 'TodoWrite') {
    tip = makeLine('📋 TodoWrite', '更新工作待办清单');
  } else if (toolName === 'EnterPlanMode') {
    tip = makeLine('🤔 EnterPlanMode', 'AI 进入规划模式，正在思考解决方案');
  } else if (toolName === 'ExitPlanMode') {
    tip = makeLine('✅ ExitPlanMode', '规划完成，准备开始执行');
  } else if (toolName.startsWith('mcp__')) {
    const m = toolName.match(/^mcp__([^_]+)__(.+)$/);
    if (m) {
      const srv = m[1], tool = m[2];
      const srvMap = { context7:'📚 查询官方文档库', exa:'🌐 联网搜索信息', 'basic-memory':'🧠 读写 AI 长期记忆', Playwright:'🎭 自动操控浏览器', 'lark-mcp':'📱 操作飞书办公软件', web_reader:'📖 读取网页内容' };
      tip = srvMap[srv] ? makeLine(`🔌 mcp: ${srv}/${tool}`, srvMap[srv]) : makeLine(`🔌 mcp: ${srv}/${tool}`, '调用第三方工具服务');
    } else {
      tip = makeLine(`🔌 ${toolName}`, '调用了外部 MCP 工具');
    }
  } else if (toolName) {
    tip = makeLine(`✅ ${toolName}`, '操作完成');
  }

  if (tip) {
    const escaped = ('🌸 ' + tip + ' 🌸').replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\n/g,'\\n').replace(/\t/g,'\\t').replace(/\r/g,'\\r');
    process.stdout.write(`{"systemMessage":"${escaped}"}\n`);
  }
});
