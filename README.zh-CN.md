# Agent Checkpoint Desk · 智能体行动检查台

[English](README.md) · [iPolloWork](https://github.com/Devin-AXIS/iPolloWork) · MIT

把 AI 智能体的行动计划整理成可审阅、可交接的记录：检查每一步影响什么，记录人工决定，追踪步骤依赖，并导出完整的 Markdown 或 JSON。

**支持 iPolloWork：**已在 **iPollo 0.50.12 / macOS arm64** 中完成文件导入、安装、面板连接和手动交互。插件还提供可选的模型导入与读取工具。详见[验收说明](docs/desktop-acceptance.md)中的实际测试范围。

## 适合谁使用

适合把多步骤工作交给 AI 智能体的开发者、维护者和运营人员，尤其是文档发布、数据清理，以及同时涉及本地修改与外部发布的流程。你可以把审阅过的计划和决定一起交给下一位执行者，而不用重新解释聊天记录。

自然语言计划容易掩盖步骤依赖。例如，删除旧草稿可能依赖公告已经发布，而发布又需要先审阅最终文本。检查台把这些关系与每一步的工具、目标、验收条件和撤回办法放在一起。

## 核心功能

- 导入包含 1–100 个步骤、各步骤 ID 唯一的结构化计划。
- 检查工具、目标、影响类型（读取 `read`、写入 `write`、外部操作 `external`、删除 `delete`）、依赖、验收条件与回退说明。
- 在面板逐项点击**允许、暂缓或重置**，记录人工决定。
- 只有当前步骤及全部依赖都被允许，才显示**审阅就绪**；被允许的步骤仍可能因依赖未通过而等待。
- 筛选待决定、暂缓或等待依赖的步骤，集中处理未完成审阅。
- 导出完整 Markdown 交接文件，或包含原始计划、人工决定和统计结果的 JSON 回执。
- 智能体可通过 `import_plan` 导入新计划、通过 `get_review` 读取结果；这两个工具均不能替人记录决定。

它是人工计划工具，不会执行列出的工具、发送公告、删除文件、验证实际执行完成情况，也不会修改 iPollo 或外部服务的权限。回执中的负责人和决定是记录内容，不是经过签名的身份或执行证明。本插件没有连接微软模型，也不代表微软认证。

## 在 iPolloWork 中安装和打开

安装包面向 [iPolloWork](https://github.com/Devin-AXIS/iPolloWork) 使用。下面是已验证的文件导入与工作区面板操作流程。

1. 从 [Releases](https://github.com/Sevaschan/agent-checkpoint-desk/releases/latest) 下载 `agent-checkpoint-desk-1.0.0.ipollowork-plugin`，或按下文自行构建。源码 ZIP 用于开发，不是安装包。
2. 打开 iPollo 的**扩展 → 插件 → 添加 → 文件**，选择 `.ipollowork-plugin` 文件并查看预览。
3. 核对名称 **Agent Checkpoint Desk / 智能体行动检查台**、发布者 **Sevaschan**、版本 **1.0.0** 和一个 UI 资源，点击**安装插件**并确认资源已启用。
4. 在本地项目任务中点击**打开右侧面板**；若面板已经打开，则点击 **+ / 添加侧面板入口**，选择 **Checkpoint Desk**。
5. 面板应显示 **iPollo 已连接 / Connected**。点击模拟案例即可手动操作；让模型调用工具时保持面板打开。

使用打包后的界面无需单独登录、API Key、npm 安装或后台服务。只有让智能体导入和读取结果时，才需要 iPollo 中已有可用的模型配置。不要把任意 GitHub 仓库链接导入当作通用安装方式。

## 完整操作示例

[examples/release-plan.json](examples/release-plan.json) 是模拟文档流程，包含四步：`inspect → draft → publish → cleanup`。

1. 点击**模拟案例 / Sample**，四个步骤均从“待决定”开始。
2. 允许 `inspect` 和 `draft`，暂缓 `publish`，允许 `cleanup`。
3. 预期结果为：**4 个步骤、3 个允许、2 个审阅就绪、1 个暂缓、1 个等待依赖、0 个待决定**。因为发布被暂缓，清理步骤仍需等待。
4. 点击**待处理 / Attention**，应只显示 `publish` 和 `cleanup`。
5. 导出 Markdown，选中生成的文本并复制保存为项目中的 `checkpoint-handoff.md`；再导出 JSON，保存为 `checkpoint-review.json`。
6. 重置 `inspect`，它后面的依赖步骤将不再显示审阅就绪。如需保留新结果，请重新导出。

仓库同时提供了桌面实际生成的[审阅回执](examples/checkpoint-review.json)、[交接文档](examples/checkpoint-handoff.md)和[重新导入结果](examples/checkpoint-pending.json)。

仓库中的[预期交接文件](examples/expected-handoff.md)和[预期回执](examples/expected-review.json)是第 3 步的确定性测试样例，不是桌面实际生成的证据。示例不会真正发布或删除任何内容。

希望由智能体协助时，先把例子放进 iPollo 项目，再输入：

> 读取 release-plan.json，发现 Checkpoint Desk 工作区应用的工具，使用 import_plan 导入其中的计划。调用 get_review，汇总待决定事项，不执行计划中的操作。

手动决定后，让智能体**只调用 `get_review`**，将返回的 Markdown/JSON 保存到项目文件。再次调用 `import_plan` 会开始新一轮审阅并清空全部决定，即使计划内容完全相同。

## 输入输出格式

输入是 JSON 对象，且只包含 `schemaVersion: 1`、`goal`、`owner`、`scope`、`actions`。每个步骤的字段必须与[示例](examples/release-plan.json)一致。文本字段长度为 1–5,000 个字符；ID 最多 64 个字符，由小写字母、数字、连字符组成，并以字母开头。整个计划按 UTF-8 JSON 限制为 1 MiB。依赖 ID 不能重复，必须存在，且不能形成循环。未知字段会明确报错，不会被悄悄忽略。

JSON 回执包含 `kind`、`recordType`、原始 `plan`、`decisions` 和 `summary`。需要重新审阅已保存回执时，取出其中的 **`plan` 对象**再导入。原决定仍留在保存的文件里，但不会作为批准状态恢复到新审阅。Markdown 包含范围以及每一步的目标、依赖、验收和撤回说明。

## 构建与打包

开发需要 Node.js 22+ 以及 `zip`、`unzip` 命令。无需安装 npm 依赖。

```sh
npm test
npm run build
npm run package
```

构建过程把 `src/checkpoints.mjs`、界面模板和模拟示例组合为独立的 `ui/index.html`。打包使用干净的临时目录，安装 ZIP 根目录仅有一份 `ipollowork.plugin.json` 及 UI 文件，不含本地执行服务、特权权限、远程接口或凭据。

发布前需用匹配版本的 iPolloWork schema 校验严格的 schemaVersion 2 清单，完成桌面验收，并对最终归档计算 SHA-256。已发布的同版本文件不得替换内容；修改后递增语义版本，保持插件 ID、发布者和 update ID 稳定。源码归档单独提供。

## 常见问题

**允许后为什么仍显示等待？** 它的直接或间接依赖中仍有待决定、暂缓或等待的步骤。先检查列出的依赖 ID。

**会自动保存决定吗？** 不会。状态只保存在当前面板中，关闭、重新加载、更新和卸载前请导出并保存文件。插件没有权限删除你保存到安装目录之外的项目文件。

**JSON 无法载入怎么办？** 查看具体错误并对照示例检查字段。导入失败会保留上一份审阅；成功导入则重置决定。

**模型为什么找不到工具？** 先打开 Checkpoint Desk 面板并检查连接状态，必要时重新加载。手动界面无需模型；工具调用取决于宿主是否支持工作区应用工具，以及模型配置是否可用。

**点击允许是否就授权智能体执行了？** 它只记录计划决定。智能体与宿主仍需遵守用户实际指令、权限和执行检查。这里的依赖就绪表示审阅决定通过，不表示前置操作已经实际完成。

## 开发与验证

[桌面验收说明](docs/desktop-acceptance.md)记录当前进度和剩余项目。自动化检查覆盖决定状态变更、间接依赖、循环、无效输入、回执行为、Markdown 转义和包内容。实测环境为 macOS arm64 / iPollo 0.50.12。已检查面板重新加载、从预览版升级、卸载和重装，保存在项目中的文件 SHA-256 始终一致。完整应用重启、其他宿主版本、系统和引擎尚未验证。

采用 MIT 许可证。部分打包与桥接方式沿用 MIT 开源的 Review Ledger Board，相关署名保留在 [LICENSE](LICENSE)。
