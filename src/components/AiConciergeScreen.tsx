import React, { useState } from 'react';
import type { AutoBookWatcher } from '../data/mockData';
import {
  IconCheck,
  IconClock,
  IconCrown,
  IconPin,
  IconSparkle,
} from './Icons';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  slotSummary?: {
    origin?: string;
    destination?: string;
    time?: string;
    seats?: number;
    maxWalkMeters?: number;
  };
}

interface AiConciergeProps {
  isPremium: boolean;
  onUnlockPremium: () => void;
  onOpenPremiumModal: () => void;
  watchers: AutoBookWatcher[];
  onAddWatcher: (watcher: AutoBookWatcher) => void;
  onTriggerWatcherMatch: (watcherId: string) => void;
  compact?: boolean;
}

type SlotStep = 'idle' | 'ask_seats' | 'ask_pickup' | 'ask_walk';

export const AiConciergeScreen: React.FC<AiConciergeProps> = ({
  isPremium,
  onUnlockPremium,
  onOpenPremiumModal,
  watchers,
  onAddWatcher,
  onTriggerWatcherMatch,
  compact = false,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-welcome',
      sender: 'ai',
      text: 'สวัสดีครับ! ผมคือ HOP AI Concierge พิมพ์สั่งจองรถล่วงหน้าหรือตั้งเฝ้าดูทริป (Auto-Booking Watcher) ด้วยภาษาธรรมชาติได้เลยครับ หากข้อมูลจุดรับ-ส่งหรือจำนวนที่นั่งยังไม่ครบ ผมจะช่วยถามต่อให้เองครับ',
      timestamp: '09:40',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [slotStep, setSlotStep] = useState<SlotStep>('idle');
  const [draftSlots, setDraftSlots] = useState<{
    origin: string;
    destination: string;
    time: string;
    seats: number;
    maxWalkMeters: number;
  }>({
    origin: '',
    destination: 'คอนโด B (รังสิต)',
    time: '09:00 น.',
    seats: 0,
    maxWalkMeters: 0,
  });

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
      const detectedDest = isBangkadi ? 'SIIT บางกระดี่' : 'คอนโด B (รังสิต)';
      const timeMatch = text.match(/(\d{1,2}[.:]\d{2}|\d{1,2}\s*โมง)/);
      const detectedTime = timeMatch ? timeMatch[0].replace('.', ':') + (timeMatch[0].includes('น.') ? '' : ' น.') : '09:00 น.';

      setDraftSlots({
        origin: '',
        destination: detectedDest,
        time: detectedTime,
        seats: 0,
        maxWalkMeters: 0,
      });

      const aiReply: ChatMessage = {
        id: `ai-${Date.now() + 1}`,
        sender: 'ai',
        text: `รับทราบครับ! ต้องการเดินทางไป "${detectedDest}" รอบเวลา ${detectedTime} นะครับ — ตอนนี้ข้อมูลการจองยังขาดอีกเล็กน้อย ต้องการจองสำหรับกี่ที่นั่งครับ?`,
        timestamp: '09:41',
        slotSummary: {
          destination: detectedDest,
          time: detectedTime,
        },
      };

      setMessages((prev) => [...prev, userMsg, aiReply]);
      setSlotStep('ask_seats');
      return;
    }

    if (slotStep === 'ask_seats') {
      const numMatch = text.match(/\d+/);
      const parsedSeats = numMatch ? Math.min(4, Math.max(1, parseInt(numMatch[0], 10))) : 1;
      const updated = { ...draftSlots, seats: parsedSeats };
      setDraftSlots(updated);

      const aiReply: ChatMessage = {
        id: `ai-${Date.now() + 1}`,
        sender: 'ai',
        text: `บันทึก ${parsedSeats} ที่นั่งเรียบร้อยครับ! รับจุดขึ้นรถที่ "หน้าตึก SIIT รังสิต" เลยไหมครับ หรือต้องการขึ้นที่จุดไหน?`,
        timestamp: '09:41',
        slotSummary: {
          destination: updated.destination,
          time: updated.time,
          seats: parsedSeats,
        },
      };

      setMessages((prev) => [...prev, userMsg, aiReply]);
      setSlotStep('ask_pickup');
      return;
    }

    if (slotStep === 'ask_pickup') {
      let pickup = 'SIIT รังสิต';
      if (text.toLowerCase().includes('dome')) pickup = 'TU Dome Plaza';
      else if (text.toLowerCase().includes('kave')) pickup = 'Kave TU Rangsit';
      else if (text.includes('บางกระดี่')) pickup = 'SIIT บางกระดี่';

      const updated = { ...draftSlots, origin: pickup };
      setDraftSlots(updated);

      const aiReply: ChatMessage = {
        id: `ai-${Date.now() + 1}`,
        sender: 'ai',
        text: `รับที่ "${pickup}" นะครับ คำถามสุดท้าย: ยอมรับระยะเดินจากจุดส่งได้ไม่เกินกี่เมตรครับ? (ระบบจำกัด Hard Limit ไม่เกิน 500 เมตร เพื่อไม่ให้ต้องเดินไกลเกินจริง)`,
        timestamp: '09:41',
        slotSummary: {
          origin: pickup,
          destination: updated.destination,
          time: updated.time,
          seats: updated.seats,
        },
      };

      setMessages((prev) => [...prev, userMsg, aiReply]);
      setSlotStep('ask_walk');
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
        vibePreference: 'Indie • Valorant • สายชวนคุย',
        status: 'watching',
        createdAt: 'เมื่อสักครู่',
      };

      onAddWatcher(finalWatcher);

      const guardrailNote = wasOverLimit
        ? ` (คุณพิมพ์ ${rawMeters}m แต่ระบบปรับให้เป็นลิมิตสูงสุด 500m ตาม Guardrail)`
        : '';

      const aiReply: ChatMessage = {
        id: `ai-${Date.now() + 1}`,
        sender: 'ai',
        text: `ข้อมูลครบถ้วนแล้วครับ!${guardrailNote} ผมสร้าง Auto-Booking Watcher เฝ้าดูทริป "${finalWatcher.origin} → ${finalWatcher.destination}" เวลา ${draftSlots.time} (${finalWatcher.seats} ที่นั่ง, ระยะเดินไม่เกิน ${cappedMeters}m) ให้เรียบร้อย ทันทีที่มีคนเปิดหารรถตรงเงื่อนไข ระบบจะล็อกที่นั่งให้อัตโนมัติทันทีครับ!`,
        timestamp: '09:42',
        slotSummary: {
          origin: finalWatcher.origin,
          destination: finalWatcher.destination,
          time: draftSlots.time,
          seats: finalWatcher.seats,
          maxWalkMeters: cappedMeters,
        },
      };

      setMessages((prev) => [...prev, userMsg, aiReply]);
      setSlotStep('idle');
    }
  };

  if (!isPremium) {
    return (
      <div className="flex-1 flex flex-col bg-slate-900 text-white p-4 pb-24 overflow-y-auto custom-scroll">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-3.5 mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-white flex items-center gap-1.5">
              <IconSparkle size={16} className="text-orange-400" />
              <span>HOP AI Concierge</span>
            </h2>
            <p className="text-[11px] text-slate-300 mt-0.5">
              ระบบสั่งจองรถอัตโนมัติด้วยภาษาธรรมชาติ (Interactive Slot-Filling)
            </p>
          </div>
          <span className="text-[10px] font-black bg-orange-500/20 text-orange-300 border border-orange-500/40 px-2.5 py-1 rounded-full">
            HOP Premium
          </span>
        </div>

        {/* Sample Chat Preview Blurred / Locked */}
        <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-3.5 mb-4 space-y-2.5 opacity-80">
          <div className="bg-orange-500 text-white text-[11px] font-bold p-2.5 rounded-2xl rounded-tr-none ml-auto max-w-[85%]">
            "เห้ย ต้องการไปคอนโด B ตอน 9.00 ถ้ามีคนเปิดหารรถไปที่นี่ ให้กดจองให้เลยนะ"
          </div>
          <div className="bg-slate-700 text-slate-100 text-[11px] p-2.5 rounded-2xl rounded-tl-none max-w-[88%]">
            รับทราบครับ! ไป คอนโด B ตอน 09:00 น. — ต้องการจองสำหรับกี่ที่นั่ง และรับระยะเดินจากจุดส่งได้ไม่เกินกี่เมตรครับ? (สูงสุด ≤ 500m)
          </div>
        </div>

        {/* Paywall Card */}
        <div className="bg-white text-slate-900 rounded-3xl p-4 shadow-xl border-2 border-orange-500 space-y-3.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                <IconCrown size={18} className="text-orange-500" />
                <span>ปลดล็อก HOP Premium</span>
              </h3>
              <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                ผู้ใช้งานทั่วไปสามารถค้นหา กรอง Vibe และกดจองผ่านหน้าเว็บ (GUI) ได้ฟรีครบ 100% ทุกฟีเจอร์!
              </p>
            </div>
            <div className="text-right shrink-0 bg-orange-50 border border-orange-200 px-2.5 py-1.5 rounded-xl">
              <div className="text-lg font-black text-orange-600 tabular-nums leading-none">฿49</div>
              <div className="text-[9px] font-bold text-orange-800">/ เดือน</div>
            </div>
          </div>

          <div className="space-y-2 text-[11px] bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="flex items-start gap-2">
              <IconCheck size={15} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong className="font-black text-slate-900">AI Auto-Booking Assistant:</strong> พิมพ์สั่งงานทิ้งไว้ ให้ AI ถามข้อมูลที่ขาดและเฝ้ากดจองให้อัตโนมัติทันทีที่มีคนเปิดตี้
              </span>
            </div>
            <div className="flex items-start gap-2">
              <IconCheck size={15} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong className="font-black text-slate-900">ฟรีค่าธรรมเนียมแพลตฟอร์ม:</strong> ประหยัดค่าบริการรอบละ ฿4–฿5 ทุกทริปการเดินทาง
              </span>
            </div>
            <div className="flex items-start gap-2">
              <IconCheck size={15} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong className="font-black text-slate-900">ป้าย HOP Premium Badge:</strong> เพิ่มความน่าเชื่อถือบนโปรไฟล์และลำดับจับคู่ไวขึ้น
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onUnlockPremium}
              className="flex-1 bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-black text-xs py-3 rounded-xl shadow-md transition"
            >
              ทดลองเปิด HOP Premium ทันที (฿49/ด.)
            </button>
            <button
              type="button"
              onClick={onOpenPremiumModal}
              className="px-3 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-[11px] hover:bg-slate-100 transition"
            >
              ดูแผนธุรกิจ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col bg-slate-900 text-white overflow-hidden ${compact ? '' : 'pb-[84px]'}`}>
      {/* Top Status Strip */}
      {!compact && (
        <div className="px-4 pt-3 pb-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <IconSparkle size={16} />
            </div>
            <div>
              <h2 className="text-sm font-black text-white leading-tight">HOP AI Concierge</h2>
              <p className="text-[10px] text-emerald-400 font-bold">
                HOP Premium Active • Interactive Slot-Filling
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold bg-slate-800 border border-slate-700 px-2 py-1 rounded-lg text-slate-300 tabular-nums">
            Watchers: {watchers.length}
          </span>
        </div>
      )}

      {/* Active Auto-Book Watchers List */}
      <div className="px-3.5 py-2.5 bg-slate-950/70 border-b border-slate-800 max-h-[165px] overflow-y-auto custom-scroll">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-black text-orange-400 flex items-center gap-1">
            <IconClock size={12} />
            <span>รายการเฝ้าจองอัตโนมัติ (Active Auto-Book Watchers)</span>
          </span>
          <span className="text-[9px] text-slate-400 font-medium">Guardrail ≤ 500m</span>
        </div>
        <div className="space-y-2">
          {watchers.map((w) => (
            <div
              key={w.id}
              className={`p-2.5 rounded-xl border text-[11px] transition ${
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
                  {w.status === 'booked' ? 'จองอัตโนมัติสำเร็จ!' : 'กำลังเฝ้าดู...'}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-300 tabular-nums">
                <span>
                  {w.timeLabel} • {w.seats} ที่นั่ง • เดิน ≤ {w.maxWalkMeters}m
                </span>
                {w.status === 'watching' ? (
                  <button
                    type="button"
                    onClick={() => onTriggerWatcherMatch(w.id)}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-black px-2 py-0.5 rounded-md text-[9px] shadow-sm transition"
                  >
                    จำลองคนเปิดทริปตรงเงื่อนไข
                  </button>
                ) : (
                  <span className="text-emerald-300 font-bold">
                    จับคู่กับ: {w.matchedHost}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 p-3.5 space-y-3 overflow-y-auto custom-scroll">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
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
                  <span>ปลายทาง: {m.slotSummary.destination || 'รอระบุ...'}</span>
                  <span>เวลา: {m.slotSummary.time || 'รอระบุ...'}</span>
                  <span>ที่นั่ง: {m.slotSummary.seats ? `${m.slotSummary.seats} ที่` : 'รอระบุ...'}</span>
                  <span className="col-span-2 text-emerald-300">
                    ระยะเดินสูงสุด: {m.slotSummary.maxWalkMeters !== undefined ? `≤ ${m.slotSummary.maxWalkMeters}m` : 'รอระบุ (ไม่เกิน 500m)'}
                  </span>
                </div>
              )}
            </div>
            <span className="text-[9px] text-slate-400 mt-1 px-1 tabular-nums">{m.timestamp}</span>
          </div>
        ))}

        {/* Quick Interactive Slot-Filling Chips based on current step */}
        <div className="pt-1">
          {slotStep === 'idle' && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400">
                กดเลือกประโยคตัวอย่างเพื่อทดสอบ Interactive Slot-Filling:
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
              {['1 ที่นั่งครับ', '2 ที่นั่ง (ไปกับเพื่อน)', '3 ที่นั่ง'].map((chip) => (
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

          {slotStep === 'ask_pickup' && (
            <div className="flex flex-wrap gap-1.5">
              {[
                'ขึ้นที่หน้าตึก SIIT รังสิต เลยครับ',
                'รับที่ TU Dome Plaza',
                'รับที่หน้า Kave TU Rangsit',
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
                'ลองพิมพ์เกินลิมิต: 800 เมตร',
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
        className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            slotStep === 'idle'
              ? 'พิมพ์สั่ง AI เช่น ไปคอนโด B ตอน 9.00...'
              : 'พิมพ์ตอบคำถาม AI หรือกดปุ่มด้านบน...'
          }
          className="flex-1 bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-xs font-bold px-3.5 py-2.5 rounded-xl focus:border-orange-500"
        />
        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition shrink-0"
        >
          ส่ง
        </button>
      </form>
    </div>
  );
};
