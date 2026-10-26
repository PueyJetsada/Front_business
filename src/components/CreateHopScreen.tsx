import React, { useState } from 'react';
import {
  CAMPUS_LOCATIONS,
  VIBE_CATEGORIES,
  type BookingMode,
  type HostType,
  type RideHop,
  type UserProfile,
} from '../data/mockData';
import {
  DriverBunnySvg,
  IconCar,
  IconCheck,
  IconClock,
  IconLeaf,
  IconPin,
  IconUsers,
  PassengerBunnySvg,
} from './Icons';

interface CreateHopScreenProps {
  userProfile: UserProfile;
  onCreateRide: (ride: RideHop) => void;
}

export const CreateHopScreen: React.FC<CreateHopScreenProps> = ({
  userProfile,
  onCreateRide,
}) => {
  const [hostType, setHostType] = useState<HostType>('driver');
  const [mode, setMode] = useState<BookingMode>('realtime');
  const [origin, setOrigin] = useState('SIIT รังสิต');
  const [destination, setDestination] = useState('SIIT บางกระดี่');
  const [departMinutes, setDepartMinutes] = useState(10);
  const [scheduleLabel, setScheduleLabel] = useState('พรุ่งนี้ • 09:00 น.');
  const [seats, setSeats] = useState(3);
  const [baseFare, setBaseFare] = useState(35);
  const [dropOffMeters, setDropOffMeters] = useState(0);
  const [selectedVibes, setSelectedVibes] = useState<string[]>(
    userProfile.vibes.slice(0, 4)
  );
  const [bioNote, setBioNote] = useState(
    'ออกตรงเวลาหน้าตึก SIIT รังสิต เปิดเพลงชิลๆ แอร์เย็น มาหารค่ารถกันครับ!'
  );

  const commissionFee = Math.max(4, Math.round(baseFare * 0.12));

  const toggleVibe = (tag: string) => {
    setSelectedVibes((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRide: RideHop = {
      id: `hop-custom-${Date.now()}`,
      hostName: userProfile.name,
      faculty: userProfile.faculty,
      rating: 5.0,
      hostType,
      vehicleLabel:
        hostType === 'driver'
          ? `${userProfile.carBrand} (${userProfile.carType.split(' ')[0]})`
          : 'หาร GrabCar / Bolt (4 ที่นั่ง)',
      licensePlate: hostType === 'driver' ? userProfile.carLicense : undefined,
      origin,
      destination,
      actualDropOffName:
        dropOffMeters === 0
          ? `ถึงหน้าจุดหมาย ${destination} (0m)`
          : `จุดจอดใกล้ ${destination} (เดิน ${dropOffMeters}m)`,
      pickupMeters: 15,
      dropOffMeters,
      mode,
      departMinutes: mode === 'realtime' ? departMinutes : undefined,
      scheduleLabel: mode === 'prebook' ? scheduleLabel : undefined,
      seatsLeft: seats,
      totalSeats: seats,
      baseFare,
      commissionFee,
      vibes: selectedVibes.length > 0 ? selectedVibes : ['Indie', 'สายชวนคุย'],
      ig: userProfile.ig,
      facebook: userProfile.facebook,
      bioNote,
      co2SavedKg: destination.includes('บางกระดี่') ? 2.6 : 1.3,
    };

    onCreateRide(newRide);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex-1 p-4 pb-28 bg-slate-50 overflow-y-auto custom-scroll space-y-3.5"
    >
      <div>
        <h2 className="text-lg font-black text-slate-900">เปิดตี้สร้างทริป (Create Hop)</h2>
        <p className="text-[11px] text-slate-600 font-medium">
          เลือกบทบาทของคุณเพื่อหาเพื่อนร่วมทาง SIIT / ม.ธรรมศาสตร์
        </p>
      </div>

      {/* Role Selector: Driver vs Co-hopper */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => setHostType('driver')}
          className={`p-3 rounded-2xl border-2 text-left transition flex flex-col gap-1.5 ${
            hostType === 'driver'
              ? 'bg-orange-50 border-orange-500 shadow-sm'
              : 'bg-white border-slate-200 hover:border-orange-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <DriverBunnySvg size={32} />
            {hostType === 'driver' && (
              <span className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center">
                <IconCheck size={12} />
              </span>
            )}
          </div>
          <div className="text-xs font-black text-slate-900">คนมีรถหาคนหาร (Driver)</div>
          <div className="text-[10px] text-slate-600 font-medium leading-snug">
            ช่วยประหยัดค่าน้ำมัน ค่าแก๊ส หรือค่าชาร์จไฟฟ้า EV
          </div>
        </button>

        <button
          type="button"
          onClick={() => setHostType('cohopper')}
          className={`p-3 rounded-2xl border-2 text-left transition flex flex-col gap-1.5 ${
            hostType === 'cohopper'
              ? 'bg-orange-50 border-orange-500 shadow-sm'
              : 'bg-white border-slate-200 hover:border-orange-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <PassengerBunnySvg size={32} />
            {hostType === 'cohopper' && (
              <span className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center">
                <IconCheck size={12} />
              </span>
            )}
          </div>
          <div className="text-xs font-black text-slate-900">แชร์ Grab/Bolt (Co-hopper)</div>
          <div className="text-[10px] text-slate-600 font-medium leading-snug">
            ตกรถตู้มธ. หาเพื่อนหารค่า Grab/Bolt ไม่ต้องจ่ายเต็มคนเดียว
          </div>
        </button>
      </div>

      {/* Booking Mode Toggle */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-2.5 shadow-sm">
        <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setMode('realtime')}
            className={`py-2 rounded-lg text-xs font-black transition ${
              mode === 'realtime'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            เดินทางตอนนี้ (Now)
          </button>
          <button
            type="button"
            onClick={() => setMode('prebook')}
            className={`py-2 rounded-lg text-xs font-black transition ${
              mode === 'prebook'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            จองล่วงหน้า (Pre-book)
          </button>
        </div>

        {/* Route Inputs */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-black text-slate-600 flex items-center gap-1 mb-1">
              <IconPin size={12} className="text-orange-500" />
              <span>จุดเริ่มต้น (Origin)</span>
            </label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900"
            >
              {CAMPUS_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-600 flex items-center gap-1 mb-1">
              <IconPin size={12} className="text-teal-600" />
              <span>จุดปลายทาง (Drop-off)</span>
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900"
            >
              {CAMPUS_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Time & Drop-off Distance */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-black text-slate-600 flex items-center gap-1 mb-1">
              <IconClock size={12} className="text-orange-500" />
              <span>{mode === 'realtime' ? 'ออกในอีก (นาที)' : 'วัน-เวลาเดินทาง'}</span>
            </label>
            {mode === 'realtime' ? (
              <select
                value={departMinutes}
                onChange={(e) => setDepartMinutes(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 tabular-nums"
              >
                <option value={5}>ออกใน 5 นาที</option>
                <option value={10}>ออกใน 10 นาที</option>
                <option value={15}>ออกใน 15 นาที</option>
              </select>
            ) : (
              <input
                type="text"
                value={scheduleLabel}
                onChange={(e) => setScheduleLabel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900"
              />
            )}
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-600 block mb-1">
              ระยะห่างจุดส่ง (≤ 500m)
            </label>
            <select
              value={dropOffMeters}
              onChange={(e) => setDropOffMeters(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 tabular-nums"
            >
              <option value={0}>ส่งตรงจุดหมายเป๊ะ (0m)</option>
              <option value={100}>ป้ายใกล้เคียง (เดิน 100m)</option>
              <option value={200}>หน้าปากซอย (เดิน 200m)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Seats & Fare Split Summary */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-2.5 shadow-sm">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-black text-slate-600 flex items-center gap-1 mb-1">
              <IconUsers size={12} className="text-orange-500" />
              <span>ที่นั่งว่างรับเพิ่ม</span>
            </label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setSeats(n)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-black border tabular-nums transition ${
                    seats === n
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-600 flex items-center gap-1 mb-1">
              <IconCar size={12} className="text-teal-600" />
              <span>ราคาหารต่อคน (฿)</span>
            </label>
            <input
              type="number"
              min={15}
              max={150}
              value={baseFare}
              onChange={(e) => setBaseFare(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-sm font-black text-orange-600 tabular-nums"
            />
          </div>
        </div>

        {/* Transparent Platform Revenue & Eco Split Box */}
        <div className="bg-orange-50/80 border border-orange-200 rounded-xl p-2.5 text-[10px] space-y-1 tabular-nums">
          <div className="flex justify-between font-bold text-slate-700">
            <span>ค่ารถหารต่อคน (Host รับเต็ม):</span>
            <span>฿{baseFare}</span>
          </div>
          <div className="flex justify-between font-bold text-slate-700">
            <span>ค่าธรรมเนียมแพลตฟอร์ม (Primary Revenue):</span>
            <span>+฿{commissionFee} (HOP Premium ฟรี!)</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-orange-200 font-black text-emerald-700">
            <span className="flex items-center gap-1">
              <IconLeaf size={12} />
              <span>ช่วยลดคาร์บอน (Eco Impact):</span>
            </span>
            <span>~1.8 kg CO₂</span>
          </div>
        </div>
      </div>

      {/* Vibe Tags Selection */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-2 shadow-sm">
        <div className="text-xs font-black text-slate-900">
          เลือก Vibe ประจำทริปนี้ (ใช้คำนวณ % Match)
        </div>
        <div className="flex flex-wrap gap-1.5">
          {VIBE_CATEGORIES.flatMap((c) => c.tags).map((tag) => {
            const active = selectedVibes.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleVibe(tag)}
                className={`text-[10px] px-2.5 py-1 rounded-full font-bold border transition ${
                  active
                    ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-orange-300'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
        <input
          type="text"
          value={bioNote}
          onChange={(e) => setBioNote(e.target.value)}
          placeholder="ข้อความสั้นๆ ถึงเพื่อนร่วมทาง..."
          className="w-full mt-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-black text-sm py-3.5 rounded-2xl shadow-lg transition"
      >
        เปิดตี้สร้างทริปตอนนี้เลย →
      </button>
    </form>
  );
};
