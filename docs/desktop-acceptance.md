# Desktop acceptance / 桌面验收

**Passed for Agent Checkpoint Desk 1.0.0 in iPollo 0.50.12 / macOS arm64.** The tested engine was OpenCode with the existing GPT-5.5 configuration. Testing used a dedicated local project and synthetic documentation actions; the actions themselves were never executed.

**Agent Checkpoint Desk 1.0.0 已在 iPollo 0.50.12 / macOS arm64 中通过验收。** 使用 OpenCode 引擎与已有 GPT-5.5 配置，在专用本地项目中测试模拟文档流程，没有执行计划中描述的发布或删除动作。

## Package identity

- Name: Agent Checkpoint Desk; publisher display name: Sevaschan.
- Plugin ID: `agent-checkpoint-desk`; publisher ID: `sevaschan`; update ID: `sevaschan/agent-checkpoint-desk`.
- Version: `1.0.0`; one UI resource, `ui/index.html`.
- Ordinary declarative package, `source.trusted=false`; no requested permissions, authorization methods, external endpoints, local services, native binaries or process MCP servers.
- Installed archive: `agent-checkpoint-desk-1.0.0.ipollowork-plugin`.
- SHA-256 of the installed archive: `0b44cd5c97308ef6e53d7cf57cbea88a25c7c442750e633cbb21353efcfe44b6`.

## Observed checks

| Check / 检查 | Observed result / 实际结果 |
| --- | --- |
| File import preview | Correct name/version; declarative safety check passed |
| Installation and enablement | One UI resource enabled; author Sevaschan; version confirmed |
| Workspace panel | Checkpoint Desk opens and displays Connected |
| Manual review | Allowed inspect/draft/cleanup, held publish; 2 ready, 1 held, 1 waiting |
| Attention filter | Only publish and cleanup remain |
| Invalid input | Missing-goal error displayed; existing decisions and results preserved |
| Markdown / JSON export | Actual panel exports contain complete plan, decisions and expected summary |
| Model integration | On both preview and reinstalled stable version: get_review twice, import_plan once |
| Fresh import | All 4 decisions reset to pending; no decisions restored implicitly |
| Panel close / reopen | Empty initial state and Connected; externally saved files retained |
| Preview upgrade | 1.0.0-beta.1 → 1.0.0 through the Update button; stable UI usable |
| Uninstall | Only this test plugin removed from installed list; project files retained |
| Reinstall | Same 1.0.0 archive installed and actual model tools worked again |

“Manual review” means the UI controls were exercised by desktop test automation. This is a synthetic acceptance run, not evidence that a real maintainer authorized the sample actions.

“手动审阅”指桌面自动化实际操作了面板按钮。这是模拟验收，不是某位真实维护者授权执行示例操作的证明。

## Actual saved outputs

The stable installation's model tool results were saved in the test project and copied without changing their contents:

- [checkpoint-review.json](../examples/checkpoint-review.json): total 4, allowed 3, ready 2, held 1, waiting 1, pending 0.
- [checkpoint-handoff.md](../examples/checkpoint-handoff.md): exact Markdown from get_review, compared against the formatter and observed panel export.
- [checkpoint-pending.json](../examples/checkpoint-pending.json): total 4, pending 4 after import_plan.

The earlier saved project receipt and handoff retained their SHA-256 hashes after panel reload, upgrade, uninstall and reinstall. State inside the panel is intentionally temporary; the checked persistence is of files saved outside the plugin installation directory.

以上文件来自正式安装后的真实工具返回。面板状态有意设计为临时状态；这里验证的是已保存到插件安装目录之外的项目文件，在重新加载、升级、卸载和重装后保持不变。

The `expected-*` files remain separate deterministic fixtures. Their names and descriptions do not imply desktop execution evidence.

## Automated validation

12 Node.js tests passed for decision transitions, direct/transitive dependencies, cyclic and malformed inputs, dense DAG responsiveness, UTF-8 limits, receipt import behavior, Markdown escaping, bundled-script syntax and archive contents. The strict upstream schemaVersion 2 validator passed using iPolloWork schema commit `0aaa843a91cc4f67c1a673064b36305a2076ea6f`. An initial schema rejection was fixed by using lowercase publisher/update IDs; the display name remains Sevaschan.

The install archive contains exactly the root manifest and bundled HTML file, with safe relative paths and no symlinks. Archive size, expanded size and file count are within the documented limits. Its payload matches the source files. Source and payload were checked for the configured credentials and common token/private-key patterns, with no matches.

## Verified scope

Full application restart, Windows/Linux desktop use, other iPollo versions, and other engines/models were not tested. The plugin does not enforce host permissions, prove identity, verify execution, or integrate with Microsoft services. No live release, message, data deletion or other action in the synthetic plan was performed.

未测试完整应用重启、其他操作系统、其他 iPollo 版本及其他引擎/模型。本插件不负责宿主权限执行、身份认证或操作完成证明，也没有微软服务连接。

Published source and archive checks are performed separately at release time. Compare the release's `SHA256SUMS` with the installed-archive hash above; source ZIPs are development artifacts, not installation packages.
