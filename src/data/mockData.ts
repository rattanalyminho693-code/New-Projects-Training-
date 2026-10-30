import { 
  MembershipPlan, 
  PaymentRecord, 
  TradingSignal, 
  UserAccount, 
  WebhookLog,
  MT5Config,
  MT5Position,
  MT5ExecutionLog,
  VideoLesson,
  ChatMessage,
  StaffPosition,
  StaffPermissionKey,
  StaffAccount,
  StaffAuditLog,
  FinanceLedgerEntry,
  HRRequestItem,
  VideoProductionTask,
  CustomerRegistrationRecord
} from '../types';

export const INITIAL_PLANS: MembershipPlan[] = [
  {
    id: 'plan_starter',
    name: 'Standard Trader',
    nameKm: 'កញ្ចប់សាកល្បងប្រចាំខែ',
    price: 35,
    billingPeriod: '1 Month',
    billingPeriodKm: '១ ខែ',
    targetAudience: 'For individual traders testing automated alerts',
    targetAudienceKm: 'សម្រាប់អ្នកជួញដូរទោលចង់សាកល្បង Alert ស្វ័យប្រវត្តិ',
    features: [
      'Daily 3-5 High-Probability Forex & Gold Signals',
      'Instant TradingView Webhook Delivery',
      'Clear Entry, TP1, TP2, TP3 and Stop Loss',
      'Telegram & Web Dashboard Realtime Sync',
      'Community Chat Access'
    ],
    featuresKm: [
      'ទទួលបាន ៣-៥ Signals ប្រចាំថ្ងៃ (មាស Gold និង Forex)',
      'ផ្ញើផ្ទាល់ពី TradingView Webhook ភ្លាមៗ',
      'មានចំណុចចូល Entry, TP1, TP2, TP3 និង SL ច្បាស់លាស់',
      'ធ្វើសមកាលកម្មផ្ទាល់លើ Web Dashboard និង Telegram',
      'សិទ្ធិចូលរួមបន្ទប់ជជែកសហគមន៍'
    ]
  },
  {
    id: 'plan_vip_pro',
    name: 'VIP Pro Trader',
    nameKm: 'កញ្ចប់ VIP Pro ៣ខែ (ពេញនិយម)',
    price: 89,
    billingPeriod: '3 Months',
    billingPeriodKm: '៣ ខែ',
    popular: true,
    targetAudience: 'For serious traders aiming for consistent weekly gains',
    targetAudienceKm: 'សម្រាប់អ្នកជួញដូរអាជីពដែលចង់បានប្រាក់ចំណេញប្រចាំសប្តាហ៍',
    features: [
      'All Standard Features Included',
      'Crypto & US30 Index Scalping Alerts',
      'Live Trading Audio Chimes & MT5 Auto-Copy Format',
      'Pine Script Custom Strategy Alerts Access',
      'Direct Trading Strategy Mentorship'
    ],
    featuresKm: [
      'រួមបញ្ចូលលក្ខណៈពិសេសទាំងអស់នៃកញ្ចប់ Standard',
      'បន្ថែម Signal ជួញដូរ Crypto (BTC) និងសន្ទស្សន៍ US30/NAS100',
      'សំឡេង Alert និងទម្រង់ Copy ចូល MT4/MT5 ដោយចុចតែម្តង',
      'សិទ្ធិប្រើប្រាស់ Pine Script Indicators ផ្តាច់មុខ',
      'ការពិគ្រោះយុទ្ធសាស្ត្រ និង Risk Management ផ្ទាល់'
    ]
  },
  {
    id: 'plan_lifetime',
    name: 'Lifetime VIP Master',
    nameKm: 'កញ្ចប់ VIP ពេញមួយជីវិត (Lifetime)',
    price: 199,
    billingPeriod: 'Lifetime Access',
    billingPeriodKm: 'ប្រើប្រាស់មួយជីវិត',
    targetAudience: 'One-time payment for permanent VIP signals and private webhook tools',
    targetAudienceKm: 'បង់តែមួយដង ទទួលបាន Signal គ្រប់ពេលវេលា និង API Webhook ផ្ទាល់ខ្លួន',
    features: [
      'Unlimited Lifetime Access to All VIP Signals',
      'Personal Webhook Endpoint for TradingView Bot',
      'Institutional Gold & Liquidity Sweep Setups',
      'Priority 24/7 Admin & Signal Support',
      'Zero Renewal Fees Forever'
    ],
    featuresKm: [
      'ប្រើប្រាស់ Signal VIP ទាំងអស់ដោយគ្មានដែនកំណត់',
      'ទទួលបាន Endpoint Webhook ផ្ទាល់ខ្លួនសម្រាប់ភ្ជាប់ Bot ផ្ទាល់',
      'យុទ្ធសាស្ត្រ Institutional Liquidity Sweep & SMC',
      'សេវាបម្រើអតិថិជន និងជំនួយការ VIP ២៤/៧',
      'គ្មានថ្លៃបន្តសុពលភាពជារៀងរហូត'
    ]
  }
];

