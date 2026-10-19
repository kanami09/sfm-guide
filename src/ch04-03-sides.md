# 方向

很多方块从不同的面访问时，暴露的槽位不同。最典型的是原版熔炉：从顶面放进去的东西进原料槽，从侧面放进去的东西进燃料槽，从底面只能取出成品。SFML 用**方向限定**（side qualifier）指定访问哪个面。

## 写法

在标签后面加上 `<方向> SIDE`：

```sfml
EVERY 20 TICKS DO
    INPUT FROM furnace BOTTOM SIDE
    OUTPUT TO chest
END
```

可以列出多个方向，用逗号分隔，最后只写一个 `SIDE`：

```sfml
EVERY 20 TICKS DO
    INPUT FROM a TOP, WEST SIDE
    OUTPUT TO b
END
```

也可以用 `EACH SIDE` 表示所有方向：

```sfml
EVERY 20 TICKS DO
    INPUT fe:: FROM generator
    OUTPUT fe:: TO "flux cell" EACH SIDE
END
```

## 全部方向关键字

| 关键字 | 含义 |
| --- | --- |
| `TOP` | 上（`UP`） |
| `BOTTOM` | 下（`DOWN`） |
| `NORTH` / `SOUTH` / `EAST` / `WEST` | 北 / 南 / 东 / 西 |
| `FRONT` | 方块的**正面**（朝向） |
| `BACK` | 正面的反方向 |
| `LEFT` | 站在正面看着方块时，**你的左手边** |
| `RIGHT` | 站在正面看着方块时，**你的右手边** |
| `NULL` | “无方向”访问（见下文） |

## 不写方向时：无方向（NULL）访问

**不写方向限定时，默认使用 `NULL`**，也就是以“无方向”的方式请求方块的能力。

- 对大多数普通容器（箱子、木桶等），无方向访问拿到的就是完整的物品栏；
- 原版的分面容器（熔炉、酿造台等）在无方向访问时，通常也会暴露全部槽位；
- 但**有些模组的方块在无方向访问时行为不同**。例如 Mekanism 的方块在无方向访问时是**只读**的，SFM 会专门给出警告：*"Mekanism blocks are read-only from the null direction..."*。

```sfml
EVERY 20 TICKS DO
    INPUT FROM a NULL SIDE   -- 与 INPUT FROM a 等价
    OUTPUT TO b
END
```

<div class="note">

**提示**：在机器上搬运时，最好**明确写出方向**，并结合机器自己的“面配置”（很多科技模组的机器可以给每个面设置输入或输出）。不确定的话，先用网络工具右键那个面，或用 `Ctrl + I` 容器检查器看看各个面分别暴露了什么。

</div>

## 相对方向：FRONT / BACK / LEFT / RIGHT

相对方向根据方块状态中的朝向属性（`horizontal_facing` 或 `facing`）计算：

| 关键字 | 计算方式 |
| --- | --- |
| `FRONT` | 朝向本身 |
| `BACK` | 朝向的反方向 |
| `LEFT` | 朝向顺时针旋转 90°（从上往下看） |
| `RIGHT` | 朝向逆时针旋转 90° |

举例：熔炉朝北，即正面在北侧。你站在熔炉北边面向南看着它，你的左手边是东，所以 `LEFT` 是 `EAST`，`RIGHT` 是 `WEST`。

```sfml
EVERY 20 TICKS DO
    INPUT FROM machine LEFT SIDE
    OUTPUT TO machine2 RIGHT, FRONT, BACK SIDE
END
```

相对方向的好处是：同样的程序用在朝向不同的一排机器上，不需要逐台修改方向。

<div class="warning">

**注意：相对方向解析失败时会退化成无方向访问。**

- 方块**没有朝向属性**（比如箱子是有朝向的，但很多模组方块没有）：相对方向无法计算，结果是“无方向”，相当于 `NULL SIDE`；
- 方块**朝上或朝下**（`facing` 为 up/down）：`FRONT`/`BACK` 正常（分别是上/下），但 `LEFT`/`RIGHT` 无法计算，同样退化为“无方向”。

也就是说，在这些方块上写 `LEFT SIDE` 不会报错，实际访问的却可能是方块的全部槽位。

</div>

<div class="source">

**源码依据**：`Side.resolve()`：`LEFT -> facing.getClockWise()`，`RIGHT -> facing.getCounterClockWise()`，`FRONT -> facing`，`BACK -> facing.getOpposite()`，取不到朝向或抛出异常时返回 `null`（[Side.java][side]）。

</div>

## EACH SIDE 的含义

`EACH SIDE` 等价于依次访问 **7 个方向**：上、下、北、南、东、西、无方向（`NULL`）。

它最适合**能量**这类“哪个面都能进、每个面各算各的”的场合，比如给能量单元的每个面都充电。

<div class="warning">

**注意**：对普通箱子这类“每个面都暴露同一个物品栏”的容器，`EACH SIDE` 会把**同一批槽位访问 7 次**。搬运本身不会因此多搬，但**计数类的操作会重复计算**。最典型的是 `IF chest EACH SIDE HAS ...`：`HAS` 会把每个方向上看到的数量累加起来，同一个箱子的东西被数了 7 遍。所以对普通容器，不要用 `EACH SIDE`。

</div>

## 实例：原版熔炉的各个面

| 面 | 插入 | 抽取 |
| --- | --- | --- |
| 顶面（`TOP`） | 原料槽 | 原料槽 |
| 侧面（东南西北） | 燃料槽 | 燃料槽 |
| 底面（`BOTTOM`） | 燃料槽 | 成品槽（以及燃料槽中的空桶） |

所以，模组内置示例 `furnace_manager.sfml` 是这样写的：

```sfml
NAME "Furnace Manager"

EVERY 20 TICKS DO
    INPUT FROM "to be smelted"
    OUTPUT 8 TO EACH furnace TOP SIDE       -- 原料从顶面放入

    FORGET

    INPUT FROM fuel
    OUTPUT RETAIN 1 TO EACH furnace BOTTOM SIDE   -- 燃料从底面放入

    FORGET

    INPUT FROM furnace BOTTOM SIDE          -- 成品从底面取出
    OUTPUT TO results
END
```

## 语法

```antlr
sidequalifier : EACH SIDE                  #EachSide
              | side (COMMA side)* SIDE    #ListedSides
              ;
side          : TOP | BOTTOM | NORTH | EAST | SOUTH | WEST
              | LEFT | RIGHT | FRONT | BACK | NULL ;
```

方向限定写在标签之后、槽位之前；如果用了 `ROUND ROBIN`，要写在它的后面。

<div class="version">

**版本**：`EACH SIDE` 从 4.15.0 开始提供；`LEFT`/`RIGHT`/`FRONT`/`BACK` 相对方向从 4.27.0 开始提供。

</div>

[side]: https://github.com/TeamDman/SuperFactoryManager/blob/e9755fa9be3b9ccb1adb0ada36fd9b13422e1f82/platform/minecraft/projections/sfm-4.34.0/mc-1.21.1/src/main/java/ca/teamdman/sfml/ast/Side.java
