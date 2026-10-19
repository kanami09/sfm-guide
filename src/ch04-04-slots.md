# 槽位

## 写法

在标签访问的最后加上 `SLOTS <槽位列表>`，就只访问指定编号的槽位：

```sfml
EVERY 20 TICKS DO
    INPUT FROM a TOP, WEST SIDE SLOTS 0,1,3-4,7-9,21
    OUTPUT TO a BOTTOM SIDE SLOTS 2
END
```

- 槽位编号**从 0 开始**；
- 用逗号分隔多个槽位或范围；
- `a-b` 表示从 `a` 到 `b` 的闭区间，**包含两端**；
- 只有一个槽位时，可以写成单数的 `SLOT`，比如 `SLOT 5`。`SLOT` 和 `SLOTS` 完全等价。

```sfml
EVERY 20 TICKS DO
    INPUT FROM chest SLOT 5
    OUTPUT TO chest SLOT 9
END
```

不写槽位限定时，访问全部槽位。

<div class="version">

**版本**：单数形式 `SLOT` 从 4.27.0 开始提供。

</div>

## 槽位编号是“这个面上”的编号

<div class="warning">

**注意：槽位编号取决于你访问的是哪个面。**

SFML 的槽位编号是**物流能力（Capability）里的槽位编号**。对分面的容器来说，每个面暴露的是一个**子集**，并且这个子集会**重新从 0 开始编号**。

以原版熔炉为例（容器内部编号：0 原料、1 燃料、2 成品）：

| 访问的面 | 能看到的槽位 | SFML 中的编号 |
| --- | --- | --- |
| 无方向 | 原料、燃料、成品 | 0、1、2 |
| `TOP` | 原料 | 0 |
| `BOTTOM` | 成品、燃料 | 0（成品）、1（燃料） |
| 侧面 | 燃料 | 0 |

所以 `furnace BOTTOM SIDE SLOTS 2` 什么都匹配不到，SFM 会给出警告 *"Statement matches no slots"*。

</div>

确定槽位编号最可靠的办法：

1. 打开容器界面，按 `Ctrl + I` 打开**容器检查器**，它会按面列出每个非空槽位的编号；
2. 或者在编辑器里把光标放在 `INPUT` / `OUTPUT` 语句上按 `Ctrl + Space`，检查这条语句实际匹配到的槽位。

## 方向和槽位的顺序

槽位限定必须写在**方向限定之后**：

```sfml
EVERY 20 TICKS DO
    INPUT FROM a TOP SIDE SLOTS 0-8      -- ✅
    OUTPUT TO b
END
```

```sfml,error
EVERY 20 TICKS DO
    INPUT FROM a SLOTS 0-8 TOP SIDE      -- ❌ 顺序反了
    OUTPUT TO b
END
```

## 实例：AE2 压印器

AE2 压印器有三个槽位：上方的压印模板、中间的原料、下方的压印模板。模组内置示例 `ae2_inscribers.sfml` 用槽位把不同的材料放进正确的位置（节选）：

```sfml
EVERY 20 TICKS DO
    INPUT FROM materials

    OUTPUT RETAIN 2 gold_ingot TO EACH logic SLOTS 2
    OUTPUT RETAIN 2 diamond TO EACH engineering SLOTS 2
    OUTPUT RETAIN 2 silicon TO EACH silicon SLOTS 2

    OUTPUT RETAIN 2 redstone TO EACH last SLOTS 2
    OUTPUT RETAIN 2 printed_silicon TO EACH last SLOTS 1
END
```

完整的分析见[实战项目：AE2 压印器](ch07-05-ae2.md)。

## 槽位相关的警告

| 警告 | 含义 |
| --- | --- |
| *Statement matches no slots* | 指定的槽位在这个面上不存在 |
| *No slots support extraction* | 匹配到的槽位都不允许抽取（比如熔炉的成品槽不能从顶面取） |
| *No slots support insertion* | 匹配到的槽位都不允许插入 |

## 语法

```antlr
slotqualifier : (SLOTS | SLOT) rangeset ;
rangeset      : range (COMMA range)* ;
range         : number (DASH number)? ;
```

<div class="note">

**提示**：数字和 `-` 之间可以有空格，`SLOTS 0 - 8` 也合法，不过一般习惯写成 `0-8`。槽位列表**不允许尾随逗号**。

</div>
