# 前言

[Super Factory Manager][sfm]（简称 SFM，中文名“超级工厂管理器”）是 TeamDman 制作的 Minecraft 物流模组。早年的 Steve's Factory Manager 用流程图连线来编排物流；从 SFM 4 开始，物流逻辑改为用一门文本语言来写，这门语言叫 **SFML**（Super Factory Manager Language）。

SFML 很小。在几分钟就能写出第一个能用的程序，但想用好它，仍需对语法结构和关键字有一定的理解。

本书想写成一份像《Rust 程序设计语言》那样的完整语言指南：从入门开始，逐章讲解每个语法结构和关键字，给出能运行的例子，并说明背后的执行机制。

## 参考来源

本书的一大部分参考了**SFM 官方仓库**：<https://github.com/TeamDman/SuperFactoryManager>。具体包括：

- 语法文件 `SFML.g4`（ANTLR 4 语法），它决定什么写法合法；
- `ca.teamdman.sfml.ast` 包下的 Java 源码，它决定每条语句实际做什么；
- 模组内置的示例程序（`template_programs/*.sfml`）和更新日志 `changelog.sfml`。

另有一部分参考了游戏论坛或社区的教程，但其中有一些内容已经过时，在[常见误区与勘误](ch09-00-pitfalls.md)一章里指出。

<div class="warning">

**关于主分支上的“开发版语法”**：仓库主干 `platform/minecraft/src/main/antlr/sfml/SFML.g4` 里还能看到 `LET`、`PLAYER`、`BROADCAST`、`RENDER IMAGE`、`EVERY FRAME` 等关键字。它们属于尚未发布的开发中功能，**正式版尚未支持**。本书不介绍这些关键字，在游戏中也无法使用。

</div>

## 适用版本

- Super Factory Manager
    - 4.35.0 及以下
- Minecraft
    - 1.19.2 1.19.4
    - 1.20 1.20.1 1.20.2 1.20.3 1.20.4
    - 1.21 1.21.1
    - 26.1.2

## 本书的示例是怎么验证的

书中每一个标为 SFML 的代码块，都经过一个小工具检查：这个工具用 ANTLR 4.9.1（和 SFM 构建时用的版本相同）从 4.34.0 的 `SFML.g4` 生成解析器，然后逐个解析书中的代码块。完整程序直接解析；只有几行语句的片段，先包进一个触发器再解析。少数故意写错的反面例子会标出来，并确认它们**确实**无法通过解析。

语法检查只能保证“写法合法”。至于“运行起来会怎样”，本书的说法都来自对执行代码的逐行阅读，相关段落会附上对应源码的链接。

[sfm]: https://github.com/TeamDman/SuperFactoryManager
