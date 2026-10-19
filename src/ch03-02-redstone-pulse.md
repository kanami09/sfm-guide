# 红石脉冲触发器

## 写法

```sfml
EVERY REDSTONE PULSE DO
    INPUT FROM a
    OUTPUT TO b
END
```

每当管理器收到一次**红石脉冲**，这个触发器的语句块就执行一次。

## 什么算一次“脉冲”

管理器检测的是**上升沿**：红石信号从“无”变成“有”的那一刻算一次脉冲。

- 判断“有信号”的条件是：**管理器所在位置**收到红石信号，**或者管理器正上方的方块位置**收到红石信号；
- 管理器用一个方块状态（`TRIGGERED`）做去抖：信号持续存在时不会重复计数，必须先断开再接通，才算下一次脉冲；
- 脉冲会被计数并排进队列。在管理器的下一个运行刻，红石脉冲触发器会**按队列中的脉冲数执行相应次数**，然后清空队列。

<div class="source">

**源码依据**：`ManagerBlock.neighborChanged()` 中，`isPowered = level.hasNeighborSignal(pos) || level.hasNeighborSignal(pos.above())`；当 `isPowered && !TRIGGERED` 时调用 `trackRedstonePulseUnprocessed()`。`RedstoneTrigger.tick()` 按 `context.getRedstonePulses()` 循环执行语句块；`Program.tick(manager)` 结束时调用 `manager.clearRedstonePulseQueue()`。

</div>

## 与定时触发器配合

一个程序里可以同时有定时触发器和红石脉冲触发器，它们互不影响：

```sfml
NAME "按钮出货"

-- 平时：每秒把加工产物收进仓库
EVERY 20 TICKS DO
    INPUT FROM machine BOTTOM SIDE
    OUTPUT TO storage
END

-- 按一下按钮：从仓库取一组钻石放进投递箱
EVERY REDSTONE PULSE DO
    INPUT 64 diamond FROM storage
    OUTPUT TO dropbox
END
```

## 与 REDSTONE 条件的区别

注意区分**红石脉冲触发器**和**红石条件** `IF REDSTONE ...`：

| | 红石脉冲触发器 | 红石条件 |
| --- | --- | --- |
| 写法 | `EVERY REDSTONE PULSE DO` | `IF REDSTONE GE 1 THEN` |
| 含义 | 信号**从无到有**时执行一次 | 执行到这里时，检查**当前**信号强度 |
| 适用场景 | 按钮、观察者、一次性事件 | 拉杆开关、比较器输出的信号强度 |

```sfml
-- 拉杆打开期间每秒搬运，关上就停
EVERY 20 TICKS DO
    IF REDSTONE GE 1 THEN
        INPUT FROM a
        OUTPUT TO b
    END
END
```

红石条件的详细说明见 [REDSTONE 条件](ch06-04-redstone.md)。

<div class="note">

**提示**：红石脉冲触发器**不受**定时触发器最小间隔的限制，每来一次脉冲就执行一次。用高频红石时钟驱动管理器，可以让物品搬运频率超过“每 20 刻一次”。这样做要考虑服务器性能，有些服务器也不欢迎这种用法。

</div>
