# 程序结构

## 总体结构

一个 SFML 程序由两部分组成：

```text
程序 = [程序名]  触发器*
```

对应语法文件中的规则：

```antlr
program : name? trigger* EOF;
name    : NAME string ;
```

也就是说：

1. **程序名**可以不写；如果写，必须放在最前面，并且只能写一次；
2. 程序名之后是**零个或多个触发器**；
3. 除了程序名和触发器，顶层不能出现别的东西。语句必须写在触发器内部。

```sfml
NAME "示例程序"     -- 可选，必须在最前面

EVERY 20 TICKS DO   -- 触发器 1
    INPUT FROM a
    OUTPUT TO b
END

EVERY REDSTONE PULSE DO   -- 触发器 2
    INPUT FROM c
    OUTPUT TO d
END
```

<div class="note">

**提示**：一个程序可以包含多个触发器，它们彼此独立。每个触发器有自己的执行间隔，在一个触发器里登记的 `INPUT` 不会影响其他触发器。

</div>

下面这个程序把语句直接写在了顶层，因此无法通过解析：

```sfml,error
INPUT FROM a
OUTPUT TO b
```

## 触发器与语句块

触发器的形式是 `EVERY ... DO 语句块 END`，目前有两种：

```antlr
trigger : EVERY interval DO block END           // 定时触发器
        | EVERY REDSTONE PULSE DO block END     // 红石脉冲触发器
        ;
```

**语句块**（block）是零条或多条语句，按书写顺序执行。语句共四种：

```antlr
block     : statement* ;
statement : inputStatement     // INPUT ...
          | outputStatement    // OUTPUT ...
          | ifStatement        // IF ... THEN ... END
          | forgetStatement    // FORGET ...
          ;
```

| 语句 | 作用 | 章节 |
|---|---|---|
| `INPUT` | 登记来源 | [第 4 章](ch04-01-io-model.md) |
| `OUTPUT` | 从已登记的来源搬到目的地 | [第 4 章](ch04-01-io-model.md) |
| `FORGET` | 撤销已登记的来源 | [4.7 节](ch04-07-forget.md) |
| `IF` | 条件分支，分支内部又是语句块 | [第 6 章](ch06-01-if.md) |

语句块可以为空，这样写是合法的（虽然没什么用）：

```sfml
EVERY 20 TICKS DO
END
```

## 空白、换行与缩进

SFML **不在乎空白和换行**。空格、制表符和换行在词法分析阶段就被丢弃了（语法文件中的 `WS ... -> channel(HIDDEN)`）。因此：

- 没有语句分隔符，不需要也**不允许**写分号；
- 一条语句可以拆成多行，几条语句也可以挤在一行；
- 缩进只是为了方便阅读。

下面三种写法完全等价：

```sfml
EVERY 20 TICKS DO INPUT FROM a OUTPUT TO b END
```

```sfml
EVERY 20 TICKS DO
    INPUT FROM a
    OUTPUT TO b
END
```

```sfml
EVERY 20 TICKS DO
    INPUT
        5 iron_ingot,
        3 gold_ingot
    FROM a
    OUTPUT
    TO b
END
```

列表较长时，常见的写法是一行写一项，就像第三种那样。

## 注释

SFML 只有一种注释：从 `--` 开始到行尾。

```sfml
-- 这是一行注释
EVERY 20 TICKS DO   -- 行尾注释
    INPUT FROM a
    ---- 多写几个短横线也没关系，常用来做分隔线
    OUTPUT TO b
END
```

SFML **没有块注释**。要注释掉多行，在编辑器里选中这些行再按 `Ctrl + /`。

## 尾随逗号

有几种列表允许在最后一项后面多写一个逗号，方便增删行：

| 列表 | 是否允许尾随逗号 |
|---|---|
| 资源限额列表（`INPUT 5 stone, 3 dirt, FROM a`） | ✅ |
| `EXCEPT` 后的资源列表 | ✅ |
| `FORGET` 后的标签列表 | ✅ |
| `OR` 连接的资源（`stone OR dirt OR`） | ✅（尾随的是 `OR`） |
| 标签列表（`FROM a, b`） | ❌ |
| 方向列表（`TOP, BOTTOM SIDE`） | ❌ |
| 槽位列表（`SLOTS 0, 1`） | ❌ |

```sfml
EVERY 20 TICKS DO
    INPUT
        5 stone,
        3 iron_ingot,
        cobblestone,   -- 尾随逗号，合法
    FROM a
    OUTPUT TO b
END
```

```sfml,error
EVERY 20 TICKS DO
    INPUT FROM a, b,   -- 标签列表不允许尾随逗号
    OUTPUT TO c
END
```

## 语句的两种语序

`INPUT` 和 `OUTPUT` 都有两种等价的语序。除了常见的“动词在前”，也可以“方位在前”：

```sfml
EVERY 20 TICKS DO
    -- 常规写法
    INPUT 5 stone FROM a TOP SIDE
    OUTPUT TO b

    -- 倒装写法，含义相同
    FROM a TOP SIDE INPUT 5 stone
    TO b OUTPUT
END
```

对应的语法规则：

```antlr
inputStatement  : INPUT inputResourceLimits? resourceExclusion? FROM EACH? labelAccess
                | FROM EACH? labelAccess INPUT inputResourceLimits? resourceExclusion?
                ;
outputStatement : OUTPUT outputResourceLimits? resourceExclusion? TO emptyslots? EACH? labelAccess
                | TO emptyslots? EACH? labelAccess OUTPUT outputResourceLimits? resourceExclusion?
                ;
```

倒装写法很少有人用，本书其余部分一律使用常规写法。知道有这种写法，读别人的程序时就不会困惑。

## 执行顺序概览

完整的执行模型在[第 8 章](ch08-01-runtime.md)讲解，这里先给出最重要的几条：

1. 管理器**每个游戏刻**检查一遍所有触发器，按书写顺序依次判断“这一刻该不该执行”；
2. 一个触发器执行时，它的语句块**从上到下**依次执行；
3. 每个触发器有**独立的上下文**：在触发器 1 里登记的 `INPUT`，在触发器 2 里看不到；
4. `INPUT` 登记的来源在**同一个触发器内一直有效**，直到被 `FORGET` 撤销或触发器结束。写在 `IF` 分支里的 `INPUT` 也一样，`END` 之后仍然有效。

<div class="source">

**源码依据**：`Program.tick()` 遍历所有触发器，为每个要执行的触发器调用 `context.fork()` 创建独立的上下文（[Program.java][program]）；`InputStatement.tick()` 只是 `context.addInput(this)`（[InputStatement.java][input]）。

</div>

[program]: https://github.com/TeamDman/SuperFactoryManager/blob/e9755fa9be3b9ccb1adb0ada36fd9b13422e1f82/platform/minecraft/projections/sfm-4.34.0/mc-1.21.1/src/main/java/ca/teamdman/sfml/ast/Program.java
[input]: https://github.com/TeamDman/SuperFactoryManager/blob/e9755fa9be3b9ccb1adb0ada36fd9b13422e1f82/platform/minecraft/projections/sfm-4.34.0/mc-1.21.1/src/main/java/ca/teamdman/sfml/ast/InputStatement.java
