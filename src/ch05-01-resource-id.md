# 资源标识符

## 完整形式

在 SFML 内部，每个资源标识符都由**四段**组成：

```text
资源类型命名空间 : 资源类型名 : 资源命名空间 : 资源名
       sfm      :    item    :  minecraft   :  stone
```

- 前两段确定**资源类型**：物品（`sfm:item`）、流体（`sfm:fluid`）、Forge 能量（`sfm:forge_energy`）等；
- 后两段确定**具体是哪种资源**，也就是 Minecraft 注册名的命名空间和路径，比如 `minecraft:stone`。

完整写法当然可以用，但平时几乎没人这样写：

```sfml
EVERY 20 TICKS DO
    INPUT sfm:item:minecraft:stone FROM a
    OUTPUT TO b
END
```

## 简写规则

不加引号的资源标识符在编译时会按下面的步骤处理（`ASTBuilder.visitResource()`）：

1. 把 `::` 替换成 `:*:`；
2. 如果以 `:` 结尾，补上一个 `*`；
3. 把每个 `*` 替换成正则的 `.*`；
4. 全部转成小写；
5. 按 `:` 分段，根据段数确定含义：

| 段数 | 例子 | 解释为 |
| --- | --- | --- |
| 1 | `stone` | 物品，**任意命名空间**，名为 `stone` |
| 2 | `minecraft:stone` | 物品，命名空间 `minecraft`，名为 `stone` |
| 3 | `fluid:minecraft:water` | 资源类型 `sfm:fluid`，`minecraft:water` |
| 4 | `sfm:item:minecraft:stone` | 完整形式 |

由此得到一批常用写法：

| 写法 | 展开后 | 含义 |
| --- | --- | --- |
| `stone` | `sfm:item:.*:stone` | 任何模组中名为 `stone` 的物品 |
| `minecraft:stone` | `sfm:item:minecraft:stone` | 原版石头 |
| `minecraft:` | `sfm:item:minecraft:.*` | 原版的**所有**物品 |
| `*` | `sfm:item:.*:.*` | 所有物品 |
| `*ingot*` | `sfm:item:.*:.*ingot.*` | 名字里含 `ingot` 的所有物品 |
| `create:*` | `sfm:item:create:.*` | 机械动力（Create）的所有物品 |
| `fluid::` | `sfm:fluid:.*:.*` | 所有流体 |
| `fluid::water` | `sfm:fluid:.*:water` | 任何命名空间下名为 `water` 的流体 |
| `fluid:minecraft:lava` | `sfm:fluid:minecraft:lava` | 原版岩浆 |
| `fe::` | `sfm:forge_energy:.*:.*` | Forge 能量（`fe` 是 `forge_energy` 的别名） |

```sfml
EVERY 20 TICKS DO
    -- 这两行等价
    INPUT stone FROM a
    INPUT sfm:item:*:stone FROM a

    -- 这两行等价
    INPUT fluid::water FROM a
    INPUT sfm:fluid:*:water FROM a

    OUTPUT stone, fluid:: TO b
END
```

<div class="warning">

**物品默认匹配任意命名空间。**

只写 `iron_ingot` 时，匹配的是**所有**名为 `iron_ingot` 的物品，不限于原版。早期版本默认使用 `minecraft` 命名空间，现在已经改了（模组内置示例 `resource_types.sfml` 中有说明）。网上一些旧教程，以及仓库 `examples/` 目录里的旧注释，仍然写着“默认是 `minecraft:`”，这个说法已经过时了。如果确实需要区分不同模组的同名物品，就把命名空间写全：`minecraft:iron_ingot`。

</div>

## 通配符 `*`

不加引号时，`*` 可以出现在名字的任何位置，表示“任意多个任意字符”：

```sfml
EVERY 20 TICKS DO
    INPUT *_log FROM a         -- 以 _log 结尾
    INPUT iron_* FROM a        -- 以 iron_ 开头
    INPUT *seed* FROM a        -- 包含 seed
    INPUT mekanism:*ore FROM a -- mekanism 中以 ore 结尾的物品
    OUTPUT TO b
END
```

