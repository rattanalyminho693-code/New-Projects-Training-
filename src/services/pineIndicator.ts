/**
 * Exact Pine Script v5 implementation for:
 * LuxAlgo - Pivot Based Buy & Sell with SL/TP [Instant / ចេញភ្លាមៗ]
 */

import {
  Candle,
  IndicatorSettings,
  IndicatorBarData,
  Trade,
  BacktestMetrics
} from '../types/tradingBot';

export const DEFAULT_INDICATOR_SETTINGS: IndicatorSettings = {
  signalMode: 'Fast Pivot (ចេញលឿន 1-Bar)',
  leftBars: 12,
  rightBars: 1,
  rrRatio: 2.0,
  backpaint: false,
  maxCss: '#14b8a6',
  minCss: '#ef4444',
  avgCss: '#ff5d00',
  bullFill: 'rgba(20, 184, 166, 0.14)',
  bearFill: 'rgba(239, 68, 68, 0.14)'
};

export function calculatePivotHigh(
  candles: Candle[],
  currentIndex: number,
  left: number,
  right: number
): number | null {
  const pivotIndex = currentIndex - right;
  if (pivotIndex < left || pivotIndex >= candles.length) return null;

  const pivotVal = candles[pivotIndex].high;

  for (let k = 1; k <= left; k++) {
    const prevHigh = candles[pivotIndex - k]?.high;
    if (prevHigh === undefined || prevHigh > pivotVal) {
      return null;
    }
  }

  for (let k = 1; k <= right; k++) {
    const nextHigh = candles[pivotIndex + k]?.high;
    if (nextHigh === undefined || nextHigh >= pivotVal) {
      return null;
    }
  }

  return pivotVal;
}

export function calculatePivotLow(
  candles: Candle[],
  currentIndex: number,
  left: number,
  right: number
): number | null {
  const pivotIndex = currentIndex - right;
  if (pivotIndex < left || pivotIndex >= candles.length) return null;

  const pivotVal = candles[pivotIndex].low;

  for (let k = 1; k <= left; k++) {
    const prevLow = candles[pivotIndex - k]?.low;
    if (prevLow === undefined || prevLow < pivotVal) {
      return null;
    }
  }

  for (let k = 1; k <= right; k++) {
    const nextLow = candles[pivotIndex + k]?.low;
    if (nextLow === undefined || nextLow <= pivotVal) {
      return null;
    }
  }

  return pivotVal;
}

function lowestLow(candles: Candle[], currentIndex: number, n: number): number {
  let min = candles[currentIndex].low;
  for (let i = 1; i < n; i++) {
    const idx = currentIndex - i;
    if (idx >= 0 && candles[idx].low < min) {
      min = candles[idx].low;
    }
  }
  return min;
}

function highestHigh(candles: Candle[], currentIndex: number, n: number): number {
  let max = candles[currentIndex].high;
  for (let i = 1; i < n; i++) {
    const idx = currentIndex - i;
    if (idx >= 0 && candles[idx].high > max) {
      max = candles[idx].high;
    }
  }
  return max;
}

