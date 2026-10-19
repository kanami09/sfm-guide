# 熔炉阵列

## 需求

一排原版熔炉（数量不限），要求：

1. 从原料箱取出**矿石和粗矿**，均匀地分给每台熔炉；
2. 从燃料箱取出煤或木炭，给每台熔炉补燃料；
3. 把烧好的成品收进成品箱。

## 布局与标签

```text
[原料箱 raw]   [燃料箱 fuel]   [成品箱 results]
      │              │                │
══════╪══════════════╪════════════════╪══════  ← 线缆
  [熔炉] [熔炉] [熔炉] [熔炉] [熔炉] ……          ← 全部贴 furnace
                 [工厂管理器]
```

| 标签 | 标记的方块 |
| --- | --- |
| `raw` | 原料箱 |
| `fuel` | 燃料箱 |
| `furnace` | 每一台熔炉（可以用标签枪的 Ctrl + 右键批量贴） |
| `results` | 成品箱 |

## 程序

```sfml
NAME "熔炉阵列"

EVERY 20 TICKS DO
    -- 1. 原料：只取矿石和粗矿，每台熔炉的原料槽补到 16 个
    INPUT WITH #ores OR #raw_materials FROM raw
    OUTPUT RETAIN 16 TO EACH furnace TOP SIDE
FORGET
    -- 2. 燃料：每台熔炉的燃料槽补到 8 个（煤和木炭合计）
    INPUT coal, charcoal FROM fuel
    OUTPUT RETAIN 8 coal OR charcoal TO EACH furnace NORTH SIDE
FORGET
    -- 3. 成品：从底面取出
    INPUT FROM furnace BOTTOM SIDE
    OUTPUT TO results
END
```

## 讲解

### 为什么原料用 `TOP SIDE`

原版熔炉的顶面只暴露原料槽。用 `TOP SIDE` 输出，东西只会进原料槽；`RETAIN 16` 统计的也只是原料槽里的数量。

### 为什么燃料用 `NORTH SIDE`，而不是 `BOTTOM SIDE`

原版熔炉的**任意一个水平面**（东南西北）都只暴露燃料槽，**与熔炉朝向无关**。所以 `NORTH SIDE` 对每台熔炉都指向燃料槽。

模组内置示例 `furnace_manager.sfml` 用的是 `BOTTOM SIDE` 加燃料。底面确实也能插入燃料，但底面同时暴露了**成品槽**。如果写成不带资源的 `OUTPUT RETAIN 1 TO EACH furnace BOTTOM SIDE`，`RETAIN` 会把成品槽里的东西也算进去：成品槽里只要有 1 个铁锭，SFM 就会认为“已经有 1 个了”，于是不再补燃料。本例中的写法从两方面避免了这个问题：

1. 换成只暴露燃料槽的侧面；
2. `RETAIN 8 coal OR charcoal` 明确只统计煤和木炭。

### 为什么原料要过滤

熔炉的原料槽能放进**任何**物品。如果原料箱里混进了不能烧炼的东西（比如一把剑），它会被放进熔炉，然后一直卡在那里。用 `WITH #ores OR #raw_materials` 限定只取矿石和粗矿，就能避免这种情况。

物品标签（tag）没写命名空间，所以 1.21 的 `c:ores` 和 1.20.1 的 `forge:ores` 都能匹配（见 [WITH](ch05-07-with-tag.md)）。

### “均匀分配”是怎样实现的

`TO EACH furnace` + `RETAIN 16` 的意思是“**每台**熔炉都补到 16 个”。SFM 按顺序给熔炉补货，原料充足时每台都能补满。原料不足时，排在前面的熔炉先拿到。想让原料不足时分得更平均，可以把 `RETAIN` 调小（比如 `RETAIN 4`），让每次每台只补一点。

这正是模组示例推荐用 `RETAIN` 代替 `ROUND ROBIN` 的原因：不需要轮询，每台机器就都能得到东西。

### 为什么用 FORGET 分段

三段搬运各有不同的来源。如果不加 `FORGET`，第二段的 `OUTPUT` 也会从 `raw` 取货，第三段甚至会把原料和燃料搬进成品箱。详见 [FORGET](ch04-07-forget.md)。

## 变化

### 高炉和烟熏炉

高炉、烟熏炉的槽位布局与熔炉相同，用不同的标签分开处理即可：

```sfml
NAME "冶炼与烹饪"

EVERY 20 TICKS DO
    INPUT WITH #ores OR #raw_materials FROM raw
    OUTPUT RETAIN 16 TO EACH blast TOP SIDE
FORGET
    INPUT beef, porkchop, chicken, mutton, cod, salmon, potato FROM food
    OUTPUT RETAIN 16 TO EACH smoker TOP SIDE
FORGET
    INPUT coal, charcoal FROM fuel
    OUTPUT RETAIN 8 coal OR charcoal TO EACH blast, smoker NORTH SIDE
FORGET
    INPUT FROM blast, smoker BOTTOM SIDE
    OUTPUT TO results
END
```

### 燃料不足时报警

`HAS` 加集合运算符，可以检测“有没有熔炉缺燃料”。下例在燃料箱空了之后，从备用箱补充：

```sfml
EVERY 100 TICKS DO
    IF SOME furnace NORTH SIDE HAS EQ 0 AND fuel HAS EQ 0 THEN
        INPUT coal, charcoal FROM backup_fuel
        OUTPUT TO fuel
    END
END
```
