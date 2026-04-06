#!/bin/bash
# tool-tips-post.sh - 工具执行后双语提示（英文命令 + 中文解释）
# cc-cli-cn: https://github.com/Zeno-wistom/cc-cli-cn
# 基于 cute-claude-hooks by gugug168, License: MIT
#
# 显示模式由 ~/.claude/cc-cli-cn-mode 控制：
#   bilingual (默认) — 英文命令 + 中文解释
#   cn                — 纯中文（原版风格）
#   en                — 关闭提示

MODE_FILE="$HOME/.claude/cc-cli-cn-mode"
MODE="bilingual"
[ -f "$MODE_FILE" ] && MODE=$(cat "$MODE_FILE" | tr -d '[:space:]')
case "$MODE" in bilingual|cn|en) ;; *) MODE="bilingual" ;; esac

# 关闭模式直接退出
[ "$MODE" = "en" ] && exit 0

input=$(cat)

extract_field() {
    local key="$1"
    local clean
    clean=$(printf '%s' "$input" | sed 's/\\"/__DQ__/g')
    local val
    val=$(printf '%s' "$clean" | sed -n "s/.*\"${key}\"[[:space:]]*:[[:space:]]*\"\([^\"]*\)\".*/\1/p" | head -1)
    val=$(printf '%s' "$val" | sed 's/__DQ__/"/g; s/\\n/\n/g')
    printf '%s' "$val"
}

tool_name=$(extract_field "tool_name")
file_path=$(extract_field "file_path")
pattern=$(extract_field "pattern")
bash_cmd=$(extract_field "command")

short_path() { echo "$1" | sed 's/.*[\\\//]//' | head -c 50; }

