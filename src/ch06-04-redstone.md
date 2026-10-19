# REDSTONE 条件

## 写法

```sfml
EVERY 20 TICKS DO
    IF REDSTONE GE 2 THEN
        INPUT FROM a
        OUTPUT TO b
    END
END
```

`REDSTONE <比较运算符> <数字>`：读取**管理器方块**当前收到的红石信号强度（0~15），和给定的数字比较。

## 信号来源

条件读取的是**管理器所在位置**从各个相邻方块收到的**最强**红石信号（`level.getBestNeighborSignal(managerPos)`）。

<div class="note">

**提示**：这和[红石脉冲触发器](ch03-02-redstone-pulse.md)有一点不同：脉冲触发器还会检测管理器**正上方**那一格是否有信号，`REDSTONE` 条件只看管理器自己的位置。

</div>

## 陷阱：单独写 REDSTONE

<div class="warning">

**单独写 `REDSTONE` 时，条件永远为真。**

语法允许省略比较运算符和数字（`REDSTONE (comparisonOp number)?`），省略时默认是 `REDSTONE >= 0`。信号强度永远不小于 0，所以：

```sfml
EVERY 20 TICKS DO
    IF REDSTONE THEN     -- 恒为真！并不是“有信号时”的意思
        INPUT FROM a
        OUTPUT TO b
    END
END
```

要表达“有红石信号时”，请写 `REDSTONE GE 1`（或 `REDSTONE > 0`）。

</div>

<div class="source">

**源码依据**：`ASTBuilder.visitBooleanRedstone()` 的默认值是 `ComparisonOperator.GREATER_OR_EQUAL` 和 `Number(0)`；`BoolRedstone.test()` 用 `level.getBestNeighborSignal(manager.getBlockPos())` 作为左操作数（[BoolRedstone.java][rs]）。

</div>

## 用法示例

### 拉杆开关

```sfml
EVERY 20 TICKS DO
    IF REDSTONE GE 1 THEN
        INPUT FROM a
        OUTPUT TO b
    END
END
```

### 用比较器的信号强度选择行为

```sfml
EVERY 20 TICKS DO
    INPUT FROM storage
    IF REDSTONE GE 10 THEN
        OUTPUT 64 TO export
    ELSE IF REDSTONE GE 1 THEN
        OUTPUT 8 TO export
    END
END
```

### 反向开关：有信号时停止

```sfml
EVERY 20 TICKS DO
    IF NOT REDSTONE GE 1 THEN     -- 等价于 REDSTONE EQ 0
        INPUT FROM a
        OUTPUT TO b
    END
END
```

## 与“红石”物品区分

`REDSTONE` 关键字也可以当资源名使用，表示物品红石粉。它是条件还是资源，取决于它出现的位置：

```sfml
EVERY 20 TICKS DO
    IF a HAS GT 0 redstone THEN    -- 资源：a 中有红石粉
        INPUT redstone FROM a      -- 资源：红石粉
        OUTPUT TO b
    END
    IF REDSTONE GE 1 THEN          -- 条件：红石信号
        INPUT FROM c
        OUTPUT TO d
    END
END
```

在 `HAS ... OR` 后面写 `REDSTONE` 时的歧义，见上一节的[陷阱](ch06-03-boolean.md#陷阱has-中的-or-与条件间的-or)。

[rs]: https://github.com/TeamDman/SuperFactoryManager/blob/e9755fa9be3b9ccb1adb0ada36fd9b13422e1f82/platform/minecraft/projections/sfm-4.34.0/mc-1.21.1/src/main/java/ca/teamdman/sfml/ast/BoolRedstone.java
