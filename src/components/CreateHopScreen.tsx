import React, { useState } from 'react';
import {
  CAMPUS_LOCATIONS,
  getSeatPositionsByType,
  MPV_SEAT_POSITIONS,
  SEDAN_SEAT_POSITIONS,
  SUV_SEAT_POSITIONS,
  VEHICLE_COLOR_OPTIONS,
  VIBE_CATEGORIES,
  type BookingMode,
  type RideHop,
  type SeatId,
  type UserProfile,
  type VehicleSeatType,
} from '../data/mockData';
import {
  DriverBunnySvg,
  IconCar,
  IconCheck,
  IconClock,
  IconLeaf,
  IconPin,
  IconShieldCheck,
  IconSteeringWheel,
  IconUsers,
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
  const [vehicleType, setVehicleType] = useState<VehicleSeatType>(
    userProfile.carType || 'sedan'
  );
  const [carBrand, setCarBrand] = useState<string>(
    userProfile.carBrand || 'BYD Dolphin'
  );
  const [carColor, setCarColor] = useState<string>(
    userProfile.carColor || 'สีขาว'
  );
  const [carLicense, setCarLicense] = useState<string>(
    userProfile.carLicense || '1กฒ 8899'
  );

  const [mode, setMode] = useState<BookingMode>('realtime');
  const [origin, setOrigin] = useState('SIIT รังสิต');
  const [destination, setDestination] = useState('SIIT บางกระดี่');
  const [scheduleLabel, setScheduleLabel] = useState('พรุ่งนี้ • 09:00 น.');

  const totalSeatsForType =
    vehicleType === 'suv' || vehicleType === 'mpv' ? 6 : 4;
  const [seats, setSeats] = useState<number>(3);

  // Numeric-only state for iOS numeric keypad (Point 6)
  const [baseFare, setBaseFare] = useState<number>(35);
  const [baseFareInput, setBaseFareInput] = useState<string>('35');

  const [dropOffMeters, setDropOffMeters] = useState<number>(0);
  const [selectedVibes, setSelectedVibes] = useState<string[]>(
    userProfile.vibes.slice(0, 4)
  );
  const [bioNote, setBioNote] = useState(
    'ออกตรงเวลาหน้าตึก SIIT รังสิต เปิดเพลงชิลๆ แอร์เย็น มาหารค่ารถกันครับ!'
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const effectiveBaseFare = Math.max(1, baseFare || 35);
  const commissionFee = Math.max(4, Math.round(effectiveBaseFare * 0.12));

  const handleSelectVehicleType = (nextType: VehicleSeatType) => {
    setVehicleType(nextType);
    const maxSeats = nextType === 'suv' || nextType === 'mpv' ? 6 : 4;
    if (seats > maxSeats) {
      setSeats(maxSeats);
    } else if ((nextType === 'suv' || nextType === 'mpv') && seats === 3) {
      setSeats(4);
    }
  };

  const handleFareInputChange = (raw: string) => {
    // Strip any non-digit character so only positive integers are allowed
    const digitsOnly = raw.replace(/[^0-9]/g, '');
    setBaseFareInput(digitsOnly);
    const parsed = parseInt(digitsOnly, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      setBaseFare(Math.min(500, parsed));
    } else {
      setBaseFare(0);
    }
  };

  const handleFareInputBlur = () => {
    const valid = Math.max(10, Math.min(500, baseFare || 35));
    setBaseFare(valid);
    setBaseFareInput(String(valid));
  };

  const toggleVibe = (tag: string) => {
    setSelectedVibes((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const seatPositions = getSeatPositionsByType(vehicleType, totalSeatsForType);
  const allSeatIds: SeatId[] = seatPositions.map((s) => s.id);
  const occupiedCount = Math.max(0, totalSeatsForType - seats);
  const previewOccupiedSeats: SeatId[] = allSeatIds.slice(
    totalSeatsForType - occupiedCount
  );

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    handleFareInputBlur();
    setShowConfirmModal(true);
  };

  const handleConfirmedCreate = () => {
    const cleanBrand = carBrand.trim() || userProfile.carBrand || 'Honda Civic';
    const cleanColor = carColor.trim() || userProfile.carColor || 'สีขาว';
    const cleanLicense = carLicense.trim() || userProfile.carLicense || 'กข 1234';
    const typeSuffix =
      vehicleType === 'mpv'
        ? ' (MPV 7 ที่นั่ง)'
        : vehicleType === 'suv'
          ? ' (SUV 7 ที่นั่ง)'
          : '';

    const newRide: RideHop = {
      id: `hop-custom-${Date.now()}`,
      hostName: userProfile.name,
      faculty: userProfile.faculty,
      rating: 5.0,
      hostType: 'driver',
      vehicleType,
      carColor: cleanColor,
      vehicleLabel: `${cleanBrand}${typeSuffix} • ${cleanColor}`,
      licensePlate: cleanLicense,
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
      totalSeats: totalSeatsForType,
      occupiedSeats: previewOccupiedSeats,
      baseFare: effectiveBaseFare,
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
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-black text-slate-900">
            เปิดตี้สร้างทริป (สำหรับผู้มีรถส่วนตัว)
          </h2>
          <p className="text-[11px] text-slate-600 font-medium">
            ระบุข้อมูลรถยนต์ สีรถ เส้นทาง และที่นั่งว่างเพื่อรับเพื่อนร่วมทาง
          </p>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0">
          <DriverBunnySvg size={28} />
        </div>
      </div>

      <div
        className={
          isTablet ? 'grid grid-cols-2 gap-4 items-start' : 'space-y-3.5'
        }
      >
        <div className="space-y-3.5">
          {/* Driver Vehicle Information: Type (Sedan 4 seats vs SUV 7 seats), Model, Color, License Plate */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 text-orange-500 flex items-center justify-center">
                  <IconCar size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900">
                    ข้อมูลรถยนต์และประเภทรถ
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold">
                    แสดงรุ่นรถ สีรถ และป้ายทะเบียนในการ์ดทริป
                  </p>
                </div>
              </div>
              <span className="plate-badge bg-slate-900 text-amber-300 border border-amber-400 px-2.5 py-0.5 rounded-md font-mono font-black text-[10px] shadow-sm">
                {carLicense || 'กข 1234'}
              </span>
            </div>

            {/* Vehicle Type Selector (Sedan 4 passenger seats vs SUV 2-3-2 vs MPV 2-2-3) */}
            <div>
              <label className="text-[10px] font-black text-slate-600 block mb-1">
                ประเภทรถ (ปรับผังที่นั่งอัตโนมัติ)
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSelectVehicleType('sedan')}
                  className={`min-h-[50px] p-2 rounded-xl border-2 text-left transition ${
                    vehicleType === 'sedan'
                      ? 'bg-orange-50 border-orange-500 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-black text-slate-900">
                      รถเก๋ง / Sedan
                    </span>
                    {vehicleType === 'sedan' && (
                      <span className="w-3.5 h-3.5 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0">
                        <IconCheck size={9} />
                      </span>
                    )}
                  </div>
                  <div className="text-[8px] font-bold text-slate-500 mt-0.5 leading-tight">
                    แถวหน้า 2 • หลัง 3 (4 ที่นั่ง)
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectVehicleType('suv')}
                  className={`min-h-[50px] p-2 rounded-xl border-2 text-left transition ${
                    vehicleType === 'suv'
                      ? 'bg-orange-50 border-orange-500 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-black text-slate-900">
                      รถ SUV (2-3-2)
                    </span>
                    {vehicleType === 'suv' && (
                      <span className="w-3.5 h-3.5 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0">
                        <IconCheck size={9} />
                      </span>
                    )}
                  </div>
                  <div className="text-[8px] font-bold text-slate-500 mt-0.5 leading-tight">
                    หน้า 2 • สอง 3 • สาม 2 (6 ที่นั่ง)
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectVehicleType('mpv')}
                  className={`min-h-[50px] p-2 rounded-xl border-2 text-left transition ${
                    vehicleType === 'mpv'
                      ? 'bg-orange-50 border-orange-500 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-black text-slate-900">
                      รถ MPV (2-2-3)
                    </span>
                    {vehicleType === 'mpv' && (
                      <span className="w-3.5 h-3.5 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0">
                        <IconCheck size={9} />
                      </span>
                    )}
                  </div>
                  <div className="text-[8px] font-bold text-slate-500 mt-0.5 leading-tight">
                    หน้า 2 • กลาง 2 เบาะแยก • หลัง 3
                  </div>
                </button>
              </div>
            </div>

            {/* Car Model, Vehicle Color & License Plate Inputs */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-black text-slate-600 block mb-1">
                  รุ่นรถ
                </label>
                <input
                  type="text"
                  value={carBrand}
                  onChange={(e) => setCarBrand(e.target.value)}
                  placeholder="เช่น BYD Dolphin"
                  className="w-full min-h-[42px] bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-600 block mb-1">
                  สีรถ (Vehicle Color)
                </label>
                <input
                  type="text"
                  value={carColor}
                  onChange={(e) => setCarColor(e.target.value)}
                  placeholder="เช่น สีขาว"
                  className="w-full min-h-[42px] bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-600 block mb-1">
                  ป้ายทะเบียน
                </label>
                <input
                  type="text"
                  value={carLicense}
                  onChange={(e) => setCarLicense(e.target.value)}
                  placeholder="เช่น 1กฒ 8899"
                  className="w-full min-h-[42px] bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 font-mono"
                />
              </div>
            </div>

            {/* Quick Vehicle Color Chips */}
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-500 block">
                เลือกสีรถด่วน:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {VEHICLE_COLOR_OPTIONS.map((colorOpt) => {
                  const isSelected = carColor.trim() === colorOpt;
                  return (
                    <button
                      key={colorOpt}
                      type="button"
                      onClick={() => setCarColor(colorOpt)}
                      className={`min-h-[30px] px-2.5 py-0.5 rounded-full text-[10px] font-black border transition ${
                        isSelected
                          ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:border-orange-300'
                      }`}
                    >
                      {colorOpt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Booking Mode Toggle & Route Inputs */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2.5 shadow-sm">
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

            {/* Prebook Schedule & Drop-off Distance */}
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
          {/* Dynamic Seats, Numeric-Only iOS Fare Input & Live Seat Layout Preview */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-600 flex items-center gap-1 mb-1">
                  <IconUsers size={12} className="text-orange-500" />
                  <span>
                    {`จำนวนที่นั่งว่าง (สูงสุด ${totalSeatsForType} ที่นั่ง)`}
                  </span>
                </label>
                <div
                  className={`grid gap-1.5 ${
                    vehicleType === 'suv' || vehicleType === 'mpv'
                      ? 'grid-cols-6'
                      : 'grid-cols-4'
                  }`}
                >
                  {(vehicleType === 'suv' || vehicleType === 'mpv'
                    ? [1, 2, 3, 4, 5, 6]
                    : [1, 2, 3, 4]
                  ).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setSeats(n)}
                      className={`min-h-[42px] py-1.5 rounded-xl text-xs font-black border tabular-nums active:scale-95 transition ${
                        seats === n
                          ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
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
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={baseFareInput}
                  onChange={(e) => handleFareInputChange(e.target.value)}
                  onBlur={handleFareInputBlur}
                  placeholder="35"
                  aria-label="ค่ารถต่อที่นั่ง (บาท)"
                  className="no-spinner appearance-none w-full min-h-[42px] bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-sm font-black text-orange-600 font-mono tabular-nums"
                />
              </div>
            </div>

            {/* Live Dynamic Seat Layout Preview (Sedan 2-Row vs SUV 2-3-2 vs MPV 2-2-3 Captain Seats) */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black text-slate-700">
                <span>
                  {vehicleType === 'mpv'
                    ? 'ผังที่นั่ง รถ MPV (แถวหน้า 2 • แถวกลาง 2 เบาะแยก • หลังสุด 3)'
                    : vehicleType === 'suv'
                      ? 'ผังที่นั่ง รถ SUV (แถวหน้า 2 • แถวสอง 3 • แถวสาม 2)'
                      : 'ผังที่นั่ง รถเก๋ง / Sedan (แถวหน้า 2 • แถวหลัง 3)'}
                </span>
                <span className="text-emerald-700 shrink-0 ml-1">
                  {`ว่าง ${seats}/${totalSeatsForType} ที่นั่ง`}
                </span>
              </div>

              <div className="mx-auto max-w-[245px] bg-slate-100 border-2 border-slate-700 rounded-t-[32px] rounded-b-[18px] p-2 space-y-1.5">
                <div className="h-4 bg-sky-100 border border-slate-400 rounded-t-[16px] rounded-b text-[8px] font-black text-slate-600 flex items-center justify-center">
                  หน้ารถ (ทิศทางเดินทาง ▲)
                </div>

                {/* Row 1: Front Passenger + Driver (2 คน) */}
                <div className="text-[7px] font-black text-slate-500 text-center">
                  แถวหน้า: 2 คน (คนขับ 1 + ข้างคนขับ 1)
                </div>
                <div className="grid grid-cols-2 gap-2.5 px-1.5">
                  <div
                    className={`h-11 rounded-xl border-2 flex flex-col items-center justify-center text-[8px] font-black ${
                      previewOccupiedSeats.includes('F1')
                        ? 'bg-slate-200 border-slate-300 text-slate-400'
                        : 'bg-emerald-50 border-emerald-400 text-emerald-950'
                    }`}
                  >
                    <span>F1 • ข้างคนขับ</span>
                    <span>
                      {previewOccupiedSeats.includes('F1') ? 'ไม่ว่าง' : 'ว่าง'}
                    </span>
                  </div>
                  <div className="h-11 rounded-xl border-2 border-slate-700 bg-slate-800 text-white flex flex-col items-center justify-center text-[8px] font-black">
                    <IconSteeringWheel size={12} className="text-orange-400" />
                    <span>คนขับ</span>
                  </div>
                </div>

                {vehicleType === 'sedan' ? (
                  <>
                    <div className="text-[7px] font-black text-slate-500 text-center">
                      แถวหลัง: 3 คน
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['R1', 'R2', 'R3'] as SeatId[]).map((sid) => {
                        const occ = previewOccupiedSeats.includes(sid);
                        const meta = SEDAN_SEAT_POSITIONS.find(
                          (s) => s.id === sid
                        )!;
                        return (
                          <div
                            key={sid}
                            className={`h-11 rounded-xl border-2 flex flex-col items-center justify-center text-[8px] font-black ${
                              occ
                                ? 'bg-slate-200 border-slate-300 text-slate-400'
                                : 'bg-emerald-50 border-emerald-400 text-emerald-950'
                            }`}
                          >
                            <span>{meta.code}</span>
                            <span>{meta.shortLabel}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : vehicleType === 'mpv' ? (
                  <>
                    {/* MPV Row 2: 2 Captain Seats (เบาะแยก ปรับไฟฟ้า ไม่มีที่นั่งกลาง) */}
                    <div className="text-[7px] font-black text-slate-500 text-center">
                      แถวกลาง: 2 คน (เบาะแยก ปรับไฟฟ้า • ไม่มีที่นั่งกลาง)
                    </div>
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5 px-1">
                      {(() => {
                        const occ = previewOccupiedSeats.includes('M1');
                        const meta = MPV_SEAT_POSITIONS.find(
                          (s) => s.id === 'M1'
                        )!;
                        return (
                          <div
                            className={`h-11 rounded-xl border-2 flex flex-col items-center justify-center text-[8px] font-black ${
                              occ
                                ? 'bg-slate-200 border-slate-300 text-slate-400'
                                : 'bg-emerald-50 border-emerald-400 text-emerald-950'
                            }`}
                          >
                            <span>{meta.code}</span>
                            <span>{meta.shortLabel}</span>
                          </div>
                        );
                      })()}
                      <div className="h-10 px-1.5 rounded-lg border border-dashed border-slate-300 bg-slate-200/70 flex flex-col items-center justify-center text-[7px] font-black text-slate-500 leading-tight text-center">
                        <span>ทางเดิน</span>
                        <span>เบาะแยก</span>
                      </div>
                      {(() => {
                        const occ = previewOccupiedSeats.includes('M2');
                        const meta = MPV_SEAT_POSITIONS.find(
                          (s) => s.id === 'M2'
                        )!;
                        return (
                          <div
                            className={`h-11 rounded-xl border-2 flex flex-col items-center justify-center text-[8px] font-black ${
                              occ
                                ? 'bg-slate-200 border-slate-300 text-slate-400'
                                : 'bg-emerald-50 border-emerald-400 text-emerald-950'
                            }`}
                          >
                            <span>{meta.code}</span>
                            <span>{meta.shortLabel}</span>
                          </div>
                        );
                      })()}
                    </div>
                    {/* MPV Row 3: 3 Back Row Seats */}
                    <div className="text-[7px] font-black text-slate-500 text-center">
                      แถวหลังสุด: เบาะ 3 ที่นั่ง
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['B1', 'B2', 'B3'] as SeatId[]).map((sid) => {
                        const occ = previewOccupiedSeats.includes(sid);
                        const meta = MPV_SEAT_POSITIONS.find(
                          (s) => s.id === sid
                        )!;
                        return (
                          <div
                            key={sid}
                            className={`h-11 rounded-xl border-2 flex flex-col items-center justify-center text-[8px] font-black ${
                              occ
                                ? 'bg-slate-200 border-slate-300 text-slate-400'
                                : 'bg-emerald-50 border-emerald-400 text-emerald-950'
                            }`}
                          >
                            <span>{meta.code}</span>
                            <span>{meta.shortLabel}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    {/* SUV Row 2: Middle Row 3 Seats */}
                    <div className="text-[7px] font-black text-slate-500 text-center">
                      แถวสอง: 3 คน
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['M1', 'M2', 'M3'] as SeatId[]).map((sid) => {
                        const occ = previewOccupiedSeats.includes(sid);
                        const meta = SUV_SEAT_POSITIONS.find(
                          (s) => s.id === sid
                        )!;
                        return (
                          <div
                            key={sid}
                            className={`h-11 rounded-xl border-2 flex flex-col items-center justify-center text-[8px] font-black ${
                              occ
                                ? 'bg-slate-200 border-slate-300 text-slate-400'
                                : 'bg-emerald-50 border-emerald-400 text-emerald-950'
                            }`}
                          >
                            <span>{meta.code}</span>
                            <span>{meta.shortLabel}</span>
                          </div>
                        );
                      })}
                    </div>
                    {/* SUV Row 3: Third Row 2 Seats */}
                    <div className="text-[7px] font-black text-slate-500 text-center">
                      แถวสาม: 2 คน
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 px-3">
                      {(['B1', 'B2'] as SeatId[]).map((sid) => {
                        const occ = previewOccupiedSeats.includes(sid);
                        const meta = SUV_SEAT_POSITIONS.find(
                          (s) => s.id === sid
                        )!;
                        return (
                          <div
                            key={sid}
                            className={`h-11 rounded-xl border-2 flex flex-col items-center justify-center text-[8px] font-black ${
                              occ
                                ? 'bg-slate-200 border-slate-300 text-slate-400'
                                : 'bg-emerald-50 border-emerald-400 text-emerald-950'
                            }`}
                          >
                            <span>{meta.code}</span>
                            <span>{meta.shortLabel}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Clear Step-by-Step Fare Breakdown + Eco Impact on the Very Last Line */}
            <div className="bg-orange-50/80 border border-orange-200 rounded-xl p-2.5 text-[10px] space-y-1 tabular-nums">
              <div className="flex justify-between font-bold text-slate-700">
                <span>ค่าโดยสารปกติ (หารต่อคน):</span>
                <span>
                  ฿{effectiveBaseFare + commissionFee} (ค่ารถ ฿{effectiveBaseFare}{' '}
                  + บริการ ฿{commissionFee})
                </span>
              </div>
              <div className="flex justify-between font-bold text-emerald-700">
                <span>ส่วนลดจาก HOP Premium:</span>
                <span>-฿{commissionFee}</span>
              </div>
              <div className="flex justify-between items-baseline pt-1 border-t border-orange-200 font-black text-slate-900">
                <span>ราคาสุทธิที่ต้องชำระ (สำหรับสมาชิก HOP Premium):</span>
                <span className="text-sm text-orange-600 font-mono">
                  ฿{effectiveBaseFare}/คน
                </span>
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

          {/* Multi-Select Vibe Tags Selection */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-xs font-black text-slate-900">
                เลือก Vibe ประจำทริปนี้ (เลือกได้หลายอัน)
              </div>
              <span className="text-[10px] font-black text-orange-600">
                {`เลือกแล้ว ${selectedVibes.length} แท็ก`}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {VIBE_CATEGORIES.flatMap((c) => c.tags).map((tag) => {
                const active = selectedVibes.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleVibe(tag)}
                    className={`min-h-[34px] text-[10px] px-3 py-1 rounded-full font-bold border active:scale-95 transition flex items-center gap-1 ${
                      active
                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-orange-300'
                    }`}
                  >
                    {active && <IconCheck size={11} />}
                    <span>{tag}</span>
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
                <span className="text-slate-500 font-bold">รถยนต์และสีรถ:</span>
                <span className="font-black text-slate-900">
                  {carBrand} • {carColor} (
                  {vehicleType === 'suv' ? 'SUV 7 ที่นั่ง' : 'Sedan 4 ที่นั่ง'})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">ป้ายทะเบียน:</span>
                <span className="plate-badge font-mono font-black text-amber-300 bg-slate-900 border border-amber-400 px-2 py-0.5 rounded-md text-[10px]">
                  {carLicense}
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
                <span className="font-black text-slate-900">
                  {seats}/{totalSeatsForType} ที่นั่ง
                </span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-slate-200">
                <span className="text-slate-700 font-black">ราคาหารต่อที่นั่ง:</span>
                <span className="font-black text-orange-600 font-mono text-sm">
                  ฿{effectiveBaseFare} (+บริการ ฿{commissionFee})
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
