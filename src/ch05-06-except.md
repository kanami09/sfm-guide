# EXCEPT

## 写法

`EXCEPT` 写在资源条目列表之后、`FROM` / `TO` 之前，后面跟一个**逗号分隔**的资源列表，用来把这些资源从整条语句中**排除**：

```sfml
EVERY 20 TICKS DO
    INPUT *ingot* EXCEPT iron_ingot, gold_ingot FROM a   -- 除铁锭和金锭外的所有锭
    INPUT EXCEPT cobblestone FROM z                      -- 除圆石外的所有物品
    OUTPUT 5 EXCEPT copper_ingot TO b                    -- 最多放 5 个，铜锭不放
END
```

排除列表中同样可以使用通配符：

```sfml
EVERY 20 TICKS DO
    INPUT
        *iron*,
        *copper*
    EXCEPT
        *block*      -- iron_block 和 copper_block 都会被排除
    FROM chest
    OUTPUT TO chest2
END
```

## EXCEPT 作用于整条语句

`EXCEPT` 是**语句级**的修饰，作用于这条语句中的**所有**资源条目，没有办法只对某一个资源条目排除。上面的例子中，`*block*` 同时从 `*iron*` 和 `*copper*` 两个资源条目中排除。

## EXCEPT 不支持 WITH

`EXCEPT` 后面只能写资源标识符，**不能**写 `WITH` / `WITHOUT` 物品标签（tag）条件。也**没有**“语句级的物品标签（tag）排除”。要按物品标签（tag）排除，就在每个资源条目里各自写 `WITHOUT` 或 `WITH NOT`：

```sfml
EVERY 20 TICKS DO
    INPUT
        * WITH #ores AND NOT #needs_stone_tool,
        * WITHOUT #piglin_loved,
    FROM chest
    OUTPUT TO other_chest
END
```

## 列表用逗号，不用 OR

`EXCEPT` 后面的资源列表用**逗号**分隔，不是 `OR`。这和资源条目中的 `OR` 不一样：

```sfml
EVERY 20 TICKS DO
    INPUT 16 *_ore OR raw_* EXCEPT gold_ore, raw_gold FROM a   -- OR 用于资源条目，逗号用于 EXCEPT
    OUTPUT TO b
END
```

## 在 HAS 条件中

`IF ... HAS` 条件中也可以写 `EXCEPT`，用来在计数时排除某些资源，见 [HAS 表达式](ch06-02-has.md)：

```sfml
EVERY 20 TICKS DO
    IF chest HAS GT 0 *ingot EXCEPT iron_ingot THEN
        INPUT *ingot EXCEPT iron_ingot FROM chest
        OUTPUT TO storage
    END
END
```

<div class="version">

**版本**：`EXCEPT` 从 4.12.0 开始提供；4.18.0 改进了排除列表的遍历性能。

</div>

## 语法

```antlr
resourceExclusion : EXCEPT resourceIdList ;
resourceIdList    : resourceId (COMMA resourceId)* COMMA? ;
```
