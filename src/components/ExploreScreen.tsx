import React, { useState } from 'react';
import {
  CAMPUS_LOCATIONS,
  CAR_SEAT_POSITIONS,
  ROUTE_PRESETS,
  calculateSmartMatch,
  type BookedRideDetail,
  type BookingMode,
  type RideHop,
  type UserProfile,
} from '../data/mockData';
import {
  DriverBunnySvg,
  IconCheck,
  IconClock,
  IconCrown,
  IconFacebook,
  IconInstagram,
  IconLeaf,
  IconPin,
  IconShieldCheck,
  IconSliders,
  IconSparkle,
  IconSteeringWheel,
  IconSwap,
  IconUsers,
  PassengerBunnySvg,
} from './Icons';

interface ExploreScreenProps {
  rides: RideHop[];
  userProfile: UserProfile;
  isPremium: boolean;
  activeBooking: BookedRideDetail | null;
  isTablet?: boolean;
  onOpenSeatModal: (
    ride: RideHop,
    initialStep?:
      | 'select-seat'
      | 'confirm-book'
      | 'active-status'
      | 'confirm-cancel'
      | 'trip-review'
  ) => void;
  onOpenAiTab: () => void;
  onOpenCreateTab: () => void;
}

type SortByOption = 'smart' | 'vibe' | 'destination';

