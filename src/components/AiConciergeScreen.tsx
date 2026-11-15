import React, { useState } from 'react';
import { createAiWatcher, sendConciergeMessage } from '../config/api';
import type {
  AutoBookWatcher,
  BookedRideDetail,
  ChatMessage,
  RideHop,
} from '../data/mockData';
import {
  DriverBunnySvg,
  IconChatBubble,
  IconCheck,
  IconClock,
  IconCrown,
  IconFacebook,
  IconInstagram,
  IconLock,
  IconPin,
  IconShieldCheck,
  IconSparkle,
} from './Icons';

export type SlotStep = 'idle' | 'ask_seats' | 'ask_pickup' | 'ask_walk';

export interface DraftSlots {
  origin: string;
  destination: string;
  time: string;
  seats: number;
  maxWalkMeters: number;
}

interface FriendChatItem {
  id: string;
  sender: 'driver' | 'cohopper' | 'user';
  senderName: string;
  text: string;
  time: string;
}

interface AiConciergeProps {
  currentUserId?: number;
  isPremium: boolean;
  isTablet?: boolean;
  onOpenPremiumModal: () => void;
  messages: ChatMessage[];
  onChangeMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  slotStep: SlotStep;
  onChangeSlotStep: React.Dispatch<React.SetStateAction<SlotStep>>;
  draftSlots: DraftSlots;
  onChangeDraftSlots: React.Dispatch<React.SetStateAction<DraftSlots>>;
  watchers: AutoBookWatcher[];
  onAddWatcher: (watcher: AutoBookWatcher) => void;
  onRemoveWatcher: (watcherId: string) => void;
  onTriggerWatcherMatch: (watcherId: string) => void;
  activeSubTab: 'ai' | 'friend';
  onChangeSubTab: (tab: 'ai' | 'friend') => void;
  rides?: RideHop[];
  activeBooking?: BookedRideDetail | null;
  selectedFriendRideId?: string | null;
  onSelectFriendRideId?: (rideId: string | null) => void;
}

const DEFAULT_FRIEND_THREADS: Record<string, FriendChatItem[]> = {
  'hop-z': [
    {
      id: 'fz-1',
      sender: 'driver',
      senderName: 'นาย Z (คนขับ)',
      text: 'สวัสดีครับ! เดี๋ยวแวะรับหน้าตึก SIIT รังสิตครับ รถ Honda Civic สีเทาดำ ทะเบียน 1กข 9421 เปิดเพลง Indie รอเลย 🎵',
      time: '09:36',
    },
    {
      id: 'fz-2',
      sender: 'cohopper',
      senderName: 'มิน (เพื่อนร่วมทริป • R1)',
      text: 'กำลังเดินลงจากตึกเรียนค่ะ อีก 2 นาทีถึงจุดนัดรับนะคะ',
      time: '09:38',
    },
  ],
  'hop-nicha': [
    {
      id: 'fn-1',
      sender: 'driver',
      senderName: 'ณิชา (คนขับ)',
      text: 'สวัสดีค่า รถ Toyota Veloz SUV 7 ที่นั่ง (สีขาว) จอดรอตรงจุดรับหน้าตึก SIIT รังสิตนะคะ ใครถึงแล้วทักแจ้งได้เลยค่ะ 🚗✨',
      time: '09:35',
    },
  ],
};

