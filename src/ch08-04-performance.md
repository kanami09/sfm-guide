# 性能建议

SFM 的程序运行在服务器主线程上。写得不好的程序会拖慢整个服务器。管理器界面会显示**峰值刻耗时**，日志里也有每条语句的耗时，可以用它们来评估。

## 1. 选择合适的执行间隔

- 物品搬运的默认最小间隔是 20 刻，大多数情况下已经足够；
- 不急的任务（整理仓库、清理杂物）用更长的间隔，比如 `EVERY 300 SECONDS`；
- 只有能量需要每刻搬运，而且要放在单独的触发器里。

## 2. 用全局时钟加偏移量错开负载

大量管理器都用 `EVERY 20 GLOBAL TICKS` 时，它们会在同一刻一起执行，造成周期性卡顿。可以给不同的管理器或触发器设置不同的偏移量：

```sfml
EVERY 20G+0 TICKS DO
    INPUT FROM a
    OUTPUT TO b
END

EVERY 20G+7 TICKS DO
    INPUT FROM c
    OUTPUT TO d
END
```

本地时钟（不写 `GLOBAL`）在管理器加载时会被随机化，本身就有错开的效果；但带偏移量的本地时钟有[无法执行的风险](ch03-01-timer.md#偏移量)，所以需要偏移量时请用全局时钟。

## 3. 往大仓库输出时用 EMPTY SLOTS IN

往大量非空槽位里放东西时，每个槽位都要检查能不能堆叠。`EMPTY SLOTS IN` 只看空槽位，可以显著减少检查次数（见 [EMPTY SLOTS IN](ch04-06-empty-slots.md)）。

## 4. 用方向和槽位缩小范围

```sfml
EVERY 20 TICKS DO
    INPUT FROM machine BOTTOM SIDE SLOTS 0-2    -- 只扫描需要的槽位
    OUTPUT TO storage
END
```

槽位越少，收集和搬运的工作量越小。尤其注意不要对普通容器用 `EACH SIDE`，那会把同一个物品栏扫描 7 次。

## 5. 少用 ROUND ROBIN

模组示例明确建议用 `RETAIN` 代替 `ROUND ROBIN`。轮询每次只处理一个目标，要达到同样的效果需要执行更多次。

## 6. 通配符不必刻意回避

常见的通配符形式（`*xxx*`、`xxx*`、`*xxx`、`xxx*yyy`）会被优化成简单的字符串判断，并且编译后有缓存。不必为了性能刻意避开通配符。复杂的正则（带引号的字符串）会慢一些。

## 7. 减少无效的 IF 判断

`HAS` 条件需要扫描标签对应方块的所有相关槽位。把**最便宜、最常为假**的条件放在 `AND` 的左边，利用短路求值跳过后面昂贵的判断：

```sfml
EVERY 20 TICKS DO
    IF REDSTONE GE 1 AND storage HAS LT 1000 iron_ingot THEN   -- 先查红石，便宜
        INPUT FROM raw
        OUTPUT TO crusher
    END
END
```

## 8. 服务器管理员的紧急手段

| 手段 | 作用 |
|---|---|
| 配置 `disableProgramExecution = true` | 所有管理器停止编译和运行程序（紧急情况使用）。SFM 引发崩溃时，崩溃信息中也会提示这个配置项 |
| 调大 `timerTriggerMinimumIntervalInTicks` | 提高全服的最小间隔 |
| `disallowedResourceTypesForTransfer` | 禁止搬运某些资源类型 |
| `/sfm bust_cable_network_cache` | 清空线缆网络缓存 |

配置项的完整说明见[附录 D](appendix-04-config.md)。