export function computeLuxAlgoIndicator(
  candles: Candle[],
  settings: IndicatorSettings
): IndicatorBarData[] {
  const result: IndicatorBarData[] = [];
  const n = candles.length;
  if (n === 0) return result;

  const { signalMode, leftBars, rightBars, rrRatio, backpaint } = settings;
  const effectiveRight =
    signalMode === 'Classic LuxAlgo (ដើម 24-Bar)' ? leftBars : rightBars;
  const offset = backpaint ? leftBars : 0;

  let currentMax = candles[0].high;
  let currentMin = candles[0].low;
  let currentTrend: 'bull' | 'bear' = 'bull';

  for (let i = 0; i < n; i++) {
    const candle = candles[i];

    const ph = calculatePivotHigh(candles, i, leftBars, effectiveRight);
    const pl = calculatePivotLow(candles, i, leftBars, effectiveRight);

    if (pl !== null) {
      currentTrend = 'bull';
    } else if (ph !== null) {
      currentTrend = 'bear';
    }

    if (ph !== null || pl !== null) {
      const refIdx = Math.max(0, i - effectiveRight);
      currentMax = candles[refIdx].high;
      currentMin = candles[refIdx].low;
    }

    const offsetIdx = Math.max(0, i - offset);
    currentMax = Math.max(candles[offsetIdx].high, currentMax);
    currentMin = Math.min(candles[offsetIdx].low, currentMin);
    const avg = (currentMax + currentMin) / 2;

    const isBuyPivot = pl !== null;
    const isSellPivot = ph !== null;

    let isBuyBreak = false;
    let isSellBreak = false;

    if (i >= 2) {
      const prevResult = result[i - 1];
      const prevPrevResult = result[i - 2];
      if (prevResult && prevPrevResult) {
        const prevClose = candles[i - 1].close;
        const currClose = candle.close;
        const maxPrev1 = prevResult.max;
        const maxPrev2 = prevPrevResult.max;
        isBuyBreak = prevClose <= maxPrev2 && currClose > maxPrev1;

        const minPrev1 = prevResult.min;
        const minPrev2 = prevPrevResult.min;
        isSellBreak = prevClose >= minPrev2 && currClose < minPrev1;
      }
    }

    const isBuy =
      signalMode === 'Instant Breakout (ចេញភ្លាមៗ 0-Bar)' ? isBuyBreak : isBuyPivot;
    const isSell =
      signalMode === 'Instant Breakout (ចេញភ្លាមៗ 0-Bar)' ? isSellBreak : isSellPivot;

    let entryPrice: number | undefined;
    let slPrice: number | undefined;
    let tpPrice: number | undefined;

    if (isBuy) {
      entryPrice = candle.close;
      if (signalMode === 'Instant Breakout (ចេញភ្លាមៗ 0-Bar)') {
        slPrice = lowestLow(candles, i, 5);
      } else {
        const refIdx = Math.max(0, i - effectiveRight);
        slPrice = candles[refIdx].low;
      }
      if (slPrice >= entryPrice) {
        slPrice = entryPrice * 0.99;
      }
      tpPrice = entryPrice + (entryPrice - slPrice) * rrRatio;
    } else if (isSell) {
      entryPrice = candle.close;
      if (signalMode === 'Instant Breakout (ចេញភ្លាមៗ 0-Bar)') {
        slPrice = highestHigh(candles, i, 5);
      } else {
        const refIdx = Math.max(0, i - effectiveRight);
        slPrice = candles[refIdx].high;
      }
      if (slPrice <= entryPrice) {
        slPrice = entryPrice * 1.01;
      }
      tpPrice = entryPrice - (slPrice - entryPrice) * rrRatio;
    }

    result.push({
      ph,
      pl,
      max: currentMax,
      min: currentMin,
      avg,
      trend: currentTrend,
      isBuy,
      isSell,
      entryPrice,
      slPrice,
      tpPrice
    });
  }

  return result;
}

