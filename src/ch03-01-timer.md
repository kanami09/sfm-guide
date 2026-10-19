# 定时触发器

## 基本写法

```sfml
EVERY 20 TICKS DO
    INPUT FROM a
    OUTPUT TO b
END
```

`EVERY <数字> <单位> DO ... END`：每隔指定的时间执行一次语句块。

| 单位 | 含义 |
|---|---|
| `TICK` / `TICKS` | 游戏刻。单复数完全等价，`EVERY 5 TICK` 也合法 |
| `SECOND` / `SECONDS` | 秒，编译时乘以 20 换算成刻 |

```sfml
EVERY 20 TICKS DO END      -- 每 20 刻
EVERY 1 SECOND DO END      -- 同上，1 × 20 = 20 刻
EVERY 5 SECONDS DO END     -- 每 100 刻
EVERY 300 SECONDS DO END   -- 每 5 分钟
```

**数字可以省略**，省略时按 1 计算：

```sfml
EVERY SECOND DO END   -- 1 秒 = 20 刻
```

`EVERY TICK DO`（每刻执行）在语法上也合法，但是否能通过编译要看下面的**最小间隔**规则。

<div class="note">

**提示**：“秒”是按每秒 20 刻换算的游戏时间。服务器卡顿（TPS 低于 20）时，现实中的间隔会相应变长。

</div>

## 最小间隔

为了防止程序拖垮服务器，SFM 在编译时检查每个定时触发器的间隔：

| 情况 | 默认最小间隔 | 服务器配置项 |
|---|---|---|
| 一般情况 | **20 刻** | `timerTriggerMinimumIntervalInTicks` |
| 触发器内所有 `INPUT`/`OUTPUT` 只涉及 Forge 能量（`fe::` 等，在部分 MC 版本上也包括 `mekanism_energy`） | **1 刻** | `timerTriggerMinimumIntervalInTicksWhenOnlyForgeEnergyIOStatementsPresent` |

间隔小于最小值时编译失败，错误信息是 *"Minimum trigger interval is N ticks."*。

```sfml
-- ✅ 只搬能量，可以每刻执行
EVERY TICK DO
    INPUT fe:: FROM generator
    OUTPUT fe:: TO machine
END
```

```sfml,ignore
-- ❌ 语法正确，但会编译失败：搬物品的触发器默认至少要间隔 20 刻
EVERY 5 TICKS DO
    INPUT FROM a
    OUTPUT TO b
END
```

<div class="warning">

**注意**：判断“是否只涉及能量”时，看的是触发器内**每一条**输入/输出语句里写明的资源（`IF` 分支内的语句也算）。**不写资源的语句默认匹配物品**。所以下面这个触发器不算“只涉及能量”，不能每刻执行：

```sfml,ignore
EVERY TICK DO
    INPUT fe:: FROM generator
    OUTPUT TO machine        -- 没写资源 = 物品，因此最小间隔回到 20 刻
END
```

更何况这个 `OUTPUT` 只会接收物品，根本不会搬运能量（见[资源类型](ch05-02-resource-types.md)）。

</div>

<div class="source">

**源码依据**：`ASTBuilder.visitTimerTrigger()` 根据 `TimerTrigger.usesOnlyForgeEnergyResourceIO()` 选择最小间隔，并在 `time.ticks() < minInterval` 时抛出异常（[ASTBuilder.java][astbuilder]、[TimerTrigger.java][timer]）。默认值见 [SFMServerConfig.java][config]。

</div>

## 管理器时钟与全局时钟

定时触发器是否执行，取决于下面这个判断（[Interval.java][interval]）：

```text
时钟 % 间隔 == 偏移量
```

其中“时钟”有两种：

| 对齐方式 | 写法 | 时钟来源 |
|---|---|---|
| **本地**（默认） | `EVERY 20 TICKS` | 管理器自己的计数器：管理器每运行一刻加 1 |
| **全局** | `EVERY 20 GLOBAL TICKS` | 世界的游戏时间（`level.getGameTime()`） |

本地时钟的特点：

- 管理器刚放下时从 0 开始计数；
- 管理器**从存档加载时**（比如进入世界、区块重新加载），计数器会被设成一个**随机值**。这样做是为了让大量管理器不要都挤在同一刻执行。

全局时钟的特点是**所有管理器看到的是同一个时钟**。如果你希望几台管理器严格同步（或者严格错开），就用全局时钟。

```sfml
EVERY 20 GLOBAL TICKS DO END   -- 世界时间每到 20 的倍数时执行
EVERY 20G TICKS DO END         -- 简写：数字后紧跟 g/G
EVERY 20 G TICKS DO END        -- G 也可以分开写
```

## 偏移量

在间隔后面加上 `PLUS n`（或 `+ n`），表示在“`时钟 % 间隔`等于 `n` 的那一刻”执行，而不是等于 0 的那一刻：