export const INITIAL_SIGNALS: TradingSignal[] = [
  {
    id: 'sig_001',
    ticker: 'XAUUSD',
    assetName: 'Gold Spot / US Dollar',
    action: 'BUY',
    entryPrice: 2382.50,
    tp1: 2388.00,
    tp2: 2394.00,
    tp3: 2405.00,
    sl: 2374.00,
    status: 'ACTIVE',
    timeframe: '15m',
    strategy: 'PineScript EMA Cloud Breakout + Volume Spike',
    source: 'TradingView Webhook',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    riskReward: '1 : 2.6',
    notes: 'Price bounced off key 4H demand zone. Momentum indicator confirmed upward expansion.',
    isVipOnly: true,
    signature: 'XAUUSD_BUY_2382.50_15m'
  },
  {
    id: 'sig_002',
    ticker: 'BTCUSD',
    assetName: 'Bitcoin / US Dollar',
    action: 'BUY',
    entryPrice: 67200.00,
    tp1: 68100.00,
    tp2: 69200.00,
    tp3: 70500.00,
    sl: 66300.00,
    status: 'HIT_TP2',
    timeframe: '1h',
    strategy: 'FVG Liquidity Sweep & RSI Divergence',
    source: 'TradingView Webhook',
    timestamp: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    pipsGained: 2000,
    riskReward: '1 : 2.2',
    notes: 'Target 2 hit successfully! Move stop loss to breakeven (+entry).',
    isVipOnly: true,
    signature: 'BTCUSD_BUY_67200.00_1h'
  },
  {
    id: 'sig_003',
    ticker: 'EURUSD',
    assetName: 'Euro / US Dollar',
    action: 'SELL',
    entryPrice: 1.0865,
    tp1: 1.0840,
    tp2: 1.0815,
    tp3: 1.0780,
    sl: 1.0895,
    status: 'HIT_TP1',
    timeframe: '15m',
    strategy: 'OrderBlock Rejection PineScript Alert',
    source: 'TradingView Webhook',
    timestamp: new Date(Date.now() - 1000 * 60 * 320).toISOString(),
    pipsGained: 25,
    riskReward: '1 : 2.8',
    notes: 'TP1 reached! Secured 50% partial profits.',
    isVipOnly: true,
    signature: 'EURUSD_SELL_1.0865_15m'
  },
  {
    id: 'sig_004',
    ticker: 'US30',
    assetName: 'Dow Jones Industrial Average',
    action: 'BUY',
    entryPrice: 39150.00,
    tp1: 39320.00,
    tp2: 39500.00,
    tp3: 39750.00,
    sl: 39020.00,
    status: 'HIT_TP3',
    timeframe: '30m',
    strategy: 'NY Session Opening Range Breakout',
    source: 'TradingView Webhook',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    pipsGained: 600,
    riskReward: '1 : 4.6',
    notes: 'All 3 Take Profit targets smashed! Outstanding +600 points.',
    isVipOnly: true,
    signature: 'US30_BUY_39150.00_30m'
  },
  {
    id: 'sig_005',
    ticker: 'GBPUSD',
    assetName: 'British Pound / US Dollar',
    action: 'SELL',
    entryPrice: 1.2740,
    tp1: 1.2710,
    tp2: 1.2675,
    tp3: 1.2630,
    sl: 1.2770,
    status: 'HIT_SL',
    timeframe: '1h',
    strategy: 'Trendline Break & Retest',
    source: 'Admin Manual',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    pipsGained: -30,
    riskReward: '1 : 3.6',
    notes: 'High impact CPI news caused sudden spike. Controlled risk strictly respected.',
    isVipOnly: true,
    signature: 'GBPUSD_SELL_1.2740_1h'
  }
];

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr_001',
    name: 'Sokha Chan',
    email: 'sokha.trader@gmail.com',
    phone: '012 889 900',
    telegram: '@sokha_fx',
    password: 'Customer@2026',
    gmailVerified: true,
    interestedPlanId: 'plan_vip_pro',
    role: 'vip',
    status: 'active',
    vipExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 75).toISOString(),
    joinedAt: '2026-08-15',
    totalPayments: 89,
    mt5Allowed: true // Authorized by Admin for MT5 Auto-Trade
  },
  {
    id: 'usr_002',
    name: 'Ratana Minho',
    email: 'rattanaminho@gmail.com',
    phone: '098 777 666',
    telegram: '@ratana_minho',
    password: 'Customer@2026',
    gmailVerified: true,
    interestedPlanId: 'plan_vip_pro',
    role: 'member',
    status: 'active',
    joinedAt: '2026-10-20',
    totalPayments: 35,
    mt5Allowed: false
  },
  {
    id: 'usr_003',
    name: 'Dara Samnang',
    email: 'dara.fx@gmail.com',
    phone: '010 334 556',
    telegram: '@darasamnang',
    password: 'Customer@2026',
    gmailVerified: true,
    interestedPlanId: 'plan_vip_pro',
    role: 'member',
    status: 'active',
    joinedAt: '2026-10-23',
    totalPayments: 89,
    mt5Allowed: false
  },
  {
    id: 'usr_004',
    name: 'Alexandre Kim',
    email: 'alex.gold@gmail.com',
    phone: '015 992 110',
    password: 'Customer@2026',
    gmailVerified: true,
    role: 'vip',
    status: 'active',
    vipExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 340).toISOString(),
    joinedAt: '2026-06-10',
    totalPayments: 199,
    mt5Allowed: false // VIP but pending Admin authorization for MT5 Auto-Trade
  },
  {
    id: 'usr_005',
    name: 'Channary Seng',
    email: 'channary.seng@gmail.com',
    phone: '085 441 228',
    password: 'Customer@2026',
    gmailVerified: true,
    role: 'vip',
    status: 'active',
    vipExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 88).toISOString(),
    joinedAt: '2026-10-24',
    totalPayments: 89,
    mt5Allowed: true
  },
  {
    id: 'usr_006',
    name: 'Vannak Pich',
    email: 'vannak.pich@gmail.com',
    phone: '017 662 319',
    password: 'Customer@2026',
    gmailVerified: true,
    role: 'vip',
    status: 'active',
    vipExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3640).toISOString(),
    joinedAt: '2026-10-18',
    totalPayments: 199,
    mt5Allowed: true
  },
  {
    id: 'usr_007',
    name: 'Sreyneang Keo',
    email: 'sreyneang.fx@gmail.com',
    phone: '096 512 884',
    telegram: '@sreyneang_keo',
    password: 'Customer@2026',
    gmailVerified: true,
    interestedPlanId: 'plan_starter',
    role: 'member',
    status: 'active',
    joinedAt: '2026-10-27',
    totalPayments: 0,
    mt5Allowed: false
  }
];

export const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay_106',
    userId: 'usr_005',
    userName: 'Channary Seng',
    userEmail: 'channary.seng@gmail.com',
    userPhone: '085 441 228',
    planId: 'plan_vip_pro',
    planName: 'កញ្ចប់ VIP Pro ៣ខែ (ពេញនិយម)',
    amount: 89,
    paymentMethod: 'ABA KHQR',
    transactionId: 'ABA-88492015',
    submittedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    reviewedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    status: 'APPROVED',
    approvalMode: 'AUTO',
    notes: 'Auto-Approved (ABA KHQR · VIP-PRO-89USD)'
  },
  {
    id: 'pay_105',
    userId: 'usr_006',
    userName: 'Vannak Pich',
    userEmail: 'vannak.pich@gmail.com',
    userPhone: '017 662 319',
    planId: 'plan_lifetime',
    planName: 'កញ្ចប់ VIP ពេញមួយជីវិត (Lifetime)',
    amount: 199,
    paymentMethod: 'USDT TRC20',
    transactionId: 'TRC20-99104823',
    submittedAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    reviewedAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    status: 'APPROVED',
    approvalMode: 'AUTO',
    notes: 'Auto-Approved (USDT TRC20 · VIP-LIFE-199USD)'
  },
  {
    id: 'pay_101',
    userId: 'usr_002',
    userName: 'Ratana Minho',
    userEmail: 'rattanaminho@gmail.com',
    userPhone: '098 777 666',
    planId: 'plan_vip_pro',
    planName: 'VIP Pro Trader (3 Months)',
    amount: 89,
    paymentMethod: 'ABA KHQR',
    transactionId: 'TXN-ABA-9823412',
    receiptImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop&q=60',
    submittedAt: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    status: 'PENDING',
    approvalMode: 'MANUAL',
    notes: 'Customer transferred via ABA Mobile KHQR scan, waiting for review.'
  },
  {
    id: 'pay_102',
    userId: 'usr_003',
    userName: 'Dara Samnang',
    userEmail: 'dara.fx@outlook.com',
    userPhone: '010 334 556',
    planId: 'plan_starter',
    planName: 'Standard Trader (1 Month)',
    amount: 35,
    paymentMethod: 'Bakong',
    transactionId: 'TXN-BAKONG-551249',
    receiptImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop&q=60',
    submittedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    status: 'PENDING',
    approvalMode: 'MANUAL',
    notes: 'Bakong QR payment transferred.'
  },
  {
    id: 'pay_104',
    userId: 'usr_004',
    userName: 'Alexandre Kim',
    userEmail: 'alex.gold@yahoo.com',
    userPhone: '015 992 110',
    planId: 'plan_lifetime',
    planName: 'Lifetime VIP Master',
    amount: 199,
    paymentMethod: 'ABA KHQR',
    transactionId: 'TXN-ABA-6410928',
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 19).toISOString(),
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 19).toISOString(),
    status: 'APPROVED',
    approvalMode: 'AUTO',
    notes: 'Auto-Approved via ABA PayWay KHQR.'
  },
  {
    id: 'pay_100',
    userId: 'usr_001',
    userName: 'Sokha Chan',
    userEmail: 'sokha.trader@gmail.com',
    userPhone: '012 889 900',
    planId: 'plan_vip_pro',
    planName: 'VIP Pro Trader (3 Months)',
    amount: 89,
    paymentMethod: 'ABA KHQR',
    transactionId: 'TXN-ABA-7761230',
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 47).toISOString(),
    status: 'APPROVED',
    approvalMode: 'MANUAL',
    notes: 'Verified via ABA merchant statement by FIN-001.'
  },
  {
    id: 'pay_103',
    userId: 'usr_007',
    userName: 'Sreyneang Keo',
    userEmail: 'sreyneang.fx@gmail.com',
    userPhone: '096 512 884',
    planId: 'plan_starter',
    planName: 'Standard Trader (1 Month)',
    amount: 35,
    paymentMethod: 'Bakong',
    transactionId: 'TXN-BKG-001920',
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 71).toISOString(),
    status: 'REJECTED',
    approvalMode: 'MANUAL',
    notes: 'Duplicate reference submitted — asked customer to re-verify.'
  }
];

