/**
 * Auto Trading Bot Execution Engine + MT5 Bridge Synchronization
 * Handles position sizing, bracket orders (SL/TP), trailing stops (+1R break-even),
 * real-time tick monitoring, and TradingView / LuxAlgo webhook execution.
 */

import { BotConfig, BotPosition, BotLogItem } from '../types/tradingBot';
import { soundAlert } from './soundAlert';

export interface BotState {
  config: BotConfig;
  positions: BotPosition[];
  closedPositions: BotPosition[];
  logs: BotLogItem[];
  totalTrades: number;
  winCount: number;
  lossCount: number;
  realizedPnl: number;
}

export const INITIAL_BOT_CONFIG: BotConfig = {
  botEnabled: true,
  status: 'RUNNING',
  mode: 'MT5_BRIDGE',
  syncWithMT5: true,
  initialBalance: 10000,
  currentBalance: 10428.5,
  riskPerTradePercent: 2.0,
  maxLeverage: 10,
  autoCloseOnOpposite: true,
  trailingStop: true,
  soundAlerts: true,
  webhookSecret: 'LUX_MT5_BOT_KEY_2026',
  telegramChatId: '@AlphaSignal_VIP_1',
  telegramBotToken: ''
};

const INITIAL_SEED_POSITIONS: BotPosition[] = [
  {
    id: 'bot_pos_seed_1',
    symbol: 'XAU/USD',
    type: 'BUY',
    entryPrice: 2736.4,
    currentPrice: 2742.8,
    slPrice: 2728.0,
    tpPrice: 2753.2,
    sizeUnits: 23.8095,
    allocatedMargin: 6515.13,
    unrealizedPnl: 152.38,
    unrealizedPnlPercent: 0.23,
    entryTime: Date.now() - 1000 * 60 * 18,
    status: 'OPEN'
  }
];

const STORAGE_KEY = 'alphasignal_lux_bot_engine_v1';

export type MT5ForwardCallback = (order: {
  symbol: string;
  action: 'BUY' | 'SELL';
  entryPrice: number;
  sl: number;
  tp: number;
  sourceLabel: string;
}) => void;

export class TradingBotEngine {
  public state: BotState;
  private listeners: (() => void)[] = [];
  private mt5ForwardHandler: MT5ForwardCallback | null = null;

