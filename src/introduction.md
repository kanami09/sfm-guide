# 简介

欢迎阅读《SFML 编程语言指南》。SFML 是 Super Factory Manager（SFM）模组的脚本语言，专门用来在 Minecraft 里**搬运资源**：物品、流体、能量，以及装了 Mekanism 时的各种化学品。

一段 SFML 程序看起来是这样的：

```sfml,error
NAME "熔炉管理"

EVERY 20 TICKS DO
    INPUT FROM 原料箱
    OUTPUT 8 TO EACH 熔炉 TOP SIDE
FORGET
    INPUT FROM 燃料箱
    OUTPUT RETAIN 1 TO EACH 熔炉 BOTTOM SIDE
FORGET
    INPUT FROM 熔炉 BOTTOM SIDE
    OUTPUT TO 成品箱
END
```

等等，标签可以用中文吗？**当然可以，但不是上面那样**。SFML 的标识符只允许英文字母、数字、下划线和 `*`，中文标签必须加引号写成 `"原料箱"`。上面这段代码其实无法通过编译，[第 2.2 节](ch02-02-lexical.md)会解释原因，修正后的写法如下：

```sfml
NAME "熔炉管理"

EVERY 20 TICKS DO
    INPUT FROM "原料箱"
    OUTPUT 8 TO EACH "熔炉" TOP SIDE
FORGET
    INPUT FROM "燃料箱"
    OUTPUT RETAIN 1 TO EACH "熔炉" BOTTOM SIDE
FORGET
    INPUT FROM "熔炉" BOTTOM SIDE
    OUTPUT TO "成品箱"
END
```

即使你从没写过程序，也大概能读懂它在做什么：每秒一次，把原料放进每个熔炉的顶部，把燃料放进底部，再把成品取出来。这就是 SFML 的设计目标：**读起来像自然语言**。

## 本书适合谁

- **玩家**：想在整合包里用 SFM 搭建物流系统，但看不懂示例程序，或者程序“不按预期工作”。
- **整合包作者和服务器管理员**：需要了解配置项、性能和不同 MC 版本之间的差异。
- **有编程经验的读者**：想把 SFML 的语义弄得一清二楚，比如数量和保留量到底怎么计算、语句以什么顺序执行。

阅读本书不需要编程基础。

## 如何阅读本书

本书的结构参照《Rust 程序设计语言》：

| 章节 | 内容 |
| --- | --- |
| 第 1 章 入门指南 | 需要哪些方块和物品，写出并运行第一个程序 |
| 第 2 章 语言基础 | 程序结构、关键字、标识符、字符串、注释 |
| 第 3 章 触发器 | `EVERY ... DO ... END`：程序什么时候运行 |
| 第 4 章 输入与输出 | `INPUT` / `OUTPUT`：从哪里搬到哪里 |
| 第 5 章 资源匹配与数量 | 搬什么、搬多少、留多少 |
| 第 6 章 条件控制 | `IF`：根据库存或红石信号决定做什么 |
| 第 7 章 实战项目 | 熔炉阵列、仓库、补料、流体和能量、AE2 压印器 |
| 第 8 章 深入执行模型 | 搬运算法、编译警告、性能 |
| 第 9 章 常见误区与勘误 | 新手常踩的坑，以及网络教程中的错误说法 |
| 附录 | 关键字速查、完整语法、配置项、版本差异、术语表 |

第 1 到 6 章建议按顺序读。第 7 章可以挑感兴趣的项目看。第 8 章适合在程序行为让你困惑时查阅。

## 本书的约定

**大小写**：SFML 的关键字不区分大小写，`EVERY`、`every`、`Every` 都可以。本书统一把关键字写成大写，标签和物品名写成小写，方便区分。

**提示框**：

<div class="note">

补充说明或实用技巧。

</div>

<div class="warning">

需要特别关注或容易出错的地方。

</div>

<div class="source">

一段描述或规则依据的源代码。

</div>

<div class="version">

某个特性从哪个版本开始提供，或者在不同 MC 版本上的差异。

</div>

**术语**：书中的“标签”默认指用标签枪标记在方块上的**标签（label）**。Minecraft 数据包里的物品标签（如 `#c:ingots`）会写成“**Tag**”或“物品标签（tag）”以示区分。详见[术语表](appendix-06-glossary.md)。

准备好了吗？我们从[入门指南](ch01-00-getting-started.md)开始。