export const DEFAULT_WEBHOOK_CONFIG = {
  secretKey: 'TV_SECRET_PRO_2026',
  endpointUrl: 'https://api.alphasignal.vip/webhook/tradingview',
  duplicateWindowSeconds: 60
};

export const SAMPLE_PINE_SCRIPT = `//@version=5
indicator("AlphaSignal VIP - Webhook Alert Engine", overlay=true)

// EMAs for Trend Detection
emaFast = ta.ema(close, 20)
emaSlow = ta.ema(close, 50)

bullishCross = ta.crossover(emaFast, emaSlow)
bearishCross = ta.crossunder(emaFast, emaSlow)

plot(emaFast, color=color.green, title="EMA 20")
plot(emaSlow, color=color.red, title="EMA 50")

// Calculate TP/SL
atr = ta.atr(14)
longSL = close - (atr * 1.5)
longTP1 = close + (atr * 1.5)
longTP2 = close + (atr * 2.5)
longTP3 = close + (atr * 4.0)

// TradingView Alert Payload in JSON
alertMessageBuy = '{"secret": "TV_SECRET_PRO_2026", "ticker": "' + syminfo.ticker + '", "action": "BUY", "price": ' + str.tostring(close) + ', "sl": ' + str.tostring(longSL) + ', "tp1": ' + str.tostring(longTP1) + ', "tp2": ' + str.tostring(longTP2) + ', "tp3": ' + str.tostring(longTP3) + ', "timeframe": "' + timeframe.period + '", "strategy": "EMA Golden Cross"}'

if (bullishCross)
    alert(alertMessageBuy, alert.freq_once_per_bar_close)
`;

export const DEFAULT_MT5_CONFIG: MT5Config = {
  autoTradeEnabled: true,
  accountNumber: '50892411',
  brokerServer: 'Exness-MT5Real',
  lotType: 'fixed',
  fixedLotSize: 0.10,
  riskPercent: 1.5,
  magicNumber: 202610,
  maxSlippage: 3,
  partialTakeProfit: true,
  connected: true,
  accountBalance: 10000.00,
  accountEquity: 10625.00
};

export const INITIAL_MT5_POSITIONS: MT5Position[] = [
  {
    ticket: 892410,
    signalId: 'sig_001',
    symbol: 'XAUUSD',
    type: 'BUY',
    volume: 0.10,
    openPrice: 2382.50,
    currentPrice: 2385.50,
    sl: 2374.00,
    tp: 2394.00,
    openTime: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    profit: 300.00,
    pips: 30,
    comment: 'AlphaVIP AutoTrade MT5'
  },
  {
    ticket: 892411,
    signalId: 'sig_002',
    symbol: 'BTCUSD',
    type: 'BUY',
    volume: 0.05,
    openPrice: 67200.00,
    currentPrice: 67850.00,
    sl: 66300.00,
    tp: 69200.00,
    openTime: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    profit: 325.00,
    pips: 65,
    comment: 'AlphaVIP AutoTrade MT5'
  }
];

export const INITIAL_MT5_LOGS: MT5ExecutionLog[] = [
  {
    id: 'mt5_log_001',
    ticket: 892410,
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    symbol: 'XAUUSD',
    type: 'BUY',
    volume: 0.10,
    price: 2382.50,
    sl: 2374.00,
    tp: 2394.00,
    status: 'FILLED',
    latencyMs: 14,
    message: 'Instant Execution successful on Exness-MT5Real'
  },
  {
    id: 'mt5_log_002',
    ticket: 892411,
    timestamp: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    symbol: 'BTCUSD',
    type: 'BUY',
    volume: 0.05,
    price: 67200.00,
    sl: 66300.00,
    tp: 69200.00,
    status: 'FILLED',
    latencyMs: 19,
    message: 'Instant Execution successful on Exness-MT5Real'
  }
];

export const SAMPLE_MQL5_EA = `//+------------------------------------------------------------------+
//|                                   AlphaSignal_MT5_AutoTrader.mq5 |
//|                                  Copyright 2026, AlphaSignal VIP |
//|                             https://api.alphasignal.vip/webhook  |
//+------------------------------------------------------------------+
#property copyright "AlphaSignal VIP"
#property link      "https://api.alphasignal.vip"
#property version   "2.00"
#property strict

#include <Trade\\Trade.mqh>
CTrade trade;

//--- Expert Advisor Inputs
input string   InpApiEndpoint  = "https://api.alphasignal.vip/api/mt5-signals"; // Webhook Endpoint
input string   InpSecretToken  = "TV_SECRET_PRO_2026";                          // VIP Secret Token
input double   InpFixedLot     = 0.10;                                          // Default Lot Size
input ulong    InpMagicNumber  = 202610;                                        // Magic Number
input ulong    InpMaxSlippage  = 3;                                             // Max Slippage (points)
input bool     InpAutoBreakEven= true;                                          // Move SL to Breakeven at TP1

int OnInit()
{
   trade.SetExpertMagicNumber(InpMagicNumber);
   trade.SetDeviationInPoints(InpMaxSlippage);
   trade.SetTypeFilling(ORDER_FILLING_FOK);
   Print("AlphaSignal MT5 Auto-Trader initialized successfully!");
   return(INIT_SUCCEEDED);
}

void OnDeinit(const int reason)
{
   Print("AlphaSignal MT5 Auto-Trader detached.");
}

void OnTick()
{
   // Check for incoming signals via WebRequest or Socket Bridge
   // When BUY signal received:
   // trade.Buy(InpFixedLot, "XAUUSD", AskPrice, StopLoss, TakeProfit, "AlphaSignal VIP Auto");
   // When SELL signal received:
   // trade.Sell(InpFixedLot, "XAUUSD", BidPrice, StopLoss, TakeProfit, "AlphaSignal VIP Auto");
}
`;

