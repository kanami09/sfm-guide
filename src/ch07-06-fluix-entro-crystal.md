# 复制福鲁伊克斯水晶和恩特罗水晶

## 背景

如果你同时安装了 AE2（Applied Energistics 2，应用能源2）、AAE（AdvancedAE，高级 AE）和 EAE（ExtendedAE，AE 扩展），那么它们会在游戏中添加以下两种水晶：

- 福鲁伊克斯水晶（`ae2:fluix_crystal`，AE2 添加）
- 恩特罗水晶（`extendedae:entro_crystal`，EAE 添加）

同时，还有下面的配方（由 AAE 的反应仓添加）：

```text
64*赛特斯石英水晶 => 64*充能赛特斯石英水晶
32*充能赛特斯石英水晶 32*福鲁伊克斯粉 => 64*福鲁伊克斯水晶
32*福鲁伊克斯水晶 32*恩特罗粉 => 64*恩特罗水晶
```

不难看出，只需要消耗赛特斯石英水晶、水和电力（当然，需要事先备好至少一份原材料），就可以源源不断地产出福鲁伊克斯水晶和恩特罗水晶。

<div class="note">

配方的具体数量可能随模组版本变化，请以 JEI 中显示的为准。

</div>

## 布局与标签

| 标签 | 标记的方块 |
| --- | --- |
| `电源` | 提供 FE 的方块 |
| `机器` | 所有需要供电的机器 |
| `水源` | 提供水的方块，例如水槽 |
| `反应仓` | 所有反应仓 |
| `存储` | 存放原料和产物的容器 |
| `充能赛特斯石英水晶反应仓` | 生产充能赛特斯石英水晶的反应仓 |
| `福鲁伊克斯水晶粉碎机` | 生产福鲁伊克斯粉的机器（这里使用的是 Mek 的粉碎机） |
| `福鲁伊克斯水晶反应仓` | 生产福鲁伊克斯水晶的反应仓 |
| `恩特罗水晶粉碎机` | 生产恩特罗粉的机器 |
| `恩特罗水晶反应仓` | 生产恩特罗水晶的反应仓 |

<div class="note">

一个方块可以标记多个标签。供电和供水用的是通用的 `机器`、`反应仓` 标签，所以每台反应仓都要同时标记三个标签，以生产福鲁伊克斯水晶的反应仓为例，要贴 `机器`、`反应仓` 和 `福鲁伊克斯水晶反应仓`。

</div>

<div class="note">

也可以使用 AE2 原版的压印器或其他机器粉碎水晶，但需要注意代码中访问的面可能需要调整。

</div>

## 程序

```sfml
name "福鲁伊克斯/恩特罗水晶复制"


every 1 ticks do -- 供电
    input fe:: from "电源" bottom side
    output fe:: to "机器" bottom side
end


every redstone pulse do -- 反应仓供水
    input fluid:minecraft:water from "水源" bottom side
    output fluid:: to "反应仓" bottom side
end


every redstone pulse do -- 福鲁伊克斯水晶
    -- 原材料
    input ae2:certus_quartz_crystal from "存储" bottom side
    output retain 64 ae2:certus_quartz_crystal to each "充能赛特斯石英水晶反应仓" bottom side

forget

    input ae2:fluix_crystal from "存储" bottom side
    output retain 64 ae2:fluix_crystal to each "福鲁伊克斯水晶粉碎机" bottom side

forget

    -- 生产福鲁伊克斯水晶
    input ae2:charged_certus_quartz_crystal from "充能赛特斯石英水晶反应仓" bottom side
    input ae2:fluix_dust from "福鲁伊克斯水晶粉碎机" bottom side
    output retain 64 each to each "福鲁伊克斯水晶反应仓" bottom side

forget

    -- 收取
    input ae2:fluix_crystal from "福鲁伊克斯水晶反应仓" bottom side
    output ae2:fluix_crystal to "存储" bottom side
end


every redstone pulse do -- 恩特罗水晶
    -- 原材料
    input extendedae:entro_crystal from "存储" bottom side
    output retain 64 extendedae:entro_crystal to each "恩特罗水晶粉碎机" bottom side

forget

    -- 生产恩特罗水晶
    input extendedae:entro_dust from "恩特罗水晶粉碎机" bottom side
    input retain 64 ae2:fluix_crystal from "存储" bottom side -- 存储里始终保留至少 64 个福鲁伊克斯水晶，防止耗尽导致停产
    output retain 64 each to each "恩特罗水晶反应仓" bottom side

forget

    -- 收取
    input extendedae:entro_crystal from "恩特罗水晶反应仓" bottom side
    output extendedae:entro_crystal to "存储" bottom side
end
```

<div class="note">

这份程序假设赛特斯石英水晶的产量大于反应仓的消耗量，如果你的赛特斯石英水晶产量较低，则需要调整代码或使用容量更小的容器存储产物（比如插了降级插件的抽屉）。

</div>

### 解析

除去第一行的程序名，整个程序由四个触发器组成。前两个触发器的目的很明确：为需要供电的机器供电，以及为所有的反应仓供水：

