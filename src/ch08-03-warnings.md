# 编译检查与警告

SFM 的诊断信息分两类：

- **错误（error）**：程序无法运行，管理器状态显示“无效程序”；
- **警告（warning）**：程序可以运行，但很可能有问题。

两者都会标注在磁盘的提示信息中。磁盘上最多显示多少条，由服务器配置 `maxDiskProblems` 决定（默认 10 条）。管理器界面的警告按钮：**点击**把带诊断注释的代码复制到剪贴板，**Shift + 点击**尝试自动修复。

## 错误

### 语法错误

由 ANTLR 解析器产生，格式为 `line 行:列 描述`，比如：

```text
line 3:15 mismatched input 'east' expecting {EACH, TOP, BOTTOM, ...}
line 1:4 token recognition error at: '原'
```

常见原因：

| 现象 | 原因 |
| --- | --- |
| `token recognition error` | 使用了词法不认识的字符，比如未加引号的中文、`.`、`-` |
| `mismatched input 'xxx'` | 关键字被当成了名字（加引号），或者各部分的顺序错了 |
| `missing END` / `extraneous input` | `DO`/`THEN` 与 `END` 没有配对 |

### 编译期错误

| 错误信息 | 原因 |
| --- | --- |
| *Minimum trigger interval is N ticks.* | 定时触发器的间隔小于最小值（见[定时触发器](ch03-01-timer.md#最小间隔)） |
| *Label name cannot be longer than 256 characters.* | 标签太长 |
| *Invalid resource identifier pattern "..."* | 带引号的正则表达式不合法 |
| *Program references an unknown resource type "..."* | 资源类型不存在（拼错了，或者没装对应模组） |
| *Program has a malformed resource type "..."* | 资源类型部分格式非法，比如用了通配符 |
| *Program references a disallowed resource type "..."* | 资源类型被服务器禁用 |
| *Redstone signal strength cannot be greater than ...* | `REDSTONE` 比较的数字过大 |
| *Program execution is disabled via config* | 服务器开启了 `disableProgramExecution` |

## 警告

### 标签

| 警告 | 含义与处理 |
| --- | --- |
| *Label "x" is used in code but not assigned in the world.* | 程序用到了标签 x，但没有方块贴着它。检查拼写和大小写，确认已经推送 |
| *Label "x" is assigned in the world but not defined in code.* | 有方块贴着 x，但程序没用到。可能是旧标签，可以清掉 |
| *Label "x" is assigned in the world at ... but not connected by cables.* | 方块不在线缆网络中 |
| *Label "x" is assigned in the world at ... and is connected by cables but is not detected as a valid inventory.* | 方块连进了网络，但没有任何 SFM 能处理的能力 |
| *Did you remember to push your labels using the label gun?* | 提醒你推送标签 |

### 输入输出

| 警告 | 含义与处理 |
| --- | --- |
| *Statement "..." inputs "..." from "..." but no future output statement consume "..."* | 这条 `INPUT` 登记的某种资源类型，后面没有任何 `OUTPUT` 会消费。常见原因：漏写了 `OUTPUT`；或者 `OUTPUT` 没写对应的资源类型（如 `fluid::`） |
| *Statement "..." uses resource type "..." which has no matching input statement.* | `OUTPUT` 的资源类型在前面没有对应的 `INPUT` |
| *Statement matches no slots* | 指定的槽位或方向上没有槽位 |
| *No slots support extraction* | 匹配到的槽位都不允许抽取 |
| *No slots support insertion* | 匹配到的槽位都不允许插入 |
| *Resource "..." was not found.* | 资源标识符（非通配符）在注册表中找不到，多半是拼错了 |

### 写法

| 警告 | 含义与处理 |
| --- | --- |
| *EACH used without a pattern* | 数量后的 `EACH` 用在只可能匹配一种资源的资源条目上，没有意义（见 [5.4](ch05-04-each-quantity.md)） |
| *Round robin by block shouldn't be used with EACH* | `ROUND ROBIN BY BLOCK` 与 `FROM EACH`/`TO EACH` 同时使用 |
| *Round robin by label should be used with more than one label* | `ROUND ROBIN BY LABEL` 只列了一个标签 |

### Mekanism

| 警告 | 含义与处理 |
| --- | --- |
| *Mekanism blocks are read-only from the null direction* | 在 Mekanism 方块上没写方向 |
| *Mekanism block side config at ... doesn't agree with statement* | 程序中的方向与机器的面配置不一致 |

## 警告是怎样产生的：路径模拟

“`INPUT` 没有被消费”这类警告，需要知道程序可能走哪些路径。SFM 的做法是**模拟所有路径**：对每个触发器，把其中 n 个 `IF` 的真假组合全部枚举一遍（2ⁿ 种），在每条路径上跟踪 `INPUT` / `OUTPUT` / `FORGET` 的效果。

当一个触发器内的 `IF` 数量超过服务器配置 `maxIfStatementsInTriggerBeforeSimulationIsntAllowed`（默认 10）时，这个触发器就不做模拟，并记录 *"Too many conditions for simulation, some linter warnings may be missed."*。这时与路径相关的警告可能会漏报，但**不影响程序的实际运行**。

<div class="note">

警告是在**编译时**根据当时的世界状态生成的。比如某个标签当时没贴，就会产生警告；之后贴上并推送，警告会在下一次重新编译（例如打开管理器界面）时更新。

</div>
