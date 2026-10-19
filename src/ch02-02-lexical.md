# 词法：关键字、标识符与字面量

词法规则决定一段文本会被切分成哪些“单词”（token）。在 SFML 里这件事格外重要，因为**同一个单词能不能当标签或物品名用**，完全取决于它是不是关键字。

## 大小写

**关键字不区分大小写。** 语法文件用 `fragment A : ('a' | 'A');` 这样的片段定义每个字母，所以 `EVERY`、`every`、`eVeRy` 都会被识别成同一个关键字。

**物品名等资源标识符也不区分大小写**，编译时会统一转成小写（见[资源标识符](ch05-01-resource-id.md)）。

**标签区分大小写。** 标签按原样以字符串保存（`Label(String name)`，查找时用的是普通的 `Map<String, ...>`），所以 `Chest` 和 `chest` 是**两个不同的标签**。

## 标识符

不加引号的名字（标签、物品名的各段、物品标签（tag）的各段）叫**标识符**，规则是：

```antlr
IDENTIFIER : [a-zA-Z_*][a-zA-Z0-9_*]* | '*';
```

- 第一个字符：英文字母、下划线 `_` 或星号 `*`；
- 后续字符：英文字母、数字、下划线或星号；
- 单独一个 `*` 也是标识符。

| 写法 | 是否合法 | 说明 |
| --- | --- | --- |
| `chest`、`my_chest_2` | ✅ | |
| `*ingot*` | ✅ | `*` 可以出现在任何位置，用作通配符 |
| `*` | ✅ | |
| `2x_chest` | ❌ | 不能以数字开头 |
| `ore-washer` | ❌ | `-` 不允许出现（它是槽位范围的符号） |
| `my.chest` | ❌ | `.` 不允许出现 |
| `箱子` | ❌ | 非 ASCII 字符不允许出现 |

不符合规则的名字**加双引号**就能用：`"2x_chest"`、`"ore-washer"`、`"箱子"`、`"storage a"`。

```sfml
EVERY 20 TICKS DO
    INPUT FROM "原料箱", "storage a"
    OUTPUT TO "成品箱"
END
```

```sfml,error
EVERY 20 TICKS DO
    INPUT FROM 原料箱   -- 中文标签必须加引号
    OUTPUT TO b
END
```

<div class="warning">

**注意**：引号的作用在**标签**和**资源标识符**上**不一样**。

- 对**标签**来说，`"a"` 和 `a` 完全相同，引号只是让你能写特殊字符。
- 对**资源标识符**来说，加了引号的字符串会被当成**正则表达式**，而且不会做 `*` → `.*` 的转换和自动转小写。详见[资源标识符](ch05-01-resource-id.md)。

</div>

## 关键字

下表列出 4.34.0 语法中的全部关键字（大小写任意）。

| 类别 | 关键字 |
| --- | --- |
| 程序与触发器 | `NAME` `EVERY` `DO` `END` `REDSTONE` `PULSE` |
| 时间 | `TICK` `TICKS` `SECOND` `SECONDS` `GLOBAL`（及其简写 `G`） `PLUS` |
| 输入输出 | `INPUT` `OUTPUT` `FROM` `TO` `FORGET` |
| 数量与排除 | `RETAIN` `EACH` `EXCEPT` |
| 物品标签（tag） | `WITH` `WITHOUT` `TAG` |
| 方向 | `TOP` `BOTTOM` `NORTH` `EAST` `SOUTH` `WEST` `LEFT` `RIGHT` `FRONT` `BACK` `NULL` `SIDE` |
| 槽位 | `SLOT` `SLOTS` `EMPTY` `IN` |
| 轮询 | `ROUND` `ROBIN` `BY` `LABEL` `BLOCK` |
| 条件 | `IF` `THEN` `ELSE` `HAS` `TRUE` `FALSE` `NOT` `AND` `OR` |
| 比较 | `GT` `LT` `EQ` `LE` `GE` |
| 集合运算 | `OVERALL` `SOME` `ONE` `LONE`（另外 `EVERY`、`EACH` 也用作集合运算符） |
| 保留未用 | `WHERE` |

完整的含义速查见[附录 A](appendix-01-keywords.md)。

### 能当名字用的关键字

