# ROUND ROBIN

## 先说结论：你可能不需要它

模组内置示例 `round_robin.sfml` 的第一句注释就是：*you probably don't need round robin, instead, try retain!*（你多半不需要轮询，试试 retain 吧！）

很多人想用轮询，其实是想“**均匀分配**”或者“**每台机器都别塞太多**”。这类需求用 [`TO EACH` + `RETAIN`](ch05-03-quantity-retain.md) 实现，效果更好，也更快：

```sfml
EVERY 20 TICKS DO
    INPUT fluid::water FROM source
    OUTPUT RETAIN 1000 fluid::water TO EACH thingy   -- 每个 thingy 最多 1 桶水
END
```

## 写法

`ROUND ROBIN BY BLOCK` 或 `ROUND ROBIN BY LABEL`，写在标签列表**之后**、方向限定之前：

```sfml
EVERY 20 TICKS DO
    INPUT FROM source
    OUTPUT 128 dirt TO dest ROUND ROBIN BY BLOCK
END
```

```sfml
EVERY 20 TICKS DO
    INPUT FROM "storage a", "storage b" ROUND ROBIN BY LABEL
    OUTPUT 8 bone_meal TO EACH dispenser
END
```

## 两种模式

### BY BLOCK：每次只选一个方块

不用轮询时，语句会访问所有标签下的**全部方块**。用了 `ROUND ROBIN BY BLOCK` 后：

1. 收集所有列出的标签下的方块（同一个方块即使贴了多个标签，也只算一次）；
2. **每次执行只选其中一个**，下一次执行换下一个，依次循环。

```sfml
EVERY 20 TICKS DO
    INPUT FROM source
    OUTPUT 128 dirt TO dest ROUND ROBIN BY BLOCK
    -- 每次只往一个 dest 放（最多 128 个泥土），下一次换下一个 dest
END
```

### BY LABEL：每次只选一个标签

1. **每次执行只选列表中的一个标签**，访问这个标签下的全部方块；
2. 下一次执行换下一个标签，依次循环。

```sfml
EVERY 20 TICKS DO
    INPUT FROM "storage a", "storage b" ROUND ROBIN BY LABEL
    OUTPUT 8 bone_meal TO EACH dispenser
    -- 第一次相当于 INPUT FROM "storage a"
    -- 第二次相当于 INPUT FROM "storage b"
    -- 第三次又回到 "storage a"……
END
```

## 轮询的“节拍”

轮询的位置**每次计算该语句的目标方块时前进一步**，所以轮换速度取决于语句执行的频率。按示例中的说法：*it will rotate each time the statement ticks, so it isn't the fastest*。在 `EVERY 20 TICKS` 的触发器里，每秒只换一个目标。

<div class="warning">

**注意：混合多种资源类型时，轮询会“多走几步”。**

SFM 是按**资源类型**分别收集槽位的，每收集一种资源类型，就会计算一次目标方块，轮询也就前进一步。因此：

```sfml
EVERY 20 TICKS DO
    INPUT stone, fluid:: FROM a, b ROUND ROBIN BY LABEL
    OUTPUT stone, fluid:: TO c
END
```

这条 `INPUT` 每次执行时，轮询会前进两步：物品取一个标签，流体取下一个标签。本例正好只有两个标签，结果是物品**每次都**从 `a` 取、流体**每次都**从 `b` 取，轮询实际上失效了。想让轮询行为可预测，就别在一条语句里混用多种资源类型。

</div>

<div class="source">

**源码依据**：`RoundRobin.getPositionsForLabels()` 每次调用都执行 `next()`，让内部索引加 1（[RoundRobin.java][rr]）；`InputStatement` / `OutputStatement` 的 `gatherSlots()` 对每种引用到的资源类型分别调用 `resourceType.forEachCapability(...)`，后者内部调用 `labelAccess.getLabelledPositions()`。另外，`IF ... HAS` 条件中如果用了轮询，计算条件时也会让轮询前进。

</div>

<div class="note">

**轮询状态保存在哪里**：轮询的位置保存在编译后的程序对象里。程序在以下情况会被重新编译，轮询随之从头开始：修改磁盘内容、服务器配置变更、管理器重新加载等。另外，SFM 按**程序文本**缓存编译结果，所以多台管理器运行**一字不差**的同一份程序时，它们共用同一个程序对象，轮询位置也是共享的（见[程序是如何运行的](ch08-01-runtime.md)）。

</div>

## 相关警告

| 警告 | 含义 |
| --- | --- |
| *Round robin by block shouldn't be used with EACH* | `BY BLOCK` 每次只选一个方块，再加 `EACH`（逐个方块计数）没有意义 |
| *Round robin by label should be used with more than one label* | `BY LABEL` 只列了一个标签，轮询不起作用 |

## 语法

```antlr
labelAccess : label (COMMA label)* roundrobin? sidequalifier? slotqualifier? ;
roundrobin  : ROUND ROBIN BY (LABEL | BLOCK) ;
```

```sfml
EVERY 20 TICKS DO
    INPUT FROM a, b ROUND ROBIN BY BLOCK TOP SIDE SLOTS 0-8   -- 顺序：标签 → 轮询 → 方向 → 槽位
    OUTPUT TO c
END
```

<div class="version">

**版本**：`ROUND ROBIN` 从 4.14.0 开始提供。

</div>

[rr]: https://github.com/TeamDman/SuperFactoryManager/blob/e9755fa9be3b9ccb1adb0ada36fd9b13422e1f82/platform/minecraft/projections/sfm-4.34.0/mc-1.21.1/src/main/java/ca/teamdman/sfml/ast/RoundRobin.java
