# 仓库收纳与整理

## 需求

刷怪塔、自动农场和挖矿把各种东西倒进一个“收件箱”。要求：

1. 按类别把物品分到不同的仓库；
2. 分不了类的东西放进杂物仓库；
3. 尽量减少大仓库带来的卡顿。

## 布局与标签

| 标签 | 贴在 |
|---|---|
| `inbox` | 收件箱（漏斗、刷怪塔都往这里倒） |
| `ores` | 矿物仓库（可以是多个箱子） |
| `wood` | 木材仓库 |
| `farm` | 农作物仓库 |
| `mobs` | 怪物掉落物仓库 |
| `misc` | 杂物仓库 |

注意：`ores` 这个**标签**名和物品标签（tag）`#ores` 互不冲突，它们分属两个不同的命名空间。

## 程序

```sfml
NAME "仓库收纳"

EVERY 20 TICKS DO
    INPUT FROM inbox

    -- 按类别分流，从上到下依次执行
    OUTPUT WITH #ores OR #raw_materials OR #ingots OR #gems TO ores
    OUTPUT *_log OR *_wood OR *_planks OR *_sapling OR stick TO wood
    OUTPUT WITH #crops OR #seeds TO farm
    OUTPUT rotten_flesh, bone, string, gunpowder, spider_eye, arrow TO mobs

    -- 兜底：剩下的放进杂物仓库，只占用空槽位
    OUTPUT TO EMPTY SLOTS IN misc
END

-- 每 5 分钟整理一次杂物仓库，把零散的组合并起来
EVERY 300 SECONDS DO
    INPUT FROM misc
    OUTPUT TO misc
END
```

## 讲解

### 一个 INPUT，多个 OUTPUT

`INPUT FROM inbox` 只写一次，后面的每个 `OUTPUT` 都会从收件箱取货（见[工作模型](ch04-01-io-model.md)）。每个 `OUTPUT` 只接收自己的限额所匹配的东西，其他东西留在收件箱里，等后面的 `OUTPUT` 处理。最后一条不带过滤的 `OUTPUT` 负责兜底。

**顺序很重要**：兜底的 `OUTPUT` 必须放在最后，否则所有东西都会被它抢先拿走。

### 逗号和 OR 的区别

```sfml,ignore
OUTPUT *_log OR *_wood OR *_planks TO wood          -- 一个限额，用 OR 合并
OUTPUT rotten_flesh, bone, string TO mobs           -- 三个限额，用逗号分隔
```

没有数量限制的时候，两种写法的效果相同。差别只在需要限量时才会体现（见[多个限额与 OR](ch05-05-limit-list.md)）。

### EMPTY SLOTS IN 与定期整理

杂物仓库里的东西种类多、零散，每次往里放东西都要检查大量“还能再堆叠”的槽位。`EMPTY SLOTS IN` 让 SFM 只看空槽位，开销小得多。代价是同类物品会分散在多个槽位里，所以再加一个低频触发器，定期把仓库“搬给自己”，物品就会重新堆叠起来。这个写法来自模组内置示例 `empty_slots.sfml`。

### 仓库满了会怎样

目的地放不下时，东西会留在收件箱里，**不会丢失**。收件箱满了之后，往里倒东西的漏斗会停下来，或者刷怪塔的掉落物会留在地上。可以再加一个条件，在收件箱快满时发出提示，比如点亮一盏灯（需要配合其他红石机制）。

## 变化：按需取货

在仓库旁边放一个“取货箱” `pickup`，按一下按钮就从仓库取一组常用物品：

```sfml
EVERY REDSTONE PULSE DO
    INPUT FROM ores, wood, farm, mobs, misc
    OUTPUT
        64 torch,
        64 cobblestone,
        32 bread
    TO pickup
END
```

按钮接在管理器上（或管理器正上方的方块上），每按一次执行一次。

## 变化：保持一部分库存不被取走

有些自动化会从仓库里取材料，你可能希望仓库里始终留一些备用。在**取用方**的 `INPUT` 上用 `RETAIN`：

```sfml
EVERY 20 TICKS DO
    INPUT RETAIN 64 iron_ingot FROM ores   -- 仓库至少留 64 个铁锭
    OUTPUT RETAIN 16 iron_ingot TO EACH machine
END
```
