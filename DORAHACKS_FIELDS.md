# DoraHacks Submission Fields

Use this as clean copy for the BNB Hack: AI Trading Agent Edition submission form.

Do not paste passwords, private keys, seed phrases, API keys, exchange credentials, personal identity documents, or off-platform payment instructions into any field.

## Project Name

```text
BNB Risk Skill
```

## Track

```text
Track 2 - Strategy Skills
```

## Tagline

```text
Simulation-only risk gate strategy skill for BNB/EVM AI trading agents.
```

## Short Description

```text
BNB Risk Skill helps an AI trading agent evaluate a strategy idea before execution. It runs a moving-average crossover simulation, returns backtest metrics, data-quality warnings, stress-scenario results, a 0-100 risk score, and a machine-readable agentAction object that recommends paper trading, human review, or rejection.
```

## Long Description

```text
AI trading agents can generate strategy ideas quickly, but they need a safe intermediate step before any real execution. BNB Risk Skill is a Strategy Skill that performs a simulation-only backtest and risk review.

The skill accepts a price series and strategy settings, including moving-average windows, position sizing, stop-loss, take-profit, and starting capital. It returns final equity, PnL, return, max drawdown, exposure, trade count, volatility, win rate, data-quality flags, risk flags, a bounded risk score, stress-scenario summaries, a recommendation, and agent-readable JSON.

The safety design is explicit: no real trades, no wallet connection, no private keys, no exchange credentials, no profit guarantees, and no autonomous execution. The agentAction output marks the result as simulation_only, sets autonomousTradingAllowed to false, requires human approval before execution, and lists blocked actions such as live_trade and wallet_connection.

This makes the project useful as a pre-execution risk gate for Track 2 Strategy Skills. An AI agent can use it to decide whether a strategy idea should move to paper trading, require human review, or be rejected.
```

## Problem

```text
AI trading agents need a trustworthy risk gate between strategy generation and execution. Without simulation, drawdown checks, and machine-readable boundaries, an agent may overfit or move too quickly toward unsafe actions.
```

## Solution

```text
BNB Risk Skill converts a strategy idea into a simulation report, stress checks, risk flags, a risk score, and a constrained next-step recommendation. It gives the agent a safe action boundary before any live or paper trading workflow.
```

## Demo Commands

```powershell
npm test
npm run demo
npm run preflight
```

## Safety Statement

```text
This project is simulation-only. It does not trade real funds, connect to a wallet, request private keys, use exchange credentials, guarantee returns, or permit autonomous execution.
```

## Repository Description

```text
Simulation-only risk gate strategy skill for BNB/EVM AI trading agents.
```

## Suggested Topics

```text
bnb-chain
ai-agents
trading-strategy
backtesting
risk-management
javascript
hackathon
simulation
```

## Links To Add After Publishing

Repository URL:

```text
https://github.com/xianzuyang9-blip/bnb-risk-skill
```

Demo URL:

```text
https://xianzuyang9-blip.github.io/bnb-risk-skill/
```