export const INITIAL_LESSONS: VideoLesson[] = [
  {
    id: 'lesson_01',
    title: 'TradingView Setup & Charting Mastery',
    titleKm: 'ការរៀបចំ និងប្រើប្រាស់ TradingView សម្រាប់អ្នកចាប់ផ្តើម',
    description: 'Learn how to configure your workspace, customize candle styles, set alert webhooks, and read market structure cleanly without indicator clutter.',
    descriptionKm: 'ស្វែងយល់ពីរបៀបរៀបចំផ្ទាំង Chart, កំណត់ Alert Webhook ស្វ័យប្រវត្តិ, និងវិភាគរចនាសម្ព័ន្ធទីផ្សារ Market Structure ដោយមិនបាច់ស្មុគស្មាញ។',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Standard embed format
    duration: '18:45',
    category: 'basics',
    categoryKm: 'មូលដ្ឋានគ្រឹះ',
    accessLevel: 'all',
    createdAt: '2026-03-15T08:00:00Z',
    viewsCount: 1420,
    instructor: 'Master Roth (Chief Analyst)',
    thumbnailUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    keyTakeaways: [
      'Configuring TradingView multi-chart layouts',
      'Placing horizontal ray levels for key swing highs and lows',
      'Configuring alert webhook JSON payload format',
      'Saving chart templates across desktop and mobile'
    ],
    keyTakeawaysKm: [
      'ការរៀបចំផ្ទាំង Multi-Chart នៅលើ TradingView',
      'ការគូសបន្ទាត់ Swing High និង Swing Low សំខាន់ៗ',
      'ទម្រង់ Format នៃ Webhook Alert សម្រាប់ភ្ជាប់ចូលប្រព័ន្ធ',
      'ការរក្សាទុក Template លើកុំព្យូទ័រ និងទូរស័ព្ទដៃ'
    ]
  },
  {
    id: 'lesson_02',
    title: 'Smart Money Concept (SMC) & Institutional Order Blocks',
    titleKm: 'យុទ្ធសាស្ត្រ Smart Money Concept (SMC) & Order Block Reversal',
    description: 'Master institutional order flow: understand Fair Value Gaps (FVG), liquidity pools, break of structure (BOS), and change of character (CHoCH).',
    descriptionKm: 'មេរៀនស៊ីជម្រៅពីលំហូរទុនធនាគារពិភពលោក (SMC), ការសម្គាល់ Fair Value Gap (FVG), Liquidity Sweeps, BOS និង CHoCH ដើម្បីរកចំណុចចូលច្បាស់បំផុត។',
    videoUrl: 'https://www.youtube.com/embed/L_LUpnjgPso',
    duration: '26:30',
    category: 'smc',
    categoryKm: 'SMC & OrderBlock',
    accessLevel: 'vip',
    createdAt: '2026-03-20T10:30:00Z',
    viewsCount: 980,
    instructor: 'Master Roth (Chief Analyst)',
    thumbnailUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=800&q=80',
    keyTakeaways: [
      'Identifying bullish & bearish institutional order blocks',
      'Wait for liquidity purge before entry to avoid fakeouts',
      'Refining 4H order blocks down to 15m entry triggers',
      'Setting precise invalidation stop-loss behind wick extremes'
    ],
    keyTakeawaysKm: [
      'របៀបកំណត់ Order Block របស់ស្ថាប័នធំៗ (Bullish & Bearish)',
      'រង់ចាំទីផ្សារស៊ី Liquidity រួចទើបចូល Trade កុំឱ្យចាញ់បោក Fakeout',
      'ការចម្រាញ់ពី Timeframe 4H មក 15m ដើម្បីទទួលបាន Risk/Reward ខ្ពស់',
      'ការដាក់ Stop Loss ត្រឹមត្រូវការពារដើមទុនមិនឱ្យខាតធ្ងន់ធ្ងរ'
    ]
  },
  {
    id: 'lesson_03',
    title: 'Automated Webhook to MT5 Terminal Execution (Zero Delay)',
    titleKm: 'ការភ្ជាប់ Webhook និង Auto-Trading ចូល MT5 ដោយស្វ័យប្រវត្តិ',
    description: 'Step-by-step setup guide for connecting AlphaSignal VIP webhooks to MetaTrader 5 Expert Advisor for fully automated trade execution.',
    descriptionKm: 'ការណែនាំលម្អិតពីការតម្លើង EA លើ MT5, ការបើក WebRequest URL, និងរបៀបដែល Bot បើក Order, TP1/TP2 និង Break-even ដោយស្វ័យប្រវត្តិក្នង 120ms។',
    videoUrl: 'https://www.youtube.com/embed/bTqVqk7FSmY',
    duration: '22:15',
    category: 'mt5_bot',
    categoryKm: 'MT5 Auto-Trading',
    accessLevel: 'vip',
    createdAt: '2026-04-02T14:15:00Z',
    viewsCount: 750,
    instructor: 'Dev Lead & Quant Sokha',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    keyTakeaways: [
      'Installing .mq5 EA into MQL5/Experts folder',
      'Enabling WebRequest for https://api.alphasignal.vip in MT5',
      'Setting dynamic vs fixed lot sizes based on balance',
      'Partial take-profit logic (50% closed at TP1, move SL to breakeven)'
    ],
    keyTakeawaysKm: [
      'ការដំឡើង File .mq5 ចូលទៅកាន់ Folder MQL5/Experts ក្នុង MT5',
      'ការបើក Allow WebRequest សម្រាប់ URL របស់ប្រព័ន្ធ',
      'ការកំណត់ Lot Size ថេរ ឬគិតជា % នៃសមតុល្យគណនី (Balance)',
      'យុទ្ធសាស្ត្រកាត់ចំណេញ 50% នៅ TP1 និងរំកិល SL មកទប់ដើម (Breakeven)'
    ]
  },
  {
    id: 'lesson_04',
    title: 'The Mathematics of 1:3 Risk to Reward & Lot Sizing',
    titleKm: 'ក្បួនគ្រប់គ្រងដើមទុន 1:3 Risk-to-Reward & Lot Sizing គិតតាម Pip',
    description: 'Why win rate does not matter without proper risk management. Learn how a 40% win rate can make you consistently profitable with 1:3 R:R.',
    descriptionKm: 'មូលហេតុដែល Win Rate មិនសំខាន់ស្មើនឹង Risk Management។ រៀនគណនា Lot Size តាមទំហំ Stop Loss ដើម្បីការពារគណនីមិនឱ្យ Burnout។',
    videoUrl: 'https://www.youtube.com/embed/ysz5S6PUM-U',
    duration: '15:10',
    category: 'risk_management',
    categoryKm: 'គ្រប់គ្រងដើមទុន (Risk)',
    accessLevel: 'member',
    createdAt: '2026-03-25T11:00:00Z',
    viewsCount: 1650,
    instructor: 'Master Roth (Chief Analyst)',
    thumbnailUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80',
    keyTakeaways: [
      'Never risking more than 1% to 2% per trade',
      'Calculating lot size based on SL distance rather than fixed lots',
      'Managing drawdowns and avoiding revenge trading',
      'Compound growth projections over 12 months'
    ],
    keyTakeawaysKm: [
      'កុំប្រថុយដើមទុនលើសពី ១% ទៅ ២% ក្នុងមួយ Trade ឱ្យសោះ',
      'របៀបគណនា Lot Size ដោយផ្អែកលើចម្ងាយ Pip នៃ Stop Loss',
      'ការគ្រប់គ្រងអារម្មណ៍ពេលជួប Drawdown និងបញ្ចៀស Revenge Trading',
      'តារាងកំណើនទុន Compound Growth រយៈពេល ១២ខែ'
    ]
  },
  {
    id: 'lesson_05',
    title: 'Gold Spot (XAUUSD) 15m Scalping Precision',
    titleKm: 'បច្ចេកទេស Scalping មាស XAUUSD លើ Timeframe 15m',
    description: 'Advanced session liquidity trading for Gold (London & New York overlap). Reading volume spikes and executing high probability scalp orders.',
    descriptionKm: 'ការជួញដូរមាស XAUUSD ក្នុងពេលផ្សារ London & New York បើកដំណាលគ្នា។ បច្ចេកទេសចាប់រលក Scalp 15m យក 30-60 pips យ៉ាងលឿន។',
    videoUrl: 'https://www.youtube.com/embed/5qap5aO4i9A',
    duration: '24:50',
    category: 'technical',
    categoryKm: 'បច្ចេកទេស Trade',
    accessLevel: 'vip',
    createdAt: '2026-04-05T09:40:00Z',
    viewsCount: 1120,
    instructor: 'Master Roth (Chief Analyst)',
    thumbnailUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=800&q=80',
    keyTakeaways: [
      'Gold volatility hours: 13:00 GMT and 18:30 GMT',
      'Spotting session high/low liquidity traps',
      'Entering immediately following clean 15m candle rejection wicks',
      'Scaling out at predetermined liquidity pools'
    ],
    keyTakeawaysKm: [
      'ម៉ោងដែលមាសប្រែប្រួលខ្លាំង: ម៉ោង 13:00 GMT និង 18:30 GMT',
      'ការមើលអន្ទាក់ Liquidity Trap នៅក្បែរកំពូល និងបាតនៃថ្ងៃ',
      'ការចូល Trade ភ្លាមៗក្រោយពេលទៀន 15m បង្ហាញកន្ទុយ Rejection',
      'ការបែងចែក TP ជាដំណាក់កាលដើម្បីរក្សាប្រាក់ចំណេញ'
    ]
  },
  {
    id: 'lesson_06',
    title: 'Trader Psychology & Eliminating Emotional Revenge Trading',
    titleKm: 'ចិត្តវិទ្យាក្នុងការ Trade និងវិធីទប់ស្កាត់ការខឹងទីផ្សារ (Revenge Trading)',
    description: 'The psychological framework used by institutional prop firm traders to stay calm, disciplined, and consistent regardless of market fluctuations.',
    descriptionKm: 'គោលការណ៍ផ្លូវចិត្តរបស់អ្នកជួញដូរអាជីពនៅ Prop Firm ដើម្បីរក្សាភាពស្ងប់ស្ងាត់ មានវិន័យ និងជៀសវាងការខាតបង់ដោយសារការភ័យខ្លាច ឬលោភលន់។',
    videoUrl: 'https://www.youtube.com/embed/jNQXAC9IVRw',
    duration: '16:40',
    category: 'psychology',
    categoryKm: 'ចិត្តវិទ្យា Trader',
    accessLevel: 'member',
    createdAt: '2026-03-10T16:20:00Z',
    viewsCount: 2100,
    instructor: 'Coach Serey (Trading Mindset)',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    keyTakeaways: [
      'The 3-loss circuit breaker rule (stop trading for the day)',
      'Treating trading as a probability business, not gambling',
      'Building an end-of-day trading journal',
      'Handling streak bias (winning or losing streaks)'
    ],
    keyTakeawaysKm: [
      'ច្បាប់កាត់ផ្តាច់: បើចាញ់ ៣ ដងជាប់គ្នា ត្រូវបិទកុំព្យូទ័រឈប់ Trade ប្រចាំថ្ងៃ',
      'ចាត់ទុកការ Trade ជាមុខជំនួញប្រូបាប៊ីលីតេ មិនមែនល្បែងស៊ីសង',
      'ការកត់ត្រា Trading Journal រាល់ពេលចប់ការជួញដូរ',
      'ការគ្រប់គ្រងស្មារតីពេលជួប Winning Streak ឬ Losing Streak'
    ]
  }
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  // Community Channel Messages (Member ធម្មតា)
  {
    id: 'msg_comm_01',
    channelId: 'community',
    senderId: 'usr_admin',
    senderName: 'Master Sovann (Admin)',
    senderRole: 'admin',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    text: 'Welcome to Alpha Traders Community! 🇰🇭 This is our public forum for market analysis, educational discussions, and community sharing. Please adhere to respectful communication.',
    textKm: 'សូមស្វាគមន៍មកកាន់ Alpha Traders Community! 🇰🇭 បន្ទប់នេះសម្រាប់ពិភាក្សាទីផ្សារទូទៅ និងសួរសំណួរមេរៀន។ សូមរក្សាវិន័យជួញដូរ និងហាម Spam។',
    timestamp: '08:30 AM',
    isPinned: true,
    reactions: { '🔥': 14, '❤️': 9, '👍': 22 }
  },
  {
    id: 'msg_comm_02',
    channelId: 'community',
    senderId: 'usr_002',
    senderName: 'Kim Vicheka (Member)',
    senderRole: 'member',
    senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    text: 'Good morning everyone! Gold (XAUUSD) seems to be respecting the 2715 support level. Any thoughts on London session?',
    textKm: 'សួស្តីបងប្អូនទាំងអស់គ្នា! ថ្ងៃនេះ XAUUSD មើលទៅអាចឡើងដល់ 2730 ទេ បន្ទាប់ពីទម្លុះ Resistance M15 ព្រឹកមិញ?',
    timestamp: '08:45 AM',
    reactions: { '👍': 4 }
  },
  {
    id: 'msg_comm_03',
    channelId: 'community',
    senderId: 'usr_analyst_01',
    senderName: 'Rithy Pro Analyst',
    senderRole: 'analyst',
    senderAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    text: 'Yes Vicheka, on the 15m chart there is a clean Bullish Order Block around 2715-2718. Wait for a rejection wick before jumping in.',
    textKm: 'ត្រូវហើយបង Vicheka! លើ Chart 15m មាន Bullish Order Block ចន្លោះ 2715-2718។ រង់ចាំទៀនមាន Rejection កន្ទុយវែងសិនចាំចូល Buy ដើម្បីសុវត្ថិភាព។',
    timestamp: '08:52 AM',
    replyTo: {
      id: 'msg_comm_02',
      senderName: 'Kim Vicheka (Member)',
      text: 'Good morning everyone! Gold (XAUUSD) seems to be respecting the 2715 support level.'
    },
    reactions: { '🔥': 8, '👏': 5 }
  },
  {
    id: 'msg_comm_04',
    channelId: 'community',
    senderId: 'usr_004',
    senderName: 'Heng Bunrong',
    senderRole: 'member',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    text: 'Just finished watching Video Lesson #3 on Smart Money Concepts in the Academy. Truly eye-opening!',
    textKm: 'ទើបតែមើលវីដេអូមេរៀនទី ៣ SMC ចប់ក្នុង Academy យល់ច្បាស់ណាស់ អរគុណ Admin ដែលបានបង្រៀនជាភាសាខ្មែរស្រួលយល់!',
    timestamp: '09:15 AM',
    reactions: { '❤️': 6 }
  },
  {
    id: 'msg_comm_05',
    channelId: 'community',
    senderId: 'usr_005',
    senderName: 'Chann Pich',
    senderRole: 'member',
    senderAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80',
    text: 'How can I connect MT5 Auto-Trading? Do I need VIP upgrade first?',
    textKm: 'តើខ្ញុំអាចភ្ជាប់ MT5 Auto-Trading ដោយរបៀបណាដែរ? ចាំបាច់ត្រូវតែបង់ប្រាក់ Upgrade VIP សិនមែនទេបង?',
    timestamp: '09:28 AM'
  },
  {
    id: 'msg_comm_06',
    channelId: 'community',
    senderId: 'usr_001',
    senderName: 'Sokha Chan (VIP Member)',
    senderRole: 'vip',
    senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    text: 'Yes Pich! You need VIP plan + Admin authorization for MT5 Auto-Trade. Once enabled, the bot takes signals with zero latency. Highly worth it!',
    textKm: 'បាទបង Pich! ត្រូវតែជា VIP Member និងមានការអនុញ្ញាតពី Admin ទើបអាចបើក MT5 Auto-Trade បាន។ ពេលបើកហើយ Bot ជួញដូរស្វ័យប្រវត្តិតាម Webhook Signal មិនបាច់ចាំអង្គុយមើលកុងទ័រទេ។ ស្រួលមែនទែន!',
    timestamp: '09:34 AM',
    replyTo: {
      id: 'msg_comm_05',
      senderName: 'Chann Pich',
      text: 'How can I connect MT5 Auto-Trading? Do I need VIP upgrade first?'
    },
    reactions: { '🚀': 7, '👍': 11 }
  },

  // VIP Channel Messages (VIP ១ - VIP Member ផ្តាច់មុខ)
  {
    id: 'msg_vip_01',
    channelId: 'vip',
    senderId: 'usr_admin',
    senderName: 'Master Sovann (Admin)',
    senderRole: 'admin',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    text: '⭐ ALPHA VIP INSIDER: Today US Core CPI data drops at 8:30 PM. Keep MT5 position risk at 1.0-1.5%. All automated webhooks are calibrated with tighter trailing stops.',
    textKm: '⭐ ALPHA VIP INSIDER: យប់នេះម៉ោង 8:30 យប់មានព័ត៌មានធំ US Core CPI។ សូមកាត់បន្ថយ Risk មកត្រឹម 1.0 - 1.5% លើ MT5។ Webhook បើកដំណើរការពេញលេញ!',
    timestamp: '07:15 AM',
    isPinned: true,
    reactions: { '🔥': 28, '💰': 19, '👑': 15 }
  },
  {
    id: 'msg_vip_02',
    channelId: 'vip',
    senderId: 'usr_webhook_bot',
    senderName: 'Alpha TradingView Bot 🤖',
    senderRole: 'admin',
    senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
    text: '🚨 [VIP SIGNAL ALERT] #XAUUSD BUY LIMIT @ 2718.50 | SL: 2712.00 | TP1: 2724.00 (+55 pips) | TP2: 2730.00 (+115 pips) | TP3: 2742.00 (+235 pips)',
    textKm: '🚨 [VIP SIGNAL ALERT] #XAUUSD BUY LIMIT @ 2718.50 | SL: 2712.00 | TP1: 2724.00 (+55 pips) | TP2: 2730.00 (+115 pips) | TP3: 2742.00 (+235 pips)',
    timestamp: '08:12 AM',
    attachment: {
      type: 'signal_card',
      title: 'XAUUSD M15 Order Block Reversal',
      details: 'Risk-Reward: 1:3.6 | Volatility: High | Confirmed by PineScript EMA Cloud'
    },
    reactions: { '🚀': 24, '🔥': 18 }
  },
  {
    id: 'msg_vip_03',
    channelId: 'vip',
    senderId: 'usr_mt5_bridge',
    senderName: 'MT5 Bridge Gateway ⚡',
    senderRole: 'admin',
    senderAvatar: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=120&q=80',
    text: '⚡ MT5 AUTO-TRADE BRIDGED: 19 Authorized VIP accounts filled Order #892110 with zero slippage. Total Volume: 4.8 Lots. Trailing SL auto-primed.',
    textKm: '⚡ MT5 AUTO-TRADE BRIDGED: គណនី VIP ចំនួន 19 ដែល Admin បាន Approve បានបើក Order #892110 ជោគជ័យភ្លាមៗ។ Slippage: 0.1 pip.',
    timestamp: '08:13 AM',
    reactions: { '⚡': 21, '👏': 16 }
  },
  {
    id: 'msg_vip_04',
    channelId: 'vip',
    senderId: 'usr_001',
    senderName: 'Sokha Chan (VIP Pro)',
    senderRole: 'vip',
    senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    text: 'Executed on my Raw Spread MT5 account at 2718.52! Beautiful entry Master Sovann! 🎯',
    textKm: 'Bot កេះ Order ចូលលើ MT5 ខ្ញុំបានតម្លៃ 2718.52 យ៉ាងស្រួល! អរគុណ Master Sovann!',
    timestamp: '08:20 AM',
    reactions: { '👍': 12, '❤️': 8 }
  },
  {
    id: 'msg_vip_05',
    channelId: 'vip',
    senderId: 'usr_webhook_bot',
    senderName: 'Alpha TradingView Bot 🤖',
    senderRole: 'admin',
    senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
    text: '🎯 [TARGET REACHED] #XAUUSD TP1 HIT at 2724.00 (+55.0 PIPS PROFIT)! Partial Take-Profit triggered. Stop-Loss shifted to Breakeven 2718.50.',
    textKm: '🎯 [TARGET REACHED] #XAUUSD TP1 បុកចំ 2724.00 (+55.0 Pips ចំណេញ)! Bot បានកាត់ 50% យកប្រាក់ចំណេញ ហើយរំកិល SL ទៅ Breakeven ដោយស្វ័យប្រវត្តិ!',
    timestamp: '09:05 AM',
    reactions: { '💰': 35, '🔥': 29, '🎉': 22 }
  },
  {
    id: 'msg_vip_06',
    channelId: 'vip',
    senderId: 'usr_vip_02',
    senderName: 'Bona Keo (VIP Member)',
    senderRole: 'vip',
    senderAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&q=80',
    text: '+$385 secured on TP1! Risk is completely eliminated now, pure free ride to TP2 and TP3! 🚀💸',
    textKm: '+$385 បានចូលកុងហើយនៅ TP1! ឥឡូវគ្មាន Risk ទៀតទេ រង់ចាំទៅ TP2 & TP3 ស្រួលចិត្តណាស់!',
    timestamp: '09:12 AM',
    replyTo: {
      id: 'msg_vip_05',
      senderName: 'Alpha TradingView Bot 🤖',
      text: '🎯 [TARGET REACHED] #XAUUSD TP1 HIT at 2724.00 (+55.0 PIPS PROFIT)!'
    },
    reactions: { '💸': 15, '👏': 9 }
  }
];

