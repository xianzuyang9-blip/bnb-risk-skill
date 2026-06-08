(function () {
  const copy = {
    en: {
      eyebrow: 'Track 2 Strategy Skill',
      title: 'BNB Risk Skill',
      summary: 'A simulation-only strategy skill that lets an AI trading agent test a strategy idea, surface risk flags, and decide whether the next step should be paper trading, review, or rejection.',
      guardrailKeys: 'No private keys',
      guardrailTrades: 'No real trades',
      guardrailPromises: 'No profit promises',
      strategyInput: 'Strategy Input',
      startingCapital: 'Starting capital',
      fastWindow: 'Fast MA window',
      slowWindow: 'Slow MA window',
      maxPosition: 'Max position %',
      stopLoss: 'Stop loss %',
      takeProfit: 'Take profit %',
      priceSeries: 'Price series',
      runSimulation: 'Run Simulation',
      riskResult: 'Risk Result',
      agentAction: 'Agent Action',
      riskFlags: 'Risk Flags',
      dataQuality: 'Data Quality',
      ready: 'ready',
      inputError: 'input error',
      metrics: {
        riskScore: 'Risk score',
        finalEquity: 'Final equity',
        returnPct: 'Return',
        maxDrawdown: 'Max drawdown',
        trades: 'Trades',
        exposure: 'Exposure',
        pnl: 'PnL',
        winRate: 'Win rate',
        volatility: 'Strategy vol'
      }
    },
    zh: {
      eyebrow: 'Track 2 策略技能',
      title: 'BNB 风险策略技能',
      summary: '这是一个仅用于模拟的策略技能，让 AI 交易代理先测试策略想法、暴露风险信号，再决定下一步是纸面交易、人工复核还是拒绝执行。',
      guardrailKeys: '不需要私钥',
      guardrailTrades: '不执行真钱交易',
      guardrailPromises: '不承诺收益',
      strategyInput: '策略输入',
      startingCapital: '初始资金',
      fastWindow: '快速均线窗口',
      slowWindow: '慢速均线窗口',
      maxPosition: '最大仓位 %',
      stopLoss: '止损 %',
      takeProfit: '止盈 %',
      priceSeries: '价格序列',
      runSimulation: '运行模拟',
      riskResult: '风险结果',
      agentAction: '代理动作',
      riskFlags: '风险标记',
      dataQuality: '数据质量',
      ready: '就绪',
      inputError: '输入错误',
      metrics: {
        riskScore: '风险分数',
        finalEquity: '最终权益',
        returnPct: '收益率',
        maxDrawdown: '最大回撤',
        trades: '交易次数',
        exposure: '暴露比例',
        pnl: '盈亏',
        winRate: '胜率',
        volatility: '策略波动'
      }
    },
    es: {
      eyebrow: 'Habilidad de Estrategia Track 2',
      title: 'BNB Risk Skill',
      summary: 'Una habilidad de estrategia solo para simulacion que permite a un agente de trading con IA probar una idea, mostrar alertas de riesgo y decidir si el siguiente paso debe ser paper trading, revision o rechazo.',
      guardrailKeys: 'Sin claves privadas',
      guardrailTrades: 'Sin operaciones reales',
      guardrailPromises: 'Sin promesas de ganancia',
      strategyInput: 'Entrada de Estrategia',
      startingCapital: 'Capital inicial',
      fastWindow: 'Ventana MA rapida',
      slowWindow: 'Ventana MA lenta',
      maxPosition: 'Posicion maxima %',
      stopLoss: 'Stop loss %',
      takeProfit: 'Take profit %',
      priceSeries: 'Serie de precios',
      runSimulation: 'Ejecutar Simulacion',
      riskResult: 'Resultado de Riesgo',
      agentAction: 'Accion del Agente',
      riskFlags: 'Alertas de Riesgo',
      dataQuality: 'Calidad de Datos',
      ready: 'listo',
      inputError: 'error de entrada',
      metrics: {
        riskScore: 'Puntaje de riesgo',
        finalEquity: 'Capital final',
        returnPct: 'Retorno',
        maxDrawdown: 'Drawdown maximo',
        trades: 'Operaciones',
        exposure: 'Exposicion',
        pnl: 'PnL',
        winRate: 'Tasa de acierto',
        volatility: 'Volatilidad'
      }
    }
  };

  let language = 'en';
  const form = document.querySelector('#strategy-form');
  const recommendation = document.querySelector('#recommendation');
  const metrics = document.querySelector('#metrics');
  const action = document.querySelector('#agent-action');
  const flags = document.querySelector('#risk-flags');
  const dataQuality = document.querySelector('#data-quality');
  const languageButtons = Array.from(document.querySelectorAll('[data-lang]'));

  function parsePrices(value) {
    return value.split(',')
      .map((entry) => Number(entry.trim()))
      .filter((entry) => Number.isFinite(entry));
  }

  function readInput() {
    const data = new FormData(form);
    return {
      startingCapital: Number(data.get('startingCapital')),
      fastWindow: Number(data.get('fastWindow')),
      slowWindow: Number(data.get('slowWindow')),
      maxPositionPct: Number(data.get('maxPositionPct')) / 100,
      stopLossPct: Number(data.get('stopLossPct')) / 100,
      takeProfitPct: Number(data.get('takeProfitPct')) / 100,
      prices: parsePrices(String(data.get('prices') || ''))
    };
  }

  function metric(label, value) {
    return `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`;
  }

  function formatPct(value) {
    return `${(value * 100).toFixed(2)}%`;
  }

  function render(result) {
    const t = copy[language];
    recommendation.textContent = result.recommendation.replaceAll('_', ' ');
    metrics.innerHTML = [
      metric(t.metrics.riskScore, result.metrics.riskScore),
      metric(t.metrics.finalEquity, `$${result.metrics.finalEquity.toLocaleString()}`),
      metric(t.metrics.returnPct, formatPct(result.metrics.returnPct)),
      metric(t.metrics.maxDrawdown, formatPct(result.metrics.maxDrawdownPct)),
      metric(t.metrics.trades, result.metrics.tradeCount),
      metric(t.metrics.exposure, formatPct(result.metrics.exposurePct)),
      metric(t.metrics.pnl, `$${result.metrics.pnl.toLocaleString()}`),
      metric(t.metrics.winRate, formatPct(result.metrics.winRatePct)),
      metric(t.metrics.volatility, formatPct(result.metrics.strategyVolatilityPct))
    ].join('');
    action.textContent = JSON.stringify(result.agentAction, null, 2);
    const riskFlags = result.riskFlags.length ? result.riskFlags : ['no_risk_flags'];
    flags.innerHTML = riskFlags.map((flag) => `<li>${flag}</li>`).join('');
    const qualityFlags = result.dataQualityFlags.length ? result.dataQualityFlags : ['data_quality_ok'];
    dataQuality.innerHTML = qualityFlags.map((flag) => `<li>${flag}</li>`).join('');
  }

  function run(event) {
    if (event) event.preventDefault();
    const t = copy[language];
    try {
      const result = window.BNBRiskSkill.simulateStrategy(readInput());
      render(result);
    } catch (error) {
      recommendation.textContent = t.inputError;
      metrics.innerHTML = '';
      action.textContent = JSON.stringify({ error: error.message }, null, 2);
      flags.innerHTML = '<li>needs_review</li>';
      dataQuality.innerHTML = '<li>invalid_input</li>';
    }
  }

  function applyLanguage(nextLanguage) {
    language = nextLanguage;
    const t = copy[language];
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : language;
    document.querySelectorAll('[data-i18n]').forEach((node) => {
      node.textContent = t[node.dataset.i18n];
    });
    languageButtons.forEach((button) => {
      button.classList.toggle('active', button.dataset.lang === language);
    });
    recommendation.textContent = t.ready;
    run();
  }

  languageButtons.forEach((button) => {
    button.addEventListener('click', () => applyLanguage(button.dataset.lang));
  });

  form.addEventListener('submit', run);
  applyLanguage('en');
}());
