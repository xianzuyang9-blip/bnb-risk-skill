# Judge Quick Review

BNB Risk Skill is a Track 2 Crypto Intelligence / Strategy Skill for the BNB Hack.

It is a simulation-only pre-execution risk gate for AI trading agents. It does not trade, connect a wallet, ask for private keys, or promise returns.

## 60 Second Path

1. Open the live demo:

```text
https://xianzuyang9-blip.github.io/bnb-risk-skill/
```

2. Click `Run Simulation`.
3. Inspect `Risk Result`, `Risk Flags`, `Data Quality`, and the `Agent Action` JSON.
4. Confirm the safety contract:

```json
{
  "mode": "simulation_only",
  "privateKeyRequired": false,
  "autonomousTradingAllowed": false,
  "requiresHumanApprovalBeforeExecution": true
}
```

## Why It Fits Track 2

Track 2 asks for strategy/intelligence skills rather than live trading execution. BNB Risk Skill converts market data and strategy parameters into:

- backtest metrics,
- drawdown and exposure checks,
- data-quality warnings,
- stress-scenario summaries,
- a 0-100 risk score,
- a machine-readable recommendation.

The output is designed for an AI trading agent to decide whether a strategy should move to paper trading, require human review, or be rejected.

## CMC Agent Hub Alignment

The skill is intentionally data-source agnostic, so CMC Agent Hub market data can be passed in through the `prices` input or a future adapter. The current `skill-manifest.json` describes the input/output contract that an agent can call after retrieving BNB/EVM market data.

Expected agent flow:

```text
CMC / market data -> BNB Risk Skill -> risk score + blocked actions -> paper trade, review, or reject
```

## Reproducibility

```powershell
npm test
npm run demo
npm run preflight
```

No package install is required.

## Safety Boundary

Blocked actions are declared in `skill-manifest.json`:

- `live_trade`
- `wallet_connection`
- `private_key_request`
- `seed_phrase_request`
- `autonomous_execution`

This makes the project useful as a guardrail layer before an agent ever reaches an execution tool.
