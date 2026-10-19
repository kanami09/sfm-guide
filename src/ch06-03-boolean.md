# 布尔逻辑与优先级

## 运算符

| 写法 | 含义 |
|---|---|
| `TRUE` / `FALSE` | 布尔常量 |
| `NOT x` | 取反 |
| `x AND y` | 与：两者都为真 |
| `x OR y` | 或：至少一个为真 |
| `( x )` | 括号，改变结合顺序 |

```sfml
EVERY 20 TICKS DO
    INPUT FROM source
    IF
        NOT source HAS > 20 stone
        AND source HAS GE 20 cobblestone
    THEN
        OUTPUT 20 TO dest2
    END
END
```

## 优先级：NOT > AND > OR

<div class="warning">

**`NOT`、`AND`、`OR` 的优先级并不相同。**

仓库 `examples/03-conditions.sfm` 的注释写着 “not, and, and or operators all have same precidence”（三者优先级相同），这个说法与 4.34.0 的实际语法**不符**。

`SFML.g4` 中 `boolexpr` 是 ANTLR 4 的左递归规则，备选分支按书写顺序决定优先级：先写的优先级更高。其顺序是 `NOT`、`AND`、`OR`，所以：

- `NOT` 优先级最高；
- `AND` 高于 `OR`。

本书作者用 SFM 构建时所用的 ANTLR 4.9.1 生成解析器做了实测，结果如下：

| 表达式 | 实际结合方式 |
|---|---|
| `NOT TRUE AND FALSE` | `(NOT TRUE) AND FALSE` |
| `A OR B AND C` | `A OR (B AND C)` |
| `NOT A OR B` | `(NOT A) OR B` |

</div>

所以，下面两个条件是**不同**的：

```sfml
EVERY 20 TICKS DO
    IF a HAS GT 0 stone OR (b HAS GT 0 dirt AND REDSTONE GE 1) THEN END
    IF (a HAS GT 0 stone OR b HAS GT 0 dirt) AND REDSTONE GE 1 THEN END
END
```

第一个不加括号写成 `a HAS GT 0 stone OR b HAS GT 0 dirt AND REDSTONE GE 1`，含义与之相同。

**建议**：混用 `AND` 和 `OR` 时，**始终加括号**。仓库示例里的建议也是：*use parentheses to ensure things work as you expect*。

## 短路求值

`AND` 和 `OR` 都是**短路**求值：`A AND B` 中 `A` 为假时，不会再计算 `B`；`A OR B` 中 `A` 为真时，不会再计算 `B`。一般情况下这只影响性能，但如果条件里用了 [`ROUND ROBIN`](ch04-08-round-robin.md)，就会影响轮询是否前进。

## 陷阱：HAS 中的 OR 与条件间的 OR

`OR` 在 SFML 里有**两种**用法：

1. **资源析取**：`a HAS GT 5 stone OR dirt`，统计石头和泥土的**合计**数量；
2. **布尔或**：`a HAS GT 5 stone OR b HAS GT 5 dirt`，两个条件满足其一即可。

解析器会尽量把 `OR` 后面的内容读成资源。只要 `OR` 后面的单词**能被当作资源名**，并且之后的内容仍然合法，它就会被当成资源析取。最容易出问题的是 `REDSTONE`，它既是条件关键字，也是合法的资源名（物品“红石粉”）：

```sfml
EVERY 20 TICKS DO
    -- ⚠️ 被解析成：a 中“石头或红石粉”的合计数量 > 1
    IF a HAS GT 1 stone OR redstone THEN
        INPUT FROM a
        OUTPUT TO b
    END
END
```

如果你的本意是“石头多于 1 个，**或者**有红石信号”，必须用括号把 `HAS` 表达式括起来：

```sfml
EVERY 20 TICKS DO
    IF (a HAS GT 1 stone) OR REDSTONE THEN
        INPUT FROM a
        OUTPUT TO b
    END
END
```

（`REDSTONE` 单独使用的含义，见下一节。）

<div class="source">

**源码依据**：上面两段代码的解析树都由本书的检查工具实际生成。第一段中，`stone OR redstone` 被解析为 `resourceIdDisjunction`；第二段中，`OR` 被解析为 `BooleanDisjunction`。

</div>

## 语法

```antlr
boolexpr : TRUE                       #BooleanTrue
         | FALSE                      #BooleanFalse
         | LPAREN boolexpr RPAREN     #BooleanParen
         | NOT boolexpr               #BooleanNegation
         | boolexpr AND boolexpr      #BooleanConjunction
         | boolexpr OR boolexpr       #BooleanDisjunction
         | setOp? labelAccess HAS comparisonOp number resourceIdDisjunction? with? (EXCEPT resourceIdList)?  #BooleanHas
         | REDSTONE (comparisonOp number)?   #BooleanRedstone
         ;
```
