# Publish Checklist

Use this before publishing `bnb-risk-skill` to GitHub or submitting it to a hackathon.

## Local Checks

```powershell
npm test
npm run demo
npm run preflight
npm run publish:readiness
```

Expected:

```text
bnb-risk-skill tests passed
preflight passed
publish readiness passed
```

## GitHub Repository

Recommended repository:

```text
bnb-risk-skill
```

Visibility:

```text
Public
```

Do GitHub login in the browser. Do not put passwords, private keys, seed phrases, or API keys into commands, scripts, README files, issues, commits, or release notes.

## Repository Description

```text
Simulation-only risk gate strategy skill for BNB/EVM AI trading agents.
```

## Topics

```text
bnb-chain
ai-agents
trading-strategy
backtesting
risk-management
javascript
hackathon
```

## After Publish

1. Copy the public repository URL.
2. Confirm `README.md` renders correctly.
3. Confirm `index.html` is visible in the repo.
4. Confirm GitHub Actions CI runs `npm run preflight`.
5. Use `SUBMISSION.md` for the project narrative.
6. Use `DORAHACKS_FIELDS.md` as clean copy for the hackathon submission form.
7. Use the zip hash from `live-prospecting/2026-06-07-hackathon-status.md`.

## Never Publish

- passwords
- seed phrases
- private keys
- exchange credentials
- API keys
- personal identity documents