export const POSITION_DEFINITIONS: Record<
  StaffPosition,
  {
    labelEn: string;
    labelKm: string;
    shortTitle: string;
    idPrefix: string;
    descEn: string;
    descKm: string;
    defaultPermissions: StaffPermissionKey[];
  }
> = {
  administrator: {
    labelEn: 'Administrator',
    labelKm: 'Administrator (អភិបាលគ្រប់គ្រងជាន់ខ្ពស់)',
    shortTitle: 'Administrator',
    idPrefix: 'ADM',
    descEn: 'Full executive control, Set Staff ID & Passwords, role permissions, webhook & MT5 security',
    descKm: 'គ្រប់គ្រងប្រព័ន្ធទាំងមូល កំណត់ ID & Password តាមមុខតំណែង និងសុវត្ថិភាព Webhook/MT5',
    defaultPermissions: [
      'overview',
      'staff_credentials',
      'editorial_signals',
      'video_studio',
      'hr_operations',
      'leadership_finance',
      'members_vip',
      'system_security'
    ]
  },
  editor: {
    labelEn: 'Editor',
    labelKm: 'Editor (អ្នកគ្រប់គ្រងអត្ថបទ & Signal)',
    shortTitle: 'Editor',
    idPrefix: 'EDT',
    descEn: 'Broadcast trading signals, update TP/SL hit statuses, publish VIP & community market notes',
    descKm: 'បញ្ជូន Signal ជួញដូរ កែប្រែស្ថានភាព TP/SL និងបង្ហោះអត្ថបទវិភាគទីផ្សារក្នុងឆានែល',
    defaultPermissions: ['overview', 'editorial_signals']
  },
  videos_editor: {
    labelEn: 'Videos Editor',
    labelKm: 'Videos Editor (អ្នកគ្រប់គ្រងវីដេអូមេរៀន)',
    shortTitle: 'Videos Editor',
    idPrefix: 'VID',
    descEn: 'Upload, edit, preview, and lock/unlock Academy video lessons & manage video production queue',
    descKm: 'កាត់ត បង្ហោះ កែសម្រួលមេរៀន Video Academy និងកំណត់សិទ្ធិមើលសម្រាប់សមាជិក/VIP',
    defaultPermissions: ['overview', 'video_studio']
  },
  hr: {
    labelEn: 'HR',
    labelKm: 'HR (ផ្នែកធនធានមនុស្ស & បុគ្គលិក)',
    shortTitle: 'HR',
    idPrefix: 'HR',
    descEn: 'Manage staff roster, duty shifts, attendance status, leave approvals, and member support',
    descKm: 'គ្រប់គ្រងបញ្ជីបុគ្គលិក វេនធ្វើការ ច្បាប់ឈប់សម្រាក និងជំនួយផ្នែកសេវាសមាជិក',
    defaultPermissions: ['overview', 'hr_operations', 'members_vip']
  },
  leadership_finance: {
    labelEn: 'Leadership Finnie (Finance)',
    labelKm: 'Leadership Finnie (ថ្នាក់ដឹកនាំ & ហិរញ្ញវត្ថុ)',
    shortTitle: 'Leadership Finnie',
    idPrefix: 'FIN',
    descEn: 'Approve ABA/Bakong/USDT slips, manage P&L ledger, payroll expenses, and financial analytics',
    descKm: 'ពិនិត្យអនុម័តវិក្កយបត្រ ABA/Bakong/USDT គ្រប់គ្រងចំណូល-ចំណាយ ប្រាក់ខែ និងរបាយការណ៍ហិរញ្ញវត្ថុ',
    defaultPermissions: ['overview', 'leadership_finance', 'members_vip']
  }
};

