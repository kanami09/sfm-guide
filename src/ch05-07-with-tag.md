# WITH / WITHOUT：按物品标签（tag）匹配

除了按注册 ID 匹配，SFML 还能按 Minecraft 的**标签**（tag）匹配资源，比如“所有矿石”“所有锭”“所有可以用铲子挖的方块”。

> 本节中的“标签（tag）”指数据包中定义的物品、方块、流体标签（如 `#c:ingots`），不是标签枪贴的标签（label）。

## 基本写法

在资源后面（或者干脆不写资源）加上 `WITH` 和一个物品标签（tag）表达式：

```sfml
EVERY 20 TICKS DO
    -- 以下三种写法等价
    INPUT WITH #c:ingots FROM chest
    INPUT WITH TAG c:ingots FROM chest
    INPUT WITH TAG #c:ingots FROM chest

    OUTPUT TO storage
END
```

- `#` 和 `TAG` 关键字可以任选其一，也可以同时写；
- 不写资源时，隐含的资源是“所有物品”（`sfm:item:*:*`），也就是说上面三行等价于 `INPUT * WITH #c:ingots FROM chest`；
- `WITH` 也可以接在具体的资源后面，作为**额外的过滤条件**：

```sfml
EVERY 20 TICKS DO
    INPUT minecraft: WITH #ingots FROM chest   -- 原版的、带 ingots 标签的物品
    INPUT *a* WITH TAG minecraft:mineable/shovel FROM chest
    OUTPUT TO storage
END
```

<div class="version">

**版本差异：通用标签的命名空间**

- MC 1.21 及以后（NeoForge）的通用标签使用 `c:` 命名空间，例如 `#c:ingots`、`#c:ores`、`#c:gems`；
- 更早的 Forge 版本（如 1.19.2、1.20.1）使用 `forge:` 命名空间，例如 `#forge:ingots`；
- 模组内置示例 `tag_matching.sfml` 中写的是 `forge:`。

**省略命名空间**（写成 `#ingots`）可以同时匹配 `c:ingots` 和 `forge:ingots`。如果你的程序要在不同版本之间通用，这是最省心的写法。

</div>

## 物品标签（tag）匹配规则

### 省略命名空间 = 任意命名空间

```sfml
EVERY 20 TICKS DO
    -- 这两行等价
    INPUT WITH #ingots FROM chest
    INPUT WITH TAG *:ingots FROM chest
    OUTPUT TO storage
END
```

### 路径的段数必须相同

物品标签（tag）的路径用 `/` 分成若干段。匹配时，模式的段数必须和物品标签（tag）的段数**完全相同**（`**` 除外）：

| 模式 | `c:ingots` | `c:ingots/iron` | `c:ingots/iron/raw` |
|---|---|---|---|
| `#ingots` | ✅ | ❌ | ❌ |
| `#ingots/*` | ❌ | ✅ | ❌ |
| `#ingots/*/*` | ❌ | ❌ | ✅ |
| `#ingots/**` | ❌ | ✅ | ✅ |

注意第一行：`#ingots` **不会**匹配 `c:ingots/iron` 这类子标签。好在通常 `c:ingots` 本身就包含了所有的锭，一般没问题；但对于只有子标签、没有父标签的情况，就要用 `/*` 或 `/**`。

### 通配符

每一段中都可以用 `*`，`**` 表示“剩下的所有段”：

```sfml
EVERY 20 TICKS DO
    INPUT WITH TAG refinedstorage:disks/items/* FROM chest
    INPUT WITH #tools/*/*_matter FROM chest
    INPUT WITH #the_bumblezone:essence/** FROM chest
    OUTPUT TO storage
END
```

模组示例对最后一行的说明：它会匹配 `#the_bumblezone:essence/life/grow_plants`、`#the_bumblezone:essence/calming_arena/drowned_bonus_held_item` 等任意深度的物品标签（tag）。

### 物品也会匹配方块标签（tag）

