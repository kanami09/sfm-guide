# 常见误区与勘误

本章分两部分：第一部分是写 SFML 时最常踩的坑，第二部分指出仓库旧示例和网络教程中与 4.34.0 源码不符的说法。

## 第一部分：常见误区

### 1. 贴了标签却忘记推送

标签枪贴完标签后，必须**右键管理器**把标签推送到磁盘，程序才能看到。→ [准备工作](ch01-01-blocks-and-items.md)

### 2. 以为 INPUT 会搬运

`INPUT` 只登记来源，真正搬运的是 `OUTPUT`。只有 `INPUT` 的程序什么都不会做；把 `OUTPUT` 写在 `INPUT` 前面，这条 `OUTPUT` 也什么都不会做。→ [工作模型](ch04-01-io-model.md)

### 3. 流体、能量只在一边写了资源类型

```sfml
EVERY 20 TICKS DO
    INPUT fluid:: FROM a
    OUTPUT TO b            -- ❌ 只接收物品
END
```

不写资源等于“所有**物品**”。**两边都要写** `fluid::`。→ [资源类型](ch05-02-resource-types.md)

### 4. 忘了用 FORGET，后面的 OUTPUT 也会从前面的 INPUT 取货

同一个触发器里，`INPUT` 一直有效到被 `FORGET` 撤销为止。→ [FORGET](ch04-07-forget.md)

### 5. RETAIN 默认是“合计”，不是“每个”

- `OUTPUT RETAIN 8 coal TO furnace`：**所有**熔炉合计 8 个；想要每台各 8 个，写 `TO EACH furnace`；
- `INPUT RETAIN 5 FROM chest`：**所有物品**合计留 5 个；想要每种各留 5 个，写 `RETAIN 5 EACH`。

→ [数量与 RETAIN](ch05-03-quantity-retain.md)

### 6. 中文、空格、关键字当标签没加引号

`FROM 原料箱`、`FROM storage a`、`FROM north` 都无法通过解析，应写成 `"原料箱"`、`"storage a"`、`"north"`。→ [词法](ch02-02-lexical.md)

### 7. 标签大小写不一致

标签区分大小写，`Chest` ≠ `chest`。关键字和资源名不区分大小写。

### 8. 偏移量写错导致触发器从不执行

- `EVERY 20 PLUS 20 TICKS`：偏移量不小于间隔，**永远不会执行**；
- `EVERY 20 PLUS 5 TICKS`（本地时钟）：重新加载后可能长期不执行。