export const INITIAL_STAFF_ACCOUNTS: StaffAccount[] = [
  {
    id: 'stf_001',
    staffCode: 'ADM-001',
    password: 'Admin@2026',
    fullName: 'Master Sovann',
    fullNameKm: 'ម៉ាស្ទ័រ សុវណ្ណ',
    position: 'administrator',
    email: 'sovann.admin@gmail.com',
    phone: '012 999 888',
    status: 'active',
    dutyStatus: 'on_duty',
    shift: '08:00 - 20:00 (Executive)',
    monthlySalary: 2500,
    permissions: [
      'overview',
      'staff_credentials',
      'editorial_signals',
      'video_studio',
      'hr_operations',
      'leadership_finance',
      'members_vip',
      'system_security'
    ],
    createdAt: '2026-01-10',
    lastLoginAt: '2026-10-28 08:15'
  },
  {
    id: 'stf_002',
    staffCode: 'EDT-001',
    password: 'Editor@2026',
    fullName: 'Rithy Analyst',
    fullNameKm: 'រិទ្ធី (អ្នកវិភាគ & Editor)',
    position: 'editor',
    email: 'rithy.editor@gmail.com',
    phone: '096 445 221',
    status: 'active',
    dutyStatus: 'on_duty',
    shift: '13:00 - 22:00 (London/NY)',
    monthlySalary: 1200,
    permissions: ['overview', 'editorial_signals'],
    createdAt: '2026-02-14',
    lastLoginAt: '2026-10-28 13:02'
  },
  {
    id: 'stf_003',
    staffCode: 'VID-001',
    password: 'Video@2026',
    fullName: 'Borey Studio',
    fullNameKm: 'បូរី (កាត់តវីដេអូមេរៀន)',
    position: 'videos_editor',
    email: 'borey.video@gmail.com',
    phone: '010 778 334',
    status: 'active',
    dutyStatus: 'remote',
    shift: '09:00 - 18:00 (Studio)',
    monthlySalary: 950,
    permissions: ['overview', 'video_studio'],
    createdAt: '2026-03-01',
    lastLoginAt: '2026-10-27 17:40'
  },
  {
    id: 'stf_004',
    staffCode: 'HR-001',
    password: 'HR@2026',
    fullName: 'Sophea Chann',
    fullNameKm: 'សុភា ចាន់ (ធនធានមនុស្ស)',
    position: 'hr',
    email: 'sophea.hr@gmail.com',
    phone: '077 312 900',
    status: 'active',
    dutyStatus: 'on_duty',
    shift: '08:00 - 17:00 (HQ Desk)',
    monthlySalary: 1100,
    permissions: ['overview', 'hr_operations', 'members_vip'],
    createdAt: '2026-02-01',
    lastLoginAt: '2026-10-28 08:05'
  },
  {
    id: 'stf_005',
    staffCode: 'FIN-001',
    password: 'Finnie@2026',
    fullName: 'Vannak Kim (CFO)',
    fullNameKm: 'វណ្ណៈ គីម (ហិរញ្ញវត្ថុជាន់ខ្ពស់)',
    position: 'leadership_finance',
    email: 'vannak.finance@gmail.com',
    phone: '015 882 100',
    status: 'active',
    dutyStatus: 'on_duty',
    shift: '08:30 - 18:30 (Finance)',
    monthlySalary: 1850,
    permissions: ['overview', 'leadership_finance', 'members_vip'],
    createdAt: '2026-01-15',
    lastLoginAt: '2026-10-28 09:12'
  }
];

