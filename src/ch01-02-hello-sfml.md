# Hello, SFML!

学一门编程语言，通常从 “Hello, World!” 开始。在 SFML 里，与它对应的程序是：**把一个箱子里的东西搬到另一个箱子**。

## 第一步：摆放方块

在世界里摆好下面这些方块：

```text
 [箱子 A] [工厂线缆] [工厂管理器] [工厂线缆] [箱子 B]
```

管理器本身就相当于线缆，所以两个箱子直接贴着管理器也可以。往箱子 A 里随便放些物品。

## 第二步：插入磁盘，编写程序

1. 右键打开工厂管理器，把**程序磁盘**放进槽位；
2. 点击“**编辑**”（或按 `Ctrl + E`），打开文本编辑器；
3. 输入下面的程序：

   ```sfml
   NAME "Hello SFML"

   EVERY 20 TICKS DO
       INPUT FROM a
       OUTPUT TO b
   END
   ```

4. 按 `Shift + Enter`，或点击完成按钮，保存并关闭编辑器。

如果管理器状态显示“**无效程序**”，说明程序有语法错误。把鼠标悬停在磁盘上，可以看到错误信息和出错的行号。

<div class="note">

也可以在电脑上用文本编辑器写好程序，复制后在管理器界面点击“从剪贴板粘贴”（或按 `Ctrl + V`）。VS Code 有官方的 SFML 语法高亮扩展，搜索 *Super Factory Manager Language* 即可找到。

</div>

## 第三步：贴标签并推送

现在程序里有两个标签：`a` 和 `b`，但世界里还没有任何方块贴上它们。

1. 手持**标签枪**，**Shift + 右键**管理器，从程序中**拉取**标签，标签枪里就有了 `a` 和 `b`；
2. 用 Shift + 滚轮切换到 `a`，右键箱子 A；
3. 切换到 `b`，右键箱子 B；
4. **不按 Shift，直接右键管理器**，把标签**推送**到磁盘。

几秒钟之内，箱子 A 里的物品就会陆续出现在箱子 B 中。

## 逐行解读

```sfml
NAME "Hello SFML"
```

**程序名**，可选。它会显示为磁盘的名称。如果要写，只能写一次，而且必须放在程序最开头。

```sfml
EVERY 20 TICKS DO
    -- ...
END
```

**定时触发器**：每 20 游戏刻执行一次 `DO` 和 `END` 之间的内容。在不卡顿的情况下，Minecraft 每秒运行 20 刻，所以这里就是“每秒一次”。没有触发器的程序什么也不会做。第 3 章会详细讲解触发器。

```sfml
INPUT FROM a
```

**输入语句**：声明“贴了 `a` 标签的方块是本次搬运的**来源**”。要特别注意：

<div class="warning">

**`INPUT` 本身不搬运任何东西。** 它只是把来源登记下来。真正搬运发生在后面的 `OUTPUT` 语句执行时。SFM 也没有“中转缓冲区”，物品是从来源直接进入目的地的。模组内置示例 `a_simple_program.sfml` 里的原话是：*on their own, input statements do nothing; there is no item buffer*。

</div>

```sfml
OUTPUT TO b
```

**输出语句**：把之前登记过的所有来源中的东西，尽可能多地搬进贴了 `b` 标签的方块。

## 试着改一改

**只搬圆石：**

```sfml
EVERY 20 TICKS DO
    INPUT cobblestone FROM a
    OUTPUT TO b
END
```

**每次只搬 1 个：**

```sfml
EVERY 20 TICKS DO
    INPUT 1 FROM a
    OUTPUT TO b
END
```

**在 A 里留下 10 个铁锭，其余都搬走：**

```sfml
EVERY 20 TICKS DO
    INPUT RETAIN 10 iron_ingot FROM a
    OUTPUT TO b
END
```

**每 5 秒执行一次：**

```sfml
EVERY 5 SECONDS DO
    INPUT FROM a
    OUTPUT TO b
END
```

这几个写法分别会在[资源匹配与数量](ch05-00-resources.md)和[触发器](ch03-00-triggers.md)两章中详细讲解。

## 如果程序不工作

按下面的顺序检查：

1. **管理器状态**是不是“运行中”？如果显示“无效程序”，就是有语法错误，悬停磁盘可以看到错误信息。
2. **标签推送了吗？** 贴完标签后要右键管理器推送。
3. **容器连进网络了吗？** 手持网络工具可以透视查看线缆。
4. **磁盘上有没有警告？** 悬停磁盘，或者看管理器界面上的警告按钮。下一节会介绍各种警告的含义。

下一节介绍[编辑器与调试工具](ch01-03-editor-and-tools.md)。
