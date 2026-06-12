# Observability Plan — no-console-log-cli

## Context
no-console-log-cli is a custom ESLint rule that detects console.log
in JavaScript files and flags it as a violation.

If this rule was adopted by multiple teams running it in CI,
here is what we would measure, visualise, and alert on.

## 1. Metrics

| Metric | Type | What it tells us |
|--------|------|-----------------|
| rule.triggered.total | counter | how many times the rule ran |
| rule.violations.found | counter | how many console.log calls caught |
| rule.false_negatives | counter | console.log calls the rule missed |
| ci.run.duration_ms | gauge | how long full CI takes per PR |
| ci.run.pass_rate | gauge | % of PRs passing CI over time |
| npm.cache.hit_rate | gauge | how often node_modules cache reused |
| npm.install.duration_ms | gauge | time saved by caching vs cold install |

## 2. Dashboards

### Rule Health
- violations found per day (line chart)
- rule pass rate trend over 30 days
- valid cases correctly ignored (console.warn, console.error)

### CI Performance
- average CI run duration over time
- cache hit rate per day
- failed vs passed CI runs per day

### Adoption (if published to npm)
- weekly npm downloads
- active repos using the rule
- version distribution — latest vs outdated

## 3. Monitors

| Monitor | Alert when | Why |
|---------|------------|-----|
| Rule not firing | violations = 0 for 24h | rule may be silently broken |
| CI failure spike | > 3 failures/hour on main | something broke the test suite |
| CI duration spike | run time > 2x baseline | dependency bloat or runner issue |
| Cache miss rate | hit rate drops below 50% | package-lock.json churn |
| Test suite failure | any test fails on main | rule regression — fix immediately |

## 4. Connection to my background

Circuit breaker = stop calling a broken service.
CI gate = stop merging broken code.
Both detect failure early and contain blast radius.

Chat dump logging = decide upfront what to record
so you can answer questions when things go wrong.
This plan = decide upfront what signals to emit
so you can answer "why did the rule stop working?" at 2am.

Same discipline. Different layer.
