# 机器补料：维持库存

## 需求

一组加工机器（以“粉碎机”为例，任何模组的类似机器都适用），要求：

1. 每台机器的输入端始终有材料，但不要塞太多，避免材料全堆在一台机器上；
2. 加工产物及时取出；
3. 仓库中的成品足够多时，停止加工以节省资源；
4. 另外给“厨房”箱子维持一些食物的库存。

## 布局与标签

| 标签 | 标记的方块 |
| --- | --- |
| `storage` | 主仓库 |
| `crusher` | 每一台粉碎机。假设机器的**顶面输入、底面输出**，具体以你的机器为准 |
| `kitchen` | 厨房箱子 |

## 程序

```sfml
NAME "机器补料"

EVERY 20 TICKS DO
    -- 成品不足 1024 个时才补料
    IF storage HAS LT 1024 WITH #dusts THEN
        INPUT WITH #raw_materials FROM storage
        OUTPUT RETAIN 8 EACH TO EACH crusher TOP SIDE
    END
FORGET
    -- 产物总是取出
    INPUT FROM crusher BOTTOM SIDE
    OUTPUT TO storage
FORGET
    -- 厨房：每种食物都保持 32 个
    INPUT RETAIN 64 EACH bread OR cooked_beef OR baked_potato FROM storage
    OUTPUT RETAIN 32 EACH bread OR cooked_beef OR baked_potato TO kitchen
END
```

## 讲解

### `RETAIN 8 EACH` + `TO EACH`

```sfml,ignore
OUTPUT RETAIN 8 EACH TO EACH crusher TOP SIDE
```

这里有两个 `EACH`：

- `TO EACH crusher`：**每台**粉碎机分别计数；
- `RETAIN 8 EACH`：**每种**材料分别计数。

合起来就是：每台粉碎机里，每种材料都补到 8 个。这个资源条目只写了 `RETAIN 8 EACH`，没有写具体资源，相当于 `*`（所有物品），而 `*` 是通配符，所以 `EACH` 不会触发 “EACH used without a pattern” 警告。

如果机器一次只能加工一种材料（大多数机器都是这样），可以把 `RETAIN 8 EACH` 换成 `RETAIN 8`，即每台机器总共 8 个，这样就不会往同一台机器里塞进好几种材料。

### 用 IF 控制加工

`storage HAS LT 1024 WITH #dusts` 统计仓库中所有带 `dusts` 物品标签（tag）的物品，**合计**少于 1024 个时才补料。`HAS` 默认使用 `OVERALL` 集合运算符：有多个仓库箱子时，数量是加在一起算的，正好符合需求。

注意，补料写在 `IF` 里面，取产物写在 `IF` 外面。即使停止补料，机器里已有的材料加工完之后，产物照样会被取出。

### 两端都用 RETAIN

厨房的部分同时用了输入端和输出端的 `RETAIN`：

- 输入端 `RETAIN 64 EACH ... FROM storage`：仓库里每种食物至少留 64 个，不会被厨房搬空；
- 输出端 `RETAIN 32 EACH ... TO kitchen`：厨房里每种食物补到 32 个。

## 变化：只在机器空闲时补料

如果希望“机器的输入槽空了才补”，而不是一直补到某个数量，可以用 `HAS EQ 0` 和集合运算符：

```sfml
EVERY 20 TICKS DO
    IF SOME crusher TOP SIDE HAS EQ 0 THEN
        INPUT 16 WITH #raw_materials FROM storage
        OUTPUT 16 TO EMPTY SLOTS IN EACH crusher TOP SIDE
    END
END
```

这里有一个细节：`IF` 判断的是“**至少有一台**空了”，但 `OUTPUT ... TO EACH crusher` 会对**所有**粉碎机操作。之所以能实现“只补空机器”，靠的是 `EMPTY SLOTS IN`：输入槽非空的机器不会被放进东西。另外，`INPUT 16` 限制了这一次总共只取 16 个材料，所以先轮到的那几台空机器会先拿到材料。
