# Past Team CI/CD + Observability Reflection

## CI/CD — How it worked
The team I worked with had CI running on every PR:
- install dependencies
- run unit tests
- run build verification
- block merge if anything failed

Deployments were manual — someone triggered a deploy script
after merging to main. No automatic continuous delivery.

## What signals they used
- pass/fail on the test suite was the main signal
- Slack notification when main pipeline broke
- build time noticed informally, never tracked formally

## What worked well
The PR gate was trusted. Nobody merged without a green check.
Tests ran fast — under 2 minutes — so feedback was quick.

## What I would want to understand better
Why were deployments still manual? Trust gap or just never prioritised?
When main broke despite green PRs — what integration gaps existed?
How did the team decide what to test vs skip? Implicit knowledge I never got.

## What I would add now
- Automatic deploy to staging on every merge to main
- Merge queue to prevent green PR + red main scenarios
- DORA metrics — lead time and change failure rate tracked weekly
- Cache monitoring so slow CI is caught before it becomes normal

---

## Observability — How it worked
Observability was mostly reactive.
Main tools: SSH server logs + basic uptime ping monitor.
We looked at logs after something broke, not before.

## What signals they used
- uptime percentage — is the service up?
- error logs — what broke, read after the fact
- user reports — often the first real signal

## What worked well
Hard outages caught quickly by the uptime monitor.
Error logs detailed enough to debug most issues.
Small team meant fast communication when things broke.

## What I would want to understand better
Were there slow degradations nobody noticed?
The monitor only caught complete failures, not gradual slowdowns.
How much time was reactive debugging vs proactive monitoring?

## What I would add now
- Datadog APM — see where requests slow down
- Structured logs — searchable, not raw SSH output
- p99 latency monitor — catch slowness before users report it
- Error rate monitor — alert when error % crosses threshold
- Shared dashboard visible to the whole team

---

## Key connection to this project
My chat-dump logging background taught me:
decide what questions you need to answer before the incident.
Then make sure those signals exist.

This observability plan asks:
what would I need to know if the rule silently stopped working?
Answer: rule.violations.found dropping to zero.
That is the first monitor I would set up.

Same instinct. Different stack.
