# BNB Hack Submission Draft

Project name:

```text
BNB Risk Skill
```

Track:

```text
Track 2 - Strategy Skills
```

One-liner:

```text
A simulation-only strategy skill that gives AI trading agents a risk score, stress checks, and blocked-action contract before any strategy can move toward paper trading.
```

## Problem

AI trading agents can generate strategy ideas quickly, but they need a safe intermediate step before any execution. A skill should be able to backtest an idea, flag dangerous assumptions, and return a machine-readable recommendation.

## Solution

BNB Risk Skill runs a moving-average crossover simulation with configurable risk settings:

- fast/slow moving-average windows
- max position size
- stop-loss threshold
- take-profit threshold
- starting capital
- price series

It returns:

- final equity
- PnL and return
- max drawdown
- trade count
- exposure
- win rate and average trade return
- volatility and a bounded risk score
- data-quality warnings
- risk flags
- stress-scenario summaries
- recommendation
- agent-readable `agentAction`

## Safety Design

The skill is deliberately simulation-only.

It does not:

- trade real funds
- connect to a wallet
- ask for private keys
- use exchange credentials
- guarantee returns
- allow autonomous execution

The `agentAction` object explicitly includes:

```json
{
  "mode": "simulation_only",
  "privateKeyRequired": false,
  "autonomousTradingAllowed": false,
  "requiresHumanApprovalBeforeExecution": true
}
```

## Demo Commands

```powershell
npm test
npm run demo
```

## Example Output

```json
{
  "recommendation": "paper_trade_candidate",
  "agentAction": {
    "type": "strategy_skill_result",
    "chain": "bnb-chain",
    "mode": "simulation_only",
    "recommendation": "paper_trade_candidate",
    "allowedNextStep": "Run a longer paper-trading test with fresh data.",
    "privateKeyRequired": false,
    "autonomousTradingAllowed": false
  }
}
```

## What Would Come Next

1. Add a CoinMarketCap/BNB market-data adapter.
2. Add more strategy specs.
3. Add deterministic JSON schema validation.
4. Add paper-trading logs.
5. Keep real trading behind explicit human approval and separate wallet controls.
