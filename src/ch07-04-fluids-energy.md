# 流体、能量与化学品

本节演示物品以外的资源类型。最重要的一条规则是：**`INPUT` 和 `OUTPUT` 两边都要写明资源类型**（见[资源类型](ch05-02-resource-types.md)）。

## 无限水

SFM 自带的**蓄水槽**（`water_tank`）是一个无限水源：放在两个相邻的水源方块旁边就会激活，和其他已激活的蓄水槽相邻时产水更多。

```sfml
NAME "供水"

EVERY 20 TICKS DO
    INPUT fluid::water FROM water_tank
    OUTPUT RETAIN 8000 fluid::water TO EACH boiler    -- 每台锅炉保持 8 桶水
END
```

流体的单位是 **mB**，1000 mB = 1 桶。

## 岩浆发电

```sfml
EVERY 20 TICKS DO
    INPUT fluid::lava FROM lava_tank
    OUTPUT RETAIN 4000 fluid::lava TO EACH generator
END
```

## 能量传输

能量单独放在一个触发器里，这样可以**每刻执行**：

```sfml
NAME "能量网络"

-- 发电机 → 储能
EVERY TICK DO
    INPUT fe:: FROM generator
    OUTPUT fe:: TO battery
END

-- 储能 → 机器（每台机器最多充到 100 万 FE）
EVERY TICK DO
    INPUT fe:: FROM battery
    OUTPUT RETAIN 1000000 fe:: TO EACH machine
END
```

`fe::`、`rf::`、`energy::`、`power::`、`forge_energy::` 都是同一种资源类型。

<div class="warning">

**注意**：每刻执行的前提是，触发器里**所有** `INPUT` / `OUTPUT` 都只涉及能量。哪怕只混进一条物品语句，或者一条没写资源的语句，这个触发器都必须改成至少每 20 刻执行一次，否则编译失败。

</div>

### 能量输出到所有面

有些储能方块每个面都能单独输入输出能量。可以用 `EACH SIDE` 访问所有面：

```sfml
EVERY TICK DO
    INPUT fe:: FROM generator
    OUTPUT fe:: TO "flux cell" EACH SIDE
END
```

## Mekanism 化学品

以 MC 1.21.1（Mekanism 10.7+）为例。电解分离器把水分解成氢气和氧气：

```sfml
NAME "电解"

EVERY 20 TICKS DO
    INPUT fluid::water FROM water_tank
    OUTPUT RETAIN 8000 fluid::water TO separator BACK SIDE
FORGET
    INPUT chemical::hydrogen FROM separator LEFT SIDE
    OUTPUT chemical::hydrogen TO hydrogen_tank
FORGET
    INPUT chemical::oxygen FROM separator RIGHT SIDE
    OUTPUT chemical::oxygen TO oxygen_tank
END
```

<div class="warning">

**Mekanism 的面配置必须和程序一致。**

- 上例假设你在分离器的面配置中设置了：**背面**输入水，**左面**输出氢气，**右面**输出氧气。这里的左右是指**你面对机器正面时**的左右（见[相对方向](ch04-03-sides.md#相对方向front--back--left--right)）；
- Mekanism 方块**无方向访问时只读**，所以必须写方向；
- 方向和面配置不一致时，SFM 会给出警告 *Mekanism block side config at ... doesn't agree with statement*。

在 1.20.x 及更早版本上，用 `gas::` 代替 `chemical::`（见[资源类型的版本差异](ch05-02-resource-types.md#可用的资源类型)）。

</div>

## 混合资源的机器

有些机器同时需要物品、流体和能量。建议**按资源类型拆分触发器**：物品和流体放在一个 20 刻的触发器里，能量单独放在每刻执行的触发器里：

```sfml
NAME "混合机器"

EVERY 20 TICKS DO
    INPUT iron_ingot FROM storage
    OUTPUT RETAIN 16 iron_ingot TO EACH machine TOP SIDE
FORGET
    INPUT fluid::water FROM water_tank
    OUTPUT RETAIN 4000 fluid::water TO EACH machine TOP SIDE
FORGET
    INPUT *, fluid:: FROM machine BOTTOM SIDE
    OUTPUT *, fluid:: TO storage
END

EVERY TICK DO
    INPUT fe:: FROM battery
    OUTPUT fe:: TO EACH machine
END
```

注意第三段中的 `*, fluid::`：两边都写了两种资源类型，物品和流体才会一起被取出。
