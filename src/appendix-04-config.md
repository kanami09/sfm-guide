# 附录 D：服务器配置

SFM 的服务器配置**对客户端可见**（配置文件注释原文：*This config is shown to clients, don't put anything secret in here*）。

- 查看：`/sfm config show`，所有人可用；或者点击管理器界面的“查看服务器配置”；
- 编辑：`/sfm config edit`，需要管理员权限。

修改服务器配置后，各管理器会在下一刻检测到配置版本变化，自动重新编译程序。

## 服务器配置项

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| `disableProgramExecution` | `false` | 设为 `true` 时，所有管理器停止编译和运行程序（紧急情况使用） |
| `logResourceLossToConsole` | `true` | 发生“资源丢失”（目的地实际插入的数量少于模拟时声称的数量）时，是否在控制台输出详细报告 |
| `timerTriggerMinimumIntervalInTicks` | `20` | 定时触发器的最小间隔（刻），范围 1 ~ 2³¹−1 |
| `timerTriggerMinimumIntervalInTicksWhenOnlyForgeEnergyIOStatementsPresent` | `1` | 触发器中只有能量输入输出时的最小间隔 |
| `maxIfStatementsInTriggerBeforeSimulationIsntAllowed` | `10` | 一个触发器内 `IF` 的数量上限，超过后编译期不再模拟所有路径（模拟的路径数为 2ⁿ），只影响警告 |
| `maxDiskProblems` | `10` | 磁盘上最多显示多少条错误和警告 |
| `disallowedResourceTypesForTransfer` | `[]` | 禁止搬运的资源类型列表，元素为资源类型 ID，如 `"sfm:fluid"`。程序中引用这些类型会编译失败 |
| `levelsToShards` | `JustOne` | 附魔书转换成经验碎片的规则（与 SFML 无关） |

<div class="source">

[SFMServerConfig.java](https://github.com/TeamDman/SuperFactoryManager/blob/e9755fa9be3b9ccb1adb0ada36fd9b13422e1f82/platform/minecraft/projections/sfm-4.34.0/mc-1.21.1/src/main/java/ca/teamdman/sfm/common/config/SFMServerConfig.java)

</div>

## 客户端配置项

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| `showLabelGunReminderOverlay` | `true` | 手持标签枪时显示操作提示 |
| `showNetworkToolReminderOverlay` | `true` | 手持网络工具时显示操作提示 |

## 文本编辑器配置

可以在编辑器左下角的按钮中修改：

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| `showLineNumbers` | `false` | 显示行号 |
| `intellisenseLevel` | `OFF` | 智能提示：`OFF` / 基础 / 高级 |
| `preferredEditor` | `sfm:v1` | 首选编辑器：V1 / V2 |
