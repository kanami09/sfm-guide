# SFML 编程语言指南

Super Factory Manager（SFM）模组的脚本语言 **SFML** 的中文教程网站，使用 [mdBook](https://rust-lang.github.io/mdBook/) 构建，结构参照《Rust 程序设计语言》。

- 依据版本：SFM **4.34.0**（同样适用于 4.35.0），覆盖 MC 1.19.2 ~ 26.1.2
- 唯一事实来源：<https://github.com/TeamDman/SuperFactoryManager>（提交 `e9755fa9`）

## 构建与预览

```bash
mdbook serve --open
```

```bash
mdbook build
```

构建产物位于 `book/`，是纯静态网站，可以直接部署到 GitHub Pages 等静态托管服务。

## 目录结构

| 路径 | 内容 |
| --- | --- |
| `src/SUMMARY.md` | 目录 |
| `src/*.md` | 各章节 |
| `theme/sfml-highlight.js` | highlight.js 的 SFML 语法高亮定义 |
| `theme/sfml.css` | 语法高亮配色和提示框样式 |
| `tools/sfml-check/` | 代码块语法校验工具 |

## 写作约定

- 代码块用 ` ```sfml ` 标注。只有几行语句的片段会被自动包进触发器再检查；
- 故意写错的反面例子用 ` ```sfml,error `，校验工具会确认它们**确实**无法解析；
- 语法正确但会在编译期失败（比如间隔太短）或者只用于说明的片段，用 ` ```sfml,ignore `；
- 提示框：`<div class="note">`、`<div class="warning">`、`<div class="source">`（源码依据）、`<div class="version">`（版本信息），div 内部前后要留空行；
- 中文全角标点紧挨着 `**` 时，粗体不会生效。要把括号放到粗体外面，例如 `**标签**（label）`。
- Markdown 风格检查按 [.markdownlint.jsonc](.markdownlint.jsonc) 进行，VS Code 的 markdownlint 扩展会自动读取。也可以在命令行运行：`npx markdownlint-cli2@0.23.3 "**/*.md" "#book"`。CI 使用同一个版本，推送时会自动检查。如果编辑器扩展内置的 markdownlint 版本更新、报出了 CI 没报的规则，就同时升级 CI 中的版本号。

## PR 自动初审

有人向 `main` 提交或更新 PR 时，会自动进行初审：

1. **PR Check**（[pr-check.yml](.github/workflows/pr-check.yml)，只读权限）：运行 markdownlint、SFML 代码块校验和 mdBook 构建，把结果保存为产物；
2. **PR Review**（[pr-review.yml](.github/workflows/pr-review.yml)，可写 PR）：读取结果，由 [pr-review.js](.github/scripts/pr-review.js) 给出结论：
   - **未通过**：提交 Request changes 审查，列出每项检查的错误输出和本地复现命令，并打上 `needs-fix` 标签。贡献者推送新提交后会自动重新初审；
   - **通过**：撤销之前的打回，打上 `ready-for-review` 标签，并请求仓库 owner 审查，由 owner 确认后合并。

PR Review 不运行 PR 中的任何代码（只检出默认分支上的脚本），所以给它写权限是安全的。修改初审逻辑时也要保持这一点。

## 校验代码块

`tools/sfml-check/check.sh` 会下载 ANTLR 4.9.1（与 SFM 构建时用的版本相同）和 4.34.0 正式版的 `SFML.g4`，生成解析器，然后解析 `src/` 中的所有 SFML 代码块：

```bash
bash tools/sfml-check/check.sh
```

查看某段代码的解析树（比如用来确认运算符优先级）：

```bash
bash tools/sfml-check/check.sh --tree "every 20 ticks do if not true and false then end end"
```

需要安装 Java 17 或更高版本（JDK）、curl 和 bash。
