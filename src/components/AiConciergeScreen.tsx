import React, { useState } from 'react';
import type { AutoBookWatcher, ChatMessage } from '../data/mockData';
import {
  DriverBunnySvg,
  IconCheck,
  IconClock,
  IconCrown,
  IconPin,
  IconShieldCheck,
  IconSparkle,
  PassengerBunnySvg,
} from './Icons';

export type SlotStep = 'idle' | 'ask_seats' | 'ask_pickup' | 'ask_walk';

export interface DraftSlots {
  origin: string;
  destination: string;
  time: string;
  seats: number;
  maxWalkMeters: number;
}

interface AiConciergeProps {
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
}

export const AiConciergeScreen: React.FC<AiConciergeProps> = ({
  isPremium,
  isTablet = false,
  onOpenPremiumModal,
  messages,
  onChangeMessages,
  slotStep,
  onChangeSlotStep,
  draftSlots,
  onChangeDraftSlots,
  watchers,
  onAddWatcher,
  onRemoveWatcher,
  onTriggerWatcherMatch,
  activeSubTab,
  onChangeSubTab,
}) => {
  const [inputText, setInputText] = useState('');
  const [confirmCancelWatcherId, setConfirmCancelWatcherId] = useState<string | null>(
    null
  );

  const handleUserSend = (rawText: string) => {
    const text = rawText.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: '09:41',
    };

    setInputText('');

    if (slotStep === 'idle') {
      const isBangkadi = text.includes('บางกระดี่');
      const detectedDest = isBangkadi ? 'SIIT บางกระดี่' : 'คอนโด B';
      const timeMatch = text.match(/(\d{1,2}[.:]\d{2}|\d{1,2}\s*โมง)/);
      const detectedTime = timeMatch
        ? timeMatch[0].replace('.', ':') +
          (timeMatch[0].includes('น.') ? '' : ' น.')
        : '09:00 น.';

      onChangeDraftSlots({
        origin: '',
        destination: detectedDest,
        time: detectedTime,
        seats: 0,
        maxWalkMeters: 0,
      });

      const aiReply: ChatMessage = {
        id: `ai-${Date.now() + 1}`,
        sender: 'ai',
        text: `รับทราบครับ! ต้องการเดินทางไป "${detectedDest}" รอบเวลา ${detectedTime} — ต้องการจองสำหรับกี่ที่นั่งครับ?`,
        timestamp: '09:41',
        slotSummary: {
          destination: detectedDest,
          time: detectedTime,
        },
      };

      onChangeMessages((prev) => [...prev, userMsg, aiReply]);
      onChangeSlotStep('ask_seats');
      return;
    }

    if (slotStep === 'ask_seats') {
      const numMatch = text.match(/\d+/);
      const parsedSeats = numMatch
        ? Math.min(4, Math.max(1, parseInt(numMatch[0], 10)))
        : 1;
      const updated = { ...draftSlots, seats: parsedSeats };
      onChangeDraftSlots(updated);

      const aiReply: ChatMessage = {
        id: `ai-${Date.now() + 1}`,
        sender: 'ai',
        text: `บันทึก ${parsedSeats} ที่นั่งเรียบร้อยครับ! รับจุดขึ้นรถที่ "SIIT รังสิต" เลยไหมครับ หรือต้องการขึ้นที่จุดไหน?`,
        timestamp: '09:41',
        slotSummary: {
          destination: updated.destination,
          time: updated.time,
          seats: parsedSeats,
        },
      };

      onChangeMessages((prev) => [...prev, userMsg, aiReply]);
      onChangeSlotStep('ask_pickup');
      return;
    }

    if (slotStep === 'ask_pickup') {
      let pickup = 'SIIT รังสิต';
      if (text.toLowerCase().includes('dome')) pickup = 'TU Dome';
      else if (text.toLowerCase().includes('kave')) pickup = 'Kave TU';
      else if (text.includes('บางกระดี่')) pickup = 'SIIT บางกระดี่';

      const updated = { ...draftSlots, origin: pickup };
      onChangeDraftSlots(updated);

      const aiReply: ChatMessage = {
        id: `ai-${Date.now() + 1}`,
        sender: 'ai',
        text: `รับที่ "${pickup}" นะครับ คำถามสุดท้าย: ยอมรับระยะเดินจากจุดส่งได้ไม่เกินกี่เมตรครับ? (จำกัดสูงสุดไม่เกิน 500 เมตร)`,
        timestamp: '09:41',
        slotSummary: {
          origin: pickup,
          destination: updated.destination,
          time: updated.time,
          seats: updated.seats,
        },
      };

      onChangeMessages((prev) => [...prev, userMsg, aiReply]);
      onChangeSlotStep('ask_walk');
      return;
    }

    if (slotStep === 'ask_walk') {
      const numMatch = text.match(/\d+/);
      const rawMeters = numMatch ? parseInt(numMatch[0], 10) : 100;
      const cappedMeters = Math.min(500, Math.max(0, rawMeters));
      const wasOverLimit = rawMeters > 500;

      const finalWatcher: AutoBookWatcher = {
        id: `w-${Date.now()}`,
        origin: draftSlots.origin || 'SIIT รังสิต',
        destination: draftSlots.destination,
        timeLabel: `วันนี้/พรุ่งนี้ • ${draftSlots.time}`,
        seats: draftSlots.seats || 1,
        maxWalkMeters: cappedMeters,
        vibePreference: 'Indie • Game • สายชวนคุย',
        status: 'watching',
        createdAt: 'เมื่อสักครู่',
      };

      onAddWatcher(finalWatcher);

      const guardrailNote = wasOverLimit
        ? ` (คุณระบุ ${rawMeters}m ระบบจึงปรับให้ไม่เกินเพดานสูงสุด 500m)`
        : '';

      const aiReply: ChatMessage = {
        id: `ai-${Date.now() + 1}`,
        sender: 'ai',
        text: `ข้อมูลครบถ้วนแล้วครับ!${guardrailNote} เปิดระบบรอจองอัตโนมัติแบบเรียลไทม์สำหรับเส้นทาง "${finalWatcher.origin} → ${finalWatcher.destination}" เวลา ${draftSlots.time} (${finalWatcher.seats} ที่นั่ง, เดินไม่เกิน ${cappedMeters}m) เรียบร้อย ทันทีที่มีคนเปิดทริปตรงเงื่อนไข ระบบจะจับคู่และจองที่นั่งให้อัตโนมัติทันทีครับ!`,
        timestamp: '09:42',
        slotSummary: {
          origin: finalWatcher.origin,
          destination: finalWatcher.destination,
          time: draftSlots.time,
          seats: finalWatcher.seats,
          maxWalkMeters: cappedMeters,
        },
      };

      onChangeMessages((prev) => [...prev, userMsg, aiReply]);
      onChangeSlotStep('idle');
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

        {/* Tab 2: Companion Chat */}
        {activeSubTab === 'friend' && (
          <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scroll bg-slate-900">
            <div className="text-xs font-black text-slate-200 mb-1">
              ข้อความจากเพื่อนร่วมทางของคุณ
            </div>
            <div className="bg-slate-800 p-3.5 rounded-2xl border border-slate-700 flex items-center gap-3">
              <div className="w-11 h-11 bg-orange-500/20 rounded-full flex items-center justify-center border border-orange-500/40 relative shrink-0">
                <DriverBunnySvg size={28} />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-baseline">
                  <h4 className="text-xs font-black text-white">
                    นาย Z (แซ็ค • SIIT CPE)
                  </h4>
                  <span className="text-[9px] text-orange-400 font-bold">
                    96% Match
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                  "เดี๋ยวแวะรับหน้าตึก SIIT รังสิตครับ เปิดเพลง Indie รอเลย!"
                </p>
              </div>
            </div>

            <div className="bg-slate-800 p-3.5 rounded-2xl border border-slate-700 flex items-center gap-3">
              <div className="w-11 h-11 bg-orange-500/20 rounded-full flex items-center justify-center border border-orange-500/40 relative shrink-0">
                <PassengerBunnySvg size={28} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-baseline">
                  <h4 className="text-xs font-black text-white">
                    ณิชา (Nicha • SIIT DE)
                  </h4>
                  <span className="text-[9px] text-slate-400 font-bold">
                    5 นาทีที่แล้ว
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                  "มาหาร Grab กลับคอนโด B กันค่ะ เหลือว่างอีก 2 ที่นั่ง!"
                </p>
              </div>
            </div>
          </div>
        )}

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

            {/* Quick Interactive Slot-Filling Chips */}
            <div className="pt-1">
              {slotStep === 'idle' && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400">
                    ประโยคตัวอย่างสำหรับสั่งจองอัตโนมัติ:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        handleUserSend(
                          'เห้ย ต้องการไปคอนโด B ตอน 9.00 ถ้ามีคนเปิดหารรถไปที่นี่ ให้กดจองให้เลยนะ'
                        )
                      }
                      className="text-left text-[10px] bg-slate-800 hover:bg-slate-700 border border-orange-500/50 text-orange-200 px-2.5 py-1.5 rounded-xl font-bold transition"
                    >
                      "เห้ย ต้องการไปคอนโด B ตอน 9.00 ถ้ามีคนเปิดหารรถไปที่นี่ ให้กดจองให้เลยนะ"
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleUserSend(
                          'พรุ่งนี้มีเรียน SIIT บางกระดี่ 09:00 น. ถ้ามีคนเปิดตี้ให้จองให้ด้วย'
                        )
                      }
                      className="text-left text-[10px] bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-2.5 py-1.5 rounded-xl font-bold transition"
                    >
                      "พรุ่งนี้มีเรียน SIIT บางกระดี่ 09:00 น. ถ้ามีคนเปิดตี้ให้จองให้ด้วย"
                    </button>
                  </div>
                </div>
              )}

              {slotStep === 'ask_seats' && (
                <div className="flex flex-wrap gap-1.5">
                  {['1 ที่นั่งครับ', '2 ที่นั่ง (ไปกับเพื่อน)', '3 ที่นั่ง'].map(
                    (chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleUserSend(chip)}
                        className="text-[10px] bg-orange-500/20 hover:bg-orange-500 text-orange-200 hover:text-white border border-orange-500/50 px-3 py-1.5 rounded-full font-black transition"
                      >
                        {chip}
                      </button>
                    )
                  )}
                </div>
              )}

              {slotStep === 'ask_pickup' && (
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'ขึ้นที่หน้าตึก SIIT รังสิต เลยครับ',
                    'รับที่ TU Dome',
                    'รับที่หน้า Kave TU',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleUserSend(chip)}
                      className="text-[10px] bg-orange-500/20 hover:bg-orange-500 text-orange-200 hover:text-white border border-orange-500/50 px-3 py-1.5 rounded-full font-black transition"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}

              {slotStep === 'ask_walk' && (
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'เดินได้ไม่เกิน 100 เมตรครับ',
                    'ขอจุดหมายเป๊ะ 0 เมตรเลย',
                    'เดินได้ไม่เกิน 300 เมตร',
                    'ลองระบุเกินเพดาน: 800 เมตร',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleUserSend(chip)}
                      className="text-[10px] bg-orange-500/20 hover:bg-orange-500 text-orange-200 hover:text-white border border-orange-500/50 px-3 py-1.5 rounded-full font-black transition"
                    >
                      {chip}
                    </button>
                  ))}
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
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                slotStep === 'idle'
                  ? 'พิมพ์สั่ง AI เช่น ไปคอนโด B ตอน 9.00...'
                  : 'พิมพ์ตอบคำถาม AI หรือเลือกปุ่มด้านบน...'
              }
              className="flex-1 min-h-[44px] bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-xs font-bold px-3.5 py-2.5 rounded-xl focus:border-orange-500"
            />
            <button
              type="submit"
              className="min-h-[44px] min-w-[60px] bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition shrink-0"
            >
              ส่ง
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
            <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center gap-2.5">
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
            </div>
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
