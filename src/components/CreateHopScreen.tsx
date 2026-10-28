import React, { useState } from 'react';
import {
  CAMPUS_LOCATIONS,
  VIBE_CATEGORIES,
  type BookingMode,
  type HostType,
  type RideHop,
  type SeatId,
  type UserProfile,
} from '../data/mockData';
import {
  DriverBunnySvg,
  IconCar,
  IconCheck,
  IconClock,
  IconLeaf,
  IconPin,
  IconShieldCheck,
  IconUsers,
  PassengerBunnySvg,
} from './Icons';

interface CreateHopScreenProps {
  userProfile: UserProfile;
  isTablet?: boolean;
  onCreateRide: (ride: RideHop) => void;
}

export const CreateHopScreen: React.FC<CreateHopScreenProps> = ({
  userProfile,
  isTablet = false,
  onCreateRide,
}) => {
  const [hostType, setHostType] = useState<HostType>('driver');
  const [mode, setMode] = useState<BookingMode>('realtime');
  const [origin, setOrigin] = useState('SIIT รังสิต');
  const [destination, setDestination] = useState('SIIT บางกระดี่');
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const commissionFee = Math.max(4, Math.round(baseFare * 0.12));

  const toggleVibe = (tag: string) => {
    setSelectedVibes((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const handleConfirmedCreate = () => {
    const allSeats: SeatId[] = ['F1', 'R1', 'R2', 'R3'];
    const occupiedCount = Math.max(0, 4 - seats);
    const occupiedSeats = allSeats.slice(4 - occupiedCount);

    const newRide: RideHop = {
      id: `hop-custom-${Date.now()}`,
      hostName: userProfile.name,
      faculty: userProfile.faculty,
      rating: 5.0,
      hostType,
      vehicleLabel:
        hostType === 'driver'
          ? `${userProfile.carBrand} • ${userProfile.carColor}`
          : 'หารรถ GrabCar / Bolt',
      licensePlate: hostType === 'driver' ? userProfile.carLicense : undefined,
      origin,
      destination,
      actualDropOffName:
        dropOffMeters === 0
          ? `หน้าจุดหมาย ${destination}`
          : `จุดจอดใกล้ ${destination} (เดิน ${dropOffMeters}m)`,
      pickupMeters: 15,
      dropOffMeters,
      mode,
      scheduleLabel: mode === 'prebook' ? scheduleLabel : 'พร้อมออกเดินทางทันที',
      seatsLeft: seats,
      totalSeats: 4,
      occupiedSeats,
      baseFare,
      commissionFee,
      vibes: selectedVibes.length > 0 ? selectedVibes : ['Indie', 'สายชวนคุย'],
      ig: userProfile.ig,
      facebook: userProfile.facebook,
      bioNote,
      co2SavedKg: destination.includes('บางกระดี่') ? 2.6 : 1.3,
    };

    setShowConfirmModal(false);
    onCreateRide(newRide);
  };

  return (
    <form
      onSubmit={handleOpenConfirm}
      className={`flex-1 p-4 ${
        isTablet ? 'pb-8' : 'pb-28'
      } bg-slate-50 overflow-y-auto custom-scroll space-y-3.5 relative`}
    >
      <div>
        <h2 className="text-lg font-black text-slate-900">เปิดตี้สร้างทริป</h2>
        <p className="text-[11px] text-slate-600 font-medium">
          เลือกบทบาทและระบุเส้นทางเพื่อหาเพื่อนร่วมทางในมหาวิทยาลัย
        </p>
      </div>

      <div
        className={
          isTablet
            ? 'grid grid-cols-2 gap-4 items-start'
            : 'space-y-3.5'
        }
      >
        <div className="space-y-3.5">
          {/* Role Selector: Driver vs Co-hopper (No Fuel Info) */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setHostType('driver')}
              className={`p-3 rounded-2xl border-2 text-left active:scale-95 transition flex flex-col gap-1.5 ${
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
              <div className="text-xs font-black text-slate-900">มีรถส่วนตัว</div>
              <div className="text-[10px] text-slate-600 font-medium leading-snug">
                รับเพื่อนที่ไปทางเดียวกัน ช่วยแบ่งเบาค่าเดินทาง
              </div>
            </button>

            <button
              type="button"
              onClick={() => setHostType('cohopper')}
              className={`p-3 rounded-2xl border-2 text-left active:scale-95 transition flex flex-col gap-1.5 ${
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
              <div className="text-xs font-black text-slate-900">หารรถ Grab / Bolt</div>
              <div className="text-[10px] text-slate-600 font-medium leading-snug">
                ตกรถตู้มธ. หาเพื่อนเรียกรถไปด้วยกัน ไม่ต้องจ่ายเต็มคนเดียว
              </div>
            </button>
          </div>

          {/* Vehicle Preview Card when Driver is selected (Model, Color, Plate only) */}
          {hostType === 'driver' && (
            <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-orange-500 flex items-center justify-center">
                  <IconCar size={18} />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">
                    {userProfile.carBrand} • {userProfile.carColor}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    ข้อมูลรถที่จะแสดงให้เพื่อนร่วมทางเห็นตอนขึ้นรถ
                  </div>
                </div>
              </div>
              <span className="font-mono font-black text-xs bg-slate-100 border border-slate-300 text-slate-800 px-2.5 py-1 rounded-lg">
                {userProfile.carLicense}
              </span>
            </div>
          )}

          {/* Booking Mode Toggle */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-2.5 shadow-sm">
            <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setMode('realtime')}
                className={`min-h-[44px] py-2 rounded-lg text-xs font-black active:scale-95 transition ${
                  mode === 'realtime'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                เดินทางตอนนี้
              </button>
              <button
                type="button"
                onClick={() => setMode('prebook')}
                className={`min-h-[44px] py-2 rounded-lg text-xs font-black active:scale-95 transition ${
                  mode === 'prebook'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                จองล่วงหน้า
              </button>
            </div>

            {/* Route Inputs */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-black text-slate-600 flex items-center gap-1 mb-1">
                  <IconPin size={12} className="text-orange-500" />
                  <span>จุดรับขึ้นรถ</span>
                </label>
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full min-h-[44px] bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900"
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
                  <span>จุดหมายปลายทาง</span>
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full min-h-[44px] bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900"
                >
                  {CAMPUS_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Prebook Schedule (only when prebook) & Drop-off Distance */}
            <div
              className={`grid gap-2 ${
                mode === 'prebook' ? 'grid-cols-2' : 'grid-cols-1'
              }`}
            >
              {mode === 'prebook' && (
                <div>
                  <label className="text-[10px] font-black text-slate-600 flex items-center gap-1 mb-1">
                    <IconClock size={12} className="text-orange-500" />
                    <span>วัน-เวลานัดหมาย</span>
                  </label>
                  <input
                    type="text"
                    value={scheduleLabel}
                    onChange={(e) => setScheduleLabel(e.target.value)}
                    className="w-full min-h-[44px] bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900"
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] font-black text-slate-600 block mb-1">
                  ระยะเดินจากจุดส่ง (≤ 500m)
                </label>
                <select
                  value={dropOffMeters}
                  onChange={(e) => setDropOffMeters(Number(e.target.value))}
                  className="w-full min-h-[44px] bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 tabular-nums"
                >
                  <option value={0}>ถึงหน้าจุดหมาย (0m)</option>
                  <option value={100}>ป้ายใกล้เคียง (เดิน 100m)</option>
                  <option value={200}>หน้าปากซอย (เดิน 200m)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3.5">
          {/* Seats & Fare Split Summary */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-2.5 shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-600 flex items-center gap-1 mb-1">
                  <IconUsers size={12} className="text-orange-500" />
                  <span>จำนวนที่นั่งว่าง</span>
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setSeats(n)}
                      className={`flex-1 min-h-[42px] py-1.5 rounded-xl text-xs font-black border tabular-nums active:scale-95 transition ${
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
                  <span>ค่ารถต่อที่นั่ง (฿)</span>
                </label>
                <input
                  type="number"
                  min={15}
                  max={150}
                  value={baseFare}
                  onChange={(e) => setBaseFare(Number(e.target.value))}
                  className="w-full min-h-[42px] bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-sm font-black text-orange-600 tabular-nums"
                />
              </div>
            </div>

            {/* Clear Step-by-Step Fare Breakdown + Eco Impact on the Very Last Line */}
            <div className="bg-orange-50/80 border border-orange-200 rounded-xl p-2.5 text-[10px] space-y-1 tabular-nums">
              <div className="flex justify-between font-bold text-slate-700">
                <span>ค่าโดยสารปกติ (หารต่อคน):</span>
                <span>฿{baseFare + commissionFee} (ค่ารถ ฿{baseFare} + บริการ ฿{commissionFee})</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-700">
                <span>ส่วนลดจาก HOP Premium:</span>
                <span>-฿{commissionFee}</span>
              </div>
              <div className="flex justify-between items-baseline pt-1 border-t border-orange-200 font-black text-slate-900">
                <span>ราคาสุทธิที่ต้องชำระ (สำหรับสมาชิก HOP Premium):</span>
                <span className="text-sm text-orange-600 font-mono">฿{baseFare}/คน</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-orange-200/70 font-black text-emerald-700">
                <span className="flex items-center gap-1">
                  <IconLeaf size={12} />
                  <span>ช่วยลดคาร์บอนจากการเดินทางร่วมกัน:</span>
                </span>
                <span>~1.8 kg CO₂</span>
              </div>
            </div>
          </div>

          {/* Vibe Tags Selection */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-2 shadow-sm">
            <div className="text-xs font-black text-slate-900">
              เลือก Vibe ประจำทริปนี้
            </div>
            <div className="flex flex-wrap gap-1.5">
              {VIBE_CATEGORIES.flatMap((c) => c.tags).map((tag) => {
                const active = selectedVibes.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleVibe(tag)}
                    className={`min-h-[34px] text-[10px] px-3 py-1 rounded-full font-bold border active:scale-95 transition ${
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
              className="w-full min-h-[44px] mt-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
            />
          </div>

          <button
            type="submit"
            className="w-full min-h-[48px] bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black text-sm py-3.5 rounded-2xl shadow-lg transition"
          >
            ตรวจสอบและเปิดตี้สร้างทริป →
          </button>
        </div>
      </div>

      {/* Double Confirmation Bottom Sheet / Modal before Creating Ride */}
      {showConfirmModal && (
        <div
          onClick={() => setShowConfirmModal(false)}
          className="fixed sm:absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] z-50 flex items-end md:items-center justify-center p-0 md:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white text-slate-900 rounded-t-[32px] md:rounded-3xl p-4 pb-6 md:pb-4 w-full md:max-w-[400px] border-2 border-orange-500 shadow-2xl space-y-3 animate-[sheet-rise_0.22s_cubic-bezier(0.22,1,0.36,1)] safe-bottom"
          >
            <div
              className="w-11 h-1.5 rounded-full bg-slate-300 mx-auto mb-1"
              aria-hidden="true"
            />
            <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
              <IconShieldCheck size={18} className="text-orange-500" />
              <span>ยืนยันการเปิดตี้สร้างทริป</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs space-y-1.5 tabular-nums">
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">รูปแบบ:</span>
                <span className="font-black text-slate-900">
                  {hostType === 'driver' ? 'มีรถส่วนตัว' : 'หารรถ Grab / Bolt'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">เส้นทาง:</span>
                <span className="font-black text-slate-900">
                  {origin} → {destination}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">เวลาเดินทาง:</span>
                <span className="font-bold text-orange-600">
                  {mode === 'realtime' ? 'พร้อมออกเดินทางทันที' : scheduleLabel}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">ที่นั่งว่างรับเพิ่ม:</span>
                <span className="font-black text-slate-900">{seats} ที่นั่ง</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-slate-200">
                <span className="text-slate-700 font-black">ราคาหารต่อที่นั่ง:</span>
                <span className="font-black text-orange-600 font-mono text-sm">
                  ฿{baseFare} (+บริการ ฿{commissionFee})
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="min-h-[46px] py-2.5 rounded-xl border border-slate-300 text-slate-700 font-black text-xs active:scale-95 transition"
              >
                กลับไปแก้ไข
              </button>
              <button
                type="button"
                onClick={handleConfirmedCreate}
                className="min-h-[46px] py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md active:scale-95 transition"
              >
                ยืนยันเปิดตี้
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
