# 触发器

**触发器（trigger）**决定程序中的代码**什么时候**执行。SFML 程序的顶层只能出现程序名和触发器，所有语句都必须写在某个触发器里面。

4.34.0 正式版提供两种触发器：

| 触发器 | 写法 | 执行时机 |
| --- | --- | --- |
| [定时触发器](ch03-01-timer.md) | `EVERY <间隔> DO ... END` | 按固定的游戏刻间隔执行 |
| [红石脉冲触发器](ch03-02-redstone-pulse.md) | `EVERY REDSTONE PULSE DO ... END` | 管理器收到红石脉冲时执行 |

每个触发器都会在一个**独立的上下文**中执行：它登记的 `INPUT`、它的计数器，都只在本次执行内有效，执行完就丢弃，不会带到下一次，也不会影响别的触发器。

```sfml
EVERY 20 TICKS DO
    INPUT FROM a
END

EVERY 20 TICKS DO
    OUTPUT TO b   -- 这里看不到上一个触发器里的 INPUT FROM a，因此什么也不会搬
END
```

<div class="note">

**提示**：上面这个程序会产生两条警告：第一个触发器的 `INPUT` 没有被任何 `OUTPUT` 消费；第二个触发器的 `OUTPUT` 没有对应的 `INPUT`。养成看警告的习惯，可以省下很多排查时间。

</div>
