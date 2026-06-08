const DEFAULT_PRICES = [
  610, 618, 622, 617, 629, 641, 636, 648, 652, 646,
  659, 671, 666, 675, 681, 674, 688, 694, 702, 697,
  711, 706, 719, 728, 721, 733, 742, 736, 748, 755
];

const OUTPUT_SCHEMA = {
  name: 'bnb-risk-skill-output',
  version: '0.2.0',
  required: ['strategy', 'metrics', 'riskFlags', 'recommendation', 'agentAction', 'trades', 'equityCurve'],
  agentAction: {
    type: 'strategy_skill_result',
    chain: 'bnb-chain',
    mode: 'simulation_only'
  }
};

function assertNumber(name, value, min, max) {
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be a finite number`);
  }
  if (value < min || value > max) {
    throw new Error(`${name} must be between ${min} and ${max}`);
  }
}

function movingAverage(values, window) {
  return values.map((_, index) => {
    if (index + 1 < window) return null;
    const slice = values.slice(index + 1 - window, index + 1);
    return slice.reduce((sum, value) => sum + value, 0) / window;
  });
}

function maxDrawdown(equityCurve) {
  let peak = equityCurve[0] || 0;
  let worst = 0;

  for (const value of equityCurve) {
    peak = Math.max(peak, value);
    const drawdown = peak === 0 ? 0 : (peak - value) / peak;
    worst = Math.max(worst, drawdown);
  }

  return worst;
}

function standardDeviation(values) {
  if (!values.length) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / values.length;
  return Math.sqrt(variance);
}

function returnsFromPrices(prices) {
  const returns = [];
  for (let index = 1; index < prices.length; index += 1) {
    returns.push((prices[index] - prices[index - 1]) / prices[index - 1]);
  }
  return returns;
}

function buildTradeStats(trades) {
  const roundTrips = [];
  let openBuy = null;

  for (const trade of trades) {
    if (trade.type === 'buy') {
      openBuy = trade;
    } else if (trade.type === 'sell' && openBuy) {
      roundTrips.push({
        entryIndex: openBuy.index,
        exitIndex: trade.index,
        entryPrice: openBuy.price,
        exitPrice: trade.price,
        returnPct: (trade.price - openBuy.price) / openBuy.price,
        exitReason: trade.reason
      });
      openBuy = null;
    }
  }

  const wins = roundTrips.filter((trade) => trade.returnPct > 0);
  let maxConsecutiveLosses = 0;
  let runningLosses = 0;

  for (const trade of roundTrips) {
    if (trade.returnPct <= 0) {
      runningLosses += 1;
      maxConsecutiveLosses = Math.max(maxConsecutiveLosses, runningLosses);
    } else {
      runningLosses = 0;
    }
  }

  return {
    roundTrips,
    winRate: roundTrips.length ? wins.length / roundTrips.length : 0,
    averageTradeReturnPct: roundTrips.length
      ? roundTrips.reduce((sum, trade) => sum + trade.returnPct, 0) / roundTrips.length
      : 0,
    maxConsecutiveLosses
  };
}

function validateInput(input = {}) {
  const prices = Array.isArray(input.prices) && input.prices.length
    ? input.prices.map(Number)
    : DEFAULT_PRICES;
  const startingCapital = Number(input.startingCapital ?? 10000);
  const fastWindow = Number(input.fastWindow ?? 3);
  const slowWindow = Number(input.slowWindow ?? 7);
  const maxPositionPct = Number(input.maxPositionPct ?? 0.35);
  const stopLossPct = Number(input.stopLossPct ?? 0.08);
  const takeProfitPct = Number(input.takeProfitPct ?? 0.16);

  assertNumber('startingCapital', startingCapital, 100, 100000000);
  assertNumber('fastWindow', fastWindow, 2, 30);
  assertNumber('slowWindow', slowWindow, fastWindow + 1, 90);
  assertNumber('maxPositionPct', maxPositionPct, 0.01, 1);
  assertNumber('stopLossPct', stopLossPct, 0.01, 0.8);
  assertNumber('takeProfitPct', takeProfitPct, 0.01, 2);

  if (prices.length < slowWindow + 2) {
    throw new Error('prices must contain enough points for the slow window');
  }
  prices.forEach((price, index) => assertNumber(`prices[${index}]`, price, 0.000001, 100000000));

  return {
    prices,
    startingCapital,
    fastWindow,
    slowWindow,
    maxPositionPct,
    stopLossPct,
    takeProfitPct
  };
}

function simulateStrategy(input = {}) {
  const params = validateInput(input);
  const {
    prices,
    startingCapital,
    fastWindow,
    slowWindow,
    maxPositionPct,
    stopLossPct,
    takeProfitPct
  } = params;

  const fast = movingAverage(prices, fastWindow);
  const slow = movingAverage(prices, slowWindow);
  let cash = startingCapital;
  let units = 0;
  let entryPrice = 0;
  const trades = [];
  const equityCurve = [];
  const positionOpenByIndex = [];

  for (let i = 0; i < prices.length; i += 1) {
    const price = prices[i];
    const hasSignal = fast[i] !== null && slow[i] !== null;
    const signal = hasSignal && fast[i] > slow[i] ? 'long' : 'flat';
    const unrealizedReturn = units > 0 ? (price - entryPrice) / entryPrice : 0;
    const stopHit = units > 0 && unrealizedReturn <= -stopLossPct;
    const targetHit = units > 0 && unrealizedReturn >= takeProfitPct;

    if (units > 0 && (signal === 'flat' || stopHit || targetHit)) {
      cash += units * price;
      trades.push({
        type: 'sell',
        index: i,
        price,
        reason: stopHit ? 'stop_loss' : targetHit ? 'take_profit' : 'trend_exit'
      });
      units = 0;
      entryPrice = 0;
    }

    if (units === 0 && signal === 'long') {
      const allocation = cash * maxPositionPct;
      units = allocation / price;
      cash -= allocation;
      entryPrice = price;
      trades.push({ type: 'buy', index: i, price, reason: 'ma_cross' });
    }

    positionOpenByIndex.push(units > 0);
    equityCurve.push(cash + units * price);
  }

  const finalEquity = equityCurve[equityCurve.length - 1];
  const pnl = finalEquity - startingCapital;
  const returnPct = pnl / startingCapital;
  const drawdown = maxDrawdown(equityCurve);
  const tradeCount = trades.length;
  const exposurePct = positionOpenByIndex.filter(Boolean).length / equityCurve.length;
  const assetReturns = returnsFromPrices(prices);
  const equityReturns = returnsFromPrices(equityCurve);
  const assetVolatilityPct = standardDeviation(assetReturns);
  const strategyVolatilityPct = standardDeviation(equityReturns);
  const sharpeLike = strategyVolatilityPct === 0 ? 0 : average(equityReturns) / strategyVolatilityPct;
  const tradeStats = buildTradeStats(trades);
  const dataQualityFlags = buildDataQualityFlags(prices, slowWindow);
  const riskFlags = buildRiskFlags({
    drawdown,
    maxPositionPct,
    tradeCount,
    prices,
    exposurePct,
    strategyVolatilityPct,
    tradeStats,
    dataQualityFlags
  });
  const riskScore = scoreRisk({
    drawdown,
    maxPositionPct,
    exposurePct,
    strategyVolatilityPct,
    tradeStats,
    dataQualityFlags
  });
  const recommendation = chooseRecommendation({ riskFlags, returnPct, drawdown, riskScore });

  return {
    schema: OUTPUT_SCHEMA,
    strategy: {
      name: 'MA crossover with risk gates',
      fastWindow,
      slowWindow,
      maxPositionPct,
      stopLossPct,
      takeProfitPct,
      dataSource: input.dataSource || 'sample_or_user_supplied_prices',
      intendedRuntime: 'CMC Skill / AI agent pre-execution risk gate'
    },
    metrics: {
      startingCapital,
      finalEquity: round(finalEquity),
      pnl: round(pnl),
      returnPct: round(returnPct),
      maxDrawdownPct: round(drawdown),
      tradeCount,
      roundTripCount: tradeStats.roundTrips.length,
      exposurePct: round(exposurePct),
      winRatePct: round(tradeStats.winRate),
      averageTradeReturnPct: round(tradeStats.averageTradeReturnPct),
      maxConsecutiveLosses: tradeStats.maxConsecutiveLosses,
      assetVolatilityPct: round(assetVolatilityPct),
      strategyVolatilityPct: round(strategyVolatilityPct),
      sharpeLike: round(sharpeLike),
      riskScore
    },
    dataQualityFlags,
    riskFlags,
    recommendation,
    agentAction: {
      type: 'strategy_skill_result',
      chain: 'bnb-chain',
      mode: 'simulation_only',
      recommendation,
      riskScore,
      allowedNextStep: allowedNextStep(recommendation),
      blockedActions: [
        'live_trade',
        'wallet_connection',
        'private_key_request',
        'seed_phrase_request',
        'autonomous_execution'
      ],
      privateKeyRequired: false,
      autonomousTradingAllowed: false,
      requiresHumanApprovalBeforeExecution: true
    },
    trades,
    roundTrips: tradeStats.roundTrips.map((trade) => ({
      ...trade,
      returnPct: round(trade.returnPct)
    })),
    equityCurve: equityCurve.map(round)
  };
}

function buildDataQualityFlags(prices, slowWindow) {
  const flags = [];
  if (prices.length < 30) flags.push('short_backtest_sample');
  if (prices.length < slowWindow * 5) flags.push('limited_cycles_for_slow_window');
  if (new Set(prices).size < prices.length * 0.5) flags.push('repeated_price_values');
  return flags;
}

function buildRiskFlags(context) {
  const flags = [...context.dataQualityFlags];
  if (context.drawdown > 0.12) flags.push('drawdown_above_12_pct');
  if (context.maxPositionPct > 0.4) flags.push('large_position_size');
  if (context.tradeCount > context.prices.length * 0.5) flags.push('overtrading_risk');
  if (context.exposurePct > 0.8) flags.push('high_market_exposure');
  if (context.strategyVolatilityPct > 0.05) flags.push('high_strategy_volatility');
  if (context.tradeStats.maxConsecutiveLosses >= 3) flags.push('loss_streak_risk');
  return [...new Set(flags)];
}

function scoreRisk(context) {
  let score = 20;
  score += Math.min(35, context.drawdown * 180);
  score += Math.max(0, context.maxPositionPct - 0.25) * 55;
  score += Math.max(0, context.exposurePct - 0.45) * 35;
  score += Math.min(20, context.strategyVolatilityPct * 220);
  score += context.tradeStats.maxConsecutiveLosses * 5;
  score += context.dataQualityFlags.length * 6;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function chooseRecommendation({ riskFlags, returnPct, drawdown, riskScore }) {
  if (riskScore >= 70 || drawdown > 0.2) return 'do_not_trade';
  if (riskFlags.length || riskScore >= 45) return 'review_only';
  if (returnPct > 0 && drawdown <= 0.12) return 'paper_trade_candidate';
  return 'do_not_trade';
}

function allowedNextStep(recommendation) {
  if (recommendation === 'paper_trade_candidate') {
    return 'Run a longer paper-trading test with fresh CMC market data.';
  }
  if (recommendation === 'review_only') {
    return 'Send the report to a human reviewer and expand the backtest sample.';
  }
  return 'Do not execute trades. Revise the strategy and risk assumptions first.';
}

function runStressScenarios(input = {}) {
  const base = validateInput(input);
  const scenarios = {
    baseline: base.prices,
    suddenDrawdown: base.prices.map((price, index) => (
      index > Math.floor(base.prices.length * 0.55) ? price * 0.82 : price
    )),
    sidewaysChop: base.prices.map((price, index) => {
      const anchor = base.prices[0];
      return anchor * (1 + (index % 2 === 0 ? 0.012 : -0.012));
    }),
    lateBreakout: base.prices.map((price, index) => (
      index > Math.floor(base.prices.length * 0.7) ? price * 1.11 : price * 0.99
    ))
  };

  return Object.entries(scenarios).map(([name, prices]) => {
    const result = simulateStrategy({ ...input, prices });
    return {
      name,
      recommendation: result.recommendation,
      riskScore: result.metrics.riskScore,
      returnPct: result.metrics.returnPct,
      maxDrawdownPct: result.metrics.maxDrawdownPct,
      riskFlags: result.riskFlags
    };
  });
}

function average(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function round(value) {
  return Math.round(value * 10000) / 10000;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DEFAULT_PRICES,
    OUTPUT_SCHEMA,
    simulateStrategy,
    runStressScenarios
  };
}

if (typeof window !== 'undefined') {
  window.BNBRiskSkill = {
    DEFAULT_PRICES,
    OUTPUT_SCHEMA,
    simulateStrategy,
    runStressScenarios
  };
}