export const AiConciergeScreen: React.FC<AiConciergeProps> = ({
  currentUserId = 4,
  isPremium,
  isTablet = false,
  onOpenPremiumModal,
  messages,
  onChangeMessages,
  slotStep: _slotStep,
  onChangeSlotStep,
  draftSlots,
  onChangeDraftSlots,
  watchers,
  onAddWatcher,
  onRemoveWatcher,
  onTriggerWatcherMatch,
  activeSubTab,
  onChangeSubTab,
  rides = [],
  activeBooking = null,
  selectedFriendRideId = null,
  onSelectFriendRideId,
}) => {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [autoBook, setAutoBook] = useState(false);
  const [quickChips, setQuickChips] = useState<string[]>([]);
  const [confirmCancelWatcherId, setConfirmCancelWatcherId] = useState<string | null>(
    null
  );
  const [internalFriendRideId, setInternalFriendRideId] = useState<string | null>(
    null
  );
  const [friendInputText, setFriendInputText] = useState('');
  const [friendThreads, setFriendThreads] = useState<
    Record<string, FriendChatItem[]>
  >(DEFAULT_FRIEND_THREADS);

  const activeFriendRideId =
    selectedFriendRideId !== undefined ? selectedFriendRideId : internalFriendRideId;

  const setActiveFriendRideId = (id: string | null) => {
    if (onSelectFriendRideId) {
      onSelectFriendRideId(id);
    } else {
      setInternalFriendRideId(id);
    }
  };

  const getThreadForRide = (ride: RideHop): FriendChatItem[] => {
    if (friendThreads[ride.id]) return friendThreads[ride.id];
    return [
      {
        id: `init-${ride.id}-1`,
        sender: 'driver',
        senderName: `${ride.hostName.split(' ')[0]} (คนขับ)`,
        text: `สวัสดีครับ! ทริป ${ride.origin} → ${ride.destination} (${ride.vehicleLabel}) นัดเจอกันที่จุดรับได้เลยครับ ถึงแล้วทักมาในห้องแชทนี้ได้ทันทีครับ 🚗`,
        time: '09:40',
      },
    ];
  };

  const handleSendFriendMessage = (ride: RideHop, rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed) return;
    const currentList = getThreadForRide(ride);
    const userMessage: FriendChatItem = {
      id: `u-${Date.now()}`,
      sender: 'user',
      senderName: 'คุณ (ผู้โดยสาร)',
      text: trimmed,
      time: '09:42',
    };
    const driverReply: FriendChatItem = {
      id: `d-${Date.now() + 1}`,
      sender: 'driver',
      senderName: `${ride.hostName.split(' ')[0]} (คนขับ)`,
      text: trimmed.includes('ถึง')
        ? `รับทราบครับ! เห็นคุณตรงจุดนัดพบแล้ว เดี๋ยวขับ ${ride.vehicleLabel} เข้าไปเทียบรับเลยครับ 🚗💨`
        : `โอเคเลยครับ! เจอกันที่จุดนัดรับหน้า ${ride.origin} นะครับ เปิดไฟฉุกเฉินรอครับ ✨`,
      time: '09:42',
    };

    setFriendThreads((prev) => ({
      ...prev,
      [ride.id]: [...currentList, userMessage, driverReply],
    }));
    setFriendInputText('');
  };

  const formatCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const handleResetSlots = () => {
    onChangeDraftSlots({
      origin: '',
      destination: '',
      time: '',
      seats: 0,
      maxWalkMeters: 0,
    });
    setAutoBook(false);
    setIsComplete(false);
    setQuickChips([]);
    setAiError(null);
    onChangeSlotStep('idle');
  };

  const handleUserSend = async (rawText: string) => {
    const text = rawText.trim();
    if (!text || isSending) return;

    const timestamp = formatCurrentTime();
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp,
    };

    setInputText('');
    setAiError(null);
    setIsSending(true);
    onChangeMessages((prev) => [...prev, userMsg]);

    try {
      const currentSlotsPayload = {
        origin: draftSlots.origin || undefined,
        destination: draftSlots.destination || undefined,
        time_label: draftSlots.time || undefined,
        seats_needed: draftSlots.seats || undefined,
        max_walk_meters: draftSlots.maxWalkMeters || undefined,
        auto_book: autoBook,
      };

      const aiRes = await sendConciergeMessage({
        user_id: currentUserId,
        message: text,
        current_slots: currentSlotsPayload,
      });

      const nextOrigin = aiRes.slots?.origin || '';
      const nextDest = aiRes.slots?.destination || '';
      const nextTime = aiRes.slots?.time_label || '';
      const nextSeats = aiRes.slots?.seats_needed || 0;
      const nextWalk = aiRes.slots?.max_walk_meters ?? draftSlots.maxWalkMeters ?? 350;
      const nextAutoBook = Boolean(aiRes.slots?.auto_book ?? autoBook);

      onChangeDraftSlots({
        origin: nextOrigin,
        destination: nextDest,
        time: nextTime,
        seats: nextSeats,
        maxWalkMeters: nextWalk,
      });
      setAutoBook(nextAutoBook);
      setIsComplete(Boolean(aiRes.is_complete));
      setQuickChips(Array.isArray(aiRes.quick_chips) ? aiRes.quick_chips : []);

      if (aiRes.is_complete) {
        let watcherStatus: 'watching' | 'matched' = 'watching';
        let watcherId = `w-${Date.now()}`;
        try {
          const watcherRes = await createAiWatcher({
            user_id: currentUserId,
            origin: nextOrigin,
            destination: nextDest,
            time_label: nextTime,
            seats_needed: nextSeats || 1,
            max_walk_meters: Math.min(500, nextWalk || 350),
            vibe_preference: aiRes.slots?.vibe_preference || 'Indie • Game • สายชวนคุย',
          });
          if (watcherRes?.watcher_id) watcherId = `w-${watcherRes.watcher_id}`;
          if (watcherRes?.status === 'matched') watcherStatus = 'matched';
        } catch {
          // Watcher persistence error does not block displaying the AI reply
        }

        onAddWatcher({
          id: watcherId,
          origin: nextOrigin,
          destination: nextDest,
          timeLabel: `วันนี้/พรุ่งนี้ • ${nextTime}`,
          seats: nextSeats || 1,
          maxWalkMeters: Math.min(500, nextWalk || 350),
          vibePreference: aiRes.slots?.vibe_preference || 'Indie • Game • สายชวนคุย',
          status: watcherStatus,
          createdAt: 'เมื่อสักครู่',
        });
        onChangeSlotStep('idle');
      } else if (aiRes.missing_slots?.includes('seats_needed')) {
        onChangeSlotStep('ask_seats');
      } else if (aiRes.missing_slots?.includes('origin')) {
        onChangeSlotStep('ask_pickup');
      } else {
        onChangeSlotStep('ask_walk');
      }

      const responseText = aiRes.reply || aiRes.response || '';
      const aiReply: ChatMessage = {
        id: `ai-${Date.now() + 1}`,
        sender: 'ai',
        text: responseText,
        timestamp: formatCurrentTime(),
        slotSummary: {
          origin: nextOrigin || undefined,
          destination: nextDest || undefined,
          time: nextTime || undefined,
          seats: nextSeats || undefined,
          maxWalkMeters: nextWalk || undefined,
        },
      };
      onChangeMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      const errorDetail =
        err instanceof Error ? err.message : 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้';
      setAiError(
        `ไม่สามารถเชื่อมต่อบริการ AI Concierge (http://localhost:8000/api/ai/concierge) ได้: ${errorDetail}`
      );
      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now() + 1}`,
        sender: 'ai',
        text: 'ขออภัยครับ ขณะนี้ไม่สามารถเชื่อมต่อบริการ AI Concierge (พอร์ต 8000) ได้ กรุณาตรวจสอบว่า FastAPI server กำลังทำงานอยู่ แล้วลองส่งข้อความใหม่อีกครั้งครับ',
        timestamp: formatCurrentTime(),
      };
      onChangeMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const renderWatchersList = () => (
    <div className="space-y-2">
      {watchers.map((w) => (
        <div
          key={w.id}
          className={`p-3 rounded-2xl border text-[11px] transition ${
            w.status === 'booked'
              ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-100'
              : 'bg-slate-800/90 border-slate-700 text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="font-black text-white flex items-center gap-1">
              <IconPin size={12} className="text-orange-400 shrink-0" />
              <span>
                {w.origin} → {w.destination}
              </span>
            </div>
            <span
              className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                w.status === 'booked'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
              }`}
            >
              {w.status === 'booked'
                ? 'จองอัตโนมัติสำเร็จ!'
                : 'กำลังรอจับคู่และจองให้อัตโนมัติ'}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2 text-[10px] text-slate-300 tabular-nums gap-1.5 flex-wrap">
            <span>
              {w.timeLabel} • {w.seats} ที่นั่ง • เดิน ≤ {w.maxWalkMeters}m
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {w.status === 'watching' ? (
                <>
                  <button
                    type="button"
                    onClick={() => onTriggerWatcherMatch(w.id)}
                    className="min-h-[34px] bg-orange-500 hover:bg-orange-600 text-white font-black px-2.5 py-1 rounded-lg text-[9px] shadow-sm active:scale-95 transition"
                  >
                    จำลองพบทริปตรงเงื่อนไข
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmCancelWatcherId(w.id)}
                    className="min-h-[34px] bg-slate-700 hover:bg-rose-600 text-slate-200 hover:text-white font-bold px-2.5 py-1 rounded-lg text-[9px] active:scale-95 transition"
                  >
                    ยกเลิก
                  </button>
                </>
              ) : (
                <span className="text-emerald-300 font-bold">
                  จับคู่กับ: {w.matchedHost}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div
      className={`flex-1 flex ${
        isTablet ? 'flex-row' : 'flex-col pb-[84px]'
      } bg-slate-900 text-white overflow-hidden relative`}
    >
      {/* Main Left/Center Chat Column */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Unified Sub-Navigation: AI Auto-Book vs Companion Chat */}
        <div className="px-3.5 pt-2.5 pb-2 bg-slate-950 border-b border-slate-800 space-y-2 shrink-0">
          <div className="grid grid-cols-2 bg-slate-800/90 p-1 rounded-xl gap-1.5">
            <button
              type="button"
              onClick={() => onChangeSubTab('ai')}
              className={`min-h-[42px] py-2 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 active:scale-95 transition ${
                activeSubTab === 'ai'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <IconSparkle size={13} />
              <span>ผู้ช่วย AI จองอัตโนมัติ</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeSubTab('friend')}
              className={`min-h-[42px] py-2 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 active:scale-95 transition ${
                activeSubTab === 'friend'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>แชทเพื่อนร่วมทาง (2)</span>
            </button>
          </div>
        </div>

        {/* Tab 2: Companion Chat (Interactive List + Trip Group / Driver Chat Room) */}
        {activeSubTab === 'friend' &&
          (() => {
            const chatRides: RideHop[] = [];
            const bookedRideObj = activeBooking
              ? rides.find((r) => r.id === activeBooking.rideId)
              : null;
            if (bookedRideObj) chatRides.push(bookedRideObj);
            for (const r of rides) {
              if (!chatRides.some((existing) => existing.id === r.id)) {
                chatRides.push(r);
              }
            }
            const displayRides = chatRides.slice(0, 4);
            const activeRoomRide = activeFriendRideId
              ? rides.find((r) => r.id === activeFriendRideId) ||
                displayRides[0] ||
                null
              : null;

            if (activeRoomRide) {
              const isRoomBooked = activeBooking?.rideId === activeRoomRide.id;
              const thread = getThreadForRide(activeRoomRide);

              return (
                <div className="flex-1 flex flex-col overflow-hidden bg-slate-900">
                  {/* Chat Room Header with Back Button & Vehicle/Privacy-Gated Social Info */}
                  <div className="p-3 bg-slate-950 border-b border-slate-800 space-y-2 shrink-0">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveFriendRideId(null)}
                        className="min-h-[36px] px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-[11px] font-black flex items-center gap-1.5 active:scale-95 transition shrink-0"
                      >
                        <span>← ย้อนกลับ</span>
                      </button>

                      <span
                        className={`text-[9.5px] font-black px-2.5 py-0.5 rounded-full ${
                          isRoomBooked
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                        }`}
                      >
                        {isRoomBooked
                          ? '✓ ทริปที่จองแล้ว • ห้องแชทกลุ่มทริป'
                          : 'ห้องสอบถามคนขับ & เพื่อนร่วมทาง'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 bg-slate-900 p-2.5 rounded-2xl border border-slate-800">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center border border-orange-500/40 shrink-0">
                          <DriverBunnySvg size={25} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black text-white truncate">
                            {activeRoomRide.hostName} ({activeRoomRide.faculty})
                          </div>
                          <div className="text-[10px] text-slate-300 font-bold truncate">
                            {activeRoomRide.origin} → {activeRoomRide.destination} •{' '}
                            {activeRoomRide.vehicleLabel}
                          </div>
                        </div>
                      </div>
                      {activeRoomRide.licensePlate && (
                        <span className="plate-badge bg-slate-950 text-amber-300 border border-amber-400 px-2 py-0.5 rounded-md font-mono font-black text-[9.5px] shrink-0">
                          {activeRoomRide.licensePlate}
                        </span>
                      )}
                    </div>

                    {/* Privacy Gate for IG / Facebook inside Chat Header */}
                    {isRoomBooked ? (
                      <div className="flex flex-wrap items-center justify-between gap-1.5 px-1">
                        <span className="text-[9.5px] font-black text-emerald-400 flex items-center gap-1">
                          <IconCheck size={11} />
                          <span>ช่องทางติดต่อคนขับ (ปลดล็อกหลังชำระเงินแล้ว):</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          {activeRoomRide.ig && (
                            <a
                              href={`https://instagram.com/${activeRoomRide.ig.replace(
                                '@',
                                ''
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[9.5px] bg-pink-600 hover:bg-pink-500 text-white px-2.5 py-0.5 rounded-full font-black inline-flex items-center gap-1 transition"
                            >
                              <IconInstagram size={10} />
                              <span>{activeRoomRide.ig}</span>
                            </a>
                          )}
                          {activeRoomRide.facebook && (
                            <a
                              href={`https://facebook.com/search/top/?q=${encodeURIComponent(
                                activeRoomRide.facebook
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[9.5px] bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-0.5 rounded-full font-black inline-flex items-center gap-1 transition"
                            >
                              <IconFacebook size={10} />
                              <span>Facebook</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-[9.5px] font-bold text-slate-400 px-1">
                        <span className="flex items-center gap-1">
                          <IconLock size={10} className="text-amber-400" />
                          <span>
                            ซ่อน IG และ Facebook ของคนขับจนกว่าจะจองและชำระเงินสำเร็จ
                          </span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-1 p-3.5 space-y-2.5 overflow-y-auto custom-scroll">
                    {thread.map((msg) => {
                      const isUser = msg.sender === 'user';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${
                            isUser ? 'items-end' : 'items-start'
                          }`}
                        >
                          <span className="text-[9px] font-bold text-slate-400 mb-0.5 px-1">
                            {msg.senderName} • {msg.time}
                          </span>
                          <div
                            className={`max-w-[86%] p-3 rounded-2xl text-[11px] leading-relaxed ${
                              isUser
                                ? 'bg-orange-500 text-white font-bold rounded-tr-none shadow-md'
                                : msg.sender === 'driver'
                                  ? 'bg-slate-800 text-slate-100 border border-orange-500/40 rounded-tl-none'
                                  : 'bg-slate-800/80 text-slate-200 border border-slate-700 rounded-tl-none'
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      );
                    })}

                    {/* Quick Coordination Replies */}
                    <div className="pt-2 space-y-1.5">
                      <div className="text-[9.5px] font-bold text-slate-400">
                        ข้อความด่วนนัดหมายจุดรับ:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          'กำลังเดินไปจุดนัดรับครับ อีก 2 นาทีถึง!',
                          'ถึงจุดนัดพบแล้วครับ ยืนรอตรงป้ายหน้าตึก',
                          'โอเคครับ เจอกันที่รถเลย ขอบคุณครับ!',
                        ].map((quickText) => (
                          <button
                            key={quickText}
                            type="button"
                            onClick={() =>
                              handleSendFriendMessage(activeRoomRide, quickText)
                            }
                            className="text-[10px] bg-slate-800 hover:bg-orange-500 text-orange-200 hover:text-white border border-orange-500/40 px-2.5 py-1.5 rounded-full font-bold active:scale-95 transition"
                          >
                            {quickText}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Message Input Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendFriendMessage(activeRoomRide, friendInputText);
                    }}
                    className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0"
                  >
                    <input
                      type="text"
                      value={friendInputText}
                      onChange={(e) => setFriendInputText(e.target.value)}
                      placeholder={`พิมพ์ข้อความถึง ${activeRoomRide.hostName.split(' ')[0]} และเพื่อนร่วมทริป...`}
                      className="flex-1 min-h-[44px] bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-xs font-bold px-3.5 py-2.5 rounded-xl focus:border-orange-500"
                    />
                    <button
                      type="submit"
                      className="min-h-[44px] min-w-[68px] bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition shrink-0"
                    >
                      ส่งข้อความ
                    </button>
                  </form>
                </div>
              );
            }

            return (
              <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scroll bg-slate-900">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black text-slate-200">
                    ห้องแชทคนขับและเพื่อนร่วมทางในทริป
                  </div>
                  <span className="text-[10px] font-bold text-orange-400">
                    แตะที่รายชื่อเพื่อเข้าห้องแชท
                  </span>
                </div>

                {displayRides.map((r) => {
                  const isBooked = activeBooking?.rideId === r.id;
                  const thread = getThreadForRide(r);
                  const lastMsg = thread[thread.length - 1];
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setActiveFriendRideId(r.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border flex items-center gap-3 transition active:scale-[0.99] ${
                        isBooked
                          ? 'bg-emerald-950/50 border-2 border-emerald-500 hover:bg-emerald-950/70'
                          : 'bg-slate-800 hover:bg-slate-800/80 border-slate-700 hover:border-orange-500/60'
                      }`}
                    >
                      <div className="w-11 h-11 bg-orange-500/20 rounded-full flex items-center justify-center border border-orange-500/40 relative shrink-0">
                        <DriverBunnySvg size={28} />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center gap-2">
                          <h4 className="text-xs font-black text-white truncate">
                            {r.hostName} ({r.faculty})
                          </h4>
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                              isBooked
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                            }`}
                          >
                            {isBooked ? 'ทริปปัจจุบันของคุณ' : 'เปิดแชท →'}
                          </span>
                        </div>
                        <div className="text-[10px] font-bold text-teal-300 mt-0.5 truncate">
                          {r.origin} → {r.destination} • {r.vehicleLabel}
                        </div>
                        {lastMsg && (
                          <p className="text-[11px] text-slate-300 font-medium mt-1 truncate">
                            "{lastMsg.text}"
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })()}

        {/* Tab 1: AI Auto-Booking Assistant (Locked for Free User, Unlocked for HOP Premium) */}
        {activeSubTab === 'ai' && !isPremium && (
          <div className="flex-1 p-4 overflow-y-auto custom-scroll space-y-3.5">
            {/* Locked Real-time Auto-Booking Status Banner */}
            <div className="bg-slate-800 border border-orange-500/40 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-orange-400 flex items-center gap-1.5">
                  <IconClock size={14} />
                  <span>ระบบรอจองอัตโนมัติแบบเรียลไทม์ (AI Auto-Book)</span>
                </span>
                <span className="text-[9px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full">
                  ล็อกอยู่ (เฉพาะ HOP Premium)
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                ฟีเจอร์ตั้งเวลารอจับคู่และจองที่นั่งให้อัตโนมัติแบบเรียลไทม์สงวนสิทธิ์สำหรับสมาชิก{' '}
                <strong className="text-white">HOP Premium (฿49/เดือน)</strong> เท่านั้น
                (ผู้ใช้ทั่วไปยังสามารถค้นหาและกดจองเองผ่านหน้าหลักได้ฟรี 100%)
              </p>
            </div>

            {/* Sample Chat Preview */}
            <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-3.5 space-y-2.5 opacity-80">
              <div className="text-[10px] font-bold text-slate-400">
                ตัวอย่างการสั่งงาน AI เมื่อปลดล็อก HOP Premium:
              </div>
              <div className="bg-orange-500 text-white text-[11px] font-bold p-2.5 rounded-2xl rounded-tr-none ml-auto max-w-[85%]">
                "เห้ย ต้องการไปคอนโด B ตอน 9.00 ถ้ามีคนเปิดหารรถไปที่นี่ ให้กดจองให้เลยนะ"
              </div>
              <div className="bg-slate-700 text-slate-100 text-[11px] p-2.5 rounded-2xl rounded-tl-none max-w-[88%]">
                รับทราบครับ! ไป คอนโด B ตอน 09:00 น. — ต้องการจองกี่ที่นั่ง และรับระยะเดินจากจุดส่งได้ไม่เกินกี่เมตรครับ? (สูงสุด ≤ 500m)
              </div>
            </div>

            {/* Paywall Upgrade Card */}
            <div className="bg-white text-slate-900 rounded-3xl p-4 shadow-xl border-2 border-orange-500 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                    <IconCrown size={18} className="text-orange-500" />
                    <span>สมัคร HOP Premium</span>
                  </h3>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                    ปลดล็อกระบบรอจองอัตโนมัติแบบเรียลไทม์และฟรีค่าธรรมเนียมทุกรอบ
                  </p>
                </div>
                <div className="text-right shrink-0 bg-orange-50 border border-orange-200 px-2.5 py-1.5 rounded-xl">
                  <div className="text-lg font-black text-orange-600 tabular-nums leading-none">
                    ฿49
                  </div>
                  <div className="text-[9px] font-bold text-orange-800">/ เดือน</div>
                </div>
              </div>

              <div className="space-y-2 text-[11px] bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="flex items-start gap-2">
                  <IconCheck size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="font-black text-slate-900">
                      ระบบรอจองอัตโนมัติแบบเรียลไทม์:
                    </strong>{' '}
                    พิมพ์สั่งทิ้งไว้ ให้ AI รอจับคู่และล็อกที่นั่งให้อัตโนมัติทันทีที่มีคนเปิดทริป
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <IconCheck size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="font-black text-slate-900">
                      ฟรีค่าธรรมเนียมแพลตฟอร์ม:
                    </strong>{' '}
                    ประหยัดค่าบริการรอบละ ฿4–฿5 ทุกทริปการเดินทาง
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenPremiumModal}
                className="w-full min-h-[46px] bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black text-xs py-3 rounded-xl shadow-md transition"
              >
                สมัครสมาชิก HOP Premium (฿49/เดือน) →
              </button>
            </div>
          </div>
        )}

        {/* Unlocked HOP Premium AI Auto-Book View */}
        {activeSubTab === 'ai' && isPremium && (
          <>
            {/* Mobile-only top AI Auto-Book Tasks Panel (On Tablet/iPad it lives in the right column!) */}
            {!isTablet && (
              <div className="px-3.5 py-2.5 bg-slate-950/70 border-b border-slate-800 max-h-[172px] overflow-y-auto custom-scroll shrink-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black text-orange-400 flex items-center gap-1">
                    <IconClock size={12} />
                    <span>ระบบรอจองอัตโนมัติแบบเรียลไทม์ (AI Auto-Book)</span>
                  </span>
                  <span className="text-[9px] text-emerald-400 font-bold">
                    สิทธิ์ HOP Premium
                  </span>
                </div>
                {renderWatchersList()}
              </div>
            )}

            {/* Shared Chat Messages Area */}
            <div className="flex-1 p-3.5 md:p-4 space-y-3 overflow-y-auto custom-scroll">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[88%] p-3 rounded-2xl text-[11px] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-orange-500 text-white font-bold rounded-tr-none shadow-md'
                      : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none'
                  }`}
                >
                  <div>{m.text}</div>
                  {m.slotSummary && (
                    <div className="mt-2 pt-2 border-t border-slate-700/80 grid grid-cols-2 gap-1 text-[10px] font-mono text-orange-300 tabular-nums">
                      <span>ต้นทาง: {m.slotSummary.origin || 'รอระบุ...'}</span>
                      <span>
                        ปลายทาง: {m.slotSummary.destination || 'รอระบุ...'}
                      </span>
                      <span>เวลา: {m.slotSummary.time || 'รอระบุ...'}</span>
                      <span>
                        ที่นั่ง:{' '}
                        {m.slotSummary.seats
                          ? `${m.slotSummary.seats} ที่นั่ง`
                          : 'รอระบุ...'}
                      </span>
                      <span className="col-span-2 text-emerald-300">
                        ระยะเดินสูงสุด:{' '}
                        {m.slotSummary.maxWalkMeters !== undefined
                          ? `≤ ${m.slotSummary.maxWalkMeters}m`
                          : 'รอระบุ (ไม่เกิน 500m)'}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1 tabular-nums">
                  {m.timestamp}
                </span>
              </div>
            ))}

            {isSending && (
              <div className="flex items-start">
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-xs bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-2">
                  <IconSparkle size={12} className="text-orange-400 animate-pulse" />
                  <span>AI Concierge กำลังประมวลผล...</span>
                </div>
              </div>
            )}

            {aiError && (
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-[10.5px] font-bold">
                {aiError}
              </div>
            )}

            {/* Dynamic Quick Chips from AI Concierge API */}
            <div className="pt-1 space-y-2">
              {quickChips.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {quickChips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      disabled={isSending}
                      onClick={() => handleUserSend(chip)}
                      className="text-[10px] bg-orange-500/20 hover:bg-orange-500 disabled:opacity-50 text-orange-200 hover:text-white border border-orange-500/50 px-3 py-1.5 rounded-full font-black transition"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}

              {quickChips.length === 0 && !isComplete && messages.length <= 1 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400">
                    ตัวอย่างคำสั่งสำหรับ AI Concierge:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      disabled={isSending}
                      onClick={() =>
                        handleUserSend(
                          'อยากกลับคอนโด B ตอน 9 โมง ถ้ามีรถว่างจองให้เลย'
                        )
                      }
                      className="text-left text-[10px] bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-orange-500/50 text-orange-200 px-2.5 py-1.5 rounded-xl font-bold transition"
                    >
                      "อยากกลับคอนโด B ตอน 9 โมง ถ้ามีรถว่างจองให้เลย"
                    </button>
                    <button
                      type="button"
                      disabled={isSending}
                      onClick={() =>
                        handleUserSend(
                          'พรุ่งนี้มีเรียนบางกะดี 09:00 น. ขอ 1 ที่นั่ง จาก มธ'
                        )
                      }
                      className="text-left text-[10px] bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 text-slate-200 px-2.5 py-1.5 rounded-xl font-bold transition"
                    >
                      "พรุ่งนี้มีเรียนบางกะดี 09:00 น. ขอ 1 ที่นั่ง จาก มธ"
                    </button>
                  </div>
                </div>
              )}

              {isComplete && (
                <div className="flex items-center justify-between gap-2 bg-emerald-950/50 border border-emerald-500/40 rounded-xl px-3 py-2 text-[10.5px]">
                  <span className="text-emerald-200 font-bold">
                    ข้อมูลครบถ้วนแล้ว (is_complete: true)
                  </span>
                  <button
                    type="button"
                    onClick={handleResetSlots}
                    className="text-orange-300 hover:text-orange-200 font-black underline shrink-0"
                  >
                    เริ่มค้นหาใหม่
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Chat Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUserSend(inputText);
            }}
            className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputText}
              disabled={isSending}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isSending
                  ? 'กำลังรอคำตอบจาก AI...'
                  : 'พิมพ์สั่ง AI เช่น อยากกลับคอนโด B ตอน 9 โมง...'
              }
              className="flex-1 min-h-[44px] bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-xs font-bold px-3.5 py-2.5 rounded-xl focus:border-orange-500 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isSending || !inputText.trim()}
              className="min-h-[44px] min-w-[60px] bg-orange-500 hover:bg-orange-600 disabled:opacity-50 active:scale-95 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition shrink-0"
            >
              {isSending ? '...' : 'ส่ง'}
            </button>
          </form>
        </>
      )}
      </div>

      {/* TABLET / iPAD RIGHT SPLIT-VIEW COLUMN: Dedicated AI Auto-Book Watchers & Status Panel */}
      {isTablet && (
        <aside className="w-[310px] lg:w-[350px] shrink-0 border-l border-slate-800 bg-slate-950 p-4 overflow-y-auto custom-scroll space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-orange-400 flex items-center gap-1.5">
                <IconClock size={14} />
                <span>ระบบรอจองอัตโนมัติ (AI Auto-Book)</span>
              </span>
              <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                {isPremium ? 'HOP Premium' : 'ล็อกอยู่'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              รายการตั้งเวลารอจับคู่และล็อกที่นั่งให้อัตโนมัติทันทีที่มีเพื่อนเปิดทริปตรงเส้นทางและระยะเดิน ≤ 500m
            </p>
          </div>

          {isPremium ? (
            renderWatchersList()
          ) : (
            <div className="bg-slate-900 border border-orange-500/40 rounded-2xl p-3.5 space-y-2.5">
              <div className="text-xs font-black text-white">
                ปลดล็อกด้วย HOP Premium (฿49/เดือน)
              </div>
              <p className="text-[10px] text-slate-300">
                สั่งงานผ่านแชทด้านซ้ายเพื่อให้ AI เฝ้ารอจับคู่และจองที่นั่งให้อัตโนมัติแบบเรียลไทม์
              </p>
              <button
                type="button"
                onClick={onOpenPremiumModal}
                className="w-full min-h-[44px] bg-orange-500 hover:bg-orange-600 text-white font-black text-xs py-2.5 rounded-xl active:scale-95 transition"
              >
                สมัคร HOP Premium →
              </button>
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="text-[11px] font-black text-slate-300">
              เพื่อนร่วมทางที่ออนไลน์ล่าสุด
            </div>
            <button
              type="button"
              onClick={() => {
                onChangeSubTab('friend');
                setActiveFriendRideId(activeBooking?.rideId || 'hop-z');
              }}
              className="w-full text-left bg-slate-900 hover:bg-slate-800 p-3 rounded-2xl border border-slate-800 hover:border-orange-500/60 flex items-center gap-2.5 active:scale-95 transition"
            >
              <div className="w-9 h-9 bg-orange-500/20 rounded-full flex items-center justify-center border border-orange-500/40 shrink-0">
                <DriverBunnySvg size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-black text-white truncate">
                  นาย Z (SIIT CPE • 96% Match)
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  "เดี๋ยวแวะรับหน้าตึก SIIT รังสิตครับ"
                </div>
              </div>
              <IconChatBubble size={14} className="text-orange-400 shrink-0" />
            </button>
          </div>
        </aside>
      )}

      {/* Double Confirmation Bottom Sheet / Modal for Canceling an AI Auto-Book Watcher */}
      {confirmCancelWatcherId && (
        <div
          onClick={() => setConfirmCancelWatcherId(null)}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] z-50 flex items-end md:items-center justify-center p-0 md:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white text-slate-900 rounded-t-[32px] md:rounded-3xl p-4 pb-6 md:pb-4 w-full md:max-w-[400px] border-2 border-orange-500 shadow-2xl space-y-3 animate-[sheet-rise_0.22s_cubic-bezier(0.22,1,0.36,1)] safe-bottom"
          >
            <div
              className="w-11 h-1.5 rounded-full bg-slate-300 mx-auto mb-1"
              aria-hidden="true"
            />
            <div className="flex items-center gap-2 text-rose-700 font-black text-sm">
              <IconShieldCheck size={18} />
              <span>ยืนยันการยกเลิกรายการรอจองอัตโนมัติ?</span>
            </div>
            <p className="text-xs text-slate-600">
              หากยกเลิก ระบบ AI จะหยุดรอจับคู่ทริปสำหรับรายการนี้ทันที คุณต้องการยืนยันใช่หรือไม่?
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmCancelWatcherId(null)}
                className="min-h-[44px] py-2.5 rounded-xl border border-slate-300 text-slate-700 font-black text-xs active:scale-95 transition"
              >
                ไม่ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  onRemoveWatcher(confirmCancelWatcherId);
                  setConfirmCancelWatcherId(null);
                }}
                className="min-h-[44px] py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs active:scale-95 transition"
              >
                ยืนยันการยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
