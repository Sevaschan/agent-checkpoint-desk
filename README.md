# Agent Checkpoint Desk

[简体中文](README.zh-CN.md) · [iPolloWork](https://github.com/Devin-AXIS/iPolloWork) · MIT

Turn an AI agent's action plan into a reviewable handoff: see what each step touches, record human decisions, trace dependencies, and export the complete review as Markdown or JSON.

**iPolloWork support:** file import, installation, workspace-panel connection and manual operation have been exercised in iPollo **0.50.12 / macOS arm64**. The package also supports optional model-assisted imports and reads. See [validation details](docs/desktop-acceptance.md) for the exact test scope.

## Who it helps

The desk is for developers, maintainers, and operators who delegate multi-step work to AI agents and need an explicit, portable record of the plan they reviewed. It is useful before a documentation release, a data-cleanup job, or a workflow that mixes local edits with external publishing.

A paragraph of proposed work often hides dependencies: deleting a draft may depend on a successful publication, while publication needs a final text review. This desk places those relationships beside the target, tool, acceptance condition, and undo plan for every action.

## What you can do

- Import a structured plan with 1–100 uniquely identified steps.
- Inspect the intended tool, target, effect (`read`, `write`, `external`, or `delete`), dependencies, acceptance condition, and rollback notes.
- Record **Allow**, **Hold**, or **Reset** for each step using the panel controls.
- See a step as **review-ready** only when it and all its dependencies are allowed. An allowed step can still be waiting for a dependency.
- Filter to steps that need attention, including pending, held, and dependency-waiting steps.
- Export a Markdown handoff or a JSON receipt containing the exact plan, decisions, and summary.
- Let an agent import a fresh plan with `import_plan` and read the current review with `get_review`. Neither tool can record a human decision.

This is a manual planning tool. It does not run the listed tools, publish messages, delete files, verify completion, or enforce permissions in iPollo or any external service. A saved receipt is a self-reported review record, not signed evidence of identity or execution. There is no Microsoft model connection or certification.

## Install and open in iPolloWork

The package is designed for use in [iPolloWork](https://github.com/Devin-AXIS/iPolloWork). Use the verified file-import and workspace-panel procedure below.

1. Obtain `agent-checkpoint-desk-1.0.0.ipollowork-plugin` from [Releases](https://github.com/Sevaschan/agent-checkpoint-desk/releases/latest), or build it using the instructions below. The source ZIP is for development and is not an install package.
2. In iPollo, open **扩展 → 插件 → 添加 → 文件**, select the `.ipollowork-plugin` file, and inspect the preview.
3. Check **Agent Checkpoint Desk / 智能体行动检查台**, publisher **Sevaschan**, version **1.0.0**, and the single UI resource. Choose **安装插件** and ensure the resource is enabled.
4. In a local project task, use **打开右侧面板**, or **+ / 添加侧面板入口** when a panel is already open. Select **Checkpoint Desk**.
5. The panel should show **iPollo 已连接 / Connected**. Load the sample to use it manually. Keep the panel open for model tool calls.

No separate login, API key, npm installation, or background service is required to use the packaged UI. An existing working model configuration in iPollo is needed only for agent-assisted imports and reads. Arbitrary GitHub repository URLs are not a general installation path.

## Try a complete workflow

Use [examples/release-plan.json](examples/release-plan.json), a synthetic documentation workflow with four steps: `inspect → draft → publish → cleanup`.

1. Click **模拟案例 / Sample**. All four decisions start pending.
2. Allow `inspect` and `draft`, hold `publish`, and allow `cleanup`.
3. The expected summary is **4 steps, 3 allowed, 2 review-ready, 1 held, 1 waiting, 0 pending**. Cleanup remains waiting because publishing is held.
4. Choose **待处理 / Attention**. Only `publish` and `cleanup` should remain.
5. Export Markdown, select the generated text, and save it as `checkpoint-handoff.md` in your project. Export JSON and save it as `checkpoint-review.json`.
6. Reset `inspect`. Its dependent steps cease being review-ready. Export again if you want an updated receipt.

The desktop-generated [review receipt](examples/checkpoint-review.json), [handoff](examples/checkpoint-handoff.md), and [fresh-import result](examples/checkpoint-pending.json) are also included.

The committed [expected handoff](examples/expected-handoff.md) and [expected receipt](examples/expected-review.json) are deterministic test fixtures for step 3, not desktop-generated evidence. Nothing in this sample is actually published or deleted.

For agent-assisted use, place the example in your iPollo project and ask:

> Read release-plan.json. Discover the Checkpoint Desk workspace app tools and call import_plan with its plan. Read get_review and summarize pending decisions. Do not execute any proposed action.

After manually making decisions, ask the agent to call **only `get_review`** and save its returned Markdown/JSON. Calling `import_plan` again always begins a new review and resets all decisions, even if the plan is identical.

## Input and output contract

The plan is a JSON object with exactly `schemaVersion: 1`, `goal`, `owner`, `scope`, and `actions`. Each action has exactly the fields illustrated in [the sample](examples/release-plan.json). Text fields must contain 1–5,000 characters. IDs are lowercase letter/digit/hyphen slugs, start with a letter, and contain at most 64 characters. Plan input is limited to 1 MiB of UTF-8 JSON. Dependencies must be unique, refer to existing IDs, and form an acyclic graph. Unknown fields are rejected rather than silently discarded.

The JSON receipt includes `kind`, `recordType`, the original `plan`, `decisions`, and `summary`. To review a saved receipt again, extract its **`plan` object** and import that object. Previous decisions remain in the saved file but are not restored as approvals. The Markdown includes the scope and every step's target, dependency, acceptance, and undo notes.

## Build and package

Development requires Node.js 22+ and the `zip`/`unzip` command-line tools. There are no npm dependencies to install.

```sh
npm test
npm run build
npm run package
```

The build combines `src/checkpoints.mjs`, the UI template, and the synthetic example into a self-contained `ui/index.html`. Packaging uses a clean temporary directory. The install ZIP contains one root `ipollowork.plugin.json` and the UI file. It has no local executable service, privileged permissions, remote endpoints, or credentials.

Before a release, validate the strict schemaVersion 2 manifest against the matching iPolloWork schema, finish the desktop acceptance checklist, and compute SHA-256 for the final archive. Never replace bytes under a published version; increment the semantic version while keeping the plugin ID, publisher, and update ID stable. Source archives should be delivered separately.

## Questions and troubleshooting

**Why does an allowed step still say Waiting?** One of its direct or transitive dependencies is pending, held, or waiting. Inspect the dependency IDs before changing a decision.

**Are decisions saved automatically?** No. State lives in the current panel. Export and save both files before closing, reloading, updating, or uninstalling. The plugin has no access to delete project files you save outside its installation directory.

**Why won't my JSON load?** Check the visible error, compare your fields with the sample, and remove unknown fields. A failed import keeps the previous review intact. A successful import resets decisions.

**Why are the tools unavailable?** Open the Checkpoint Desk panel and check its connection status. Reload the panel if needed. Manual UI use does not require a model, but model calls depend on the host's workspace-app support and working model configuration.

**Does Allow authorize an agent to act?** It records a planning decision only. The agent and host must still follow the user's actual instructions, permissions, and execution checks. Dependency readiness here concerns review decisions, not whether predecessor actions have run.

## Development and validation

See [desktop acceptance](docs/desktop-acceptance.md) for the exact status and remaining tests. Automated coverage checks decision transitions, transitive dependencies, cycles, invalid imports, receipt behavior, Markdown escaping, and package contents. The accepted host is macOS arm64 / iPollo 0.50.12. Panel reload, upgrade from the preview, uninstall and reinstall were exercised while saved project files retained their SHA-256 hashes. Full application restart and other host versions, systems and engines are not verified.

MIT licensed. Portions of the original packaging/bridge approach derive from the MIT-licensed Review Ledger Board; retained attribution is in [LICENSE](LICENSE).