export const INITIAL_STAFF_AUDIT_LOGS: StaffAuditLog[] = [
  {
    id: 'aud_01',
    timestamp: '2026-10-28 09:12',
    staffCode: 'FIN-001',
    staffName: 'Vannak Kim (CFO)',
    position: 'leadership_finance',
    action: 'Verified ABA KHQR merchant settlement report ($2,650)',
    actionKm: 'បានពិនិត្យផ្ទៀងផ្ទាត់របាយការណ៍ទូទាត់ ABA KHQR ($2,650)',
    status: 'SUCCESS'
  },
  {
    id: 'aud_02',
    timestamp: '2026-10-28 08:45',
    staffCode: 'EDT-001',
    staffName: 'Rithy Analyst',
    position: 'editor',
    action: 'Updated XAUUSD M15 Signal status and posted London Session outlook',
    actionKm: 'បានកែប្រែស្ថានភាព Signal XAUUSD M15 និងបង្ហោះការវិភាគទីផ្សារ London',
    status: 'SUCCESS'
  },
  {
    id: 'aud_03',
    timestamp: '2026-10-28 08:15',
    staffCode: 'ADM-001',
    staffName: 'Master Sovann',
    position: 'administrator',
    action: 'Rotated Password & Staff ID permissions for Videos Editor (VID-001)',
    actionKm: 'បានកំណត់ Password និងសិទ្ធិប្រើប្រាស់សម្រាប់ Videos Editor (VID-001)',
    status: 'SECURITY'
  },
  {
    id: 'aud_04',
    timestamp: '2026-10-28 08:05',
    staffCode: 'HR-001',
    staffName: 'Sophea Chann',
    position: 'hr',
    action: 'Checked daily staff attendance roster across 5 departments',
    actionKm: 'បានត្រួតពិនិត្យវត្តមានបុគ្គលិកប្រចាំថ្ងៃទាំង ៥ ផ្នែក',
    status: 'SUCCESS'
  }
];

