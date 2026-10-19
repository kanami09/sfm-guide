# 资源类型

## 可用的资源类型

资源标识符的前两段是**资源类型**。4.34.0 内置的资源类型如下：

| 资源类型 | 常用写法 | 数量单位 | 说明 |
|---|---|---|---|
| `sfm:item` | `stone`、`*`（默认） | 个 | 物品 |
| `sfm:fluid` | `fluid::` | mB（1000 mB = 1 桶） | 流体 |
| `sfm:forge_energy` | `fe::`、`forge_energy::` | FE | Forge 能量（RF），别名 `fe`、`rf`、`energy`、`power` |
| `sfm:redstone` | — | — | 见下文说明 |

安装了 **Mekanism** 时，还会注册以下资源类型，具体取决于 Minecraft 版本：

| MC 版本 | 额外的资源类型 |
|---|---|
| 1.19.2 ~ 1.20.3 | `gas`、`infusion`、`pigment`、`slurry`、`mekanism_energy` |
| 1.20.4、1.21.0 | `gas`、`infusion`、`pigment`、`slurry` |
| 1.21.1、26.1.2 | `chemical`，以及作为它的**别名**的 `gas`、`infusion`、`pigment`、`slurry` |

<div class="version">

**版本**：Mekanism 10.7（对应 MC 1.21.1）把气体、灌注、颜料、浆液统一成了“化学品（chemical）”，SFM 4.19.0 随之把 `gas::`、`infusion::` 等改为 `chemical::` 的别名。所以在 1.21.1 上，`gas::` 和 `chemical::` 是同一种资源类型。`mekanism_energy` 只在较早的版本上可用，它允许单次操作搬运超过 `int` 范围的能量。新版本中，Mekanism 的能量直接用 `fe::` 搬运。

</div>

<div class="note">

**提示**：你的游戏里实际能用哪些资源类型，以模组内置示例 “**Fluids and other resource types**” 末尾自动生成的列表为准。服务器可以通过配置项 `disallowedResourceTypesForTransfer` 禁用某些资源类型，被禁用的类型不会出现在这个列表里。

</div>

## 不写资源 = 只有物品

<div class="warning">

**这是 SFML 中最常见的错误之一。**

`INPUT FROM a` 和 `OUTPUT TO b` 在不写资源时，默认的资源是“**所有物品**”（`sfm:item:.*:.*`），**不包括**流体、能量和化学品。

所以要搬其他类型的资源，**`INPUT` 和 `OUTPUT` 两边都要写明资源类型**：

```sfml
EVERY 20 TICKS DO
    INPUT fluid:: FROM a
    OUTPUT fluid:: TO b
END
```

只在一边写是没用的：

```sfml
EVERY 20 TICKS DO
    INPUT fluid:: FROM a   -- 登记了流体来源
    OUTPUT TO b            -- 但这里只接收物品，结果一滴也不搬
END
```

SFM 会对第二种写法给出警告：输入的流体没有被后续的输出消费，输出的物品没有对应的输入。

</div>

<div class="source">

**源码依据**：默认的“全部匹配”是 `ResourceIdentifier.MATCH_ALL = new ResourceIdentifier<>(".*", ".*")`，这个两参数构造函数固定使用 `sfm:item` 类型（[ResourceIdentifier.java][rid]）。`OutputStatement.gatherSlots()` 只为 `resourceLimits.getReferencedResourceTypes()` 中出现的资源类型收集槽位。

</div>

## 资源类型不能用通配符

资源标识符的**资源类型部分必须是确定的名字**，不能用通配符。`*::`（“所有类型的所有资源”）这种写法会导致编译错误：

```text
Program has a malformed resource type "...".
Reminder: Resource types must be literals, not wildcards.
```

写错资源类型名（比如把 `fluid::` 拼成 `fluids::`）会得到 *Program references an unknown resource type*；使用了被服务器禁用的资源类型，会得到 *Program references a disallowed resource type*。

## 混合多种资源类型

一条语句里可以同时写多种资源类型：

```sfml
EVERY 20 TICKS DO
    INPUT *, fluid::, fe:: FROM machine BOTTOM SIDE
    OUTPUT *, fluid::, fe:: TO buffer
END
```

不过要注意：

- **能量**语句可以每刻执行（见[最小间隔](ch03-01-timer.md#最小间隔)），但只要触发器里还有其他类型的资源，最小间隔就回到 20 刻。所以能量通常**单独放在一个触发器里**；
- 和 `ROUND ROBIN` 一起用时，混合资源类型会让轮询“多走几步”（见 [ROUND ROBIN](ch04-08-round-robin.md)）。

## 各种资源类型的写法示例

### 流体

```sfml
EVERY 20 TICKS DO
    INPUT fluid:minecraft:water FROM pump BOTTOM SIDE
    OUTPUT fluid:*:* TO tank TOP SIDE
END
```

```sfml
EVERY 20 TICKS DO
    INPUT fluid:: FROM tanks
    OUTPUT RETAIN 1000 fluid::water TO EACH machine   -- 每台机器最多 1 桶水
END
```

### 能量

```sfml
EVERY TICK DO
    INPUT fe:: FROM generator
    OUTPUT fe:: TO "flux cell" EACH SIDE
END
```

### Mekanism 化学品（1.21.1）

```sfml
EVERY 20 TICKS DO
    INPUT chemical::hydrogen FROM electrolytic_separator RIGHT SIDE
    OUTPUT chemical:: TO gas_tank
END
```

<div class="warning">

**Mekanism 的面配置**：Mekanism 的机器**无方向访问时只读**，并且每个面只暴露“面配置”里设置好的内容。在 Mekanism 方块上做输入输出时，**一定要写方向**，并且要和机器的面配置一致。否则 SFM 会给出警告：*Mekanism blocks are read-only from the null direction* 或 *Mekanism block side config at ... doesn't agree with statement*。

</div>

## 关于 `sfm:redstone`

资源类型注册表里有一个 `sfm:redstone`，所以它也会出现在自动生成的资源类型列表中。但在 4.34.0 中，这个资源类型的**插入和抽取方法都固定返回 0**，不能用来搬运任何东西。它和红石条件 `IF REDSTONE ...`、物品 `redstone`（红石粉）**都没有关系**。

```sfml
EVERY 20 TICKS DO
    INPUT redstone FROM a    -- 这是物品“红石粉”（一段式写法 = 物品）
    OUTPUT TO b
END
```

## 第三方资源类型

资源类型是一个注册表，其他模组也可以向其中注册自己的资源类型。这时资源类型的命名空间就不是 `sfm`，需要用四段式完整写法：`<模组ID>:<类型名>:<命名空间>:<名字>`。

[rid]: https://github.com/TeamDman/SuperFactoryManager/blob/e9755fa9be3b9ccb1adb0ada36fd9b13422e1f82/platform/minecraft/projections/sfm-4.34.0/mc-1.21.1/src/main/java/ca/teamdman/sfml/ast/ResourceIdentifier.java
