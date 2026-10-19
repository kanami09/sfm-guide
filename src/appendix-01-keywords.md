# 附录 A：关键字速查

所有关键字都**不区分大小写**。“可作名字”一列表示该关键字能否不加引号直接用作标签名或资源名。

| 关键字 | 可作名字 | 用途 | 示例 | 章节 |
| --- | --- | --- | --- | --- |
| `AND` | | 布尔与；`WITH` 子句中的与 | `a HAS GT 0 AND REDSTONE GE 1` | [6.3](ch06-03-boolean.md) |
| `BACK` | ✅ | 相对方向：背面 | `FROM m BACK SIDE` | [4.3](ch04-03-sides.md) |
| `BLOCK` | | 轮询模式：按方块 | `ROUND ROBIN BY BLOCK` | [4.8](ch04-08-round-robin.md) |
| `BOTTOM` | ✅ | 方向：下 | `FROM furnace BOTTOM SIDE` | [4.3](ch04-03-sides.md) |
| `BY` | | 轮询 | `ROUND ROBIN BY LABEL` | [4.8](ch04-08-round-robin.md) |
| `DO` | | 触发器体开始 | `EVERY 20 TICKS DO` | [3](ch03-00-triggers.md) |
| `EACH` | | ① 按方块计数 ② 按资源计数 ③ 集合运算符（= `EVERY`）④ `EACH SIDE` | `TO EACH b`、`5 EACH *ingot`、`IF EACH a HAS ...` | [4.5](ch04-05-each-label.md) |
| `EAST` | | 方向：东 | `EAST SIDE` | [4.3](ch04-03-sides.md) |
| `ELSE` | | 否则分支 | `ELSE IF ... THEN` | [6.1](ch06-01-if.md) |
| `EMPTY` | | 只放空槽位 | `TO EMPTY SLOTS IN b` | [4.6](ch04-06-empty-slots.md) |
| `END` | | 结束触发器或 `IF` | | [2.1](ch02-01-program-structure.md) |
| `EQ` | | 等于（= `=`） | `HAS EQ 0` | [6.2](ch06-02-has.md) |
| `EVERY` | | ① 触发器 ② 集合运算符：每一个 | `EVERY 20 TICKS`、`IF EVERY a HAS ...` | [3](ch03-00-triggers.md)、[6.2](ch06-02-has.md) |
| `EXCEPT` | | 排除资源 | `INPUT EXCEPT dirt FROM a` | [5.6](ch05-06-except.md) |
| `FALSE` | | 布尔常量 | | [6.3](ch06-03-boolean.md) |
| `FORGET` | | 撤销输入 | `FORGET a, b` | [4.7](ch04-07-forget.md) |
| `FROM` | | 输入来源 | `INPUT FROM a` | [4.1](ch04-01-io-model.md) |
| `FRONT` | ✅ | 相对方向：正面 | | [4.3](ch04-03-sides.md) |
| `GE` | | 大于等于（= `>=`） | | [6.2](ch06-02-has.md) |
| `GLOBAL` / `G` | ✅ | 使用全局时钟 | `EVERY 20 GLOBAL TICKS`、`20G` | [3.1](ch03-01-timer.md) |
| `GT` | | 大于（= `>`） | | [6.2](ch06-02-has.md) |
| `HAS` | | 库存判断 | `chest HAS GT 10 stone` | [6.2](ch06-02-has.md) |
| `IF` | | 条件语句 | | [6.1](ch06-01-if.md) |
| `IN` | | 用于 `EMPTY SLOTS IN` | | [4.6](ch04-06-empty-slots.md) |
| `INPUT` | | 输入语句 | | [4.1](ch04-01-io-model.md) |
| `LABEL` | | 轮询模式：按标签 | `ROUND ROBIN BY LABEL` | [4.8](ch04-08-round-robin.md) |
| `LE` | | 小于等于（= `<=`） | | [6.2](ch06-02-has.md) |
| `LEFT` | ✅ | 相对方向：左 | | [4.3](ch04-03-sides.md) |
| `LONE` | | 集合运算符：至多一个 | `IF LONE a HAS ...` | [6.2](ch06-02-has.md) |
| `LT` | | 小于（= `<`） | | [6.2](ch06-02-has.md) |
| `NAME` | | 程序名 | `NAME "xxx"` | [2.1](ch02-01-program-structure.md) |
| `NORTH` | | 方向：北 | | [4.3](ch04-03-sides.md) |
| `NOT` | | 布尔非；`WITH` 子句中的非 | `NOT a HAS ...`、`WITH NOT #ores` | [6.3](ch06-03-boolean.md) |
| `NULL` | | 无方向访问 | `NULL SIDE` | [4.3](ch04-03-sides.md) |
| `ONE` | | 集合运算符：恰好一个 | | [6.2](ch06-02-has.md) |
| `OR` | | 布尔或；资源析取；`WITH` 子句中的或 | `stone OR dirt` | [5.5](ch05-05-limit-list.md)、[6.3](ch06-03-boolean.md) |
| `OUTPUT` | | 输出语句 | | [4.1](ch04-01-io-model.md) |
| `OVERALL` | | 集合运算符：合计（默认） | | [6.2](ch06-02-has.md) |
| `PLUS` / `+` | | 定时偏移量 | `EVERY 20 PLUS 5 TICKS` | [3.1](ch03-01-timer.md) |
| `PULSE` | | 红石脉冲触发器 | `EVERY REDSTONE PULSE DO` | [3.2](ch03-02-redstone-pulse.md) |
| `REDSTONE` | ✅ | ① 脉冲触发器 ② 红石条件 ③ 物品“红石粉” | `IF REDSTONE GE 1` | [3.2](ch03-02-redstone-pulse.md)、[6.4](ch06-04-redstone.md) |
| `RETAIN` | | 保留量 | `INPUT RETAIN 5 FROM a` | [5.3](ch05-03-quantity-retain.md) |
| `RIGHT` | ✅ | 相对方向：右 | | [4.3](ch04-03-sides.md) |
| `ROBIN` / `ROUND` | | 轮询 | `ROUND ROBIN BY BLOCK` | [4.8](ch04-08-round-robin.md) |
| `SECOND` / `SECONDS` | ✅ | 时间单位：秒（×20 刻） | `EVERY 5 SECONDS` | [3.1](ch03-01-timer.md) |
| `SIDE` | | 方向限定结尾 | `TOP SIDE`、`EACH SIDE` | [4.3](ch04-03-sides.md) |
| `SLOT` / `SLOTS` | | 槽位限定 | `SLOTS 0-8` | [4.4](ch04-04-slots.md) |
| `SOME` | | 集合运算符：至少一个 | | [6.2](ch06-02-has.md) |
| `SOUTH` | | 方向：南 | | [4.3](ch04-03-sides.md) |
| `TAG` / `#` | | 物品标签（tag）匹配 | `WITH TAG c:ingots`、`WITH #c:ingots` | [5.7](ch05-07-with-tag.md) |
| `THEN` | | `IF` 条件结束 | | [6.1](ch06-01-if.md) |
| `TICK` / `TICKS` | | 时间单位：刻 | `EVERY 20 TICKS` | [3.1](ch03-01-timer.md) |
| `TO` | | 输出目的地 | `OUTPUT TO b` | [4.1](ch04-01-io-model.md) |
| `TOP` | ✅ | 方向：上 | | [4.3](ch04-03-sides.md) |
| `TRUE` | | 布尔常量 | | [6.3](ch06-03-boolean.md) |
| `WEST` | | 方向：西 | | [4.3](ch04-03-sides.md) |
| `WHERE` | | 保留关键字，目前未使用 | | — |
| `WITH` | | 物品标签（tag）条件 | `WITH #ores` | [5.7](ch05-07-with-tag.md) |
| `WITHOUT` | | 物品标签（tag）条件取反 | `WITHOUT #ores` | [5.7](ch05-07-with-tag.md) |

## 预定义的资源类型名

这些不是关键字，而是资源标识符中资源类型部分可以使用的名字：

| 名字 | 说明 |
| --- | --- |
| `item` | 物品（默认） |
| `fluid` | 流体 |
| `forge_energy`、`fe`、`rf`、`energy`、`power` | Forge 能量 |
| `redstone` | 已注册，但在 4.34.0 中不能搬运 |
| `chemical`、`gas`、`infusion`、`pigment`、`slurry`、`mekanism_energy` | Mekanism，因版本而异，见[资源类型](ch05-02-resource-types.md) |
