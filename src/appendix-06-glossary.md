# 附录 F：术语表

| 中文 | 英文 / 源码名 | 解释 |
|---|---|---|
| 工厂管理器 | Factory Manager / `ManagerBlock` | 运行程序的方块 |
| 程序磁盘 | Disk | 保存程序源码和标签数据的物品 |
| 标签 | Label | 用标签枪贴在方块上的名字，程序通过它找到方块。**区分大小写** |
| 物品标签（tag） | Tag / `TagKey` | 数据包定义的分类，如 `#c:ingots`。在 `WITH` 中使用 |
| 推送 / 拉取 | Push / Pull | 标签枪与磁盘之间同步标签：右键管理器为推送，Shift + 右键为拉取 |
| 线缆网络 | Cable Network | 由线缆和管理器连成的网络，只有其中的方块能被访问 |
| 能力 | Capability | Forge/NeoForge 中方块对外暴露的物品栏、流体槽、能量存储等接口。SFM 通过能力访问方块 |
| 刻 | Tick | 游戏时间单位，每秒 20 刻 |
| 触发器 | Trigger | `EVERY ... DO ... END`，决定语句块何时执行 |
| 定时触发器 | Timer Trigger / `TimerTrigger` | 按固定间隔执行 |
| 红石脉冲触发器 | Pulse Trigger / `RedstoneTrigger` | 收到红石上升沿时执行 |
| 本地时钟 / 全局时钟 | Local / Global alignment | 管理器自己的计数器 / 世界游戏时间 |
| 语句块 | Block | 触发器或 `IF` 分支中的语句序列 |
| 语句 | Statement | `INPUT`、`OUTPUT`、`IF`、`FORGET` |
| 上下文 | Context / `ProgramContext` | 一次触发器执行的状态，包括已登记的输入 |
| 标签访问 | Label Access / `LabelAccess` | 标签列表 + 轮询 + 方向 + 槽位 |
| 方向限定 | Side Qualifier | `TOP SIDE`、`EACH SIDE` 等 |
| 无方向 | Null side | 不指定方向时请求能力的方式 |
| 槽位限定 | Slot Qualifier | `SLOTS 0-8` |
| 资源 | Resource | 能被搬运的东西：物品、流体、能量…… |
| 资源类型 | Resource Type / `ResourceType` | `sfm:item`、`sfm:fluid`、`sfm:forge_energy` 等 |
| 资源标识符 | Resource Identifier / `ResourceIdentifier` | 四段式 `类型命名空间:类型:命名空间:名字`，支持简写和通配符 |
| 资源限额 | Resource Limit / `ResourceLimit` | 数量 + 保留量 + 资源 + `WITH` 条件 |
| 数量 | Quantity | 最多搬多少 |
| 保留量 | Retention / `RETAIN` | 输入端：至少留多少；输出端：最多补到多少 |
| 资源析取 | Resource disjunction | 用 `OR` 连接、共享一个限额的多个资源 |
| 排除 | Exclusion / `EXCEPT` | 语句级的资源排除列表 |
| 计数器 | Tracker | 记录已搬数量和保留义务的对象。`EACH` 决定计数器的粒度 |
| 集合运算符 | Set Operator | `OVERALL`、`EVERY`、`SOME`、`ONE`、`LONE` |
| 轮询 | Round Robin | 每次执行只选一个方块或标签，依次轮换 |
| 静态检查 / 警告 | Lint / Warning | 编译时发现的可疑写法 |
| 资源丢失 | Resource Loss | 目的地实际接收的数量少于模拟时声称的数量，导致东西消失。属于其他模组的兼容性问题 |
