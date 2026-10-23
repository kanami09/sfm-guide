# SFML 编程语言指南

Super Factory Manager（SFM）模组的脚本语言 **SFML** 的教程书，使用 [mdBook](https://rust-lang.github.io/mdBook/) 构建，结构参照了《Rust 程序设计语言》。

- 适用版本：SFM **4.34.0**（同样适用于 4.35.0），覆盖 MC 1.19.2 ~ 26.1.2
- 参考的源代码来自：<https://github.com/TeamDman/SuperFactoryManager>（提交 `e9755fa9`）

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
| `theme/search.js` | 中文搜索：保留 mdBook 的搜索界面，把检索引擎换成 MiniSearch，中文按相邻两字切分 |
| `theme/minisearch.js` | 第三方库 [MiniSearch](https://github.com/lucaong/minisearch) 7.2.0（MIT），未经修改 |
| `tools/sfml-check/` | 代码块语法校验工具 |

## 写作约定

- 代码块用 ` ```sfml ` 标注。只有几行语句的片段会被自动包进触发器再检查；
- 故意写错的反面例子使用 ` ```sfml,error `，校验工具会确认它们**确实**无法解析；
- 语法正确但会在编译期失败（比如间隔太短）或者只用于说明的片段，使用 ` ```sfml,ignore `；
- 提示框：`<div class="note">`（提示）、`<div class="warning">`（注意）、`<div class="source">`（源代码）、`<div class="version">`（版本差异），div 内部前后要留空行。标题和图标是自动生成的，正文里不用再写“提示：”之类的标签；
- 中文全角标点紧挨着 `**` 时，粗体不会生效。要把括号放到粗体外面，例如 `**标签**（label）`。
- Markdown 使用 markdownlint（VS Code 扩展），按照 [.markdownlint.jsonc](.markdownlint.jsonc) 进行语法检查。也可以在命令行运行 `npx markdownlint-cli2@0.23.3 "**/*.md" "#book"` 执行语法检查。

## 校验代码块

校验脚本会下载 ANTLR 4.9.1（与 SFM 构建时用的版本相同）和 4.34.0 正式版的 `SFML.g4`，生成解析器，然后解析 `src/` 中的所有 SFML 代码块。脚本有两个版本：

| 系统 | 脚本 | 额外依赖 |
| --- | --- | --- |
| Windows | `check.ps1`（PowerShell 5.1 或 7） | — |
| Linux / macOS / Git Bash | `check.sh` | bash、curl |

两者都需要安装 Java 17 或更高版本（JDK）。

Windows（PowerShell）：

```powershell
.\tools\sfml-check\check.ps1
```

如果提示“禁止运行脚本”，可以改用这条命令，它将对本次运行放宽执行策略：

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\sfml-check\check.ps1
```

Linux / macOS / Git Bash：

```bash
bash tools/sfml-check/check.sh
```

查看某段代码的解析树（比如用来确认运算符优先级）：

```powershell
.\tools\sfml-check\check.ps1 -Tree "every 20 ticks do if not true and false then end end"
```

```bash
bash tools/sfml-check/check.sh --tree "every 20 ticks do if not true and false then end end"
```

## 许可证

| 内容 | 许可证 |
| --- | --- |
| 正文 | [CC BY-SA 4.0](LICENSE) |
| 工具代码 | [MIT](LICENSE-CODE) |
| 书中原创的 SFML 示例程序 | [MIT](LICENSE-CODE) |
| 引自 SFM 的内容：附录 C 中的 `SFML.g4`，以及引自 SFM 内置示例程序（`template_programs`）和仓库 `examples/` 的代码 | 版权归 TeamDman 及贡献者，按 [MPL-2.0](https://github.com/TeamDman/SuperFactoryManager/blob/e9755fa9be3b9ccb1adb0ada36fd9b13422e1f82/LICENSE.txt) 授权 |
