# 条件控制

前面几章的程序都是“无条件”执行的。本章介绍 `IF` 语句，它让程序可以根据**容器里有什么**、**有多少**，或者**管理器收到的红石信号**来决定做什么。

- [IF / ELSE IF / ELSE](ch06-01-if.md)：条件语句的结构；
- [HAS 表达式与集合运算符](ch06-02-has.md)：“某个容器里有没有某种东西、有多少”；
- [布尔逻辑与优先级](ch06-03-boolean.md)：`NOT`、`AND`、`OR`、括号，以及一个容易踩的歧义陷阱；
- [REDSTONE 条件](ch06-04-redstone.md)：读取管理器收到的红石信号强度。

一个综合示例：

```sfml
NAME "按需加工"

EVERY 20 TICKS DO
    INPUT FROM raw_storage

    IF storage HAS LT 256 iron_ingot AND REDSTONE GE 1 THEN
        OUTPUT 64 raw_iron TO crusher
    ELSE IF storage HAS LT 256 gold_ingot THEN
        OUTPUT 64 raw_gold TO crusher
    ELSE
        OUTPUT TO overflow
    END
END
```
