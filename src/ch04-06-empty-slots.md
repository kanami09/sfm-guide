# EMPTY SLOTS IN

## 写法

在 `OUTPUT ... TO` 之后、标签之前加上 `EMPTY SLOTS IN`，表示**只往空槽位里放**：

```sfml
EVERY 20 TICKS DO
    INPUT FROM mob_loot
    OUTPUT TO EMPTY SLOTS IN storage
END
```

`EMPTY SLOT IN`（单数）也合法。这个修饰**只能用于 `OUTPUT`**。

## 为什么需要它

默认情况下，`OUTPUT` 会把目的地中**所有还没满的槽位**都当作候选，包括已经有同类物品、还能继续堆叠的槽位。对一个装满各种东西的大仓库来说，每次执行都要逐个检查这些槽位能不能塞进当前物品，开销不小。

加上 `EMPTY SLOTS IN` 后，只有空槽位才会成为候选，大大减少了要检查的槽位数量。模组内置示例的说法是：*This should be useful for minimizing lag when outputting to large full inventories*。

代价是物品不会和已有的同类物品堆叠在一起，仓库里可能出现很多没堆满的组。模组示例给出的办法是：再加一个**低频的整理触发器**，把仓库的东西“搬给自己”，这样物品就会重新堆叠：

```sfml
NAME "Empty Slots"

EVERY 20 TICKS DO
    INPUT FROM mob_loot
    OUTPUT TO EMPTY SLOTS IN storage
END

-- 可选：每 5 分钟整理一次，把零散的组合并起来
EVERY 300 SECONDS DO
    INPUT FROM storage
    OUTPUT TO storage
END
```

## 默认情况下怎样判断“槽位没满”

不加 `EMPTY SLOTS IN` 时，SFM 用下面的规则判断一个目的地槽位能不能作为候选：

1. 如果槽位的容量上限**大于 99**（抽屉、存储箱这类超大槽位），只要当前数量小于槽位上限，就是候选；
2. 否则，当前数量既要小于**槽位上限**，又要小于**物品本身的最大堆叠数**，才是候选。

<div class="source">

`OutputStatement.shouldCreateSlot()`：`emptySlotsOnly` 时只看 `type.isEmpty(stack)`；否则按上述规则判断（[OutputStatement.java][output]）。

</div>

## 与 RETAIN 一起使用

`EMPTY SLOTS IN` 只影响“往哪些槽位里**放**”，不影响 `RETAIN` 的**计数**。计算目的地已有多少时，那些非空槽位里的东西照样会被算进去：

```sfml
EVERY 20 TICKS DO
    INPUT FROM a
    OUTPUT RETAIN 64 cobblestone TO EMPTY SLOTS IN b   -- b 中已有的圆石也计入 64
END
```

<div class="version">

`EMPTY SLOTS IN` 从 4.25.0 开始提供。

</div>

[output]: https://github.com/TeamDman/SuperFactoryManager/blob/e9755fa9be3b9ccb1adb0ada36fd9b13422e1f82/platform/minecraft/projections/sfm-4.34.0/mc-1.21.1/src/main/java/ca/teamdman/sfml/ast/OutputStatement.java
