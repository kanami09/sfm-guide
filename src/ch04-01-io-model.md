# INPUT 与 OUTPUT 的工作模型

## INPUT 只登记，OUTPUT 才搬运

这是理解 SFML 最关键的一点：

- **`INPUT` 语句执行时什么也不搬。** 它只是把自己加进当前触发器的“已登记输入”列表；
- **`OUTPUT` 语句执行时**，才去扫描所有已登记输入的来源槽位，以及自己的目的地槽位，然后把东西**直接**从来源搬到目的地。

SFM **没有中转缓冲区**，物品不会先被“取出来”再“放进去”。目的地放不下的东西，会原封不动地留在来源里。

```sfml
EVERY 20 TICKS DO
    INPUT FROM a     -- 登记：a 是来源
    OUTPUT TO b      -- 搬运：a → b
END
```

<div class="source">

**源码依据**：`InputStatement.tick()` 只调用 `context.addInput(this)`；`OutputStatement.tick()` 先对 `context.getInputs()` 中的每条输入语句收集来源槽位，再收集自己的目的地槽位，最后逐个调用 `moveTo(source, destination)`（[InputStatement.java][input]、[OutputStatement.java][output]）。

</div>

## 一个 OUTPUT 消费所有已登记的 INPUT

`OUTPUT` 执行时，会从**此前登记过、尚未撤销的所有** `INPUT` 中取货：

```sfml
EVERY 20 TICKS DO
    INPUT FROM a
    INPUT FROM c
    OUTPUT TO b      -- a 和 c 里的东西都会搬到 b
END
```

这也意味着，后面的 `OUTPUT` 仍然能看到前面的 `INPUT`。模组内置示例 `forget.sfml` 专门演示了这个容易踩的坑：

```sfml
EVERY 20 TICKS DO
    INPUT FROM a
    OUTPUT 1 TO b

    INPUT FROM c
    OUTPUT TO d      -- 注意：INPUT FROM a 仍然有效！a 和 c 的东西都会进 d
END
```

如果你只想把 `c` 搬到 `d`，就要在中间用 [`FORGET`](ch04-07-forget.md) 撤销前面的输入：

```sfml
EVERY 20 TICKS DO
    INPUT FROM a
    OUTPUT 1 TO b

    FORGET

    INPUT FROM c
    OUTPUT TO d      -- 只有 c 的东西进 d
END
```

## 一个 INPUT 可以被多个 OUTPUT 消费

一条 `INPUT` 后面可以接多条 `OUTPUT`，把东西分到不同的地方：

```sfml
EVERY 20 TICKS DO
    INPUT FROM chest

    OUTPUT *ore* TO ore_processing
    OUTPUT *log* TO sawmill
    OUTPUT TO overflow      -- 剩下的都进这里
END
```

`OUTPUT` 按顺序执行。第一条把矿石搬走后，第二条执行时箱子里已经没有矿石了。最后一条不加过滤，起到“兜底”的作用。

### 输入端的数量限制在多个 OUTPUT 之间共享

`INPUT` 上的数量和保留量限制（第 5 章介绍），在同一次触发器执行中是**累计**的，会被后面所有的 `OUTPUT` 共同消耗：

```sfml
EVERY 20 TICKS DO
    INPUT 10 FROM a
    OUTPUT 3 TO x     -- 从 a 搬 3 个
    OUTPUT TO y       -- 最多再搬 7 个，因为 INPUT 总共只允许搬 10 个
END
```

`OUTPUT` 上的限制则相反：**每条 `OUTPUT` 语句每次执行都重新计数**，互不影响。

<div class="version">

**版本**：“多个 `OUTPUT` 共享输入端限额”的正确行为是 4.16.0 修复的（之前输入限额在多个输出之间不生效）。

</div>

## 没有配对的语句

| 情况 | 结果 | 警告 |
| --- | --- | --- |
| `INPUT` 之后没有任何 `OUTPUT` | 什么也不发生 | *...inputs ... but no future output statement consume ...* |
| `OUTPUT` 之前没有 `INPUT` | 什么也不发生 | *...uses resource type ... which has no matching input statement.* |
| `INPUT` 和 `OUTPUT` 的资源类型对不上 | 什么也不发生 | 同上 |

最后一种情况最隐蔽。例如：

```sfml
EVERY 20 TICKS DO
    INPUT fluid:: FROM tank_a   -- 只登记流体
    OUTPUT TO tank_b            -- 不写资源，默认只接收物品！
END
```

`OUTPUT TO tank_b` 不写资源时默认只接收**物品**，所以流体一滴也不会搬。正确的写法是两边都写上 `fluid::`，详见[资源类型](ch05-02-resource-types.md)。

## IF 分支中的 INPUT

`INPUT` 登记的效果在整个触发器内持续有效，即使它写在 `IF` 分支里。下面的例子摘自仓库 `examples/03-conditions.sfm`：

```sfml
EVERY 20 TICKS DO
    IF a HAS GE 32 iron_ingot THEN
        INPUT 1 cobblestone FROM a
    ELSE IF a HAS GE 16 iron_ingot THEN
        INPUT 1 stone FROM a
    ELSE
        INPUT 1 red_sandstone FROM a
    END

    OUTPUT TO b    -- 搬的是哪种东西，取决于上面哪个分支执行了
END
```

## 搬运顺序

当来源和目的地都有多个时，`OUTPUT` 的搬运顺序大致是：

1. 按 `INPUT` 语句的书写顺序，依次取出每个来源槽位；
2. 对每个来源槽位，按目的地槽位的顺序依次尝试放入，直到这个来源槽位搬空、达到限额，或者所有目的地都满了。

由此可以得出一个实用结论：**目的地有多个时，排在前面的先被填满**。比如 `OUTPUT 1 TO b`，当 `b` 标签贴在多个方块上时，只有其中一个会收到这 1 个物品。想让每个方块各收 1 个，要用 [`TO EACH`](ch04-05-each-label.md)。

详细的算法见[搬运算法详解](ch08-02-transfer.md)。

[input]: https://github.com/TeamDman/SuperFactoryManager/blob/e9755fa9be3b9ccb1adb0ada36fd9b13422e1f82/platform/minecraft/projections/sfm-4.34.0/mc-1.21.1/src/main/java/ca/teamdman/sfml/ast/InputStatement.java
[output]: https://github.com/TeamDman/SuperFactoryManager/blob/e9755fa9be3b9ccb1adb0ada36fd9b13422e1f82/platform/minecraft/projections/sfm-4.34.0/mc-1.21.1/src/main/java/ca/teamdman/sfml/ast/OutputStatement.java