为了方便，语法专门允许**一小部分**关键字出现在标识符的位置：

```antlr
identifier : (IDENTIFIER | REDSTONE | GLOBAL | SECOND | SECONDS
              | TOP | BOTTOM | LEFT | RIGHT | FRONT | BACK) ;
```

因此下面这些写法都合法：

```sfml
EVERY 20 TICKS DO
    INPUT redstone FROM top      -- 物品 redstone，标签 top
    OUTPUT TO left, right, g     -- g 会被识别成 GLOBAL 的简写，但这里也允许当标签
END
```

<div class="version">

**版本**：`redstone` 可以不加引号直接当物品名用，是 4.14.0 开始的。网上一些旧教程（以及仓库 `examples/01-moveitems.sfm` 里的旧注释）说“redstone 是关键字，必须加引号”，这个说法已经过时了。

</div>

### 不能当名字用的关键字

**除上面列出的以外，其他关键字都不能直接当标签或名字使用。** 比较容易撞上的有：

- 方向词：`north`、`south`、`east`、`west`、`null`、`side`；
- 两个字母的短词：`if`、`do`、`to`、`in`、`by`、`or`、`gt`、`lt`、`eq`、`le`、`ge`；
- 常见英文单词：`input`、`output`、`name`、`end`、`one`、`some`、`each`、`block`、`label`、`tag`、`slot`、`empty`、`round`。

```sfml,error
EVERY 20 TICKS DO
    INPUT FROM east     -- east 是关键字
    OUTPUT TO b
END
```

加上引号就没问题了：

```sfml
EVERY 20 TICKS DO
    INPUT FROM "east"
    OUTPUT TO "output"
END
```

<div class="note">

**为什么 `end_rod` 没问题？** 词法分析总是取**最长匹配**：`end_rod` 整体匹配 `IDENTIFIER`，比只匹配 `end` 的 `END` 更长，所以会被识别成标识符。只有当整个单词恰好等于某个关键字时，才会发生冲突。

</div>

## 数字

```antlr
NUMBER               : [0-9]+ ;
NUMBER_WITH_G_SUFFIX : [0-9]+[gG] ;
```

- 只有**非负整数**，没有小数，也没有负数；
- 数值按 64 位长整数（Java 的 `long`）解析；
- 带 `g`/`G` 后缀的数字（如 `20g`）只用在定时触发器里，表示“全局时钟对齐”，见[定时触发器](ch03-01-timer.md)。

## 字符串

```antlr
STRING : '"' (~'"'|'\\"')* '"' ;
```

- 用**双引号**括起来，没有单引号字符串；
- 字符串里要写双引号，用 `\"` 转义；
- 字符串用在三个地方：**程序名**（`NAME "..."`）、**标签**（`FROM "storage a"`）和**正则形式的资源标识符**（`INPUT ".*_ingot" FROM a`）。

## 符号

| 符号 | 用途 |
| --- | --- |
| `,` | 分隔列表项 |
| `:` | 分隔资源标识符或物品标签（tag）的各段 |
| `/` | 分隔物品标签（tag）路径（如 `#c:ingots/iron`） |
| `-` | 槽位范围（如 `SLOTS 0-8`） |
| `#` | 物品标签（tag）前缀（如 `WITH #c:ingots`） |
| `(` `)` | 改变布尔表达式或 `WITH` 子句的结合顺序 |
| `>` `<` `=` `>=` `<=` | 比较运算符，分别等价于 `GT` `LT` `EQ` `GE` `LE` |
| `+` | `PLUS` 的简写，用于定时触发器的偏移量 |
| `--` | 行注释 |

## 编译期限制

除了词法和语法，编译时还会检查以下限制：

| 限制 | 值 | 来源 |
| --- | --- | --- |
| 标签最大长度 | 256 个字符 | `Program.MAX_LABEL_LENGTH` |
| 程序最大长度 | 约 32,000 个字符（受网络数据包大小限制） | `Program.MAX_PROGRAM_LENGTH` |
| 定时触发器最小间隔 | 默认 20 刻（可配置） | 见[定时触发器](ch03-01-timer.md) |
| 正则表达式 | 必须能被 Java 正则引擎编译 | `ResourceIdentifier.assertValid()` |
