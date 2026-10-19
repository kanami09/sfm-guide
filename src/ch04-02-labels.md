# 标签

## 标签是什么

**标签**（label）是用标签枪贴在方块上的名字。程序里不写坐标，只写标签，所以同一个程序可以用在不同的地方，换个地方重新贴一遍标签就行。

- 一个标签可以贴在**多个方块**上，`FROM chest` 表示“所有贴了 `chest` 的方块”；
- 一个方块也可以贴**多个标签**；
- 标签数据保存在**磁盘**上（贴完要推送）；
- 只有**连进管理器线缆网络**的方块才会被程序访问。

## 写法

单个标签：

```sfml
EVERY 20 TICKS DO
    INPUT FROM chest
    OUTPUT TO furnace
END
```

多个标签用逗号分隔：

```sfml
EVERY 20 TICKS DO
    INPUT FROM chest_a, chest_b, "storage c"
    OUTPUT TO furnace
END
```

需要加引号的情况（详见[词法](ch02-02-lexical.md)）：

- 包含空格、中文、`-`、`.` 等特殊字符：`"storage a"`、`"矿石箱"`；
- 以数字开头：`"1st_chest"`；
- 与关键字冲突：`"north"`、`"output"`。

<div class="warning">

**注意**：标签**区分大小写**，`Chest` 和 `chest` 是两个不同的标签。

</div>

## 多个标签的顺序

`FROM a, b` 中，标签的书写顺序就是访问顺序：先处理 `a` 对应的方块，再处理 `b` 对应的方块。对 `OUTPUT` 来说，这意味着**前面的标签优先被填满**：

```sfml
EVERY 20 TICKS DO
    INPUT FROM mob_drops
    OUTPUT TO main_storage, overflow_storage   -- 主仓库满了才会放进溢出仓库
END
```

同一个标签下有多个方块时，这些方块之间的先后顺序**没有保证**，不要依赖它。

## 给管理器本身贴标签

管理器也有物品栏（插磁盘的那个槽位），也能被程序访问。给管理器贴标签时，要按住“目标管理器”修饰键（默认**右 Alt**）再右键管理器，否则右键管理器会执行推送。

<div class="version">

**版本**：管理器可以和自己交互（作为输入输出对象）是 4.27.0 加入的。更新日志里给出了这样一个例子：用程序把管理器里的磁盘换掉。

```sfml
EVERY 20 TICKS DO
    INPUT FROM manager
    OUTPUT TO chest SLOT 0
FORGET
    INPUT disk FROM chest SLOT 1
    OUTPUT TO manager
END
```

</div>

## 标签相关的警告

| 警告 | 含义 |
| --- | --- |
| *Label "x" is used in code but not assigned in the world.* | 程序里用了 `x`，但世界中没有方块贴着它（或者忘了推送） |
| *Label "x" is assigned in the world but not defined in code.* | 世界中有方块贴着 `x`，但程序里没用到 |
| *Label "x" is assigned in the world at ... but not connected by cables.* | 贴了标签的方块没连进网络 |
| *Label "x" is assigned in the world at ... and is connected by cables but is not detected as a valid inventory.* | 方块连上了，但它没有任何 SFM 认识的能力，比如一块石头 |
| *Did you remember to push your labels using the label gun?* | 提醒你推送标签 |

## 语法

```antlr
labelAccess : label (COMMA label)* roundrobin? sidequalifier? slotqualifier? ;
label       : identifier   #RawLabel
            | string       #StringLabel
            ;
```

`roundrobin`、`sidequalifier`、`slotqualifier` 分别在 [ROUND ROBIN](ch04-08-round-robin.md)、[方向](ch04-03-sides.md)、[槽位](ch04-04-slots.md) 三节介绍。注意它们**只能出现一次**，并且**作用于前面列出的所有标签**：

```sfml
EVERY 20 TICKS DO
    INPUT FROM a, b TOP SIDE    -- a 和 b 都只访问顶面
    OUTPUT TO c
END
```

如果不同的标签要访问不同的面，就分开写成多条语句：

```sfml
EVERY 20 TICKS DO
    INPUT FROM a TOP SIDE
    INPUT FROM b BOTTOM SIDE
    OUTPUT TO c
END
```
