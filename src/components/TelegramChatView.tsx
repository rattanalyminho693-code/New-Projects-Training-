import React, { useState, useRef, useEffect } from 'react';
import { 
  ChatMessage, 
  ChatChannelId, 
  Role, 
  Language, 
  UserAccount 
} from '../types';
import { 
  Send, 
  Search, 
  Pin, 
  Paperclip, 
  Smile, 
  ShieldCheck, 
  Lock, 
  CheckCheck, 
  Reply, 
  Trash2, 
  X, 
  TrendingUp, 
  Sparkles, 
  Zap, 
  Users, 
  AlertCircle,
  BarChart2,
  ChevronLeft,
  Crown
} from 'lucide-react';

interface TelegramChatViewProps {
  lang: Language;
  currentRole: Role;
  currentUser?: UserAccount;
  messages: ChatMessage[];
  onSendMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  onDeleteMessage?: (id: string) => void;
  onTogglePin?: (id: string) => void;
  onAddReaction?: (messageId: string, emoji: string) => void;
  onUpgradeToVip: () => void;
  onSimulateVipRole: () => void;
}

const COMMON_EMOJIS = ['🔥', '🚀', '💰', '👍', '👏', '❤️', '🎯'];

export const TelegramChatView: React.FC<TelegramChatViewProps> = ({
  lang,
  currentRole,
  currentUser,
  messages,
  onSendMessage,
  onDeleteMessage,
  onTogglePin,
  onAddReaction,
  onUpgradeToVip,
  onSimulateVipRole
}) => {
  const isKm = lang === 'km';
  const [activeChannel, setActiveChannel] = useState<ChatChannelId>('community');
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isVipOrAdmin = currentRole === 'vip' || currentRole === 'admin';
  const isAdmin = currentRole === 'admin';
  const isVipChannelLocked = activeChannel === 'vip' && !isVipOrAdmin;

  // Filter messages for the current channel
  const channelMessages = messages.filter(m => m.channelId === activeChannel);
  
  // Find pinned message in current channel
  const pinnedMessage = channelMessages.find(m => m.isPinned);

  // Search filter
  const displayedMessages = searchQuery.trim() 
    ? channelMessages.filter(m => 
        m.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.textKm && m.textKm.toLowerCase().includes(searchQuery.toLowerCase())) ||
        m.senderName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : channelMessages;

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (!isVipChannelLocked) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [channelMessages.length, activeChannel, isVipChannelLocked]);

  const handleSend = (attachment?: ChatMessage['attachment']) => {
    if (!inputText.trim() && !attachment) return;
    if (isVipChannelLocked) return;

    const senderName = currentUser?.name || (
      isAdmin ? 'Admin Sovann' : currentRole === 'vip' ? 'VIP Trader' : 'Community Member'
    );
    const senderRole = currentRole;
    const senderAvatar = isAdmin 
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
      : currentRole === 'vip'
      ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80'
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80';

    onSendMessage({
      channelId: activeChannel,
      senderId: currentUser?.id || `user_${Date.now()}`,
      senderName,
      senderRole,
      senderAvatar,
      text: inputText.trim(),
      textKm: isKm ? inputText.trim() : undefined,
      replyTo: replyingTo ? {
        id: replyingTo.id,
        senderName: replyingTo.senderName,
        text: replyingTo.text
      } : undefined,
      attachment,
      reactions: {}
    });

    setInputText('');
    setReplyingTo(null);
    setShowAttachmentMenu(false);
    setShowEmojiPicker(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleSendQuickSignalCard = () => {
    handleSend({
      type: 'signal_card',
      title: 'XAUUSD Instant Scalp Setup',
      details: 'Direction: BUY LIMIT @ 2720.00 | SL: 2714.00 | TP: 2728.00 (Risk:Reward 1:3)'
    });
  };

  const handleSendChartCard = () => {
    handleSend({
      type: 'chart',
      title: 'Gold 15m Liquidity Sweep Analysis',
      imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
      details: 'Price reacted directly off the Asian Session low. Look for Bullish continuation.'
    });
  };

  // Helper for role badges
  const renderRoleBadge = (role: Role | 'analyst') => {
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
          <Crown className="w-2.5 h-2.5" />
          ADMIN
        </span>
      );
    }
    if (role === 'vip') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          <Sparkles className="w-2.5 h-2.5" />
          VIP
        </span>
      );
    }
    if (role === 'analyst') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
          <TrendingUp className="w-2.5 h-2.5" />
          ANALYST
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-700/60 text-slate-300 border border-slate-600/40">
        MEMBER
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4">
      {/* Telegram Main Shell Container */}
      <div className="bg-[#17212b] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[780px]">
        
        {/* ================= LEFT SIDEBAR (CHANNELS LIST) ================= */}
        <div className={`w-full md:w-80 lg:w-96 bg-[#17212b] border-r border-[#0e1621] flex flex-col shrink-0 ${
          mobileShowChat ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Header */}
          <div className="p-4 border-b border-[#0e1621]/80 flex items-center justify-between bg-[#17212b]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#2481cc] flex items-center justify-center text-white shadow-md shadow-[#2481cc]/30">
                <Send className="w-5 h-5 -rotate-45 ml-0.5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Alpha Telegram
                </h2>
                <p className="text-[11px] text-[#708499]">
                  {isKm ? 'បន្ទប់ឆាតជួញដូរ ២ ប្រព័ន្ធ' : '2 Trading Channels'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#2481cc]/20 text-[#2481cc] border border-[#2481cc]/30">
                {currentRole.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Search box */}
          <div className="p-3 border-b border-[#0e1621]/60">
            <div className="relative">
              <Search className="w-4 h-4 text-[#708499] absolute left-3 top-2.5" />
              <input 
                type="text"
                placeholder={isKm ? 'ស្វែងរកសារ...' : 'Search messages...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#242f3d] text-xs text-white placeholder-[#708499] rounded-xl pl-9 pr-4 py-2 border border-transparent focus:border-[#2481cc] outline-none transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-[#708499] hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Channel items list */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#0e1621]/40">
            
            {/* CHANNEL 1: COMMUNITY / MEMBER ធម្មតា */}
            <button
              onClick={() => {
                setActiveChannel('community');
                setMobileShowChat(true);
              }}
              className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                activeChannel === 'community' 
                  ? 'bg-[#2b5278]/40 border-l-4 border-[#2481cc]' 
                  : 'hover:bg-[#202b36]'
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white font-bold shadow-md">
                  <Users className="w-6 h-6" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#17212b]"></span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold text-white truncate">
                    {isKm ? 'Alpha Community (ធម្មតា)' : 'Alpha Trader Community'}
                  </span>
                  <span className="text-[10px] text-[#708499]">09:34 AM</span>
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-500/20 text-blue-300">
                    {isKm ? 'សមាជិកទូទៅ' : 'Standard Member'}
                  </span>
                  <span className="text-[10px] text-[#708499]">• 1,420 {isKm ? 'នាក់' : 'members'}</span>
                </div>
                <p className="text-xs text-[#708499] truncate">
                  <span className="text-slate-300 font-medium">Sokha: </span>
                  {isKm 
                    ? 'បាទបង Pich! ត្រូវតែជា VIP Member ទើបបើក MT5 Bot...' 
                    : 'You need VIP plan + Admin authorization for MT5...'}
                </p>
              </div>

              {/* Unread badge */}
              <div className="shrink-0 flex flex-col items-end gap-1">
                <span className="w-5 h-5 rounded-full bg-[#2481cc] text-white text-[10px] font-bold flex items-center justify-center">
                  3
                </span>
              </div>
            </button>

            {/* CHANNEL 2: VIP SIGNAL & ALPHA ROOM (VIP ១) */}
            <button
              onClick={() => {
                setActiveChannel('vip');
                setMobileShowChat(true);
              }}
              className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors cursor-pointer relative ${
                activeChannel === 'vip' 
                  ? 'bg-[#2b5278]/40 border-l-4 border-amber-400' 
                  : 'hover:bg-[#202b36]'
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-amber-600 to-yellow-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
                  <Sparkles className="w-6 h-6 stroke-[2.5]" />
                </div>
                {isVipOrAdmin ? (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#17212b]"></span>
                ) : (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500/90 text-white flex items-center justify-center border-2 border-[#17212b]">
                    <Lock className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-xs font-bold text-amber-300 truncate">
                      {isKm ? 'Alpha VIP Signals (VIP ១)' : 'Alpha VIP Signals & MT5'}
                    </span>
                    {!isVipOrAdmin && <Lock className="w-3 h-3 text-amber-400 shrink-0" />}
                  </div>
                  <span className="text-[10px] text-amber-400/80 font-mono">09:12 AM</span>
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    ⭐ VIP ONLY
                  </span>
                  <span className="text-[10px] text-[#708499]">• 185 VIPs</span>
                </div>
                <p className="text-xs text-slate-400 truncate">
                  {isVipOrAdmin ? (
                    <>
                      <span className="text-amber-300 font-medium">Bona: </span>
                      {isKm ? '+$385 បានចូលកុងហើយនៅ TP1...' : '+$385 secured on TP1! Risk is zero...'}
                    </>
                  ) : (
                    <span className="text-amber-400/70 italic flex items-center gap-1 text-[11px]">
                      <Lock className="w-3 h-3" />
                      {isKm ? 'ឆានែលសម្ងាត់ VIP - ចុចដើម្បីចូល' : 'Private VIP Channel - Click to unlock'}
                    </span>
                  )}
                </p>
              </div>

              {/* VIP Badge */}
              <div className="shrink-0 flex flex-col items-end gap-1">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400 text-slate-950">
                  VIP 1
                </span>
              </div>
            </button>

          </div>

          {/* Quick Role Notice in Sidebar */}
          <div className="p-3 bg-[#242f3d]/60 border-t border-[#0e1621] text-[11px] text-[#708499] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                isAdmin ? 'bg-purple-400' : currentRole === 'vip' ? 'bg-amber-400' : 'bg-blue-400'
              }`}></span>
              <span className="text-slate-300">
                {isKm ? 'តួនាទីអ្នក:' : 'Current Role:'} <strong className="text-white uppercase">{currentRole}</strong>
              </span>
            </div>
            {!isVipOrAdmin && (
              <button
                onClick={onUpgradeToVip}
                className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer text-[10px]"
              >
                {isKm ? 'Upgrade VIP' : 'Upgrade VIP'}
              </button>
            )}
          </div>
        </div>

        {/* ================= RIGHT CHAT AREA ================= */}
        <div className={`flex-1 flex-col bg-[#0e1621] relative ${
          mobileShowChat ? 'flex' : 'hidden md:flex'
        }`}>
          
          {/* Top Chat Header */}
          <div className="h-16 px-4 bg-[#17212b] border-b border-[#0e1621] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {/* Back button for mobile */}
              <button 
                onClick={() => setMobileShowChat(false)}
                className="md:hidden text-[#708499] hover:text-white p-1"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="relative shrink-0">
                {activeChannel === 'vip' ? (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
                    <Sparkles className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                    <Users className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white truncate">
                    {activeChannel === 'vip' 
                      ? (isKm ? '⭐ Alpha VIP Signals & Bot (VIP ១)' : '⭐ Alpha VIP Signals & MT5 (VIP 1)')
                      : (isKm ? '💬 Alpha Trader Community (Member ធម្មតា)' : '💬 Alpha Trader Community (Standard)')}
                  </h3>
                  {activeChannel === 'vip' && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                      VIP ONLY
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#708499] truncate">
                  {activeChannel === 'vip'
                    ? (isKm ? '185 សមាជិក VIP • 42 នាក់កំពុង Online' : '185 VIP Members • 42 online • MT5 Bridge Active')
                    : (isKm ? '1,420 សមាជិក • 84 នាក់កំពុង Online' : '1,420 members • 84 online • General trading forum')}
                </p>
              </div>
            </div>

            {/* Header actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`p-2 rounded-lg text-[#708499] hover:text-white hover:bg-[#202b36] transition-colors ${
                  isSearchOpen ? 'text-white bg-[#202b36]' : ''
                }`}
                title="Search Chat"
              >
                <Search className="w-4 h-4" />
              </button>
              
              {activeChannel === 'vip' && !isVipOrAdmin && (
                <button
                  onClick={onUpgradeToVip}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isKm ? 'Upgrade VIP' : 'Upgrade VIP'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Search bar drop-down */}
          {isSearchOpen && (
            <div className="px-4 py-2 bg-[#17212b]/95 border-b border-[#0e1621] flex items-center gap-2">
              <Search className="w-4 h-4 text-[#708499]" />
              <input
                type="text"
                placeholder={isKm ? 'ស្វែងរកក្នុងបន្ទប់នេះ...' : 'Search in this channel...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="flex-1 bg-transparent text-xs text-white placeholder-[#708499] outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-[#708499] hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Pinned Message Banner */}
          {pinnedMessage && !isVipChannelLocked && (
            <div className="px-4 py-2 bg-[#17212b]/80 border-b border-[#0e1621] flex items-center justify-between text-xs backdrop-blur-sm">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-1 h-7 bg-[#2481cc] rounded-full shrink-0"></div>
                <Pin className="w-3.5 h-3.5 text-[#2481cc] shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-[#2481cc]">
                    {isKm ? 'សារសំខាន់ដែលបាន Pin' : 'Pinned Message'}
                  </p>
                  <p className="text-slate-300 text-xs truncate">
                    {isKm && pinnedMessage.textKm ? pinnedMessage.textKm : pinnedMessage.text}
                  </p>
                </div>
              </div>

              {isAdmin && (
                <button
                  onClick={() => onTogglePin && onTogglePin(pinnedMessage.id)}
                  className="text-[10px] text-[#708499] hover:text-white shrink-0 ml-2"
                >
                  {isKm ? 'ដោះ Pin' : 'Unpin'}
                </button>
              )}
            </div>
          )}

          {/* ================= CHAT CONTENT (GATED OR MESSAGES) ================= */}
          {isVipChannelLocked ? (
            /* TELEGRAM PRIVATE VIP CHANNEL LOCK SCREEN */
            <div className="flex-1 flex items-center justify-center p-6 bg-radial from-[#17212b] to-[#0e1621]">
              <div className="max-w-md w-full bg-[#17212b] border border-amber-500/30 rounded-2xl p-6 md:p-8 text-center space-y-5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>

                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-inner">
                  <Lock className="w-8 h-8" />
                </div>

                <div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold mb-2 border border-amber-500/30">
                    ⭐ TELEGRAM VIP CHANNEL (VIP ១)
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {isKm ? 'ឆានែល VIP នេះត្រូវបានបិទការពារ' : 'This VIP Channel is Strictly Private'}
                  </h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {isKm 
                      ? 'បន្ទប់ VIP ១ នេះសម្រាប់តែសមាជិក VIP និង Admin ប៉ុណ្ណោះ។ មានការផ្ញើ Signal ផ្ទាល់ពី TradingView Webhook, ការភ្ជាប់ MT5 Auto-Trading Bot និងការប្រឹក្សាផ្ទាល់ពី Master Sovann។' 
                      : 'This channel is restricted to verified VIP members and Administrators. Features automated PineScript signals, instant MT5 copy-trading, and exclusive scalp targets.'}
                  </p>
                </div>

                {/* VIP Features Highlights */}
                <div className="bg-[#0e1621] rounded-xl p-3.5 text-left space-y-2 border border-slate-800 text-xs">
                  <div className="flex items-center gap-2 text-slate-200">
                    <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{isKm ? 'Signal ជួញដូរមាស Gold & Forex ស្វ័យប្រវត្តិ ២៤/៥' : 'Live 24/5 Automated Gold & Forex Signals'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <BarChart2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>{isKm ? 'ភ្ជាប់ MT5 Auto-Trade កេះ Order ដោយស្វ័យប្រវត្តិ' : 'Zero-latency MT5 Auto-Trading bridge'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{isKm ? 'ការកំណត់ Stop Loss & Take Profit Breakeven ស្វ័យប្រវត្តិ' : 'Auto Breakeven & Trailing Stop protection'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={onUpgradeToVip}
                    className="w-full py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isKm ? 'បង់ប្រាក់ Upgrade VIP ឥឡូវនេះ (ABA KHQR)' : 'Upgrade to VIP Plan (ABA KHQR)'}</span>
                  </button>

                  <button
                    onClick={onSimulateVipRole}
                    className="w-full py-2.5 bg-[#242f3d] hover:bg-[#2c394a] text-slate-300 hover:text-white font-medium text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    {isKm ? 'សាកល្បងដោយប្តូរ Role ទៅជា VIP' : 'Switch Role to VIP (Instant Demo)'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* TELEGRAM MESSAGE FEED */
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0e1621] background-doodle">
              
              {/* Channel Welcome Pill */}
              <div className="flex justify-center my-2">
                <span className="px-3 py-1 rounded-full bg-[#182533]/80 border border-slate-800 text-[11px] text-[#708499] shadow-sm">
                  {activeChannel === 'vip' 
                    ? (isKm ? '🔒 ក្រុម VIP ត្រូវបានការពារដោយការសរសេរកូដសម្ងាត់' : '🔒 VIP Channel • End-to-end Verified Signals')
                    : (isKm ? '💬 សហគមន៍ជួញដូរ Alpha Community' : '💬 Alpha Trader Public Community')}
                </span>
              </div>

              {/* Messages list */}
              {displayedMessages.map((msg) => {
                const isMine = msg.senderId === currentUser?.id || 
                  (isAdmin && msg.senderRole === 'admin') ||
                  (currentRole === 'vip' && msg.senderRole === 'vip' && msg.senderName.includes(currentUser?.name || ''));
                
                return (
                  <div 
                    key={msg.id}
                    className={`flex items-start gap-2.5 group ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    {!isMine && (
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                        {msg.senderAvatar ? (
                          <img src={msg.senderAvatar} alt={msg.senderName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                            {msg.senderName.charAt(0)}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bubble */}
                    <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-3.5 py-2.5 text-xs shadow-md transition-all relative ${
                      isMine 
                        ? 'bg-[#2b5278] text-white rounded-tr-none' 
                        : 'bg-[#182533] text-slate-100 rounded-tl-none border border-[#242f3d]/50'
                    }`}>
                      
                      {/* Sender Info & Role Badge */}
                      {!isMine && (
                        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                          <span className={`font-semibold text-xs ${
                            msg.senderRole === 'admin' ? 'text-purple-300' :
                            msg.senderRole === 'vip' ? 'text-amber-300' :
                            msg.senderRole === 'analyst' ? 'text-sky-300' : 'text-emerald-300'
                          }`}>
                            {msg.senderName}
                          </span>
                          {renderRoleBadge(msg.senderRole)}
                        </div>
                      )}

                      {/* Quoted Reply if any */}
                      {msg.replyTo && (
                        <div className="mb-2 p-2 rounded-lg bg-black/20 border-l-2 border-[#2481cc] text-[11px] text-slate-300">
                          <p className="font-semibold text-[#2481cc]">{msg.replyTo.senderName}</p>
                          <p className="truncate text-slate-400">{msg.replyTo.text}</p>
                        </div>
                      )}

                      {/* Text content */}
                      <p className="leading-relaxed whitespace-pre-wrap select-text">
                        {isKm && msg.textKm ? msg.textKm : msg.text}
                      </p>

                      {/* Attachment Card if present */}
                      {msg.attachment && (
                        <div className="mt-2.5 rounded-xl overflow-hidden bg-[#0e1621]/80 border border-slate-700/60 p-2.5">
                          {msg.attachment.imageUrl && (
                            <img 
                              src={msg.attachment.imageUrl} 
                              alt={msg.attachment.title}
                              className="w-full h-36 object-cover rounded-lg mb-2"
                            />
                          )}
                          <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs mb-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{msg.attachment.title}</span>
                          </div>
                          {msg.attachment.details && (
                            <p className="text-[11px] text-slate-300 font-mono bg-black/30 p-1.5 rounded">
                              {msg.attachment.details}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Reactions bar */}
                      {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {Object.entries(msg.reactions).map(([emoji, count]) => (
                            <button
                              key={emoji}
                              onClick={() => onAddReaction && onAddReaction(msg.id, emoji)}
                              className="px-1.5 py-0.5 rounded-full bg-black/30 hover:bg-black/50 text-[10px] flex items-center gap-1 transition-colors border border-white/10"
                            >
                              <span>{emoji}</span>
                              <span className="font-semibold text-slate-300">{count}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Meta Footer (Time & Checkmarks) */}
                      <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400">
                        {msg.isPinned && (
                          <Pin className="w-2.5 h-2.5 text-[#2481cc]" />
                        )}
                        <span>{msg.timestamp}</span>
                        {isMine && (
                          <CheckCheck className="w-3.5 h-3.5 text-[#5288c1]" />
                        )}
                      </div>

                      {/* Floating Action Menu (Reply, Pin, Delete, React) */}
                      <div className={`absolute top-1 ${
                        isMine ? '-left-20' : '-right-20'
                      } hidden group-hover:flex items-center gap-1 bg-[#17212b] border border-slate-700 rounded-lg px-1.5 py-1 shadow-lg z-10`}>
                        <button
                          onClick={() => setReplyingTo(msg)}
                          className="p-1 hover:text-white text-[#708499] rounded"
                          title="Reply"
                        >
                          <Reply className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onAddReaction && onAddReaction(msg.id, '🔥')}
                          className="p-1 hover:text-white text-[#708499] rounded"
                          title="React 🔥"
                        >
                          <span className="text-xs">🔥</span>
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => onTogglePin && onTogglePin(msg.id)}
                              className="p-1 hover:text-white text-[#708499] rounded"
                              title={msg.isPinned ? 'Unpin' : 'Pin'}
                            >
                              <Pin className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onDeleteMessage && onDeleteMessage(msg.id)}
                              className="p-1 hover:text-red-400 text-[#708499] rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* ================= INPUT SECTION ================= */}
          {!isVipChannelLocked && (
            <div className="p-3 bg-[#17212b] border-t border-[#0e1621] relative shrink-0">
              
              {/* Replying banner */}
              {replyingTo && (
                <div className="mb-2 p-2 rounded-lg bg-[#242f3d] flex items-center justify-between text-xs text-slate-300 border-l-2 border-[#2481cc]">
                  <div className="flex items-center gap-2 truncate">
                    <Reply className="w-3.5 h-3.5 text-[#2481cc] shrink-0" />
                    <div className="truncate">
                      <span className="font-semibold text-white">{replyingTo.senderName}: </span>
                      <span className="text-slate-400">{replyingTo.text}</span>
                    </div>
                  </div>
                  <button onClick={() => setReplyingTo(null)} className="text-[#708499] hover:text-white p-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Quick suggestion pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-[11px]">
                <button
                  onClick={() => setInputText(isKm ? '🎯 XAUUSD TP1 បានបុកដល់គោលដៅហើយ!' : '🎯 XAUUSD TP1 Hit!')}
                  className="px-2 py-1 rounded-full bg-[#242f3d] hover:bg-[#2e3b4d] text-slate-300 hover:text-white transition-colors shrink-0"
                >
                  🎯 TP Hit
                </button>
                <button
                  onClick={() => setInputText(isKm ? '📊 មាន Bullish Order Block លើ 15m' : '📊 Bullish Order Block on M15')}
                  className="px-2 py-1 rounded-full bg-[#242f3d] hover:bg-[#2e3b4d] text-slate-300 hover:text-white transition-colors shrink-0"
                >
                  📊 Order Block
                </button>
                <button
                  onClick={() => setInputText(isKm ? '🚀 សួស្តីបងប្អូនទាំងអស់គ្នា!' : '🚀 Good morning traders!')}
                  className="px-2 py-1 rounded-full bg-[#242f3d] hover:bg-[#2e3b4d] text-slate-300 hover:text-white transition-colors shrink-0"
                >
                  🚀 Greetings
                </button>
                {activeChannel === 'vip' && (
                  <button
                    onClick={() => setInputText(isKm ? '⚡ MT5 Bot បានកេះ Order ដោយជោគជ័យ' : '⚡ MT5 Bot executed order seamlessly')}
                    className="px-2 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-colors shrink-0 border border-amber-500/30"
                  >
                    ⚡ MT5 Status
                  </button>
                )}
              </div>

              {/* Input bar */}
              <div className="flex items-center gap-2 relative">
                
                {/* Attachment Menu Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                    className="p-2 text-[#708499] hover:text-white hover:bg-[#242f3d] rounded-xl transition-colors cursor-pointer"
                    title="Attach Signal / Chart"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  {/* Attachment popup */}
                  {showAttachmentMenu && (
                    <div className="absolute bottom-12 left-0 w-56 bg-[#242f3d] border border-slate-700 rounded-xl shadow-2xl p-2 z-20 space-y-1">
                      <button
                        onClick={handleSendQuickSignalCard}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#17212b] text-xs text-white flex items-center gap-2 cursor-pointer"
                      >
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span>{isKm ? 'ផ្ញើ Signal Card' : 'Attach Signal Card'}</span>
                      </button>
                      <button
                        onClick={handleSendChartCard}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#17212b] text-xs text-white flex items-center gap-2 cursor-pointer"
                      >
                        <BarChart2 className="w-4 h-4 text-sky-400" />
                        <span>{isKm ? 'ផ្ញើ Chart Screenshot' : 'Attach Chart Screenshot'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Input element */}
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={
                    isKm 
                      ? (activeChannel === 'vip' ? 'សរសេរសារក្នុង VIP Channel...' : 'សរសេរសារក្នុង Community...')
                      : (activeChannel === 'vip' ? 'Message Alpha VIP Channel...' : 'Message Alpha Community...')
                  }
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1 bg-[#242f3d] text-xs text-white placeholder-[#708499] rounded-xl px-4 py-2.5 outline-none border border-transparent focus:border-[#2481cc] transition-all"
                />

                {/* Emoji Picker Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 text-[#708499] hover:text-white hover:bg-[#242f3d] rounded-xl transition-colors cursor-pointer"
                    title="Emojis"
                  >
                    <Smile className="w-4 h-4" />
                  </button>

                  {showEmojiPicker && (
                    <div className="absolute bottom-12 right-0 bg-[#242f3d] border border-slate-700 rounded-xl shadow-2xl p-2 z-20 flex gap-1">
                      {COMMON_EMOJIS.map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => insertEmoji(emoji)}
                          className="p-1.5 hover:bg-[#17212b] rounded text-base cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Send Button */}
                <button
                  onClick={() => handleSend()}
                  disabled={!inputText.trim()}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    inputText.trim()
                      ? 'bg-[#2481cc] hover:bg-[#1d6fae] text-white shadow-md shadow-[#2481cc]/30'
                      : 'bg-[#242f3d] text-[#708499] cursor-not-allowed'
                  }`}
                  title="Send (Enter)"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
