# 🌸 cc-cli-cn

> Claude Code 命令行中文插件 — 支持**双语 / 纯中文 / 关闭**三种显示模式

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Compatible-orange.svg)](https://claude.ai/code)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-green.svg)]()

---

## ✨ 三种显示模式

| 模式 | 效果 | 适合谁 |
|------|------|--------|
| `bilingual` 双语（默认） | 英文命令 + 中文说明 | 熟悉英文命令、想要中文备注 |
| `cn` 纯中文 | 完全中文描述 | 入门新手 |
| `en` 关闭 | 不显示提示 | 不需要提示 |

**双语模式预览：**

```
🌸 🖥️  git push origin main
  └─ 把本地代码上传到远程仓库 🌸

🌸 🖥️  2 条命令:
  1. npm install
     └─ 安装项目所需的依赖包
  2. npm run build
     └─ 运行 package.json 里的脚本 🌸

🌸 📖 Read: index.js
  └─ 读取文件内容 → index.js 🌸

🌸 🔎 Grep: "useState"
  └─ 在文件内容中搜索包含该字符串的位置 🌸
```

---

## 📦 安装

### NPM 安装（推荐）

```bash
npm install -g cc-cli-cn
cc-cli-cn-install
```

**或 npx（无需全局安装）：**
```bash
npx cc-cli-cn-install
```

**国内加速：**
```bash
npm install -g cc-cli-cn --registry=https://registry.npmmirror.com
cc-cli-cn-install
```

### 安装选项

运行 `cc-cli-cn-install` 后会显示交互菜单：

```
══════════════════════════════════════════════
     🌸 cc-cli-cn 安装向导 🌸
══════════════════════════════════════════════
  [1] 安装 — 双语模式 bilingual  ← 推荐
  [2] 安装 — 纯中文模式 cn
  [3] 仅切换显示模式（已安装时用）
  [4] 卸载 / 关闭提示
══════════════════════════════════════════════
```

也可以直接带参数跳过菜单：
```bash
cc-cli-cn-install bilingual   # 安装双语模式
cc-cli-cn-install cn          # 安装纯中文模式
cc-cli-cn-install en          # 关闭提示
```

---

## 🔀 切换显示模式

安装后，随时用 `cc-cli-cn-mode` 切换，**无需重新安装**：

```bash
cc-cli-cn-mode bilingual   # 切换到双语模式
cc-cli-cn-mode cn          # 切换到纯中文
cc-cli-cn-mode en          # 关闭提示
cc-cli-cn-mode             # 查看当前模式
```

> 切换后重启 Claude Code 生效。

---

## 🖥️ Windows 注意事项

- 需要安装 [Git for Windows](https://git-scm.com/downloads/win)（提供 bash 环境）
- 建议设置：`git config --global core.autocrlf input`（防止换行符被转换）

---

## 📁 文件结构

```
cc-cli-cn/
├── tool-tips-post.sh   # Hook 脚本（支持三模式）
├── bin/
│   ├── install.js      # 安装器
│   └── mode.js         # 模式切换命令
├── package.json
└── README.md
```

Hook 安装后会在 `~/.claude/cc-cli-cn-mode` 写入当前模式，
脚本每次执行时读取该文件决定输出格式。

---

## 🤝 致谢

基于 [gugug168/cute-claude-hooks](https://github.com/gugug168/cute-claude-hooks) 改造，
在原版纯中文翻译的基础上新增双语模式和三档开关。

---

## 📄 许可证

[MIT License](LICENSE)