export function runIndicatorBacktest(
  candles: Candle[],
  indicatorData: IndicatorBarData[],
  rrRatio: number
): { trades: Trade[]; metrics: BacktestMetrics } {
  const trades: Trade[] = [];
  const n = candles.length;

  for (let i = 0; i < n; i++) {
    const data = indicatorData[i];
    if (!data.isBuy && !data.isSell) continue;

    const type = data.isBuy ? 'BUY' : 'SELL';
    const entryPrice = data.entryPrice!;
    const slPrice = data.slPrice!;
    const tpPrice = data.tpPrice!;

    let status: 'WIN' | 'LOSS' | 'OPEN' = 'OPEN';
    let exitIndex: number | undefined;
    let exitTime: number | undefined;
    let exitPrice: number | undefined;
    let durationBars = 0;

    for (let j = i + 1; j < n; j++) {
      const c = candles[j];
      durationBars++;

      if (type === 'BUY') {
        const hitSL = c.low <= slPrice;
        const hitTP = c.high >= tpPrice;
        if (hitSL && hitTP) {
          status = 'LOSS';
          exitIndex = j;
          exitTime = c.time;
          exitPrice = slPrice;
          break;
        } else if (hitTP) {
          status = 'WIN';
          exitIndex = j;
          exitTime = c.time;
          exitPrice = tpPrice;
          break;
        } else if (hitSL) {
          status = 'LOSS';
          exitIndex = j;
          exitTime = c.time;
          exitPrice = slPrice;
          break;
        }
      } else {
        const hitSL = c.high >= slPrice;
        const hitTP = c.low <= tpPrice;
        if (hitSL && hitTP) {
          status = 'LOSS';
          exitIndex = j;
          exitTime = c.time;
          exitPrice = slPrice;
          break;
        } else if (hitTP) {
          status = 'WIN';
          exitIndex = j;
          exitTime = c.time;
          exitPrice = tpPrice;
          break;
        } else if (hitSL) {
          status = 'LOSS';
          exitIndex = j;
          exitTime = c.time;
          exitPrice = slPrice;
          break;
        }
      }
    }

    let rMultiple = 0;
    let pnlPercent = 0;

    if (status === 'WIN') {
      rMultiple = rrRatio;
      pnlPercent =
        type === 'BUY'
          ? ((tpPrice - entryPrice) / entryPrice) * 100
          : ((entryPrice - tpPrice) / entryPrice) * 100;
    } else if (status === 'LOSS') {
      rMultiple = -1.0;
      pnlPercent =
        type === 'BUY'
          ? ((slPrice - entryPrice) / entryPrice) * 100
          : ((entryPrice - slPrice) / entryPrice) * 100;
    } else {
      const lastClose = candles[n - 1].close;
      const riskDistance = Math.abs(entryPrice - slPrice);
      if (type === 'BUY') {
        const profitDistance = lastClose - entryPrice;
        rMultiple = riskDistance > 0 ? profitDistance / riskDistance : 0;
        pnlPercent = ((lastClose - entryPrice) / entryPrice) * 100;
      } else {
        const profitDistance = entryPrice - lastClose;
        rMultiple = riskDistance > 0 ? profitDistance / riskDistance : 0;
        pnlPercent = ((entryPrice - lastClose) / entryPrice) * 100;
      }
      exitPrice = lastClose;
      exitTime = candles[n - 1].time;
    }

    trades.push({
      id: `trade_${i}_${candles[i].time}`,
      type,
      entryIndex: i,
      entryTime: candles[i].time,
      entryPrice,
      slPrice,
      tpPrice,
      exitIndex,
      exitTime,
      exitPrice,
      status,
      rMultiple: Number(rMultiple.toFixed(2)),
      pnlPercent: Number(pnlPercent.toFixed(2)),
      durationBars
    });
  }

  const totalTrades = trades.length;
  const winCount = trades.filter(t => t.status === 'WIN').length;
  const lossCount = trades.filter(t => t.status === 'LOSS').length;
  const openCount = trades.filter(t => t.status === 'OPEN').length;

  const winRate =
    winCount + lossCount > 0
      ? Number(((winCount / (winCount + lossCount)) * 100).toFixed(1))
      : 0;

  const grossWins = winCount * rrRatio;
  const grossLosses = lossCount * 1.0;
  const profitFactor =
    grossLosses > 0
      ? Number((grossWins / grossLosses).toFixed(2))
      : grossWins > 0
      ? 99.9
      : 0;

  let cumulativeR = 0;
  let peakR = 0;
  let maxDrawdownR = 0;
  const equityCurve: { tradeIndex: number; cumulativeR: number }[] = [
    { tradeIndex: 0, cumulativeR: 0 }
  ];

  trades.forEach((trade, idx) => {
    cumulativeR += trade.rMultiple;
    if (cumulativeR > peakR) {
      peakR = cumulativeR;
    }
    const dd = peakR - cumulativeR;
    if (dd > maxDrawdownR) {
      maxDrawdownR = dd;
    }
    equityCurve.push({
      tradeIndex: idx + 1,
      cumulativeR: Number(cumulativeR.toFixed(2))
    });
  });

  const netR = Number(cumulativeR.toFixed(2));
  const avgR = totalTrades > 0 ? Number((netR / totalTrades).toFixed(2)) : 0;
  const rList = trades.map(t => t.rMultiple);
  const bestTradeR = rList.length > 0 ? Math.max(...rList) : 0;
  const worstTradeR = rList.length > 0 ? Math.min(...rList) : 0;

  return {
    trades,
    metrics: {
      totalTrades,
      winCount,
      lossCount,
      openCount,
      winRate,
      profitFactor,
      netR,
      avgR,
      maxDrawdownR: Number(maxDrawdownR.toFixed(2)),
      bestTradeR,
      worstTradeR,
      equityCurve
    }
  };
}
