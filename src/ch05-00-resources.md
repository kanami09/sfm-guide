# 资源匹配与限额

上一章讲了“从哪里搬、搬到哪里”，本章讲 `INPUT` / `OUTPUT` 中间可以填写的部分：**搬什么、搬多少、留多少**。

```text
INPUT  <资源限额列表> [EXCEPT ...] FROM ...
OUTPUT <资源限额列表> [EXCEPT ...] TO ...

资源限额 = [数量 [EACH]] [RETAIN 保留量 [EACH]] [资源 {OR 资源}] [WITH/WITHOUT 物品标签（tag）表达式]
```

本章内容：

- [资源标识符](ch05-01-resource-id.md)：怎样写出“某种东西”，包括简写、通配符和正则；
- [资源类型](ch05-02-resource-types.md)：物品、流体、能量、化学品……以及“为什么流体搬不动”；
- [数量与 RETAIN](ch05-03-quantity-retain.md)：搬多少、留多少，输入端和输出端含义不同；
- [EACH：逐种资源计数](ch05-04-each-quantity.md)：`5 EACH *ingot*`；
- [多个限额与 OR](ch05-05-limit-list.md)：逗号和 `OR` 的区别；
- [EXCEPT](ch05-06-except.md)：排除某些资源；
- [WITH / WITHOUT](ch05-07-with-tag.md)：按物品标签（tag）匹配。
