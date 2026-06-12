# GitHub Merge Queue — Conceptual Notes

## The problem it solves
Two PRs can both pass CI individually but break main when merged together.
PR-A passes CI, PR-B passes CI, both merge, main breaks.
Merge Queue prevents this.

## How it works
PRs join a queue instead of merging directly.
GitHub tests each PR against main + all PRs ahead of it in the queue.
Only if that combined test passes does the PR merge.

## Batching
High traffic repos group multiple PRs into one CI run.
If the batch fails, GitHub bisects to find the culprit PR.

## Recovery
Failing PR is dropped from the queue automatically.
Remaining PRs are re-queued and re-tested without it.

## How this maps to no-console-log-cli
This repo has one critical invariant:
the rule must correctly detect console.log on every merge to main.
Merge queue enforces that — every merge is tested against real main.
No "it worked on my branch" surprises.

## Connection to feature flags
Feature flag = code runs only when flag is on.
Merge queue = code merges only when CI passes.
Both are controlled checkpoints that stop bad state moving forward.