匹配时要求**整个名字**都符合模式，而不是名字中某一部分符合：`iron_*` 不会匹配 `raw_iron_block`。

<div class="note">

拿不准一个模式会匹配哪些物品时，在编辑器里把光标放在它上面按 `Ctrl + Space`，SFM 会列出这个模式在当前游戏中匹配到的全部资源 ID。

</div>

## 带引号：正则表达式

资源标识符也可以写成**字符串**。这时它会被当作**正则表达式**处理，而且不做上面的简写转换：

```sfml
EVERY 20 TICKS DO
    INPUT ".*ingot.*" FROM a                -- 等价于 *ingot*
    INPUT "minecraft:.*_(log|wood)" FROM a  -- 原版的原木和木头
    OUTPUT TO b
END
```

和不带引号的写法相比：

| | 不带引号 | 带引号 |
| --- | --- | --- |
| `*` 的含义 | 转换成 `.*` | 正则中的量词（单独出现在开头是非法的） |
| `::` 简写 | 支持 | **不支持** |
| 自动转小写 | 是 | 否 |
| 可用字符 | 标识符字符 | 任意 |

<div class="warning">

**字符串形式不支持 `::` 简写。** 字符串只是简单地按 `:` 切分，`"fluid::water"` 会被切成 `fluid`、空字符串、`water`，而空的命名空间匹配不到任何东西。在字符串里要写完整的正则：`"fluid:.*:water"`。

同样，`"*ingot"` 是**非法**的正则（`*` 前面没有可以重复的东西），会导致编译错误 *Invalid resource identifier pattern*。要写成 `".*ingot"`。

</div>

什么时候需要用字符串？

- 需要正则的高级功能，比如分组和“或”：`"minecraft:(oak|birch)_log"`；
- 物品名里有标识符不允许的字符，比如以数字开头，或者包含 `-`、`.`。

## 匹配规则细节

对命名空间和名字这两段，SFM 分别判断：

- 如果这一段包含正则特殊字符（`.?*+^$[](){}|\` 中的任意一个），就当作正则，要求**整段完全匹配**；
- 否则按普通字符串比较，**忽略大小写**。

<div class="source">

`RegexCache.isRegexPattern()` 和 `RegexCache.buildPredicate()`（[RegexCache.java][regex]）；简写转换见 `ASTBuilder.visitResource()`，切分见 `ResourceIdentifier.fromString()`（[ResourceIdentifier.java][rid]）。对常见的 `.*xxx.*`、`xxx.*`、`.*xxx` 等模式，SFM 会优化成简单的字符串包含、前缀或后缀判断，所以不用担心通配符的性能。

</div>

## 只按 ID 匹配

资源标识符只看**注册 ID**（以及 [WITH](ch05-07-with-tag.md) 中的物品标签（tag））。4.34.0 的 SFML **无法**按 NBT、数据组件、附魔、耐久等信息区分物品。比如“附魔书”只能当作一种物品 `enchanted_book` 整体处理。

## 语法

```antlr
resourceId : identifier (COLON identifier? (COLON identifier? (COLON identifier?)?)?)?   # Resource
           | string                                                                    # StringResource
           ;
```

[regex]: https://github.com/TeamDman/SuperFactoryManager/blob/e9755fa9be3b9ccb1adb0ada36fd9b13422e1f82/platform/minecraft/projections/sfm-4.34.0/mc-1.21.1/src/main/java/ca/teamdman/sfm/common/program/RegexCache.java
[rid]: https://github.com/TeamDman/SuperFactoryManager/blob/e9755fa9be3b9ccb1adb0ada36fd9b13422e1f82/platform/minecraft/projections/sfm-4.34.0/mc-1.21.1/src/main/java/ca/teamdman/sfml/ast/ResourceIdentifier.java
