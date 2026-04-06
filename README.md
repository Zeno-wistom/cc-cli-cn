# 🌸 cc-cli-cn

> Claude Code 命令行中文插件 — 支持**双语 / 纯中文 / 关闭**三种显示模式  
> ✅ Windows / macOS / Linux 全平台，**无需安装额外依赖**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node.js-%3E%3D14-green.svg)]()

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
```

---

## 📦 安装

```bash
npm install -g cc-cli-cn
cc-cli-cn-install
```

**国内加速：**
```bash
npm install -g cc-cli-cn --registry=https://registry.npmmirror.com
cc-cli-cn-install
```

安装后**重启 Claude Code**即可生效，默认为双语模式。

---

## 🔀 切换显示模式

```bash
cc-cli-cn-mode bilingual   # 英文命令 + 中文说明（默认）
cc-cli-cn-mode cn          # 纯中文
cc-cli-cn-mode en          # 关闭提示
cc-cli-cn-mode             # 查看当前模式
```

> 切换后重启 Claude Code 生效。

---

## 📁 文件结构

```
cc-cli-cn/
├── tool-tips-post.js   # Hook 主脚本（纯 Node.js，全平台通用）
├── bin/
│   ├── install.js      # 安装器
│   └── mode.js         # 模式切换命令
├── package.json
└── README.md
```

---

## 🤝 致谢

基于 [gugug168/cute-claude-hooks](https://github.com/gugug168/cute-claude-hooks) 改造。

---

## 📄 许可证

[MIT License](LICENSE)
