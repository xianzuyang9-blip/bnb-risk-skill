const assert = require('assert');
const { simulateStrategy, runStressScenarios, OUTPUT_SCHEMA } = require('./riskSkill');

const normal = simulateStrategy();

assert.strictEqual(normal.schema.version, OUTPUT_SCHEMA.version);
assert.strictEqual(normal.agentAction.chain, 'bnb-chain');
assert.strictEqual(normal.agentAction.mode, 'simulation_only');
assert.strictEqual(normal.agentAction.privateKeyRequired, false);
assert.strictEqual(normal.agentAction.autonomousTradingAllowed, false);
assert.strictEqual(normal.agentAction.requiresHumanApprovalBeforeExecution, true);
assert.ok(normal.agentAction.blockedActions.includes('live_trade'));
assert.ok(normal.agentAction.blockedActions.includes('wallet_connection'));
assert.ok(normal.agentAction.blockedActions.includes('private_key_request'));
assert.ok(Number.isFinite(normal.metrics.finalEquity));
assert.ok(Number.isFinite(normal.metrics.riskScore));
assert.ok(normal.metrics.riskScore >= 0 && normal.metrics.riskScore <= 100);
assert.ok(Array.isArray(normal.trades));
assert.ok(Array.isArray(normal.roundTrips));
assert.ok(Array.isArray(normal.equityCurve));
assert.ok(Array.isArray(normal.dataQualityFlags));

const risky = simulateStrategy({
  maxPositionPct: 0.75,
  prices: [100, 105, 110, 90, 84, 80, 88, 82, 78, 75, 79, 74]
});

assert.ok(risky.riskFlags.includes('large_position_size'));
assert.ok(risky.dataQualityFlags.includes('short_backtest_sample'));
assert.notStrictEqual(risky.recommendation, 'paper_trade_candidate');
assert.ok(risky.metrics.riskScore > normal.metrics.riskScore);

const stress = runStressScenarios();
assert.strictEqual(stress.length, 4);
assert.deepStrictEqual(
  stress.map((scenario) => scenario.name),
  ['baseline', 'suddenDrawdown', 'sidewaysChop', 'lateBreakout']
);
for (const scenario of stress) {
  assert.ok(Number.isFinite(scenario.riskScore));
  assert.ok(Array.isArray(scenario.riskFlags));
}

assert.throws(() => simulateStrategy({ fastWindow: 8, slowWindow: 7 }), /slowWindow/);
assert.throws(() => simulateStrategy({ prices: [1, 2, 3] }), /prices/);
assert.throws(() => simulateStrategy({ maxPositionPct: 1.5 }), /maxPositionPct/);

console.log('bnb-risk-skill tests passed');
