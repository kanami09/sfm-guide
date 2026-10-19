# EACH：逐个方块计数

`EACH` 在 SFML 里出现在三个地方，含义各不相同：

| 位置 | 例子 | 含义 | 章节 |
| --- | --- | --- | --- |
| 标签前 | `FROM EACH a`、`TO EACH b` | 数量和保留量**按每个方块**单独计算 | 本节 |
| 数量或保留量后 | `5 EACH *ingot*`、`RETAIN 3 EACH *ingot*` | 数量和保留量**按每种资源**单独计算 | [5.4 节](ch05-04-each-quantity.md) |
| 条件中 | `IF EACH a HAS ...` | 集合运算符，等同于 `EVERY` | [6.2 节](ch06-02-has.md) |
| 方向 | `EACH SIDE` | 所有方向 | [4.3 节](ch04-03-sides.md) |

本节只讲第一种。

## 不加 EACH：所有方块共用一套计数

默认情况下，一条语句的数量和保留量限制（第 5 章详细介绍）是**所有匹配方块加在一起**算的：

```sfml
EVERY 20 TICKS DO
    INPUT 5 FROM c     -- 从所有 c 中“总共”取 5 个
    OUTPUT TO b
END
```

假设有 3 个箱子贴着 `c` 标签，每次执行总共只会取出 5 个，可能全部来自第一个箱子。

## 加 EACH：每个方块各算各的

```sfml
EVERY 20 TICKS DO
    INPUT 5 FROM EACH c    -- 从“每个” c 各取 5 个
    OUTPUT TO b
END
```

同样 3 个箱子，每次最多取出 3 × 5 = 15 个。

输出端同理：

```sfml
EVERY 20 TICKS DO
    INPUT FROM a
    OUTPUT 1 TO b          -- 多个 b 中，只有一个会收到这 1 个物品
END
```

```sfml
EVERY 20 TICKS DO
    INPUT FROM a
    OUTPUT 1 TO EACH b     -- 每个 b 各收到 1 个
END
```

## TO EACH 与 RETAIN：最常见的组合

`TO EACH` 最常见的用法，是配合 `RETAIN` 给**每台机器**补到固定数量：

```sfml
EVERY 20 TICKS DO
    INPUT FROM fuel_chest
    OUTPUT RETAIN 8 coal TO EACH furnace BOTTOM SIDE   -- 每台熔炉都补到 8 个煤
END
```

如果去掉 `EACH`，变成 `OUTPUT RETAIN 8 coal TO furnace BOTTOM SIDE`，意思就成了“**所有熔炉加起来**最多 8 个煤”。这通常不是你想要的。

## 精确的计数单位

严格来说，`EACH` 的计数单位不是“方块”，而是 **“标签 × 方块 × 方向”** 的每一个组合。SFM 为每个组合创建一组独立的计数器：

- `TO EACH furnace TOP, BOTTOM SIDE`：每台熔炉的顶面和底面**各自**单独计数；
- 一个方块同时贴了 `a` 和 `b`，`FROM EACH a, b` 会把它当成两个来源，分别计数。

<div class="source">

**源码依据**：`OutputStatement.gatherSlots()` 中，`each` 为真时，在 `resourceType.forEachCapability(...)` 的回调**内部**调用 `resourceLimits.createOutputTrackers()`，即每遇到一个（标签，位置，方向）能力就新建一组计数器；`each` 为假时，计数器在循环外创建一次，所有能力共用。`InputStatement.gatherSlots()` 的结构相同。

</div>

## 语法位置

`EACH` 紧跟在 `FROM` / `TO` 之后、标签之前；输出语句中如果有 `EMPTY SLOTS IN`，`EACH` 要写在它后面：

```sfml
EVERY 20 TICKS DO
    INPUT 1 FROM EACH a
    OUTPUT TO EMPTY SLOTS IN EACH b
END
```
