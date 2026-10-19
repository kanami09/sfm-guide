# EACH：逐种资源计数

## 问题

```sfml
EVERY 20 TICKS DO
    INPUT 5 *ingot FROM a
    OUTPUT TO b
END
```

这条语句是“每种锭各取 5 个”，还是“所有锭加起来取 5 个”？

答案是**加起来 5 个**。一个资源限额只有一个计数器，所有能被它匹配到的资源**共用**这个计数器。

## 在数字后面加 EACH

在数量或保留量的数字后面加上 `EACH`，这个数字就改为**按每种资源**（每个注册 ID）单独计算：

```sfml
EVERY 20 TICKS DO
    INPUT 5 EACH *ingot FROM a     -- 每种锭各取 5 个
    OUTPUT TO b
END
```

数量和保留量可以分别决定要不要加 `EACH`：

| 写法 | 数量 | 保留量 |
|---|---|---|
| `5 RETAIN 1 *ingot*` | 所有锭合计 5 | 所有锭合计留 1 |
| `5 EACH RETAIN 1 *ingot*` | 每种锭各 5 | 所有锭合计留 1 |
| `5 RETAIN 1 EACH *ingot*` | 所有锭合计 5 | 每种锭各留 1 |
| `5 EACH RETAIN 3 EACH *ingot*` | 每种锭各 5 | 每种锭各留 3 |

模组内置示例 `limits.sfml` 中的写法：

```sfml
EVERY 20 TICKS DO
    INPUT 5 EACH *ingot FROM a
    INPUT 5 RETAIN 1 EACH *ingot FROM a
    INPUT 5 EACH RETAIN 3 EACH *ingot* FROM a
    OUTPUT TO b

    OUTPUT 8 EACH *ingot* TO b
    OUTPUT RETAIN 8 EACH *ingot* TO b
    OUTPUT 8 EACH RETAIN 8 EACH *ingot* TO b
END
```

## 典型用法：每种东西都保持一定数量

“目的地中每种匹配的东西都补到 N 个”，用输出端的 `RETAIN N EACH`：

```sfml
EVERY 20 TICKS DO
    INPUT FROM chest
    OUTPUT RETAIN 1 EACH *seed* TO phyto   -- 每种种子都往植物培育器里放 1 个
END
```

“来源中每种东西都留 N 个”，用输入端的 `RETAIN N EACH`，可以不写资源：

```sfml
EVERY 20 TICKS DO
    INPUT RETAIN 1 EACH FROM chest   -- 每种物品都在 chest 里留 1 个，其余搬走
    OUTPUT TO storage
END
```

<div class="version">

**版本**：数量和保留量后的 `EACH` 从 4.12.0 开始提供。4.20.0 优化了 `EACH` 的性能，在此之前，匹配的种类越多，卡顿越严重。

</div>

## 与 FROM EACH / TO EACH 组合

资源层面的 `EACH` 和方块层面的 `EACH`（见 [4.5 节](ch04-05-each-label.md)）相互独立，可以组合使用：

```sfml
EVERY 20 TICKS DO
    INPUT FROM storage
    OUTPUT RETAIN 4 EACH *sapling TO EACH planter
    -- 每个 planter 中，每种树苗都补到 4 个
END
```

## 警告：EACH 用在不可能匹配多种资源的地方

如果数量后面加了 `EACH`，但资源本身只可能匹配一种东西，`EACH` 就没有意义，SFM 会给出警告 *"EACH used without a pattern"*：

```sfml
EVERY 20 TICKS DO
    INPUT 5 EACH stick FROM chest   -- stick 只匹配一种东西，EACH 多余
    OUTPUT TO b
END
```

判断“可能匹配多种”的标准是：限额里有不止一个资源（用 `OR` 连接），或者其中有资源使用了通配符或正则。

<div class="source">

**源码依据**：`ResourceLimit.createInputTracker()` / `createOutputTracker()` 根据数量和保留量各自的 `IdExpansionBehaviour`（`EXPAND` 或 `NO_EXPAND`），从四种计数器实现中选择一种：`SharedQuantitySharedRetention`、`ExpandedQuantitySharedRetention`、`SharedQuantityExpandedRetention`、`ExpandedQuantityExpandedRetention`（[ResourceLimit.java][rl]）。警告见 `EachInIOWithoutPatternProgramLinter`。

</div>

[rl]: https://github.com/TeamDman/SuperFactoryManager/blob/e9755fa9be3b9ccb1adb0ada36fd9b13422e1f82/platform/minecraft/projections/sfm-4.34.0/mc-1.21.1/src/main/java/ca/teamdman/sfml/ast/ResourceLimit.java