对物品来说，SFM 检查的物品标签（tag）包括**物品自身的物品标签（tag）**，以及**它对应方块的方块标签（tag）**。所以 `#minecraft:mineable/shovel` 这种方块标签（tag），也能用来筛选物品：

```sfml
EVERY 20 TICKS DO
    INPUT minecraft:* WITH TAG minecraft:mineable/shovel FROM chest
    OUTPUT TO dirt_storage
END
```

流体使用流体标签（tag）。

<div class="source">

**源码依据**：`ItemResourceType.getTagsForStack()` 先取 `Block.byItem(item)` 的方块标签（tag），再合并物品标签（tag）；`TagMatcher.testPath()` 实现了上述段数规则和 `**` 的处理（[TagMatcher.java][tag]）。

</div>

## 逻辑组合：NOT、AND、OR、括号

`WITH` 后面可以用 `NOT`、`AND`、`OR` 和括号组合多个物品标签（tag）条件：

```sfml
EVERY 20 TICKS DO
    INPUT WITH NOT #needs_stone_tool FROM chest

    INPUT
        WITH
            NOT #needs_stone_tool
            AND #ores/*
    FROM chest      -- 带 ores/* 标签，并且不带 needs_stone_tool 标签

    OUTPUT TO other_chest
END
```

**优先级：`NOT` > `AND` > `OR`**（用本书的语法检查工具实测得到）。`NOT #a AND #b OR #c` 的含义是 `((NOT #a) AND #b) OR #c`。拿不准的时候就加括号。

## WITHOUT：对整个表达式取反

`WITHOUT 表达式` 等价于 `WITH NOT (表达式)`，取反的是**整个**表达式：

```sfml
EVERY 20 TICKS DO
    -- 这两行等价：不同时带有这两个标签的物品
    INPUT WITHOUT #needs_stone_tool AND #ores/* FROM chest
    INPUT WITH NOT (#needs_stone_tool AND #ores/*) FROM chest

    -- 这一行不同：带 needs_stone_tool 但不带 ores/* 的物品
    INPUT WITH NOT #ores/* AND #needs_stone_tool FROM chest

    OUTPUT TO other_chest
END
```

## WITH 属于单个限额

`WITH` / `WITHOUT` 是**限额级**的，只作用于它所在的那个资源限额，可以和数量、`RETAIN`、其他限额自由组合：

```sfml
EVERY 20 TICKS DO
    INPUT
        3 RETAIN 5 WITH TAG #c:ingots,
        4 dirt,
        WITH #mineable/axe,
        minecraft: WITH #ingots,
        stone,
    EXCEPT sand, gold_ingot
    FROM chest
    OUTPUT TO other_chest
END
```

与之相对，[`EXCEPT`](ch05-06-except.md) 是**语句级**的，而且**不支持** `WITH`。

## 在 HAS 条件中

```sfml
EVERY 20 TICKS DO
    IF chest HAS GT 0 WITH #ores THEN
        INPUT WITH #ores FROM chest
        OUTPUT TO ore_processing
    END
END
```

<div class="version">

**版本**：`WITH TAG` 从 4.19.0 开始提供；`WITHOUT` 以及 `WITH` 中的 `OR` 在 4.20.0 修复了逻辑错误。

</div>

## 语法

```antlr
with        : WITH withClause
            | WITHOUT withClause
            ;
withClause  : LPAREN withClause RPAREN           # WithParen
            | NOT withClause                     # WithNegation
            | withClause AND withClause          # WithConjunction
            | withClause OR withClause           # WithDisjunction
            | (TAG HASHTAG? | HASHTAG) tagMatcher  # WithTag
            ;
tagMatcher  : identifier COLON identifier (SLASH identifier)*
            | identifier (SLASH identifier)*
            ;
```

[tag]: https://github.com/TeamDman/SuperFactoryManager/blob/e9755fa9be3b9ccb1adb0ada36fd9b13422e1f82/platform/minecraft/projections/sfm-4.34.0/mc-1.21.1/src/main/java/ca/teamdman/sfml/ast/TagMatcher.java
