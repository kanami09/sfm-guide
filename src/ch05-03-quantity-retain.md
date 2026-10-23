# 数量与 RETAIN

每个资源条目都可以带两个数字：

- **数量（quantity）**：本次**最多搬多少**；
- **保留量（retention）**：用 `RETAIN` 指定，表示“**保持多少**”。

```text
[数量] [RETAIN 保留量] [资源]
```

两者都可以省略；都写时，**数量必须在前**：

```sfml
EVERY 20 TICKS DO
    INPUT 5 RETAIN 3 stone FROM a    -- ✅
    OUTPUT TO b
END
```

```sfml,error
EVERY 20 TICKS DO
    INPUT RETAIN 3 5 stone FROM a    -- ❌ 顺序错误
    OUTPUT TO b
END
```

## 关键：RETAIN 在输入端和输出端的含义不同

| | 数量 | `RETAIN` |
| --- | --- | --- |
| **INPUT** | 最多从来源取出多少 | 来源中**至少留下**多少（不取走） |
| **OUTPUT** | 最多向目的地放入多少 | 目的地中**最多补到**多少（已有的也算） |

默认值也不同：

| | 数量默认 | `RETAIN` 默认 |
| --- | --- | --- |
| **INPUT** | 无限 | 0（全部可取） |
| **OUTPUT** | 无限 | 无限（不限制目的地数量） |

<div class="source">

`ASTBuilder.visitInputResourceLimits()` 使用 `Limit.MAX_QUANTITY_NO_RETENTION`（数量为 `Long.MAX_VALUE`，保留为 0）补全未写的部分；`visitOutputResourceLimits()` 使用 `Limit.MAX_QUANTITY_MAX_RETENTION`（两者都是 `Long.MAX_VALUE`）（[Limit.java][limit]）。

</div>

## 输入端

```sfml
EVERY 20 TICKS DO
    INPUT FROM a                    -- 全部取走
    INPUT 1 FROM a                  -- 总共只取 1 个
    INPUT stone FROM a              -- 只取石头，全部
    INPUT 3 stone FROM a            -- 只取石头，最多 3 个
    INPUT RETAIN 10 iron_ingot FROM a     -- 铁锭留 10 个，其余取走
    INPUT 5 RETAIN 3 stone FROM a   -- 石头最多取 5 个，并且至少留 3 个
    OUTPUT TO b
END
```

输入端 `RETAIN` 的常见用途：

- **保留种子**：农场收集箱里留几颗种子用来补种；
- **保证机器自身的工作物料不被抽空**：比如从熔炉的燃料槽取东西时留一个；
- **防止把共享仓库搬空**：`INPUT RETAIN 64 cobblestone FROM storage`。

## 输出端

```sfml
EVERY 20 TICKS DO
    INPUT FROM a
    OUTPUT 5 TO b                          -- 最多放 5 个
    OUTPUT RETAIN 1 coal TO furnace BOTTOM SIDE   -- 补到 1 个煤为止
    OUTPUT 5 RETAIN 20 red_sand TO b       -- 每次最多放 5 个，b 中红沙最多 20 个
END
```

输出端 `RETAIN` 是 SFML 里**最有用的功能**之一，它的意思是“**补货到 N**”：

```sfml
EVERY 20 TICKS DO
    INPUT FROM storage
    OUTPUT RETAIN 16 bone_meal TO EACH dispenser   -- 每个发射器始终保持 16 个骨粉
END
```

计算“目的地已有多少”时，SFM 会把目的地中**所有符合该资源条目的资源**都算上，包括已经满了的槽位，以及 `EMPTY SLOTS IN` 不会往里放的非空槽位。

## “总共”还是“每个”？

不加任何 `EACH` 时，数量和保留量都是“**这条语句涉及的所有方块、所有匹配资源加在一起**”算的：

```sfml
EVERY 20 TICKS DO
    INPUT RETAIN 5 FROM b      -- 所有 b 加起来留 5 个（任意物品合计）
    OUTPUT TO a
END
```

注意上面这行有两层“总共”：

1. **方块层面**：有多个 `b` 时，是所有 `b` 加起来留 5 个，而不是每个 `b` 各留 5 个。改成每个方块单独计算，用 [`FROM EACH b`](ch04-05-each-label.md)；
2. **资源层面**：没写资源，等于匹配所有物品，所以是“所有物品合计留 5 个”，而不是每种物品各留 5 个。改成每种资源单独计算，用 [`RETAIN 5 EACH`](ch05-04-each-quantity.md)。

| 写法 | 含义 |
| --- | --- |
| `INPUT RETAIN 5 FROM b` | 所有 b、所有物品**合计**留 5 个 |
| `INPUT RETAIN 5 FROM EACH b` | **每个** b 各留 5 个（物品合计） |
| `INPUT RETAIN 5 EACH FROM b` | 所有 b 合计，**每种**物品各留 5 个 |
| `INPUT RETAIN 5 EACH FROM EACH b` | **每个** b 中**每种**物品各留 5 个 |

```sfml
EVERY 20 TICKS DO
    INPUT RETAIN 5 EACH FROM EACH b
    OUTPUT TO a
END
```

<div class="version">

“多个 `b` 时合计保留 5 个，而不是每个各保留 5 个”是 4.20.0 修复的正确行为。4.22.0 又修复了输入端 `RETAIN` 的多个问题（#306、#200、#297、#199、#181），比如从大容量容器的底面输入时拒绝抽取。使用这些版本之前的 SFM 时，`RETAIN` 的行为可能与本书描述不同。

</div>

## 搬运多少：取最小值

一次搬运实际移动的数量，取以下各项中的**最小值**：

1. 来源槽位中的数量，减去为满足输入端 `RETAIN` 而必须留下的部分；
2. 目的地槽位实际还能放进多少（先模拟插入一次）；
3. 输出端剩余可搬量：`min(数量 − 已搬, 保留量 − 目的地已有)`；
4. 输入端剩余可搬量：`数量 − 已搬`；
5. 这种资源的单组最大堆叠数（例如 64）。

一次搬运只发生在“一个来源槽位 → 一个目的地槽位”之间，一条 `OUTPUT` 执行时会进行很多次这样的搬运，直到达到数量限制或者无货可搬。完整过程见[搬运算法详解](ch08-02-transfer.md)。

## 语法

```antlr
resourceLimit : limit? resourceIdDisjunction with?
              | limit with?
              | with
              ;
limit         : quantity retention    #QuantityRetentionLimit
              | retention             #RetentionLimit
              | quantity              #QuantityLimit
              ;
quantity      : number EACH? ;
retention     : RETAIN number EACH? ;
```

[limit]: https://github.com/TeamDman/SuperFactoryManager/blob/e9755fa9be3b9ccb1adb0ada36fd9b13422e1f82/platform/minecraft/projections/sfm-4.34.0/mc-1.21.1/src/main/java/ca/teamdman/sfml/ast/Limit.java
