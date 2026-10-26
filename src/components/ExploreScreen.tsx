import React, { useState } from 'react';
import {
  CAMPUS_LOCATIONS,
  ROUTE_PRESETS,
  calculateSmartMatch,
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
  IconSwap,
  IconUsers,
  PassengerBunnySvg,
} from './Icons';

interface ExploreScreenProps {
  rides: RideHop[];
  userProfile: UserProfile;
  isPremium: boolean;
  lockedRideIds: Record<string, boolean>;
  onToggleLockRide: (rideId: string) => void;
  onOpenAiTab: () => void;
  onOpenCreateTab: () => void;
}

type SortByOption = 'smart' | 'vibe' | 'destination';

export const ExploreScreen: React.FC<ExploreScreenProps> = ({
  rides,
  userProfile,
  isPremium,
  lockedRideIds,
  onToggleLockRide,
  onOpenAiTab,
  onOpenCreateTab,
}) => {
  const [bookingMode, setBookingMode] = useState<BookingMode>('realtime');
  const [originFilter, setOriginFilter] = useState<string>('SIIT รังสิต');
  const [destFilter, setDestFilter] = useState<string>('คอนโด B (รังสิต)');
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
  const [socialToast, setSocialToast] = useState<string | null>(null);

  const distanceWeight = 100 - vibeWeight;

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
    smart: `Smart (${vibeWeight}% Vibe)`,
    vibe: 'Vibe สูงสุด',
    destination: 'จุดหมาย 0m',
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

  return (
    <div className="flex-1 px-3 py-2 pb-24 bg-slate-50 overflow-y-auto custom-scroll space-y-2 relative">
      {socialToast && (
        <div className="sticky top-1 z-50 bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center justify-between">
          <span>{socialToast}</span>
          <span className="text-orange-400 font-black">Verified Student</span>
        </div>
      )}

      {/* Dual Booking Modes Toggle + Compact Route Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
        <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setBookingMode('realtime')}
            className={`py-1 px-2 rounded-lg text-[11px] font-black flex items-center justify-center gap-1 transition ${
              bookingMode === 'realtime'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <IconClock size={12} />
            <span>เดินทางตอนนี้ (Now)</span>
          </button>
          <button
            type="button"
            onClick={() => setBookingMode('prebook')}
            className={`py-1 px-2 rounded-lg text-[11px] font-black flex items-center justify-center gap-1 transition ${
              bookingMode === 'prebook'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <IconSparkle size={12} />
            <span>จองล่วงหน้า (Pre-book)</span>
          </button>
        </div>

        {/* Route Inputs */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-1.5 items-center">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
            <span className="text-[8px] font-bold text-slate-400 block leading-none">
              ต้นทาง (Pickup)
            </span>
            <select
              value={originFilter}
              onChange={(e) => {
                setShowAllRoutes(false);
                setOriginFilter(e.target.value);
              }}
              aria-label="จุดเริ่มต้น"
              className="w-full bg-transparent text-[11px] font-black text-slate-900 focus:outline-none"
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
            className="w-6 h-6 rounded-full bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-600 flex items-center justify-center transition"
          >
            <IconSwap size={12} />
          </button>

          <div className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
            <span className="text-[8px] font-bold text-slate-400 block leading-none">
              ปลายทาง (Drop-off)
            </span>
            <select
              value={destFilter}
              onChange={(e) => {
                setShowAllRoutes(false);
                setDestFilter(e.target.value);
              }}
              aria-label="จุดหมายปลายทาง"
              className="w-full bg-transparent text-[11px] font-black text-slate-900 focus:outline-none"
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
        <div className="flex gap-1 items-center overflow-x-auto custom-scroll">
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
                className={`text-[9px] px-2 py-0.5 rounded-full font-black border shrink-0 transition ${
                  isSelected
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100'
                }`}
              >
                {preset.id === 'case-study'
                  ? 'Case นาย A → คอนโด B'
                  : preset.id === 'inter-campus'
                    ? 'SIIT รังสิต → บางกระดี่'
                    : 'TU Dome → บางกระดี่'}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setShowAllRoutes(!showAllRoutes)}
            className={`text-[9px] px-2 py-0.5 rounded-full font-black border shrink-0 transition ${
              showAllRoutes
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            ทุกเส้นทาง
          </button>
        </div>
      </div>

      {/* Compact Smart Match % Priority Weight & 500m Hard Limit Guardrail Panel */}
      <div className="bg-white p-2 rounded-2xl border-2 border-orange-500/80 shadow-sm space-y-1.5">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5">
            <IconSliders size={14} className="text-orange-500 shrink-0" />
            <h2 className="text-[11px] font-black text-slate-900 whitespace-nowrap">
              ตั้งค่าน้ำหนัก % Match
            </h2>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => {
                setSortBy('smart');
                setVibeWeight(15);
              }}
              className={`text-[9px] px-2 py-0.5 rounded-md font-black border transition whitespace-nowrap ${
                vibeWeight <= 30
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              เน้นใกล้ (นาย Y นำ)
            </button>
            <button
              type="button"
              onClick={() => {
                setSortBy('smart');
                setVibeWeight(75);
              }}
              className={`text-[9px] px-2 py-0.5 rounded-md font-black border transition whitespace-nowrap ${
                vibeWeight >= 65
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              เน้น Vibe (นาย Z นำ)
            </button>
          </div>
        </div>

        {/* Weight Slider: Route Distance vs Vibe Similarity */}
        <div className="space-y-0.5">
          <div className="flex justify-between text-[10px] font-black tabular-nums">
            <span className="text-teal-700">ใกล้จุดหมาย: {distanceWeight}%</span>
            <span className="text-orange-600">Vibe ตรงกัน: {vibeWeight}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={vibeWeight}
            onChange={(e) => {
              setSortBy('smart');
              setVibeWeight(Number(e.target.value));
            }}
            aria-label="ปรับน้ำหนักความสำคัญระหว่างระยะทางและ Vibe"
            className="w-full hop-slider bg-slate-200 rounded-full"
          />
        </div>

        {/* Hard Limit Walking Distance Slider (0 - 500m MAX) */}
        <div className="pt-1.5 border-t border-slate-100 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-black tabular-nums">
            <span className="text-slate-800 flex items-center gap-1 whitespace-nowrap">
              <IconShieldCheck size={13} className="text-emerald-600 shrink-0" />
              <span>ระยะเดินสูงสุด (Guardrail):</span>
            </span>
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-mono text-[9px] whitespace-nowrap">
              ≤ {maxWalkLimit}m / ลิมิต 500m
            </span>
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
          <div className="flex items-center justify-between gap-2 text-[9px]">
            <span className="text-amber-900 font-bold truncate">
              ห้ามเกิน 500m (ไม่มีใครเดิน &gt;0.5km เพื่อ Vibe อย่างเดียว)
            </span>
            {guardrailBlockedRides.length > 0 && (
              <button
                type="button"
                onClick={() => setShowBlockedGuardrail(!showBlockedGuardrail)}
                className="shrink-0 bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 font-black px-1.5 py-0.5 rounded text-[9px] transition tabular-nums"
              >
                {showBlockedGuardrail
                  ? 'ซ่อน'
                  : `ถูกตัดออก (${guardrailBlockedRides.length})`}
              </button>
            )}
          </div>

          {showBlockedGuardrail && guardrailBlockedRides.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-2 space-y-1 text-[10px]">
              <div className="font-black text-rose-900">
                ถูก Guardrail คัดออก (เดินเกิน {maxWalkLimit}m หรือเกินเพดาน 500m):
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
                  <span className="font-mono font-black text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded tabular-nums text-[9px]">
                    {br.dropOffMeters}m ✕
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vibe Quick Filter Chips */}
        <div className="pt-0.5 flex items-center gap-1 overflow-x-auto custom-scroll">
          <button
            type="button"
            onClick={() => setSelectedVibeFilter(null)}
            className={`text-[9px] px-2 py-0.5 rounded-full font-black shrink-0 border transition ${
              selectedVibeFilter === null
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            ทุก Vibe
          </button>
          {['Indie', 'Valorant', 'สายชวนคุย', 'สายเงียบฟังเพลง', 'คาเฟ่', 'สายรีบไปเรียน', 'K-Pop', 'T-Pop'].map(
            (tag) => (
              <button
                key={tag}
                type="button"
                onClick={() =>
                  setSelectedVibeFilter(selectedVibeFilter === tag ? null : tag)
                }
                className={`text-[9px] px-2 py-0.5 rounded-full font-bold shrink-0 border transition ${
                  selectedVibeFilter === tag
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-orange-300'
                }`}
              >
                {tag}
              </button>
            )
          )}
        </div>
      </div>

      {/* Matches Header & Sort Dropdown */}
      <div className="flex items-center justify-between relative z-30">
        <h3 className="text-slate-900 font-black text-xs tracking-tight">
          ทริปที่แมตช์กับคุณ ({enrichedRides.length} รายการ)
        </h3>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-1 bg-white hover:bg-orange-50 text-slate-800 border-2 border-orange-500 px-2 py-1 rounded-xl text-[10px] font-black shadow-sm transition"
          >
            <span>Sort: {sortLabels[sortBy]}</span>
            <span className="text-orange-500">{sortOrder === 'desc' ? '↓' : '↑'}</span>
          </button>

          {showSortMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white border-2 border-orange-500 rounded-2xl shadow-xl p-1.5 z-40">
              <div className="px-2 py-1 text-[9px] font-extrabold text-slate-500 border-b border-slate-100 mb-1 flex justify-between items-center">
                <span>เรียงลำดับตาม</span>
                <button
                  type="button"
                  onClick={() =>
                    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
                  }
                  className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded font-black"
                >
                  {sortOrder === 'desc' ? '↓ มากไปน้อย' : '↑ น้อยไปมาก'}
                </button>
              </div>
              {(
                [
                  { key: 'smart', label: 'Smart Match % (ตามสไลเดอร์)' },
                  { key: 'vibe', label: 'Vibe ตรงกันสูงสุด' },
                  { key: 'destination', label: 'จุดหมายเดียวกัน (0m ก่อน)' },
                ] as { key: SortByOption; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => {
                    setSortBy(opt.key);
                    setShowSortMenu(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded-xl text-[10px] font-black flex items-center justify-between transition ${
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
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center space-y-2">
          <div className="mx-auto w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
            <PassengerBunnySvg size={28} />
          </div>
          <div className="text-xs font-black text-slate-900">
            ไม่พบทริปในเงื่อนไขระยะเดิน ≤ {maxWalkLimit}m
          </div>
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={() => {
                setMaxWalkLimit(350);
                setSelectedVibeFilter(null);
                setShowAllRoutes(true);
              }}
              className="bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded-xl"
            >
              รีเซ็ตตัวกรอง
            </button>
            <button
              type="button"
              onClick={onOpenAiTab}
              className="bg-orange-500 text-white text-[10px] font-black px-3 py-1.5 rounded-xl"
            >
              สั่ง AI เฝ้าจองให้
            </button>
          </div>
        </div>
      )}

      {/* Ride Cards List */}
      <div className="space-y-2.5">
        {enrichedRides.map(({ ride, match }, idx) => {
          const isLocked = Boolean(lockedRideIds[ride.id]);
          const effectiveCommission = isPremium ? 0 : ride.commissionFee;
          const totalPerPerson = ride.baseFare + effectiveCommission;
          const displaySeatsLeft = isLocked
            ? Math.max(0, ride.seatsLeft - 1)
            : ride.seatsLeft;

          return (
            <div
              key={ride.id}
              className={`bg-white p-3 rounded-2xl shadow-sm transition space-y-2 ${
                idx === 0
                  ? 'border-[3px] border-orange-500'
                  : 'border-2 border-slate-200'
              }`}
            >
              {/* Top Badges Row: Rank + Smart Match % + Drop-off Distance */}
              <div className="flex items-start justify-between gap-1.5">
                <div className="flex flex-wrap gap-1 items-center">
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-lg font-mono tabular-nums ${
                      idx === 0
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'bg-orange-100 text-orange-900'
                    }`}
                  >
                    #{idx + 1} • {match.totalMatch}% Match
                  </span>

                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-lg tabular-nums ${
                      ride.dropOffMeters === 0
                        ? 'bg-teal-100 text-teal-900 border border-teal-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {ride.dropOffMeters === 0
                      ? 'จุดหมายเดียวกัน 0m'
                      : `ห่างจุดหมาย ${ride.dropOffMeters}m`}
                  </span>
                </div>

                {/* Price Split Display */}
                <div className="text-right shrink-0">
                  <div className="text-base font-black text-orange-600 font-mono tabular-nums leading-none">
                    ฿{totalPerPerson}
                    <span className="text-[9px] font-sans font-bold text-slate-500">
                      /คน
                    </span>
                  </div>
                  <div className="text-[8px] font-bold text-emerald-700 tabular-nums mt-0.5">
                    {isPremium
                      ? 'ฟรีค่าธรรมเนียม (PRO)'
                      : `ค่ารถ ฿${ride.baseFare}+บริการ ฿${ride.commissionFee}`}
                  </div>
                </div>
              </div>

              {/* Host Identity + Optional Social Links */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-orange-50 border-2 border-orange-200 flex items-center justify-center shrink-0">
                    {ride.hostType === 'driver' ? (
                      <DriverBunnySvg size={25} />
                    ) : (
                      <PassengerBunnySvg size={25} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs font-black text-slate-900">
                        {ride.hostName}
                      </h4>
                      <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        {ride.faculty}
                      </span>
                    </div>
                    <div className="text-[9px] font-bold text-slate-500 flex items-center gap-1.5 mt-0.5 tabular-nums">
                      <span className="truncate max-w-[130px]">{ride.vehicleLabel}</span>
                      {ride.licensePlate && (
                        <span className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-mono text-[8px] whitespace-nowrap shrink-0">
                          {ride.licensePlate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Social Links (IG / FB) */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {ride.ig && (
                    <button
                      type="button"
                      onClick={() => triggerSocialPreview(`IG ${ride.ig}`)}
                      className="flex items-center gap-1 text-[8px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded-full transition"
                    >
                      <IconInstagram size={9} />
                      <span>{ride.ig}</span>
                    </button>
                  )}
                  {ride.facebook && (
                    <button
                      type="button"
                      onClick={() => triggerSocialPreview(`FB ${ride.facebook}`)}
                      title={ride.facebook}
                      className="flex items-center gap-1 text-[8px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-full transition"
                    >
                      <IconFacebook size={9} />
                      <span>Facebook</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Route & Departure Info Box */}
              <div className="bg-slate-50 rounded-xl p-2 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-black text-slate-800">
                  <span className="flex items-center gap-1">
                    <IconPin size={12} className="text-orange-500 shrink-0" />
                    <span>{ride.origin}</span>
                  </span>
                  <span className="text-orange-500 font-mono text-[10px]">━▶</span>
                  <span className="text-teal-800 truncate max-w-[175px]">
                    {ride.actualDropOffName}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[9px] font-bold text-slate-600 tabular-nums pt-1 border-t border-slate-200/70">
                  <span className="flex items-center gap-1 text-orange-600">
                    <IconClock size={11} />
                    <span>
                      {ride.mode === 'realtime'
                        ? `ออกใน ${ride.departMinutes} นาที (จุดรับห่าง ${ride.pickupMeters}m)`
                        : ride.scheduleLabel}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 text-slate-800 font-black">
                    <IconUsers size={11} className="text-teal-600" />
                    <span>
                      ว่าง {displaySeatsLeft}/{ride.totalSeats} ที่
                    </span>
                  </span>
                </div>
              </div>

              {/* Vibe & Genre Tags + Score Breakdown */}
              <div className="space-y-1">
                <div className="flex flex-wrap gap-1">
                  {ride.vibes.map((tag) => {
                    const isShared = userProfile.vibes.includes(tag);
                    return (
                      <span
                        key={tag}
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                          isShared
                            ? 'bg-orange-500 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {isShared ? `✓ ${tag}` : tag}
                      </span>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 bg-slate-100/80 px-2 py-1 rounded-lg tabular-nums">
                  <span>
                    ระยะทาง {match.routeScore}% • Vibe {match.vibeScore}%
                  </span>
                  <span className="text-emerald-700 flex items-center gap-0.5 font-black">
                    <IconLeaf size={10} />
                    <span>ลด {ride.co2SavedKg} kg CO₂</span>
                  </span>
                </div>
              </div>

              {/* Lock Seat Button */}
              <button
                type="button"
                onClick={() => onToggleLockRide(ride.id)}
                className={`w-full text-white text-xs font-black py-2 rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 ${
                  isLocked
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                {isLocked ? (
                  <>
                    <IconCheck size={14} />
                    <span>จองที่นั่งสำเร็จ! (แตะเพื่อยกเลิก)</span>
                  </>
                ) : (
                  <span>จองที่นั่งหารค่ารถ (จ่าย ฿{totalPerPerson})</span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA Banner for Pre-book / AI Concierge */}
      <div className="bg-slate-900 text-white p-3 rounded-2xl flex items-center justify-between gap-2 shadow-md">
        <div>
          <div className="text-xs font-black text-white flex items-center gap-1">
            <IconCrown size={13} className="text-orange-400" />
            <span>ยังไม่มีรอบเวลาที่ตรงใจ?</span>
          </div>
          <p className="text-[9px] text-slate-300 mt-0.5">
            เปิดตี้สร้างทริปเองฟรี หรือให้ AI เฝ้ากดจองให้อัตโนมัติ
          </p>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onOpenCreateTab}
            className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-[10px] font-black px-2.5 py-1.5 rounded-xl transition"
          >
            + เปิดตี้เอง
          </button>
          <button
            type="button"
            onClick={onOpenAiTab}
            className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black px-2.5 py-1.5 rounded-xl shadow-sm transition"
          >
            สั่ง AI จองให้
          </button>
        </div>
      </div>
    </div>
  );
};
