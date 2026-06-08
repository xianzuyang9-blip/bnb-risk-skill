# BNB Risk Skill

English | [Chinese Summary](#chinese-summary) | [Spanish Summary](#spanish-summary)

Status: hackathon MVP, simulation only.

BNB Risk Skill is a risk-first strategy skill for BNB/EVM AI trading agents. It runs a configurable moving-average strategy simulation, reports return/drawdown/exposure/volatility/trade-quality metrics, flags risky configurations, runs stress scenarios, and returns an agent-readable action object.

It deliberately does **not** trade real funds, request private keys, connect to a wallet, or make profit guarantees.

## Why This Fits Track 2

The skill is meant to be used by an AI trading agent as a Strategy Skill:

```text
market data -> strategy simulation -> risk flags -> paper-trade / review recommendation
```

Instead of optimizing for hype, it gives an agent a safe decision boundary:

- `paper_trade_candidate`
- `review_only`
- `do_not_trade`

It also returns a bounded risk score, data-quality flags, blocked actions, and an explicit instruction that human approval is required before any execution layer.

## Run

```powershell
npm test
npm run demo
npm run preflight
```

No dependencies are required.

## CI

GitHub Actions runs:

```text
npm run preflight
```

No repository secrets are required.

## Browser Demo

Open `index.html` in a browser.

The demo supports English, Chinese, and Spanish UI text. The machine-readable `agentAction` output stays in English for easier integration with agents and judges.

## Output Contract

The demo returns:

- strategy settings
- final equity, PnL, return, drawdown, trade count, exposure
- win rate, average trade return, max consecutive losses
- asset and strategy volatility
- risk score from 0 to 100
- data-quality flags
- risk flags
- recommendation
- `agentAction` JSON for an AI agent
- trades and equity curve

Important `agentAction` fields:

```json
{
  "chain": "bnb-chain",
  "mode": "simulation_only",
  "privateKeyRequired": false,
  "autonomousTradingAllowed": false,
  "requiresHumanApprovalBeforeExecution": true
}
```

## Skill Manifest And Examples

The repository includes integration-oriented artifacts for judges and agent builders:

- `skill-manifest.json`: input/output contract, blocked actions, safety settings, and commands.
- `examples/sample-input.json`: representative market-data input.
- `examples/sample-output-contract.json`: expected output shape for an AI agent.

## Safety Boundaries

- No real-money trades.
- No custody of funds.
- No seed phrases or private keys.
- No exchange credentials.
- No guaranteed returns.
- No autonomous execution.

## Submission Angle

```text
BNB Risk Skill is a Strategy Skill for AI trading agents that adds a risk gate before execution. It turns a strategy idea into a simulation report, stress-scenario summary, risk score, blocked-action list, and a constrained agentAction recommendation: paper trading, human review, or rejection.
```

## Chinese Summary

BNB Risk Skill is a risk-first strategy skill for BNB/EVM AI trading agents. It does not trade real money, request private keys, or connect to a wallet. It only simulates a strategy: given a price series and strategy settings, it returns backtest metrics, data-quality flags, risk flags, a risk score, a recommendation, and machine-readable `agentAction` JSON.

Why it fits Track 2 Strategy Skills:

```text
market data -> strategy simulation -> risk flags -> paper trading / human review / reject execution
```

Safety boundaries:

- No real trades.
- No custody of funds.
- No seed phrases or private keys.
- No exchange credentials.
- No profit promises.
- No autonomous execution.

Commands:

```powershell
npm test
npm run demo
npm run preflight
```

Browser demo:

```text
Open index.html, or preview it through a local static server.
```

## Spanish Summary

BNB Risk Skill is a risk-first strategy skill for AI trading agents on BNB/EVM. It does not trade real money, request private keys, or connect to a wallet. It only simulates: it receives a price series and strategy parameters, then returns backtest metrics, data-quality flags, risk alerts, a risk score, a recommendation, and machine-readable `agentAction` JSON.

Why it fits Track 2 Strategy Skills:

```text
market data -> strategy simulation -> risk alerts -> paper trading / human review / rejection
```

Safety boundaries:

- No real trades.
- No custody of funds.
- No seed phrases or private keys.
- No exchange credentials.
- No profit promises.
- No autonomous execution.

Commands:

```powershell
npm test
npm run demo
npm run preflight
```
