# FORGET

## 为什么需要 FORGET

我们在[工作模型](ch04-01-io-model.md)一节里讲过：`INPUT` 登记的来源在整个触发器内一直有效，后面的每一条 `OUTPUT` 都会从中取货。如果想在一个触发器里完成几段**互不相干**的搬运，就需要一种方法来“清空”已登记的来源，这就是 `FORGET`。

## 写法

### FORGET：撤销全部输入

```sfml
EVERY 20 TICKS DO
    INPUT FROM a
    OUTPUT 1 TO b

    FORGET          -- 撤销 INPUT FROM a

    INPUT FROM c
    OUTPUT TO d     -- 只搬 c 的东西
END
```

### FORGET 标签列表：只撤销指定标签

```sfml
EVERY 20 TICKS DO
    INPUT FROM a, b
    OUTPUT TO c

    FORGET b        -- 从所有已登记输入中去掉标签 b，a 仍然有效

    INPUT FROM d
    OUTPUT TO e     -- 来源：a 和 d
END
```

`FORGET` 会检查每一条已登记的 `INPUT`，从它的标签列表中删掉指定的标签：

- 删完之后还剩标签的，保留这条输入（只包含剩下的标签）；
- 删完之后没有标签的，整条输入作废。

标签列表允许尾随逗号：`FORGET a, b,`。

## 计数会被保留

部分 `FORGET` **不会重置**剩余输入的计数器，已经搬走的数量仍然算在限额里：

```sfml
EVERY 20 TICKS DO
    INPUT 10 FROM a, b
    OUTPUT 1 TO z
    FORGET b
    OUTPUT TO z     -- 最多再搬 9 个，而不是 10 个
END
```

<div class="version">

**版本**：`FORGET` 从 4.14.0 开始提供。上面这个“计数保留”的例子来自 4.17.0 的更新日志，那个版本修复了部分 `FORGET` 会错误重置计数器的问题。

</div>

## 常见写法：一个触发器里的多段流水线

`FORGET` 的标准用法，是把同一节拍下的几段搬运写在同一个触发器里，用 `FORGET` 分隔：

```sfml
EVERY 20 TICKS DO
    INPUT FROM "to be smelted"
    OUTPUT 8 TO EACH furnace TOP SIDE
FORGET
    INPUT FROM fuel
    OUTPUT RETAIN 1 TO EACH furnace BOTTOM SIDE
FORGET
    INPUT FROM furnace BOTTOM SIDE
    OUTPUT TO results
END
```

因为缩进不影响语法，很多人习惯把 `FORGET` 顶格写，在视觉上把触发器分成几段，就像上面这样。

<div class="note">

**FORGET 还是拆成多个触发器？**

两种写法的效果基本相同，因为每个触发器本来就有独立的输入上下文。区别在于：

- **同一个触发器 + `FORGET`**：几段搬运在同一刻按顺序执行，后一段能看到前一段的结果；而且只需要写一个触发器头；
- **多个触发器**：可以给每段设置不同的执行间隔。

</div>

## 无参数 FORGET 的精确含义

不带标签的 `FORGET`，在编译时会被展开成“**撤销程序中出现过的所有标签**”，效果就是撤销全部已登记的输入。

<div class="source">

**源码依据**：`ASTBuilder.visitForgetStatement()` 中，如果没有写标签，就用整个程序的 `USED_LABELS` 作为要撤销的标签集合；`ForgetStatement.tick()` 逐条重建输入语句，去掉被撤销的标签，并通过 `transferSlotsTo()` 把已收集的槽位和计数器转移给新语句（[ForgetStatement.java][forget]）。

</div>

## 语法

```antlr
forgetStatement : FORGET label? (COMMA label)* COMMA? ;
```

[forget]: https://github.com/TeamDman/SuperFactoryManager/blob/e9755fa9be3b9ccb1adb0ada36fd9b13422e1f82/platform/minecraft/projections/sfm-4.34.0/mc-1.21.1/src/main/java/ca/teamdman/sfml/ast/ForgetStatement.java