```sfml
EVERY 20 PLUS 1 TICKS DO END          -- 本地时钟
EVERY 20 GLOBAL PLUS 1 TICKS DO END   -- 全局时钟
EVERY 20+1 TICKS DO END               -- 简写（这不是数学运算！）
EVERY 20G+1 TICKS DO END              -- 全局 + 偏移
EVERY 20 GLOBAL + 1 TICKS DO END      -- 混合写法也行
EVERY 20 G PLUS 1 TICKS DO END
```

单位是秒时，偏移量**同样按秒计算**并乘以 20：

```sfml
EVERY 20+10 SECONDS DO END   -- 每 400 刻，偏移 200 刻
```

偏移量的典型用途是**错开**多个全局对齐的触发器，避免它们挤在同一刻执行：

```sfml
EVERY 20G+0 TICKS DO
    INPUT FROM a
    OUTPUT TO b
END

EVERY 20G+10 TICKS DO
    INPUT FROM c
    OUTPUT TO d
END
```

<div class="warning">

**偏移量的两个陷阱**

1. **偏移量必须小于间隔。** 判断条件是 `时钟 % 间隔 == 偏移量`，而余数一定小于间隔，所以 `EVERY 20 PLUS 20 TICKS` **永远不会执行**。编译器不会对此报错或警告。

2. **带偏移量的本地时钟触发器，在重新加载后可能长期不执行。** 按 4.34.0 的源码，管理器加载时计数器被设为 `level.random.nextInt()`，这个值可能是**负数**；而 Java 中负数取余的结果是负数或 0（例如 `-7 % 20 == -7`），永远不会等于正的偏移量。计数器每刻只加 1，从一个随机负数增长到 0 需要的时间可能以年计。不带偏移量的触发器（偏移量为 0）不受影响，因为余数 0 照样会出现。

**建议：需要偏移量时一律用全局时钟**（`EVERY 20G+5 TICKS`）。世界游戏时间不会是负数，不存在这个问题。

</div>

<div class="source">

**源码依据**：`Interval.shouldTick()`：`LOCAL -> manager.getTick() % ticks == offset`，`GLOBAL -> level.getGameTime() % ticks == offset`（[Interval.java][interval]）。`ManagerBlockEntity.loadAdditional()` 中执行 `this.tick = level.random.nextInt();`。“秒”单位下的偏移量乘以 20 是 4.24.0 修复的问题。

</div>

## 语法总结

```antlr
interval : NUMBER? GLOBAL? (PLUS NUMBER)? (TICKS | TICK | SECONDS | SECOND)
         | NUMBER_WITH_G_SUFFIX (PLUS NUMBER)? (TICKS | TICK | SECONDS | SECOND)
         ;
GLOBAL   : G L O B A L | G ;
PLUS     : '+' | P L U S ;
```

| 写法 | 间隔（刻） | 时钟 | 偏移（刻） |
|---|---|---|---|
| `EVERY TICK` | 1 | 本地 | 0 |
| `EVERY 20 TICKS` | 20 | 本地 | 0 |
| `EVERY SECOND` | 20 | 本地 | 0 |
| `EVERY 3 SECONDS` | 60 | 本地 | 0 |
| `EVERY 20 GLOBAL TICKS` / `EVERY 20G TICKS` | 20 | 全局 | 0 |
| `EVERY 20 PLUS 5 TICKS` / `EVERY 20+5 TICKS` | 20 | 本地 | 5 |
| `EVERY 20G+5 TICKS` | 20 | 全局 | 5 |
| `EVERY 2+1 SECONDS` | 40 | 本地 | 20 |

<div class="version">

**版本**：`GLOBAL` / `G` 和偏移量从 4.20.0 开始提供；`EVERY TICK DO` 写法从 4.16.0 开始提供；`SECOND`（单数）的 ×20 换算在 4.22.0 修复。

</div>

[astbuilder]: https://github.com/TeamDman/SuperFactoryManager/blob/e9755fa9be3b9ccb1adb0ada36fd9b13422e1f82/platform/minecraft/projections/sfm-4.34.0/mc-1.21.1/src/main/java/ca/teamdman/sfml/ast/ASTBuilder.java
[timer]: https://github.com/TeamDman/SuperFactoryManager/blob/e9755fa9be3b9ccb1adb0ada36fd9b13422e1f82/platform/minecraft/projections/sfm-4.34.0/mc-1.21.1/src/main/java/ca/teamdman/sfml/ast/TimerTrigger.java
[interval]: https://github.com/TeamDman/SuperFactoryManager/blob/e9755fa9be3b9ccb1adb0ada36fd9b13422e1f82/platform/minecraft/projections/sfm-4.34.0/mc-1.21.1/src/main/java/ca/teamdman/sfml/ast/Interval.java
[config]: https://github.com/TeamDman/SuperFactoryManager/blob/e9755fa9be3b9ccb1adb0ada36fd9b13422e1f82/platform/minecraft/projections/sfm-4.34.0/mc-1.21.1/src/main/java/ca/teamdman/sfm/common/config/SFMServerConfig.java
