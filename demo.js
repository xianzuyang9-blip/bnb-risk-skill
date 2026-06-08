const { simulateStrategy, runStressScenarios } = require('./riskSkill');

const result = simulateStrategy({
  startingCapital: 10000,
  fastWindow: 3,
  slowWindow: 7,
  maxPositionPct: 0.3,
  stopLossPct: 0.07,
  takeProfitPct: 0.14
});

console.log(JSON.stringify({
  result,
  stressScenarios: runStressScenarios({
    startingCapital: 10000,
    fastWindow: 3,
    slowWindow: 7,
    maxPositionPct: 0.3,
    stopLossPct: 0.07,
    takeProfitPct: 0.14
  })
}, null, 2));
