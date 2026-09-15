# Agent checkpoint handoff

Goal: Prepare a documentation release for a synthetic demo project
Owner (self-reported): Demo maintainer
Scope: Only docs/ in a disposable demo repository; review each external or destructive action separately\.

Planning record only. No action has been executed by this plugin. Decisions do not grant host or service permissions.
4 steps · 2 review-ready · 0 pending · 1 held · 1 waiting for dependencies

| Step | Effect | Decision | Dependency review |
| --- | --- | --- | --- |
| inspect | read | allow | ready |
| draft | write | allow | ready |
| publish | external | hold | hold |
| cleanup | delete | allow | waiting |

## inspect: Inspect the current documentation
Tool: file read · Target: docs/
Depends on: none
Acceptance: List changed pages and missing examples\.
Undo / rollback: No files are changed\.

## draft: Draft release notes
Tool: file edit · Target: docs/release\-notes\.md
Depends on: inspect
Acceptance: Draft includes installation steps and an example\.
Undo / rollback: Restore the previous file from version control\.

## publish: Publish the reviewed announcement
Tool: publishing service · Target: Demo project announcement channel
Depends on: draft
Acceptance: Maintainer has reviewed the exact final text and destination\.
Undo / rollback: A correction may be posted; delivery cannot be fully undone\.

## cleanup: Remove obsolete draft
Tool: file delete · Target: docs/obsolete\-draft\.md
Depends on: publish
Acceptance: The file is confirmed obsolete and backed up\.
Undo / rollback: Restore the backed\-up file\.