需要偏移量时请用 `EVERY 20G+5 TICKS`。→ [定时触发器](ch03-01-timer.md#偏移量)

### 9. `IF REDSTONE THEN` 永远为真

省略比较时默认是 `>= 0`。要写 `IF REDSTONE GE 1 THEN`。→ [REDSTONE 条件](ch06-04-redstone.md)

### 10. `HAS ... OR redstone` 被解析成资源析取

`a HAS GT 1 stone OR redstone` 的含义是“石头和红石粉合计多于 1 个”。要表达“或有红石信号”，写成 `(a HAS GT 1 stone) OR REDSTONE GE 1`。→ [布尔逻辑](ch06-03-boolean.md)

### 11. 以为 NOT、AND、OR 优先级相同

实际优先级是 `NOT` > `AND` > `OR`。混用时请加括号。→ [布尔逻辑](ch06-03-boolean.md)

### 12. 对普通箱子使用 EACH SIDE

同一个物品栏会被访问 7 次，`HAS` 计数会被放大 7 倍。→ [方向](ch04-03-sides.md#each-side-的含义)

### 13. 熔炉底面的 RETAIN 把成品也算进去了

熔炉底面同时暴露成品槽和燃料槽，`OUTPUT RETAIN 1 TO furnace BOTTOM SIDE` 会把成品也计入。可以改用侧面放燃料，或者在限额里写明燃料种类。→ [熔炉阵列](ch07-01-furnaces.md)

### 14. 槽位编号用的是容器界面上的编号

SFML 的槽位编号是**所访问的那个面**上的编号。分面容器的每个面会把可见的槽位重新从 0 编号。请用 `Ctrl + I` 容器检查器确认。→ [槽位](ch04-04-slots.md)

### 15. `HAS` 不写资源时只统计物品

`IF tank HAS EQ 0 THEN` 不会检查流体。要写 `IF tank HAS EQ 0 fluid:: THEN`。→ [HAS 表达式](ch06-02-has.md)

### 16. `#ingots` 匹配不到 `c:ingots/iron`

物品标签（tag）匹配要求路径段数相同。要匹配子标签，用 `#ingots/*` 或 `#ingots/**`。→ [WITH](ch05-07-with-tag.md)

### 17. 在字符串里用 `::` 或 `*`

带引号的资源标识符是正则表达式：`"fluid::water"` 匹配不到任何东西，`"*ingot"` 是非法的正则。应写成 `"fluid:.*:water"`、`".*ingot"`，或者干脆不加引号。→ [资源标识符](ch05-01-resource-id.md)

### 18. 相对方向在没有朝向的方块上“悄悄”变成了无方向

`LEFT`、`RIGHT` 等相对方向在方块没有朝向属性，或者朝上、朝下时，会退化为无方向访问，不会报错。→ [方向](ch04-03-sides.md#相对方向front--back--left--right)

### 19. Mekanism 机器不写方向

Mekanism 方块无方向访问时只读。必须写方向，并且要与面配置一致。→ [资源类型](ch05-02-resource-types.md)

### 20. 同一种资源被多个限额匹配，结果“超额”了

逗号分隔的多个限额各自独立计数。一种资源同时匹配多个限额时，这些限额会**叠加**。→ [多个限额与 OR](ch05-05-limit-list.md)

---

## 第二部分：勘误

以下说法出现在仓库的旧示例目录 `examples/`、网络教程或自动生成的文档中，与 4.34.0 的源码不符。模组内置的 `template_programs/*.sfml` 示例是持续维护的，比 `examples/` 目录更可靠。

### examples/01-moveitems.sfm

| 原文（注释） | 实际情况 |
| --- | --- |
| *"minecraft:" namespace is assumed*（`iron_ingot` 默认是 `minecraft:` 命名空间） | **过时**。一段式资源名匹配**任意**命名空间：`iron_ingot` → `sfm:item:.*:iron_ingot`。见 `ResourceIdentifier(String value)` 构造函数，以及内置示例 `resource_types.sfml` 的说明 |
| *redstone is a keyword for future use, so must be surrounded in quotes* | **过时**。4.14.0 起 `redstone` 可以直接当资源名和标签名，语法中 `identifier` 规则包含 `REDSTONE` |

### examples/03-conditions.sfm

| 原文（注释） | 实际情况 |
| --- | --- |
| *"not", "and", and "or" operators all have same precidence* | **不符**。左递归规则中备选分支的顺序决定了优先级：`NOT` > `AND` > `OR`。已用 ANTLR 4.9.1 实测 |
| *"minecraft:" namespace prefix is default and can be omitted* | **过时**，同上 |

### examples/04-smelting.sfm

| 原文（注释） | 实际情况 |
| --- | --- |
| *namespace defaults to "minecraft:"* | **过时**，同上 |

### examples/README.md

| 原文 | 实际情况 |
| --- | --- |
| *There are currently 3 statements: INPUT, OUTPUT, IF* | **不完整**。正式版共有 4 种语句，还有 `FORGET`（4.14.0 加入） |
| 语法文件链接指向 `platform/minecraft/src/main/antlr/sfml/SFML.g4` | 这是**主分支开发版**的语法，其中包含 `LET`、`BROADCAST`、`RENDER IMAGE`、`EVERY FRAME` 等**未发布**的功能。正式版语法见 `projections/sfm-4.34.0/*/src/main/antlr/sfml/SFML.g4`（本书[附录 C](appendix-03-grammar.md)） |

### 网络教程与自动生成的文档

| 常见说法 | 实际情况 |
| --- | --- |
| “`INPUT` 会把物品取到管理器里，再由 `OUTPUT` 放出去” | **错误**。SFM 没有缓冲区，`INPUT` 只登记，物品直接从来源搬到目的地 |
| “最短只能每 20 刻执行一次” | **不完全对**。20 刻是**默认值**，服务器可以修改；只搬能量的触发器默认可以每刻执行；红石脉冲触发器不受这个限制 |
| “`ROUND ROBIN` 会在一刻内把东西均分给所有目标” | **不是原版行为**。原版每次执行只选一个目标（或一个标签），依次轮换。“一刻内均分”是第三方附属模组（如 SFM Optimizer）修改后的行为 |
| 基于主分支源码自动生成的语言文档（如 DeepWiki）中出现的 `LET`、`PLAYER`、`BROADCAST`、`CLIENT BTW` 等写法 | 这些是**未发布的开发功能**，正式版无法使用 |
| “`EACH` 就是每个箱子各算各的” | **不全面**。`EACH` 有多种含义：`FROM EACH`/`TO EACH` 按方块计数，`5 EACH`/`RETAIN 5 EACH` 按资源种类计数，`IF EACH` 是集合运算符，`EACH SIDE` 表示所有方向。见 [4.5 节](ch04-05-each-label.md) |

<div class="note">

**发现了本书的错误？** 本书同样以源码为准。如果你发现书中的说法与源码不符，请以源码为准，并欢迎指正。

</div>