explain_cmd() {
    local cmd="$1"
    local first=$(echo "$cmd" | awk '{print $1}')
    local rest=$(echo "$cmd" | awk '{$1=""; print}' | sed 's/^ *//')
    case "$first" in
        git)
            local sub=$(echo "$rest" | awk '{print $1}')
            case "$sub" in
                status)      echo "查看哪些文件被修改了" ;;
                log)         echo "查看提交历史记录" ;;
                diff)        echo "查看具体修改了什么内容" ;;
                add)         echo "把修改加入待提交列表（暂存）" ;;
                commit)      echo "保存一次代码变更，附带说明" ;;
                push)        echo "把本地代码上传到远程仓库" ;;
                pull)        echo "从远程仓库下载并合并最新代码" ;;
                fetch)       echo "获取远程更新但不合并" ;;
                checkout|switch) echo "切换到另一个分支" ;;
                branch)      echo "查看或创建分支" ;;
                merge)       echo "把另一个分支合并进来" ;;
                rebase)      echo "整理提交历史（变基）" ;;
                stash)       echo "临时保存未提交的修改" ;;
                clone)       echo "从远程复制完整仓库" ;;
                init)        echo "初始化一个新仓库" ;;
                reset)       echo "撤销提交或取消暂存" ;;
                revert)      echo "创建新提交来撤销之前改动" ;;
                cherry-pick) echo "将某个提交应用到当前分支" ;;
                remote)      echo "管理远程仓库地址" ;;
                show)        echo "查看某次提交的详细内容" ;;
                tag)         echo "管理版本标签" ;;
                rm)          echo "从仓库中删除文件" ;;
                mv)          echo "重命名仓库中的文件" ;;
                *)           echo "Git 版本控制操作" ;;
            esac ;;
        npm|npx)
            local sub=$(echo "$rest" | awk '{print $1}')
            case "$sub" in
                install|i) echo "安装项目所需的依赖包" ;;
                run)       echo "运行 package.json 里的脚本" ;;
                init)      echo "初始化新的 Node.js 项目" ;;
                build)     echo "编译/打包项目" ;;
                test)      echo "运行自动化测试" ;;
                start)     echo "启动项目服务" ;;
                publish)   echo "发布包到 npm 仓库" ;;
                *)         echo "Node.js 包管理操作" ;;
            esac ;;
        yarn)
            local sub=$(echo "$rest" | awk '{print $1}')
            case "$sub" in
                add)     echo "添加一个新依赖包" ;;
                install) echo "安装所有项目依赖" ;;
                run)     echo "运行项目脚本" ;;
                build)   echo "构建项目" ;;
                *)       echo "Yarn 包管理操作" ;;
            esac ;;
        pnpm)
            local sub=$(echo "$rest" | awk '{print $1}')
            case "$sub" in
                add)     echo "添加依赖包" ;;
                install) echo "安装项目依赖" ;;
                run)     echo "运行脚本" ;;
                *)       echo "pnpm 包管理操作" ;;
            esac ;;
        pip|pip3)
            local sub=$(echo "$rest" | awk '{print $1}')
            case "$sub" in
                install)   echo "安装 Python 包" ;;
                uninstall) echo "卸载 Python 包" ;;
                list)      echo "列出已安装的包" ;;
                show)      echo "查看某个包的详细信息" ;;
                freeze)    echo "导出依赖列表（用于 requirements.txt）" ;;
                *)         echo "Python 包管理操作" ;;
            esac ;;
        python|python3) echo "运行 Python 脚本" ;;
        pytest)         echo "运行 Python 单元测试" ;;
        ls|dir)         echo "列出当前目录的文件" ;;
        cat|bat)        echo "打印文件内容到终端" ;;
        head)           echo "查看文件的前几行" ;;
        tail)           echo "查看文件的最后几行" ;;
        less|more)      echo "分页翻阅文件内容" ;;
        rm)             echo "删除文件或目录（不可恢复！）" ;;
        mkdir)          echo "创建新文件夹" ;;
        cp)             echo "复制文件或目录" ;;
        mv)             echo "移动或重命名文件" ;;
        touch)          echo "创建空文件（或刷新时间戳）" ;;
        chmod)          echo "修改文件的读写执行权限" ;;
        chown)          echo "修改文件所有者" ;;
        find)           echo "在目录树里搜索文件" ;;
        grep)           echo "在文件中搜索匹配的文本" ;;
        wc)             echo "统计行数/字数/字节数" ;;
        sort)           echo "对文本行排序" ;;
        uniq)           echo "去除相邻重复行" ;;
        diff)           echo "对比两个文件的差异" ;;
        curl)           echo "发起 HTTP 请求 / 下载资源" ;;
        wget)           echo "从网络下载文件" ;;
        ping)           echo "测试网络是否能连通目标" ;;
        ssh)            echo "远程登录服务器（加密）" ;;
        scp)            echo "通过 SSH 远程复制文件" ;;
        docker)
            local sub=$(echo "$rest" | awk '{print $1}')
            case "$sub" in
                build)      echo "根据 Dockerfile 构建镜像" ;;
                run)        echo "创建并启动容器" ;;
                ps)         echo "查看正在运行的容器" ;;
                stop)       echo "停止运行中的容器" ;;
                rm)         echo "删除已停止的容器" ;;
                images)     echo "查看本地镜像列表" ;;
                compose|up) echo "用 docker-compose 启动多容器应用" ;;
                *)          echo "Docker 容器操作" ;;
            esac ;;
        echo)        echo "向终端输出一段文本" ;;
        which|where) echo "查找命令的可执行文件位置" ;;
        env|printenv) echo "查看当前环境变量" ;;
        export)      echo "设置（导出）环境变量" ;;
        source|\.)   echo "在当前 Shell 中加载脚本/配置" ;;
        cd)          echo "切换工作目录" ;;
        pwd)         echo "显示当前所在路径" ;;
        whoami)      echo "显示当前登录的用户名" ;;
        date)        echo "显示当前系统日期和时间" ;;
        make)        echo "按照 Makefile 编译/构建项目" ;;
        gcc|g++|cc)  echo "编译 C/C++ 源代码" ;;
        cargo)
            local sub=$(echo "$rest" | awk '{print $1}')
            case "$sub" in
                build) echo "编译 Rust 项目" ;;
                run)   echo "编译并运行 Rust 程序" ;;
                test)  echo "运行 Rust 测试" ;;
                *)     echo "Rust 工具链操作" ;;
            esac ;;
        go)
            local sub=$(echo "$rest" | awk '{print $1}')
            case "$sub" in
                build) echo "编译 Go 程序" ;;
                run)   echo "编译并运行 Go 程序" ;;
                test)  echo "运行 Go 测试" ;;
                mod)   echo "管理 Go 模块依赖" ;;
                *)     echo "Go 语言操作" ;;
            esac ;;
        code)        echo "用 VS Code 打开文件或目录" ;;
        vim|vi|nano) echo "在终端编辑器里打开文件" ;;
        tar)         echo "打包或解压 .tar 归档文件" ;;
        zip)         echo "压缩文件为 .zip" ;;
        unzip)       echo "解压 .zip 文件" ;;
        ps)          echo "查看当前运行的进程列表" ;;
        kill)        echo "向进程发送信号（通常是终止）" ;;
        top|htop)    echo "实时查看 CPU/内存占用情况" ;;
        *)
            if [ ${#cmd} -le 20 ]; then echo "执行命令"
            else echo "执行系统操作"; fi ;;
    esac
}

make_line() {
    local en="$1" zh="$2"
    if [ "$MODE" = "bilingual" ]; then
        printf '%s\n  └─ %s' "$en" "$zh"
    else
        printf '%s' "$zh"
    fi
}

get_tip() {
    case "$1" in
        "Read")
            if [ -n "$file_path" ]; then
                local f; f=$(short_path "$file_path")
                make_line "📖 Read: $f" "读取文件内容 → $f"
            else
                make_line "📖 Read" "读取文件内容"
            fi ;;
        "Write")
            if [ -n "$file_path" ]; then
                local f; f=$(short_path "$file_path")
                make_line "📝 Write: $f" "写入（创建/覆盖）文件 → $f"
            else
                make_line "📝 Write" "写入文件"
            fi ;;
        "Edit"|"MultiEdit")
            if [ -n "$file_path" ]; then
                local f; f=$(short_path "$file_path")
                make_line "✏️  Edit: $f" "精准修改文件的部分内容 → $f"
            else
                make_line "✏️  Edit" "修改文件内容"
            fi ;;
        "Bash")
            if [ -n "$bash_cmd" ]; then
                real_cmd=$(echo "$bash_cmd" | grep -v '^[[:space:]]*#' | grep -v '^[[:space:]]*$' | head -1)
                if [ -z "$real_cmd" ]; then
                    make_line "🖥️  Bash" "执行 Shell 命令"
                else
                    split_cmd=$(echo "$real_cmd" | sed 's/ && /\n/g; s/ || /\n/g; s/; /\n/g' | grep -v '^[[:space:]]*$')
                    cmd_count=$(echo "$split_cmd" | grep -c .)
                    if [ "$cmd_count" -le 1 ]; then
                        explain=$(explain_cmd "$real_cmd")
                        make_line "🖥️  $real_cmd" "$explain"
                    else
                        if [ "$MODE" = "bilingual" ]; then
                            result="🖥️  ${cmd_count} 条命令:"
                            idx=1
                            while IFS= read -r line; do
                                [ -z "$line" ] && continue
                                [ "$idx" -gt 3 ] && break
                                explain=$(explain_cmd "$line")
                                result="${result}"$'\n'"  ${idx}. ${line}"$'\n'"     └─ ${explain}"
                                idx=$((idx+1))
                            done <<< "$split_cmd"
                            [ "$cmd_count" -gt 3 ] && result="${result}"$'\n'"  ...(还有 $((cmd_count-3)) 条)"
                            echo "$result"
                        else
                            result="🖥️ 共${cmd_count}条命令:"
                            idx=1
                            while IFS= read -r line; do
                                [ -z "$line" ] && continue
                                [ "$idx" -gt 3 ] && break
                                explain=$(explain_cmd "$line")
                                result="${result}"$'\n'"  ${idx}. ${explain}"
                                idx=$((idx+1))
                            done <<< "$split_cmd"
                            echo "$result"
                        fi
                        return
                    fi
                fi
            else
                make_line "🖥️  Bash" "执行 Shell 命令"
            fi ;;
        "Glob")
            if [ -n "$pattern" ]; then
                make_line "🔍 Glob: \"$pattern\"" "按文件名模式搜索匹配的文件"
            else
                make_line "🔍 Glob" "文件名模式搜索"
            fi ;;
        "Grep")
            if [ -n "$pattern" ]; then
                make_line "🔎 Grep: \"$pattern\"" "在文件内容中搜索包含该字符串的位置"
            else
                make_line "🔎 Grep" "文本内容搜索"
            fi ;;
        "Agent")
            make_line "🤖 Agent" "派出子 AI 助手独立处理一个子任务" ;;
        "TodoWrite")
            make_line "📋 TodoWrite" "更新工作待办清单" ;;
        "EnterPlanMode")
            make_line "🤔 EnterPlanMode" "AI 进入规划模式，正在思考解决方案" ;;
        "ExitPlanMode")
            make_line "✅ ExitPlanMode" "规划完成，准备开始执行" ;;
        *)
            if [[ "$1" == mcp__* ]]; then
                srv=$(echo "$1" | sed -n 's/mcp__\([^_]*\)__.*/\1/p')
                tool=$(echo "$1" | sed 's/mcp__[^_]*__//')
                if [ -z "$srv" ]; then
                    make_line "🔌 $1" "调用了外部 MCP 工具"
                else
                    case "$srv" in
                        "context7")     make_line "📚 mcp: context7/$tool" "查询官方文档库" ;;
                        "exa")          make_line "🌐 mcp: exa/$tool" "联网搜索信息" ;;
                        "basic-memory") make_line "🧠 mcp: basic-memory/$tool" "读写 AI 长期记忆" ;;
                        "Playwright")   make_line "🎭 mcp: Playwright/$tool" "自动操控浏览器" ;;
                        "lark-mcp")     make_line "📱 mcp: lark/$tool" "操作飞书办公软件" ;;
                        "web_reader")   make_line "📖 mcp: web_reader/$tool" "读取网页内容" ;;
                        *)              make_line "🔌 mcp: ${srv}/$tool" "调用第三方工具服务" ;;
                    esac
                fi
            else
                make_line "✅ $1" "操作完成"
            fi ;;
    esac
}

json_escape() {
    local s="$1"
    s="${s//\\/\\\\}"
    s="${s//\"/\\\"}"
    s="${s//$'\n'/\\n}"
    s="${s//$'\t'/\\t}"
    s="${s//$'\r'/\\r}"
    echo "$s"
}

if [ -n "$tool_name" ]; then
    tip=$(get_tip "$tool_name")
    if [ -n "$tip" ]; then
        escaped_tip=$(json_escape "🌸 ${tip} 🌸")
        printf '{"systemMessage":"%s"}\n' "$escaped_tip"
    fi
fi

exit 0
