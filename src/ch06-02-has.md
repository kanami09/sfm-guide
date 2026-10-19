# HAS 表达式与集合运算符

## 基本形式

```text
[集合运算符] 标签访问 HAS 比较运算符 数字 [资源] [WITH ...] [EXCEPT ...]
```

```sfml
EVERY 20 TICKS DO
    IF chest HAS GT 10 iron_ingot THEN
        INPUT iron_ingot FROM chest
        OUTPUT TO storage
    END
END
```

意思是：“`chest` 中的铁锭数量**大于** 10”。

## 比较运算符

| 关键字 | 符号 | 含义 |
| --- | --- | --- |
| `GT` | `>` | 大于 |
| `LT` | `<` | 小于 |
| `EQ` | `=` | 等于 |
| `GE` | `>=` | 大于等于 |
| `LE` | `<=` | 小于等于 |

关键字和符号可以互换：`chest HAS GE 5 stone` 与 `chest HAS >= 5 stone` 等价。SFML **没有“不等于”运算符**，需要时用 `NOT ... HAS EQ ...`。

## 计数什么

- **写了资源**：只统计匹配的资源，可以用 `OR` 列出多个（合计）、用通配符，也可以加 `WITH` 和 `EXCEPT`：

```sfml
EVERY 20 TICKS DO
    IF a HAS GE 64 *ingot EXCEPT iron_ingot THEN
        INPUT *ingot EXCEPT iron_ingot FROM a
        OUTPUT TO b
    END
    IF a HAS GT 0 WITH #ores THEN
        INPUT WITH #ores FROM a
        OUTPUT TO c
    END
END
```

- **没写资源**：统计**所有物品**的总数。注意只统计物品，不包括流体和能量：

```sfml
EVERY 20 TICKS DO
    IF chest HAS EQ 0 THEN          -- chest 里没有任何物品
        INPUT FROM backup
        OUTPUT TO chest
    END
END
```

- 统计流体、能量要写明资源类型，单位分别是 mB 和 FE：

```sfml
EVERY 20 TICKS DO
    IF tank HAS LT 4000 fluid::water THEN   -- 水少于 4 桶
        INPUT fluid::water FROM water_tank
        OUTPUT fluid::water TO tank
    END
END
```

<div class="version">

**版本**：不写资源的 `IF chest HAS EQ 0 THEN` 写法从 4.16.0 开始支持，在此之前必须写成 `IF chest HAS EQ 0 item:: THEN`。

</div>

## 标签访问中的方向和槽位

`HAS` 前面是完整的**标签访问**，所以可以带方向和槽位：

```sfml
EVERY 20 TICKS DO
    IF furnace BOTTOM SIDE HAS GT 0 THEN          -- 只看底面能取出的东西
        INPUT FROM furnace BOTTOM SIDE
        OUTPUT TO results
    END
    IF inscriber SLOTS 2 HAS EQ 0 THEN            -- 只看 2 号槽位
        INPUT 1 silicon FROM materials
        OUTPUT TO inscriber SLOTS 2
    END
END
```

<div class="warning">

**注意**：不要对普通容器写 `EACH SIDE`。`HAS` 会把每个方向上看到的数量**累加**，同一个箱子会被数 7 次（见[方向](ch04-03-sides.md#each-side-的含义)）。

</div>

## 集合运算符

一个标签往往标记在多个方块上，**集合运算符**决定怎样把这些方块各自的情况汇总成一个真假值：

| 运算符 | 为真的条件 |
| --- | --- |
| `OVERALL`（默认） | 所有方块的数量**加起来**满足比较条件 |
| `EVERY` / `EACH` | **每一个**方块都满足 |
| `SOME` | **至少一个**方块满足 |
| `ONE` | **恰好一个**方块满足 |
| `LONE` | **至多一个**方块满足（0 个或 1 个） |

模组内置示例 `if_statements.sfml` 给出了一个直观的对照。设有三个贴着 `a` 标签的容器：

```text
     a            a            a
| 5 stone |  | 5 stone |  | 10 stone |
```

| 条件 | 结果 | 原因 |
| --- | --- | --- |
| `EVERY a HAS = 5 stone` | 假 | 第三个是 10，不是每个都等于 5 |
| `EACH a HAS >= 5 stone` | **真** | 每个都至少有 5 个（`EACH` 是 `EVERY` 的别名） |
| `SOME a HAS EQ 5 stone` | **真** | 至少有一个等于 5 |
| `ONE a HAS = 5 stone` | 假 | 有两个等于 5，不是恰好一个 |
| `LONE a HAS = 5 stone` | 假 | 有两个等于 5，超过一个 |
| `OVERALL a HAS EQ 5 stone` | 假 | 合计是 20 |
| `a HAS EQ 5 stone` | 假 | 默认是 `OVERALL` |

<div class="note">

**没有任何方块贴着这个标签时**：`OVERALL` 按总数 0 比较；`EVERY` 为**真**（空集合中“每一个都满足”成立）；`SOME`、`ONE` 为假；`LONE` 为真。

</div>

<div class="source">

**源码依据**：`BoolHas.test()` 先对每个“标签-方块”分别计数，得到一组真假值，同时累计总数；然后由 `SetOperator` 汇总：`OVERALL` 只看总数的比较结果，`SOME` 是 `anyMatch`，`EVERY` 是 `allMatch`，`ONE` 是“真值个数 == 1”，`LONE` 是“真值个数 <= 1”（[BoolHas.java][has]、[SetOperator.java][setop]）。`SetOperator.from()` 会把 `EACH` 转换成 `EVERY`。

</div>

## 语法

```antlr
boolexpr   : ...
           | setOp? labelAccess HAS comparisonOp number resourceIdDisjunction? with? (EXCEPT resourceIdList)?  #BooleanHas
           ;
setOp      : OVERALL | SOME | EVERY | EACH | ONE | LONE ;
comparisonOp : GT | LT | EQ | LE | GE | '>' | '<' | '=' | '<=' | '>=' ;
```

[has]: https://github.com/TeamDman/SuperFactoryManager/blob/e9755fa9be3b9ccb1adb0ada36fd9b13422e1f82/platform/minecraft/projections/sfm-4.34.0/mc-1.21.1/src/main/java/ca/teamdman/sfml/ast/BoolHas.java
[setop]: https://github.com/TeamDman/SuperFactoryManager/blob/e9755fa9be3b9ccb1adb0ada36fd9b13422e1f82/platform/minecraft/projections/sfm-4.34.0/mc-1.21.1/src/main/java/ca/teamdman/sfml/ast/SetOperator.java