export const ExploreScreen: React.FC<ExploreScreenProps> = ({
  rides,
  userProfile,
  isPremium,
  activeBooking,
  isTablet = false,
  onOpenSeatModal,
  onOpenAiTab,
  onOpenCreateTab,
}) => {
  const [bookingMode, setBookingMode] = useState<BookingMode>('realtime');
  const [originFilter, setOriginFilter] = useState<string>('SIIT รังสิต');
  const [destFilter, setDestFilter] = useState<string>('คอนโด B');
  const [showAllRoutes, setShowAllRoutes] = useState<boolean>(false);

  // User-customizable priority weight: 0 = 100% Distance, 100 = 100% Vibe
  const [vibeWeight, setVibeWeight] = useState<number>(75);
  // Hard Limit Guardrail slider: 0 to 500m (never > 500m)
  const [maxWalkLimit, setMaxWalkLimit] = useState<number>(350);

  const [selectedVibeFilter, setSelectedVibeFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortByOption>('smart');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [showSortMenu, setShowSortMenu] = useState<boolean>(false);
  const [showBlockedGuardrail, setShowBlockedGuardrail] = useState<boolean>(false);
  const [showMobileFilterSheet, setShowMobileFilterSheet] = useState<boolean>(false);
  const [inspectedRideId, setInspectedRideId] = useState<string>('hop-z');
  const [socialToast, setSocialToast] = useState<string | null>(null);

  const activeBookedRide = activeBooking
    ? rides.find((r) => r.id === activeBooking.rideId) || null
    : null;

  // Filter rides by mode and route
  const routeScopedRides = rides.filter((r) => {
    if (r.mode !== bookingMode) return false;
    if (!showAllRoutes) {
      if (r.origin !== originFilter || r.destination !== destFilter) return false;
    }
    if (selectedVibeFilter && !r.vibes.includes(selectedVibeFilter)) {
      return false;
    }
    return true;
  });

  // Separate rides that pass the walking distance guardrail (<= 500m AND <= maxWalkLimit)
  const validRides = routeScopedRides.filter(
    (r) => r.dropOffMeters <= 500 && r.dropOffMeters <= maxWalkLimit
  );

  const guardrailBlockedRides = routeScopedRides.filter(
    (r) => r.dropOffMeters > 500 || r.dropOffMeters > maxWalkLimit
  );

  // Compute Smart Match % for each valid ride and sort
  const enrichedRides = validRides
    .map((ride) => ({
      ride,
      match: calculateSmartMatch(
        ride,
        userProfile.vibes,
        userProfile.faculty,
        vibeWeight
      ),
    }))
    .sort((a, b) => {
      let diff = 0;
      if (sortBy === 'smart') {
        diff = b.match.totalMatch - a.match.totalMatch;
      } else if (sortBy === 'vibe') {
        diff = b.match.vibeScore - a.match.vibeScore;
      } else if (sortBy === 'destination') {
        diff = a.ride.dropOffMeters - b.ride.dropOffMeters;
        return sortOrder === 'desc' ? diff : -diff;
      }
      return sortOrder === 'desc' ? diff : -diff;
    });

  const sortLabels: Record<SortByOption, string> = {
    smart: 'คะแนน Match',
    vibe: 'Vibe ตรงกัน',
    destination: 'ระยะใกล้สุด',
  };

  const handlePresetClick = (origin: string, destination: string, mode?: BookingMode) => {
    setShowAllRoutes(false);
    setOriginFilter(origin);
    setDestFilter(destination);
    if (mode) setBookingMode(mode);
  };

  const handleSwapRoute = () => {
    setOriginFilter(destFilter);
    setDestFilter(originFilter);
  };

  const triggerSocialPreview = (handle: string) => {
    setSocialToast(`เปิดโปรไฟล์โซเชียล: ${handle}`);
    setTimeout(() => setSocialToast(null), 2200);
  };

  const inspectedEntry =
    enrichedRides.find((e) => e.ride.id === inspectedRideId) ||
    enrichedRides[0] ||
    null;

  return (
    <div
      className={`flex-1 flex ${
        isTablet ? 'flex-row overflow-hidden' : 'flex-col overflow-hidden'
      } bg-slate-50 relative`}
    >
      {/* Main Scrollable Feed Column */}
      <div
        className={`flex-1 px-3 md:px-4 py-2.5 ${
          isTablet ? 'pb-6' : 'pb-28'
        } overflow-y-auto custom-scroll space-y-2.5 relative`}
      >
        {socialToast && (
          <div className="sticky top-1 z-50 bg-slate-900 text-white text-[11px] font-bold px-3 py-2 rounded-xl shadow-lg flex items-center justify-between">
            <span>{socialToast}</span>
            <span className="text-orange-400 font-black">ยืนยันตัวตนแล้ว</span>
          </div>
        )}

        {/* Active Trip Banner (Single Active Booking Status + Complete Trip Trigger) */}
        {activeBooking && activeBookedRide && (
          <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-3 shadow-sm space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-[9px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                  ทริปที่กำลังดำเนินการอยู่ (1/1 รอบ)
                </span>
                <div className="text-xs font-black text-slate-900 mt-1">
                  {activeBookedRide.origin} → {activeBookedRide.destination} (
                  {activeBookedRide.hostName})
                </div>
                <div className="text-[10px] font-bold text-slate-600 tabular-nums">
                  ที่นั่ง:{' '}
                  {activeBooking.seatIds
                    .map(
                      (id) =>
                        CAR_SEAT_POSITIONS.find((s) => s.id === id)?.shortLabel ||
                        id
                    )
                    .join(', ')}{' '}
                  • ราคาสุทธิ ฿{activeBooking.netPaid}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onOpenSeatModal(activeBookedRide, 'active-status')}
                className="min-h-[44px] py-2 px-2.5 rounded-xl bg-white hover:bg-slate-100 border border-emerald-400 text-emerald-900 font-black text-xs active:scale-95 transition"
              >
                ดูสถานะ / ยกเลิกทริป
              </button>
              <button
                type="button"
                onClick={() => onOpenSeatModal(activeBookedRide, 'trip-review')}
                className="min-h-[44px] py-2 px-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-sm flex items-center justify-center gap-1 active:scale-95 transition"
              >
                <IconCheck size={13} />
                <span>ถึงจุดหมาย / จบทริป</span>
              </button>
            </div>
          </div>
        )}

        {/* Dual Booking Modes Toggle + Compact Route Bar */}
        <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setBookingMode('realtime')}
              className={`min-h-[44px] py-2 px-2.5 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 active:scale-95 transition ${
                bookingMode === 'realtime'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <IconClock size={14} />
              <span>เดินทางตอนนี้</span>
            </button>
            <button
              type="button"
              onClick={() => setBookingMode('prebook')}
              className={`min-h-[44px] py-2 px-2.5 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 active:scale-95 transition ${
                bookingMode === 'prebook'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <IconSparkle size={14} />
              <span>จองล่วงหน้า</span>
            </button>
          </div>

          {/* Route Inputs */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 min-h-[44px] flex flex-col justify-center">
              <span className="text-[8px] font-bold text-slate-400 block leading-none">
                ต้นทาง
              </span>
              <select
                value={originFilter}
                onChange={(e) => {
                  setShowAllRoutes(false);
                  setOriginFilter(e.target.value);
                }}
                aria-label="ต้นทาง"
                className="w-full bg-transparent text-xs font-black text-slate-900 focus:outline-none mt-0.5"
              >
                {CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleSwapRoute}
              title="สลับต้นทาง-ปลายทาง"
              aria-label="สลับต้นทาง-ปลายทาง"
              className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-600 flex items-center justify-center active:scale-95 transition shrink-0"
            >
              <IconSwap size={15} />
            </button>

            <div className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 min-h-[44px] flex flex-col justify-center">
              <span className="text-[8px] font-bold text-slate-400 block leading-none">
                ปลายทาง
              </span>
              <select
                value={destFilter}
                onChange={(e) => {
                  setShowAllRoutes(false);
                  setDestFilter(e.target.value);
                }}
                aria-label="ปลายทาง"
                className="w-full bg-transparent text-xs font-black text-slate-900 focus:outline-none mt-0.5"
              >
                {CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Preset Route Chips */}
          <div className="flex gap-1.5 items-center overflow-x-auto no-scrollbar pt-0.5">
            {ROUTE_PRESETS.map((preset) => {
              const isSelected =
                !showAllRoutes &&
                originFilter === preset.origin &&
                destFilter === preset.destination;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() =>
                    handlePresetClick(
                      preset.origin,
                      preset.destination,
                      preset.id === 'inter-campus' ? 'prebook' : 'realtime'
                    )
                  }
                  className={`min-h-[36px] text-[10px] px-3 py-1 rounded-full font-black border shrink-0 active:scale-95 transition ${
                    isSelected
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setShowAllRoutes(!showAllRoutes)}
              className={`min-h-[36px] text-[10px] px-3 py-1 rounded-full font-black border shrink-0 active:scale-95 transition ${
                showAllRoutes
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              ทุกเส้นทาง
            </button>
          </div>
        </div>

        {/* Simplified Smart Match Priority Filter & 500m Walking Limit */}
        <div className="bg-white p-3 rounded-2xl border-2 border-orange-500/80 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <IconSliders size={15} className="text-orange-500 shrink-0" />
              <h2 className="text-xs font-black text-slate-900 truncate">
                รูปแบบการจับคู่
              </h2>
            </div>

            {!isTablet && (
              <button
                type="button"
                onClick={() => setShowMobileFilterSheet(true)}
                title="เปิดแผ่นตั้งค่าตัวกรองแบบละเอียด"
                aria-label="ตั้งค่าตัวกรอง Match"
                className="min-h-[36px] px-2.5 py-1 rounded-xl bg-orange-50 border border-orange-300 text-orange-700 text-[10px] font-black flex items-center gap-1 active:scale-95 transition shrink-0"
              >
                <IconSliders size={13} />
                <span>ตัวกรองละเอียด</span>
              </button>
            )}
          </div>

          {/* Full-width 2-Column Priority Selector (Prevents Mobile Text Overlap) */}
          <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setSortBy('smart');
                setVibeWeight(15);
              }}
              className={`min-h-[38px] text-[11px] px-2.5 py-1.5 rounded-lg font-black active:scale-95 transition truncate ${
                vibeWeight <= 40
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              เน้นใกล้ (ระยะทาง)
            </button>
            <button
              type="button"
              onClick={() => {
                setSortBy('smart');
                setVibeWeight(80);
              }}
              className={`min-h-[38px] text-[11px] px-2.5 py-1.5 rounded-lg font-black active:scale-95 transition truncate ${
                vibeWeight > 40
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              เน้น Vibe ตรงกัน
            </button>
          </div>

        {/* Hard Limit Walking Distance Slider (0 - 500m MAX) */}
        <div className="pt-1.5 border-t border-slate-100 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-black tabular-nums">
            <span className="text-slate-800 flex items-center gap-1 whitespace-nowrap">
              <IconShieldCheck size={13} className="text-emerald-600 shrink-0" />
              <span>ระยะเดินสูงสุด (ไม่เกิน 500m):</span>
            </span>
            <div className="flex items-center gap-1.5">
              <span className="bg-emerald-600 text-white border border-emerald-500 px-2 py-0.5 rounded-md font-mono font-black text-[9px] whitespace-nowrap shadow-sm">
                ≤ {maxWalkLimit}m
              </span>
              {guardrailBlockedRides.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowBlockedGuardrail(!showBlockedGuardrail)}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 border border-amber-400 font-black px-2 py-0.5 rounded-md text-[9px] transition tabular-nums shadow-sm"
                >
                  {showBlockedGuardrail
                    ? 'ซ่อน'
                    : `เกินระยะ (${guardrailBlockedRides.length})`}
                </button>
              )}
            </div>
          </div>

          <input
            type="range"
            min={0}
            max={500}
            step={25}
            value={maxWalkLimit}
            onChange={(e) => setMaxWalkLimit(Number(e.target.value))}
            aria-label="จำกัดระยะเดินสูงสุดไม่เกิน 500 เมตร"
            className="w-full hop-slider bg-slate-200 rounded-full"
          />

          {showBlockedGuardrail && guardrailBlockedRides.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-2 space-y-1 text-[10px]">
              <div className="font-black text-rose-900">
                ทริปที่จุดส่งเกินระยะเดิน {maxWalkLimit}m (สูงสุดไม่เกิน 500m):
              </div>
              {guardrailBlockedRides.map((br) => (
                <div
                  key={br.id}
                  className="bg-white border border-rose-200 rounded-lg p-1.5 flex items-center justify-between"
                >
                  <div>
                    <span className="font-black text-slate-800">
                      {br.hostName} ({br.faculty})
                    </span>
                    <span className="text-[9px] text-slate-500 block">
                      {br.actualDropOffName}
                    </span>
                  </div>
                  <span className="font-mono font-black text-white bg-rose-600 px-2 py-0.5 rounded-md tabular-nums text-[9px] shadow-sm">
                    ห่าง {br.dropOffMeters}m
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vibe Quick Filter Chips */}
        <div className="pt-0.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedVibeFilter(null)}
            className={`min-h-[34px] text-[10px] px-2.5 py-1 rounded-full font-black shrink-0 border active:scale-95 transition ${
              selectedVibeFilter === null
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            ทุก Vibe
          </button>
          {[
            'Indie',
            'Game',
            'สายชวนคุย',
            'สายเงียบฟังเพลง',
            'คาเฟ่',
            'สายรีบไปเรียน',
            'K-Pop',
            'T-Pop',
          ].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() =>
                setSelectedVibeFilter(selectedVibeFilter === tag ? null : tag)
              }
              className={`min-h-[34px] text-[10px] px-2.5 py-1 rounded-full font-bold shrink-0 border active:scale-95 transition ${
                selectedVibeFilter === tag
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-orange-300'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Matches Header & Sort Dropdown */}
      <div className="flex items-center justify-between relative z-30">
        <h3 className="text-slate-900 font-black text-xs tracking-tight">
          ทริปที่จับคู่ได้ ({enrichedRides.length} รายการ)
        </h3>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="min-h-[40px] flex items-center gap-1.5 bg-white hover:bg-orange-50 text-slate-800 border-2 border-orange-500 px-3 py-1.5 rounded-xl text-[10px] font-black shadow-sm active:scale-95 transition"
          >
            <span>เรียงตาม: {sortLabels[sortBy]}</span>
            <span className="text-orange-500">{sortOrder === 'desc' ? '↓' : '↑'}</span>
          </button>

          {showSortMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white border-2 border-orange-500 rounded-2xl shadow-xl p-1.5 z-40">
              <div className="px-2 py-1 text-[9px] font-extrabold text-slate-500 border-b border-slate-100 mb-1 flex justify-between items-center">
                <span>ลำดับการแสดงผล</span>
                <button
                  type="button"
                  onClick={() =>
                    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
                  }
                  className="min-h-[32px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded font-black"
                >
                  {sortOrder === 'desc' ? '↓ มากไปน้อย' : '↑ น้อยไปมาก'}
                </button>
              </div>
              {(
                [
                  { key: 'smart', label: 'คะแนน Match รวม' },
                  { key: 'vibe', label: 'เน้น Vibe ตรงกัน' },
                  { key: 'destination', label: 'เน้นใกล้จุดหมาย' },
                ] as { key: SortByOption; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => {
                    setSortBy(opt.key);
                    setShowSortMenu(false);
                  }}
                  className={`w-full min-h-[40px] text-left px-2.5 py-1.5 rounded-xl text-[10px] font-black flex items-center justify-between transition ${
                    sortBy === opt.key
                      ? 'bg-orange-500 text-white'
                      : 'text-slate-700 hover:bg-orange-50'
                  }`}
                >
                  <span>{opt.label}</span>
                  {sortBy === opt.key && (
                    <span>{sortOrder === 'desc' ? '↓' : '↑'}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Empty State if filtered too tightly */}
      {enrichedRides.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center space-y-2.5">
          <div className="mx-auto w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
            <PassengerBunnySvg size={30} />
          </div>
          <div className="text-xs font-black text-slate-900">
            ไม่พบทริปในระยะเดิน ≤ {maxWalkLimit}m
          </div>
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={() => {
                setMaxWalkLimit(350);
                setSelectedVibeFilter(null);
                setShowAllRoutes(true);
              }}
              className="min-h-[44px] bg-slate-900 text-white text-xs font-black px-4 py-2 rounded-xl active:scale-95 transition"
            >
              รีเซ็ตตัวกรอง
            </button>
            <button
              type="button"
              onClick={onOpenAiTab}
              className="min-h-[44px] bg-orange-500 text-white text-xs font-black px-4 py-2 rounded-xl active:scale-95 transition"
            >
              เปิดระบบรอจองอัตโนมัติ
            </button>
          </div>
        </div>
      )}

      {/* Ride Cards List (Single-Column on Mobile, 2-Column Grid on Tablet/iPad) */}
      <div
        className={
          isTablet
            ? 'grid grid-cols-1 xl:grid-cols-2 gap-3'
            : 'space-y-2.5'
        }
      >
        {enrichedRides.map(({ ride, match }, idx) => {
          const isThisRideBooked = activeBooking?.rideId === ride.id;
          const isInspectedOnTablet =
            isTablet && inspectedEntry?.ride.id === ride.id;
          const regularFarePerSeat = ride.baseFare + ride.commissionFee;
          const premiumSavingPerSeat = isPremium ? ride.commissionFee : 0;
          const netPerSeat = regularFarePerSeat - premiumSavingPerSeat;

          const bookedCount = isThisRideBooked && activeBooking
            ? activeBooking.seatIds.length
            : 0;
          const displaySeatsLeft = Math.max(0, ride.seatsLeft - bookedCount);

          const bookedSeatNames =
            isThisRideBooked && activeBooking
              ? activeBooking.seatIds
                  .map(
                    (id) =>
                      CAR_SEAT_POSITIONS.find((s) => s.id === id)?.shortLabel ||
                      id
                  )
                  .join(', ')
              : '';

          return (
            <div
              key={ride.id}
              onClick={() => {
                if (isTablet) setInspectedRideId(ride.id);
              }}
              className={`bg-white p-3.5 rounded-2xl shadow-sm transition space-y-2.5 flex flex-col justify-between overflow-hidden min-w-0 ${
                isTablet ? 'cursor-pointer' : ''
              } ${
                isInspectedOnTablet
                  ? 'border-[3px] border-orange-500 ring-2 ring-orange-200'
                  : idx === 0
                    ? 'border-[3px] border-orange-500'
                    : 'border-2 border-slate-200 hover:border-orange-300'
              }`}
            >
              <div className="space-y-2 min-w-0">
                {/* Top Badges Row: Rank + Smart Match % + Drop-off Distance */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5 items-center min-w-0">
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg font-mono tabular-nums whitespace-nowrap shadow-sm ${
                        idx === 0
                          ? 'bg-orange-500 text-white border border-orange-400'
                          : 'badge-match-rank bg-slate-900 text-amber-300 border border-amber-400'
                      }`}
                    >
                      #{idx + 1} • {match.totalMatch}% Match
                    </span>

                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg tabular-nums whitespace-nowrap shadow-sm ${
                        ride.dropOffMeters === 0
                          ? 'bg-emerald-600 text-white border border-emerald-400'
                          : 'bg-teal-700 text-white border border-teal-400'
                      }`}
                    >
                      {ride.dropOffMeters === 0
                        ? 'ถึงจุดหมาย 0m'
                        : `ห่างจุดหมาย ${ride.dropOffMeters}m`}
                    </span>
                  </div>

                  {/* Clear Final Price Summary on Card */}
                  <div className="text-right shrink-0 tabular-nums">
                    <div className="text-base font-black text-orange-600 font-mono leading-none">
                      สุทธิ ฿{netPerSeat}
                      <span className="text-[9px] font-sans font-bold text-slate-500">
                        /คน
                      </span>
                    </div>
                    <div className="text-[8px] font-bold text-emerald-700 mt-0.5">
                      {isPremium
                        ? `ปกติ ฿${regularFarePerSeat} • ส่วนลด HOP Premium -฿${premiumSavingPerSeat}`
                        : `ค่าโดยสารปกติ ฿${regularFarePerSeat}/คน`}
                    </div>
                  </div>
                </div>

                {/* Host Identity + Vehicle Model/Color/Plate (No Fuel Info) + Social Links */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-orange-50 border-2 border-orange-200 flex items-center justify-center shrink-0">
                      {ride.hostType === 'driver' ? (
                        <DriverBunnySvg size={25} />
                      ) : (
                        <PassengerBunnySvg size={25} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-black text-slate-900 truncate">
                          {ride.hostName}
                        </h4>
                        <span className="text-[10px] font-extrabold text-slate-700 bg-slate-100 border border-slate-300 px-1.5 py-0.5 rounded whitespace-nowrap">
                          {ride.faculty}
                        </span>
                      </div>
                      <div className="text-[10px] font-extrabold text-slate-700 flex items-center gap-1.5 mt-1 tabular-nums flex-wrap">
                        <span className="truncate">{ride.vehicleLabel}</span>
                        {ride.licensePlate && (
                          <span className="plate-badge bg-slate-900 text-amber-300 border border-amber-400 px-2 py-0.5 rounded-md font-mono font-black text-[9px] whitespace-nowrap shrink-0 shadow-sm">
                            {ride.licensePlate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Social Links (IG / FB) neatly aligned inside the card without overflowing */}
                  {(ride.ig || ride.facebook) && (
                    <div className="flex flex-wrap items-center gap-1.5 pl-12">
                      {ride.ig && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerSocialPreview(`IG ${ride.ig}`);
                          }}
                          className="inline-flex items-center gap-1 text-[9px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full active:scale-95 transition max-w-full truncate"
                        >
                          <IconInstagram size={9} className="shrink-0" />
                          <span className="truncate">{ride.ig}</span>
                        </button>
                      )}
                      {ride.facebook && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerSocialPreview(`FB ${ride.facebook}`);
                          }}
                          title={ride.facebook}
                          className="inline-flex items-center gap-1 text-[9px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full active:scale-95 transition shrink-0"
                        >
                          <IconFacebook size={9} className="shrink-0" />
                          <span>Facebook</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Route & Departure Info Box */}
                <div className="bg-slate-50 rounded-xl p-2 border border-slate-200 space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5 text-[11px] font-black text-slate-800 min-w-0">
                    <span className="flex items-center gap-1 whitespace-nowrap shrink-0">
                      <IconPin size={12} className="text-orange-500 shrink-0" />
                      <span>{ride.origin}</span>
                    </span>
                    <span className="text-orange-500 font-mono text-[10px] shrink-0">
                      ━▶
                    </span>
                    <span className="text-teal-800 truncate min-w-0 text-right">
                      {ride.actualDropOffName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[9px] font-bold text-slate-600 tabular-nums pt-1 border-t border-slate-200/70">
                    <span className="flex items-center gap-1 text-orange-600">
                      <IconClock size={11} />
                      <span>
                        {ride.mode === 'realtime'
                          ? ride.departMinutes
                            ? `ออกใน ${ride.departMinutes} นาที (จุดรับห่าง ${ride.pickupMeters}m)`
                            : `พร้อมออกเดินทางทันที (จุดรับห่าง ${ride.pickupMeters}m)`
                          : ride.scheduleLabel}
                      </span>
                    </span>
                    <span className="flex items-center gap-1 text-slate-800 font-black">
                      <IconUsers size={11} className="text-teal-600" />
                      <span>
                        ว่าง {displaySeatsLeft}/{ride.totalSeats} ที่นั่ง
                      </span>
                    </span>
                  </div>
                </div>

                {/* Vibe Tags + Score Breakdown + Eco Impact on the Bottom Row */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap gap-1">
                    {ride.vibes.map((tag) => {
                      const isShared = userProfile.vibes.includes(tag);
                      return (
                        <span
                          key={tag}
                          className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold ${
                            isShared
                              ? 'bg-orange-500 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-800 border border-slate-300'
                          }`}
                        >
                          {isShared ? `✓ ${tag}` : tag}
                        </span>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-800 bg-slate-100 border border-slate-300 px-2.5 py-1.5 rounded-xl tabular-nums">
                    <span>
                      ระยะทาง {match.routeScore}% • Vibe {match.vibeScore}%
                    </span>
                    <span className="text-emerald-700 flex items-center gap-1 font-black">
                      <IconLeaf size={11} />
                      <span>ช่วยลดคาร์บอน {ride.co2SavedKg} kg CO₂</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Open Seat Picker / Active Trip Status Button (10% Brand Accent for High Visibility) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setInspectedRideId(ride.id);
                  onOpenSeatModal(ride);
                }}
                className={`w-full min-h-[44px] text-white text-xs font-black py-2.5 rounded-xl shadow-md active:scale-95 transition flex items-center justify-center gap-1.5 ${
                  isThisRideBooked
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                {isThisRideBooked && activeBooking ? (
                  <>
                    <IconCheck size={14} />
                    <span>
                      กำลังเดินทาง ({bookedSeatNames} • สุทธิ ฿
                      {activeBooking.netPaid}) — ดูสถานะ/จบทริป
                    </span>
                  </>
                ) : (
                  <span>{`เลือกที่นั่งและจองรถ (สุทธิ ฿${netPerSeat}/คน)`}</span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA Banner for Pre-book / AI Auto-Book */}
      <div className="bg-slate-900 text-white p-3.5 rounded-2xl flex items-center justify-between gap-2 shadow-md">
        <div>
          <div className="text-xs font-black text-white flex items-center gap-1">
            <IconCrown size={13} className="text-orange-400" />
            <span>ยังไม่มีรอบเวลาที่ต้องการ?</span>
          </div>
          <p className="text-[9px] text-slate-300 mt-0.5">
            เปิดตี้สร้างทริปเองฟรี หรือตั้งระบบรอจองอัตโนมัติแบบเรียลไทม์
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenCreateTab}
            className="min-h-[42px] bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-[10px] font-black px-3 py-2 rounded-xl active:scale-95 transition"
          >
            + เปิดตี้เอง
          </button>
          <button
            type="button"
            onClick={onOpenAiTab}
            className="min-h-[42px] bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black px-3 py-2 rounded-xl shadow-sm active:scale-95 transition"
          >
            AI จองให้
          </button>
        </div>
      </div>
      </div>

      {/* TABLET / iPAD RIGHT MASTER-DETAIL INSPECTOR PANE (Live 2D Car Seat Layout & Price Breakdown) */}
      {isTablet && inspectedEntry && (
        <aside className="w-[310px] lg:w-[350px] shrink-0 border-l border-slate-200 bg-white p-4 overflow-y-auto custom-scroll flex flex-col justify-between space-y-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div>
                <span className="text-[9px] font-black text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                  รายละเอียดทริป & ผังที่นั่ง
                </span>
                <h3 className="text-sm font-black text-slate-900 mt-1">
                  {inspectedEntry.ride.hostName} ({inspectedEntry.ride.faculty})
                </h3>
                <p className="text-[10px] text-slate-500 font-bold">
                  {inspectedEntry.ride.vehicleLabel}{' '}
                  {inspectedEntry.ride.licensePlate
                    ? `• ${inspectedEntry.ride.licensePlate}`
                    : ''}
                </p>
              </div>
              <div className="text-right font-mono font-black text-orange-600 text-sm tabular-nums">
                {inspectedEntry.match.totalMatch}%
                <span className="block text-[9px] font-sans text-slate-500">
                  Match
                </span>
              </div>
            </div>

            {/* Live 2D Car Seat Preview in Split-View */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black text-slate-700">
                <span>ผังที่นั่งในรถ</span>
                <span className="text-emerald-700">
                  ว่าง {inspectedEntry.ride.seatsLeft}/
                  {inspectedEntry.ride.totalSeats} ที่นั่ง
                </span>
              </div>

              <div className="mx-auto max-w-[230px] bg-slate-100 border-2 border-slate-700 rounded-t-[36px] rounded-b-[20px] p-2.5 space-y-2">
                <div className="h-4 bg-sky-100 border border-slate-400 rounded-t-[20px] rounded-b text-[8px] font-black text-slate-600 flex items-center justify-center">
                  หน้ารถ (ทิศทางเดินทาง ▲)
                </div>
                <div className="grid grid-cols-2 gap-3 px-2">
                  {(['F1'] as const).map((seatId) => {
                    const isOcc =
                      inspectedEntry.ride.occupiedSeats.includes(seatId);
                    return (
                      <button
                        key={seatId}
                        type="button"
                        onClick={() => onOpenSeatModal(inspectedEntry.ride)}
                        className={`h-14 rounded-xl border-2 flex flex-col items-center justify-center text-[9px] font-black transition ${
                          isOcc
                            ? 'bg-slate-200 border-slate-300 text-slate-400'
                            : 'bg-emerald-50 border-emerald-400 text-emerald-950 hover:bg-orange-500 hover:text-white hover:border-orange-600'
                        }`}
                      >
                        <span>F1 • ข้างคนขับ</span>
                        <span className="text-[8px]">
                          {isOcc ? 'ไม่ว่าง' : 'ว่าง (แตะจอง)'}
                        </span>
                      </button>
                    );
                  })}
                  <div className="h-14 rounded-xl border-2 border-slate-700 bg-slate-800 text-white flex flex-col items-center justify-center text-[9px] font-black">
                    <IconSteeringWheel size={14} className="text-orange-400" />
                    <span>คนขับ</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {(['R1', 'R2', 'R3'] as const).map((seatId) => {
                    const isOcc =
                      inspectedEntry.ride.occupiedSeats.includes(seatId);
                    const meta = CAR_SEAT_POSITIONS.find((s) => s.id === seatId)!;
                    return (
                      <button
                        key={seatId}
                        type="button"
                        onClick={() => onOpenSeatModal(inspectedEntry.ride)}
                        className={`h-14 rounded-xl border-2 flex flex-col items-center justify-center text-[9px] font-black transition ${
                          isOcc
                            ? 'bg-slate-200 border-slate-300 text-slate-400'
                            : 'bg-emerald-50 border-emerald-400 text-emerald-950 hover:bg-orange-500 hover:text-white hover:border-orange-600'
                        }`}
                      >
                        <span>{meta.code}</span>
                        <span className="text-[8px]">{meta.shortLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step-by-Step Price Breakdown + Eco Impact on the Very Last Line */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-1.5 text-xs tabular-nums">
              <div className="flex justify-between text-slate-700 font-bold">
                <span>ค่าโดยสารปกติ (หารต่อคน):</span>
                <span>
                  ฿
                  {inspectedEntry.ride.baseFare +
                    inspectedEntry.ride.commissionFee}
                </span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>ส่วนลดจาก HOP Premium:</span>
                <span>
                  {isPremium ? `-฿${inspectedEntry.ride.commissionFee}` : '฿0'}
                </span>
              </div>
              <div className="pt-2 border-t-2 border-slate-200 flex justify-between items-baseline">
                <span className="text-xs font-black text-slate-900">
                  ราคาสุทธิที่ต้องชำระ (ต่อที่นั่ง):
                </span>
                <span className="text-lg font-black text-orange-600 font-mono">
                  ฿
                  {inspectedEntry.ride.baseFare +
                    (isPremium ? 0 : inspectedEntry.ride.commissionFee)}
                </span>
              </div>
              <div className="pt-1.5 border-t border-slate-200/80 flex items-center justify-between text-[10px] font-black text-emerald-700">
                <span className="flex items-center gap-1">
                  <IconLeaf size={12} />
                  <span>ช่วยลดคาร์บอนและมลพิษจากทริปนี้:</span>
                </span>
                <span>ลดได้ {inspectedEntry.ride.co2SavedKg} kg CO₂</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenSeatModal(inspectedEntry.ride)}
            className="w-full min-h-[46px] bg-orange-500 hover:bg-orange-600 text-white font-black text-xs py-3 rounded-xl shadow-md active:scale-95 transition"
          >
            เลือกที่นั่งและจองทริปนี้ →
          </button>
        </aside>
      )}

      {/* MOBILE BOTTOM SHEET: Match Priority & 500m Guardrail Settings */}
      {showMobileFilterSheet && (
        <div
          onClick={() => setShowMobileFilterSheet(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-[2px] z-50 flex items-end justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white text-slate-900 w-full rounded-t-[32px] p-4 pb-6 shadow-2xl border-2 border-orange-500 space-y-3.5 animate-[sheet-rise_0.22s_cubic-bezier(0.22,1,0.36,1)] safe-bottom"
          >
            <div
              className="w-11 h-1.5 rounded-full bg-slate-300 mx-auto mb-1"
              aria-hidden="true"
            />
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  ตั้งค่าตัวกรองการจับคู่ (Smart Match)
                </h3>
                <p className="text-[10px] text-slate-500 font-bold">
                  ปรับน้ำหนักความสำคัญและเพดานระยะเดินสูงสุดไม่เกิน 500 เมตร
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileFilterSheet(false)}
                className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center active:scale-95 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-black text-slate-900">
                1. เลือกรูปแบบการจับคู่หลัก
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSortBy('smart');
                    setVibeWeight(15);
                  }}
                  className={`min-h-[46px] p-2.5 rounded-xl font-black text-xs border-2 active:scale-95 transition ${
                    vibeWeight <= 40
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  เน้นใกล้ (ระยะทาง)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSortBy('smart');
                    setVibeWeight(80);
                  }}
                  className={`min-h-[46px] p-2.5 rounded-xl font-black text-xs border-2 active:scale-95 transition ${
                    vibeWeight > 40
                      ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  เน้น Vibe ตรงกัน
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-black text-slate-900 tabular-nums">
                <span>2. ระยะเดินสูงสุด (ไม่เกิน 500m)</span>
                <span className="text-emerald-700 font-mono">≤ {maxWalkLimit}m</span>
              </div>
              <input
                type="range"
                min={0}
                max={500}
                step={25}
                value={maxWalkLimit}
                onChange={(e) => setMaxWalkLimit(Number(e.target.value))}
                className="w-full hop-slider"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowMobileFilterSheet(false)}
              className="w-full min-h-[46px] bg-orange-500 hover:bg-orange-600 text-white font-black text-xs py-3 rounded-xl shadow-md active:scale-95 transition"
            >
              ใช้ตัวกรองนี้ ({enrichedRides.length} ทริปที่ตรงเงื่อนไข)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