export const INITIAL_FINANCE_LEDGER: FinanceLedgerEntry[] = [
  {
    id: 'fin_101',
    date: '2026-10-28',
    title: 'VIP Pro 3-Month Subscriptions Batch (ABA KHQR)',
    titleKm: 'ចំណូលកញ្ចប់សមាជិក VIP Pro ៣ខែ (តាម ABA KHQR)',
    category: 'subscription_revenue',
    type: 'INCOME',
    amount: 2650,
    paymentMethod: 'ABA KHQR',
    recordedBy: 'FIN-001',
    status: 'COMPLETED'
  },
  {
    id: 'fin_102',
    date: '2026-10-27',
    title: 'Standard & Lifetime Subscriptions (Bakong & USDT)',
    titleKm: 'ចំណូលកញ្ចប់សមាជិក Standard & Lifetime (Bakong & USDT)',
    category: 'subscription_revenue',
    type: 'INCOME',
    amount: 1190,
    paymentMethod: 'Bakong / USDT',
    recordedBy: 'FIN-001',
    status: 'COMPLETED'
  },
  {
    id: 'fin_103',
    date: '2026-10-25',
    title: 'TradingView Premium Plan & Cloud VPS MT5 Bridge',
    titleKm: 'ចំណាយម៉ាស៊ីនមេ Cloud VPS MT5 និង TradingView Pro',
    category: 'infrastructure',
    type: 'EXPENSE',
    amount: 240,
    paymentMethod: 'Corporate Card',
    recordedBy: 'FIN-001',
    status: 'COMPLETED'
  },
  {
    id: 'fin_104',
    date: '2026-10-20',
    title: 'Social Media & Telegram Community Promotion',
    titleKm: 'ចំណាយផ្សព្វផ្សាយទីផ្សារ និងសហគមន៍ Telegram',
    category: 'marketing',
    type: 'EXPENSE',
    amount: 310,
    paymentMethod: 'ABA Business',
    recordedBy: 'FIN-001',
    status: 'COMPLETED'
  }
];

export const INITIAL_HR_REQUESTS: HRRequestItem[] = [
  {
    id: 'hrr_01',
    staffId: 'stf_003',
    staffCode: 'VID-001',
    staffName: 'Borey Studio',
    position: 'videos_editor',
    requestType: 'equipment',
    reason: '4K Capture Card & Studio Condenser Mic upgrade for SMC Academy series',
    dateRange: '2026-10-29',
    status: 'PENDING',
    submittedAt: '2026-10-27'
  },
  {
    id: 'hrr_02',
    staffId: 'stf_002',
    staffCode: 'EDT-001',
    staffName: 'Rithy Analyst',
    position: 'editor',
    requestType: 'shift_change',
    reason: 'Extend NY FOMC Press Conference coverage shift until 02:00 AM',
    dateRange: '2026-10-30 - 2026-10-31',
    status: 'PENDING',
    submittedAt: '2026-10-28'
  },
  {
    id: 'hrr_03',
    staffId: 'stf_004',
    staffCode: 'HR-001',
    staffName: 'Sophea Chann',
    position: 'hr',
    requestType: 'onboarding',
    reason: 'Junior Assistant Editor onboarding orientation & NDA signing',
    dateRange: '2026-10-25',
    status: 'APPROVED',
    submittedAt: '2026-10-24'
  }
];

export const INITIAL_VIDEO_TASKS: VideoProductionTask[] = [
  {
    id: 'vtask_01',
    title: 'XAUUSD Liquidity Sweep Live Breakdown (Episode 7)',
    titleKm: 'ការវិភាគផ្ទាល់ XAUUSD Liquidity Sweep (ភាគទី ៧)',
    assignedTo: 'VID-001 · Borey Studio',
    category: 'smc',
    stage: 'editing',
    dueDate: '2026-10-30'
  },
  {
    id: 'vtask_02',
    title: 'How to Read US Core CPI & NFP Volatility on M15',
    titleKm: 'របៀបជួញដូរពេលចេញព័ត៌មានធំៗ CPI និង NFP លើ M15',
    assignedTo: 'VID-001 · Borey Studio',
    category: 'technical',
    stage: 'recording',
    dueDate: '2026-11-02'
  },
  {
    id: 'vtask_03',
    title: 'Setting Up Risk Percent Lot Sizing in MT5 Expert Advisor',
    titleKm: 'ការកំណត់ភាគរយហានិភ័យស្វ័យប្រវត្តិក្នុង MT5 EA',
    assignedTo: 'VID-001 · Borey Studio',
    category: 'mt5_bot',
    stage: 'script',
    dueDate: '2026-11-05'
  }
];

export const INITIAL_CUSTOMER_REGISTRATIONS: CustomerRegistrationRecord[] = [
  {
    id: 'REG-2026-103',
    userId: 'usr_007',
    fullName: 'Sreyneang Keo',
    email: 'sreyneang.fx@gmail.com',
    gmailVerified: true,
    verifiedAt: new Date(Date.now() - 1000 * 60 * 24).toISOString(),
    phone: '096 512 884',
    telegram: '@sreyneang_keo',
    interestedPlanId: 'plan_starter',
    interestedPlanName: 'កញ្ចប់សាកល្បងប្រចាំខែ ($35)',
    interestedPlanPrice: 35,
    customerNote: 'ចង់សាកល្បងជួញដូរមាស XAUUSD និងចូលមើលមេរៀនមូលដ្ឋានគ្រឹះ',
    submittedAt: new Date(Date.now() - 1000 * 60 * 24).toISOString(),
    workflowStage: 'NEW_FOR_ADMIN'
  },
  {
    id: 'REG-2026-102',
    userId: 'usr_003',
    fullName: 'Dara Samnang',
    email: 'dara.fx@gmail.com',
    gmailVerified: true,
    verifiedAt: new Date(Date.now() - 1000 * 60 * 145).toISOString(),
    phone: '010 334 556',
    telegram: '@darasamnang',
    interestedPlanId: 'plan_vip_pro',
    interestedPlanName: 'កញ្ចប់ VIP Pro ៣ខែ ($89)',
    interestedPlanPrice: 89,
    customerNote: 'មានគណនី Exness MT5 រួចហើយ ចង់ភ្ជាប់ Bot Auto-Trading',
    submittedAt: new Date(Date.now() - 1000 * 60 * 145).toISOString(),
    workflowStage: 'ASSIGNED_TO_STAFF',
    assignedByAdminCode: 'ADM-001',
    assignedByAdminName: 'Master Sovann',
    assignedToStaffId: 'stf_005',
    assignedToStaffCode: 'FIN-001',
    assignedToStaffName: 'Vannak Kim (CFO)',
    assignedToPosition: 'leadership_finance',
    assignedAt: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    adminInstruction: 'សូមឆែកលេខទូរស័ព្ទ Telegram និងផ្ទៀងផ្ទាត់វិក្កយបត្រកញ្ចប់ VIP Pro $89 ជូនគាត់។'
  },
  {
    id: 'REG-2026-101',
    userId: 'usr_001',
    fullName: 'Sokha Chan',
    email: 'sokha.trader@gmail.com',
    gmailVerified: true,
    verifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    phone: '012 889 900',
    telegram: '@sokha_fx',
    interestedPlanId: 'plan_vip_pro',
    interestedPlanName: 'កញ្ចប់ VIP Pro ៣ខែ ($89)',
    interestedPlanPrice: 89,
    customerNote: 'ស្នើសុំបើកសិទ្ធិ MT5 Auto-Trade និងចូលបន្ទប់ VIP 1',
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    workflowStage: 'VERIFIED_COMPLETED',
    assignedByAdminCode: 'ADM-001',
    assignedByAdminName: 'Master Sovann',
    assignedToStaffId: 'stf_004',
    assignedToStaffCode: 'HR-001',
    assignedToStaffName: 'Sophea Chann',
    assignedToPosition: 'hr',
    assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 27).toISOString(),
    adminInstruction: 'សូមឆែកគណនី Gmail និងទំនាក់ទំនងស្វាគមន៍ចូលបន្ទប់ VIP',
    staffCheckNote: 'បានទាក់ទងតាម Telegram @sokha_fx និងឆែក Gmail ត្រឹមត្រូវ ១០០%។',
    checkedByStaffCode: 'HR-001',
    checkedByStaffName: 'Sophea Chann',
    checkedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString()
  }
];


