# 多个资源条目与 OR

## 用逗号列出多个资源条目

一条语句可以写多个资源条目，用逗号分隔，**各自独立计数**：

```sfml
EVERY 20 TICKS DO
    INPUT
        5 stone,
        3 iron_ingot,
        cobblestone,     -- 圆石不限量
    FROM a
    OUTPUT TO b
END
```

上面这条语句表示：石头最多 5 个，铁锭最多 3 个，圆石全部。其他东西不取。

每个资源条目中没写的部分，按输入端或输出端的默认值补全（见[数量与 RETAIN](ch05-03-quantity-retain.md)）。

输出端同理。仓库示例 `examples/04-smelting.sfm` 中的写法：

```sfml
EVERY 20 TICKS DO
    INPUT FROM chest
    OUTPUT
        coal,
        1 RETAIN 1 oak_log,   -- 每个资源条目分别计算
        charcoal
    TO furnace BOTTOM SIDE
END
```

## 用 OR 合并成一个资源条目

用 `OR` 把多个资源连起来，它们就同属**一个资源条目**，共用计数：

```sfml
EVERY 20 TICKS DO
    INPUT
        5 stone OR dirt,   -- 石头和泥土合计 5 个
        cobblestone        -- 圆石全部
    FROM chest
    OUTPUT TO b
END
```

对比：

| 写法 | 含义 |
| --- | --- |
| `5 stone, 5 dirt` | 石头最多 5 个，泥土最多 5 个，合计最多 10 个 |
| `5 stone OR dirt` | 石头和泥土**合计**最多 5 个 |
| `5 EACH stone OR dirt` | 石头和泥土**各自**最多 5 个（`EACH` 按资源分别计数） |

`OR` 只能连接资源标识符，数量和 `RETAIN` 要写在整组的最前面。`OR` 列表允许在末尾多写一个 `OR`。

<div class="version">

资源之间的 `OR` 从 4.20.0 开始提供。

</div>

## 同一种资源匹配多个资源条目

<div class="warning">

**多个资源条目的数量是叠加的，不是取最小值。**

如果某种资源同时被列表中的多个资源条目匹配，**每个资源条目都会单独给它“放行”一次**，最终效果是这些数量相加：

```sfml
EVERY 20 TICKS DO
    INPUT
        5 *ingot,
        2 iron_ingot
    FROM a
    OUTPUT TO b
END
```

这里的铁锭既能被 `5 *ingot` 匹配，也能被 `2 iron_ingot` 匹配，因此一次最多可能取走 5 + 2 = 7 个铁锭，而不是“最多 2 个”。

SFML 没法直接表达“锭最多 5 个，其中铁锭最多 2 个”这类嵌套约束。比较接近的办法是用 `EXCEPT` 让两类资源**互不重叠**，分开写成两条语句：

```sfml
EVERY 20 TICKS DO
    INPUT 3 *ingot EXCEPT iron_ingot FROM a   -- 其他锭最多 3 个
    INPUT 2 iron_ingot FROM a                 -- 铁锭最多 2 个
    OUTPUT TO b
END
```

这样总数最多 5 个，铁锭最多 2 个，只是其他锭被固定为最多 3 个。

注意，`EXCEPT` 是语句级的，会排除整条语句的所有资源条目，所以这里必须拆成两条 `INPUT` 语句。

</div>

<div class="source">

`InputStatement.gatherSlotsForCap()` 对每个非空槽位遍历所有计数器（`for (IInputResourceTracker tracker : trackers)`），每个能匹配的计数器都会为这个槽位创建一个独立的 `LimitedInputSlot`；输出端的 `gatherSlotsForCap()` 结构相同。

</div>

## 语法

```antlr
resourceLimitList     : resourceLimit (COMMA resourceLimit)* COMMA? ;
resourceIdDisjunction : resourceId (OR resourceId)* OR? ;
```