```sfml
every 1 ticks do -- 供电
    input fe:: from "电源" bottom side -- 需要保证输入端的供电速率，否则可能会出现部分机器没电的情况
    output fe:: to "机器" bottom side  -- 向所有标记了“机器”的方块输电
end


every redstone pulse do -- 反应仓供水，同样要保证供给速率，可以用水槽或者 SFM 自带的蓄水槽
    input fluid:minecraft:water from "水源" bottom side
    output fluid:: to "反应仓" bottom side
end
```

接下来是福鲁伊克斯水晶的生产：

```sfml
every redstone pulse do
    -- 原材料
    input ae2:certus_quartz_crystal from "存储" bottom side
    output retain 64 ae2:certus_quartz_crystal to each "充能赛特斯石英水晶反应仓" bottom side

forget

    input ae2:fluix_crystal from "存储" bottom side
    output retain 64 ae2:fluix_crystal to each "福鲁伊克斯水晶粉碎机" bottom side

forget

    -- 生产福鲁伊克斯水晶
    input ae2:charged_certus_quartz_crystal from "充能赛特斯石英水晶反应仓" bottom side
    input ae2:fluix_dust from "福鲁伊克斯水晶粉碎机" bottom side
    output retain 64 each to each "福鲁伊克斯水晶反应仓" bottom side

forget

    -- 收取
    input ae2:fluix_crystal from "福鲁伊克斯水晶反应仓" bottom side
    output ae2:fluix_crystal to "存储" bottom side
end
```

由于福鲁伊克斯水晶的生产配方需要输入两种物品，而反应仓只有 9 格输入，如果像以往那样直接向对应的反应仓输入两种物品而不加以控制，很容易使反应仓被其中一种原料填满，导致无法合成。所以需要一种能够控制反应仓内物品数量的方法，那就是 [`RETAIN`](ch05-03-quantity-retain.md)：

```sfml
input ae2:charged_certus_quartz_crystal from "充能赛特斯石英水晶反应仓" bottom side
input ae2:fluix_dust from "福鲁伊克斯水晶粉碎机" bottom side
output retain 64 each to each "福鲁伊克斯水晶反应仓" bottom side
```

在这一段代码中，我们从生产充能赛特斯石英水晶的反应仓和福鲁伊克斯水晶粉碎机中输入充能赛特斯石英水晶和福鲁伊克斯粉，输出到每一台生产福鲁伊克斯水晶的反应仓中，并让每台反应仓里的每种物品都补到 64 个。

前两行很好理解，第三行乍一看可能有点懵。不要害怕，我们把它拆开来看。在[数量与 RETAIN](ch05-03-quantity-retain.md) 一节中我们讲过，`RETAIN` 出现在 `OUTPUT` 中时，表示目的地中的资源**最多补到**多少个，目的地里已有的也算在内。比如反应仓里已经有 50 个，这次最多只会再放进 14 个。`RETAIN` 的数字后面还可以加上 `EACH`，表示按**每种**资源分别计数。数字后面本该写上资源，这里省略了，默认就是所有物品（`*`，完整写法是 `sfm:item:*:*`）。所以 `retain 64 each` 的完整写法是 `retain 64 each *`，意思是：每种物品都补到 64 个。

接着是 `to each "福鲁伊克斯水晶反应仓"`。在第 4.5 节（[EACH：逐个方块计数](ch04-05-each-label.md)）中我们讲过，`EACH` 出现在标签前时，`TO` 前面的数量和保留量会对具有该标签的每一个方块**分别计算**。所以这部分的意思是：每一台生产福鲁伊克斯水晶的反应仓，都各自补到 64 个。

把这些结合到一起，就得到了最开始的解释：从生产充能赛特斯石英水晶的反应仓和福鲁伊克斯水晶粉碎机中输入充能赛特斯石英水晶和福鲁伊克斯粉，输出到每一台生产福鲁伊克斯水晶的反应仓中，并让每台反应仓里的每种物品都补到 64 个。

<div class="warning">

不要忘记 `FORGET`。如果没有 `FORGET`，`output retain 64 each to each "福鲁伊克斯水晶反应仓" bottom side` 将会从此前所有的输入中提取物品！

</div>

生产恩特罗水晶的代码和生产福鲁伊克斯水晶的几乎一致，只是原料有所不同。不过你可能会注意到有一行不一样的地方：

```sfml
input extendedae:entro_dust from "恩特罗水晶粉碎机" bottom side
input retain 64 ae2:fluix_crystal from "存储" bottom side -- 存储里始终保留至少 64 个福鲁伊克斯水晶，防止耗尽导致停产
output retain 64 each to each "恩特罗水晶反应仓" bottom side
```

输入福鲁伊克斯水晶时加入了 `retain 64` 作为保留量。生产恩特罗水晶需要用到上一条产线的产物福鲁伊克斯水晶，而福鲁伊克斯产线自己也要消耗福鲁伊克斯水晶（粉碎成粉）。如果恩特罗产线把水晶全部取走，两条产线都会停工。加上保留量后，存储中的福鲁伊克斯水晶只有**超出 64 个的部分**才会被恩特罗产线使用。

<div class="note">

按照上面的配方，福鲁伊克斯产线（先粉碎成粉）和恩特罗产线每次合成都要用到 32 个福鲁伊克斯水晶，所以保留量至少设为 64。把这个数值调大会更保险。

</div>