  constructor() {
    let loaded: BotState | null = null;
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          loaded = JSON.parse(raw) as BotState;
        }
      } catch {
        loaded = null;
      }
    }

    this.state = loaded || {
      config: { ...INITIAL_BOT_CONFIG },
      positions: [...INITIAL_SEED_POSITIONS],
      closedPositions: [],
      logs: [
        {
          id: `log_init_${Date.now()}`,
          time: Date.now() - 60000,
          type: 'INFO',
          message: 'MT5 & LuxAlgo Auto Trading Bot Engine initialized and connected.',
          messageKh:
            'ម៉ាស៊ីន MT5 & Bot Auto Trading (LuxAlgo Instant) ត្រូវបានចាប់ផ្ដើម និងតភ្ជាប់ដោយជោគជ័យ។'
        },
        {
          id: `log_seed_${Date.now()}`,
          time: Date.now() - 35000,
          type: 'ORDER_OPEN',
          message:
            '[AutoBot] BUY EXECUTED: XAU/USD @ $2736.40 | SL: $2728.00 | TP: $2753.20 | Size: 23.8095',
          messageKh:
            '[Bot ស្វ័យប្រវត្តិ] បើកបញ្ជាទិញ BUY: XAU/USD @ $2736.40 | SL: $2728.00 | TP: $2753.20 (ទំហំ: 23.8095)'
        }
      ],
      totalTrades: 6,
      winCount: 5,
      lossCount: 1,
      realizedPnl: 428.5
    };
    soundAlert.enabled = this.state.config.soundAlerts;
  }

  public setMT5ForwardHandler(cb: MT5ForwardCallback | null) {
    this.mt5ForwardHandler = cb;
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private persist() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch {
        // Ignore storage quota issues
      }
    }
  }

  private notify() {
    this.persist();
    this.listeners.forEach(l => l());
  }

  public getSnapshot(): BotState {
    return {
      ...this.state,
      config: { ...this.state.config },
      positions: this.state.positions.map(p => ({ ...p })),
      closedPositions: this.state.closedPositions.map(p => ({ ...p })),
      logs: [...this.state.logs]
    };
  }

  public updateConfig(partial: Partial<BotConfig>) {
    this.state.config = { ...this.state.config, ...partial };
    soundAlert.enabled = this.state.config.soundAlerts;
    this.notify();
  }

  public resetBot() {
    this.state.positions = [];
    this.state.closedPositions = [];
    this.state.config.currentBalance = this.state.config.initialBalance;
    this.state.totalTrades = 0;
    this.state.winCount = 0;
    this.state.lossCount = 0;
    this.state.realizedPnl = 0;
    this.addLog(
      'INFO',
      `Bot reset to initial capital ($${this.state.config.initialBalance.toLocaleString()}).`,
      `បានកំណត់ Bot ឡើងវិញទៅទុនដើម ($${this.state.config.initialBalance.toLocaleString()})។`
    );
    this.notify();
  }

  public movePositionToBreakeven(posId: string) {
    const pos = this.state.positions.find(p => p.id === posId);
    if (!pos) return;
    pos.slPrice = pos.entryPrice;
    this.addLog(
      'INFO',
      `Moved Stop Loss to Break-even ($${pos.entryPrice}) for ${pos.symbol} ${pos.type}`,
      `បានរំកិល Stop Loss មកតម្លៃដើម Break-even ($${pos.entryPrice}) សម្រាប់ ${pos.symbol} ${pos.type}`
    );
    this.notify();
  }

  private addLog(
    type: BotLogItem['type'],
    message: string,
    messageKh: string,
    details?: Record<string, unknown>
  ) {
    const item: BotLogItem = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      time: Date.now(),
      type,
      message,
      messageKh,
      details
    };
    this.state.logs = [item, ...this.state.logs.slice(0, 99)];
  }

  public processTick(symbol: string, currentPrice: number) {
    if (this.state.positions.length === 0) return;

    let stateChanged = false;
    const remainingPositions: BotPosition[] = [];

    for (const pos of this.state.positions) {
      if (pos.symbol !== symbol) {
        remainingPositions.push(pos);
        continue;
      }

      pos.currentPrice = currentPrice;
      const isBuy = pos.type === 'BUY';
      const priceDelta = isBuy
        ? currentPrice - pos.entryPrice
        : pos.entryPrice - currentPrice;

      pos.unrealizedPnl = Number((priceDelta * pos.sizeUnits).toFixed(2));
      pos.unrealizedPnlPercent = Number(
        ((priceDelta / pos.entryPrice) * 100).toFixed(2)
      );
      stateChanged = true;

      if (this.state.config.trailingStop) {
        const riskDistance = Math.abs(pos.entryPrice - pos.slPrice);
        if (riskDistance > 0 && priceDelta >= riskDistance && pos.slPrice !== pos.entryPrice) {
          pos.slPrice = pos.entryPrice;
          this.addLog(
            'INFO',
            `Trailing Stop (+1R): Moved SL to Break-even (${pos.entryPrice}) for ${pos.symbol} ${pos.type}`,
            `Trailing Stop (+1R): បានរំកិល SL មកចំណុចស្មើដើម Break-even (${pos.entryPrice}) សម្រាប់ ${pos.symbol} ${pos.type}`
          );
        }
      }

      const hitTp = isBuy ? currentPrice >= pos.tpPrice : currentPrice <= pos.tpPrice;
      const hitSl = isBuy ? currentPrice <= pos.slPrice : currentPrice >= pos.slPrice;

      if (hitTp) {
        const realized = Number(
          (Math.abs(pos.tpPrice - pos.entryPrice) * pos.sizeUnits).toFixed(2)
        );
        this.closePositionInternal(pos, pos.tpPrice, 'TAKE_PROFIT', realized);
      } else if (hitSl) {
        const realized = -Number(
          (Math.abs(pos.entryPrice - pos.slPrice) * pos.sizeUnits).toFixed(2)
        );
        this.closePositionInternal(pos, pos.slPrice, 'STOP_LOSS', realized);
      } else {
        remainingPositions.push(pos);
      }
    }

    if (stateChanged) {
      this.state.positions = remainingPositions;
      this.notify();
    }
  }

  private closePositionInternal(
    pos: BotPosition,
    exitPrice: number,
    reason: BotPosition['closedReason'] = 'MANUAL_CLOSE',
    explicitRealized?: number
  ) {
    const isBuy = pos.type === 'BUY';
    const priceDelta = isBuy ? exitPrice - pos.entryPrice : pos.entryPrice - exitPrice;
    const realized =
      explicitRealized !== undefined ? explicitRealized : priceDelta * pos.sizeUnits;

    pos.status = 'CLOSED';
    pos.closedReason = reason;
    pos.exitPrice = exitPrice;
    pos.exitTime = Date.now();
    pos.realizedPnl = Number(realized.toFixed(2));

    this.state.config.currentBalance = Number(
      (this.state.config.currentBalance + realized).toFixed(2)
    );
    this.state.realizedPnl = Number((this.state.realizedPnl + realized).toFixed(2));
    this.state.totalTrades += 1;

    if (realized >= 0) {
      this.state.winCount += 1;
      soundAlert.playTakeProfitSound();
      this.addLog(
        'TP_HIT',
        `POSITION CLOSED (+PROFIT): ${pos.symbol} ${pos.type} @ $${exitPrice} (+$${realized.toFixed(2)})`,
        `បិទបញ្ជាទទួលបានប្រាក់ចំណេញ: ${pos.symbol} ${pos.type} @ $${exitPrice} (+$${realized.toFixed(2)})`,
        { realized, exitPrice, reason }
      );
    } else {
      this.state.lossCount += 1;
      soundAlert.playStopLossSound();
      this.addLog(
        'SL_HIT',
        `STOP LOSS / CLOSED: ${pos.symbol} ${pos.type} @ $${exitPrice} (-$${Math.abs(realized).toFixed(2)})`,
        `កាត់ខាត / បិទបញ្ជា: ${pos.symbol} ${pos.type} @ $${exitPrice} (-$${Math.abs(realized).toFixed(2)})`,
        { realized, exitPrice, reason }
      );
    }

    this.state.closedPositions = [pos, ...this.state.closedPositions.slice(0, 49)];
  }

  public closePosition(
    pos: BotPosition,
    exitPrice: number,
    reason: BotPosition['closedReason'] = 'MANUAL_CLOSE',
    explicitRealized?: number
  ) {
    this.closePositionInternal(pos, exitPrice, reason, explicitRealized);
    this.state.positions = this.state.positions.filter(p => p.id !== pos.id);
    this.notify();
  }

  public executeSignal(
    symbol: string,
    type: 'BUY' | 'SELL',
    entryPrice: number,
    slPrice: number,
    tpPrice: number,
    source: 'INDICATOR' | 'WEBHOOK' | 'ADMIN_SIGNAL' = 'INDICATOR',
    bypassDuplicateGuard = false
  ) {
    if (!this.state.config.botEnabled || this.state.config.status !== 'RUNNING') {
      return;
    }

    if (this.state.config.autoCloseOnOpposite) {
      const oppositeType = type === 'BUY' ? 'SELL' : 'BUY';
      const opposites = this.state.positions.filter(
        p => p.symbol === symbol && p.type === oppositeType
      );
      opposites.forEach(op => {
        this.closePositionInternal(op, entryPrice, 'OPPOSITE_SIGNAL');
        this.state.positions = this.state.positions.filter(p => p.id !== op.id);
        this.addLog(
          'ORDER_CLOSE',
          `Auto-closed opposite ${oppositeType} on new ${type} signal at $${entryPrice}`,
          `បានបិទបញ្ជាផ្ទុយ ${oppositeType} ដោយស្វ័យប្រវត្តិនៅពេលមានសញ្ញាថ្មី ${type} @ $${entryPrice}`
        );
      });
    }

    if (!bypassDuplicateGuard) {
      const existingSame = this.state.positions.find(
        p => p.symbol === symbol && p.type === type
      );
      if (existingSame) {
        return;
      }
    }

    const balance = this.state.config.currentBalance;
    const riskDollar = balance * (this.state.config.riskPerTradePercent / 100);
    const slDistance = Math.abs(entryPrice - slPrice);
    if (slDistance <= 0) return;

    let sizeUnits = riskDollar / slDistance;
    let allocatedMargin = Number(
      ((sizeUnits * entryPrice) / this.state.config.maxLeverage).toFixed(2)
    );

    if (allocatedMargin > balance * 0.95) {
      sizeUnits = (balance * 0.95 * this.state.config.maxLeverage) / entryPrice;
      allocatedMargin = Number(
        ((sizeUnits * entryPrice) / this.state.config.maxLeverage).toFixed(2)
      );
    }

    sizeUnits = Number(sizeUnits.toFixed(4));

    const newPosition: BotPosition = {
      id: `pos_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      symbol,
      type,
      entryPrice,
      currentPrice: entryPrice,
      slPrice,
      tpPrice,
      sizeUnits,
      allocatedMargin,
      unrealizedPnl: 0,
      unrealizedPnlPercent: 0,
      entryTime: Date.now(),
      status: 'OPEN'
    };

    this.state.positions = [newPosition, ...this.state.positions];

    if (type === 'BUY') {
      soundAlert.playBuySound();
      this.addLog(
        'ORDER_OPEN',
        `[AutoBot] BUY EXECUTED: ${symbol} @ $${entryPrice} | SL: $${slPrice} | TP: $${tpPrice} | Size: ${sizeUnits}`,
        `[Bot ស្វ័យប្រវត្តិ] បើកបញ្ជាទិញ BUY: ${symbol} @ $${entryPrice} | SL: $${slPrice} | TP: $${tpPrice} (ទំហំ: ${sizeUnits})`,
        { source, entryPrice, slPrice, tpPrice, sizeUnits }
      );
    } else {
      soundAlert.playSellSound();
      this.addLog(
        'ORDER_OPEN',
        `[AutoBot] SELL EXECUTED: ${symbol} @ $${entryPrice} | SL: $${slPrice} | TP: $${tpPrice} | Size: ${sizeUnits}`,
        `[Bot ស្វ័យប្រវត្តិ] បើកបញ្ជាលក់ SELL: ${symbol} @ $${entryPrice} | SL: $${slPrice} | TP: $${tpPrice} (ទំហំ: ${sizeUnits})`,
        { source, entryPrice, slPrice, tpPrice, sizeUnits }
      );
    }

    // Mirror order to MetaTrader 5 Bridge when syncWithMT5 is active (and not already originating from ADMIN_SIGNAL)
    if (
      this.state.config.syncWithMT5 &&
      this.mt5ForwardHandler &&
      source !== 'ADMIN_SIGNAL'
    ) {
      const normalizedMt5Symbol = symbol.replace('/', '');
      this.mt5ForwardHandler({
        symbol: normalizedMt5Symbol,
        action: type,
        entryPrice,
        sl: slPrice,
        tp: tpPrice,
        sourceLabel: source === 'WEBHOOK' ? 'Bot Webhook Bridge' : 'LuxAlgo AutoBot'
      });
      this.addLog(
        'MT5_SYNC',
        `[MT5 Bridge] Forwarded ${type} ${normalizedMt5Symbol} @ $${entryPrice} to MetaTrader 5 EA`,
        `[MT5 Bridge] បានបញ្ជូនបញ្ជា ${type} ${normalizedMt5Symbol} @ $${entryPrice} ទៅកាន់ MetaTrader 5 ដោយស្វ័យប្រវត្តិ`
      );
    }

    this.notify();
  }

  public handleWebhook(payload: {
    secret: string;
    symbol: string;
    action: 'BUY' | 'SELL';
    price: number;
    sl?: number;
    tp?: number;
  }): { success: boolean; message: string; messageKh: string } {
    if (payload.secret !== this.state.config.webhookSecret) {
      this.addLog(
        'ERROR',
        'Webhook Auth Failed: Invalid secret key',
        'ការផ្ទៀងផ្ទាត់ Webhook បរាជ័យ: Secret Key មិនត្រឹមត្រូវ'
      );
      this.notify();
      return {
        success: false,
        message: 'Invalid webhook secret key',
        messageKh: 'លេខកូដសម្ងាត់ Webhook Secret មិនត្រឹមត្រូវ'
      };
    }

    if (!this.state.config.botEnabled || this.state.config.status !== 'RUNNING') {
      this.updateConfig({ botEnabled: true, status: 'RUNNING' });
    }

    const price = Number(payload.price);
    const sl = payload.sl
      ? Number(payload.sl)
      : payload.action === 'BUY'
      ? Number((price * 0.992).toFixed(4))
      : Number((price * 1.008).toFixed(4));
    const tp = payload.tp
      ? Number(payload.tp)
      : payload.action === 'BUY'
      ? Number((price + (price - sl) * 2).toFixed(4))
      : Number((price - (sl - price) * 2).toFixed(4));

    this.addLog(
      'WEBHOOK_RECEIVED',
      `Webhook received from TradingView: ${payload.action} ${payload.symbol} @ $${price}`,
      `បានទទួលសញ្ញាពី TradingView Webhook: ${payload.action} ${payload.symbol} @ $${price}`
    );

    this.executeSignal(payload.symbol, payload.action, price, sl, tp, 'WEBHOOK', true);

    return {
      success: true,
      message: `Order ${payload.action} ${payload.symbol} executed at $${price}`,
      messageKh: `បានបញ្ជូនបញ្ជា ${payload.action} ${payload.symbol} @ $${price} ដោយជោគជ័យ!`
    };
  }
}

export const botEngine = new TradingBotEngine();
