import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  AiConciergeScreen,
  type DraftSlots,
  type SlotStep,
} from './components/AiConciergeScreen';
import { CreateHopScreen } from './components/CreateHopScreen';
import { ExploreScreen } from './components/ExploreScreen';
import { applyDomLanguage, type AppLang } from './utils/i18n';
import {
  DriverBunnySvg,
  HoppingBunnySvg,
  IconCar,
  IconCheck,
  IconCrown,
  IconHistory,
  IconLeaf,
  IconMoon,
  IconPin,
  IconPlus,
  IconShieldCheck,
  IconSparkle,
  IconSun,
  IconTicket,
  IconWallet,
  PassengerBunnySvg,
  SmilingBunnySvg,
} from './components/Icons';
import { ProfileScreen } from './components/ProfileScreen';
import { SeatBookingModal } from './components/SeatBookingModal';
import {
  CAR_SEAT_POSITIONS,
  INITIAL_DISCOUNT_COUPONS,
  INITIAL_PAYMENT_METHODS,
  INITIAL_RIDES,
  INITIAL_USER_PROFILE,
  type AutoBookWatcher,
  type BookedRideDetail,
  type ChatMessage,
  type CompletedTripRecord,
  type DiscountCoupon,
  type PaymentMethod,
  type RideHop,
  type UserProfile,
} from './data/mockData';

type ScreenKey =
  | 'splash'
  | 'login'
  | 'otp'
  | 'explore'
  | 'ai'
  | 'create'
  | 'profile'
  | 'map'
  | 'payment'
  | 'history';

type ModalStepType =
  | 'select-seat'
  | 'confirm-book'
  | 'active-status'
  | 'confirm-cancel'
  | 'trip-review';

type DevicePreviewMode = 'auto' | 'mobile' | 'tablet';

export default function App() {
  const [screen, setScreen] = useState<ScreenKey>('explore');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [lang, setLang] = useState<AppLang>('th');
  const appRootRef = useRef<HTMLDivElement | null>(null);
  const [splashPhase, setSplashPhase] = useState<'hopping' | 'smiling'>('hopping');
  const [isPremium, setIsPremium] = useState<boolean>(true);
  const [showPremiumModal, setShowPremiumModal] = useState<boolean>(false);
  const [confirmPremiumStep, setConfirmPremiumStep] = useState<boolean>(false);

  // Adaptive Multi-Device Viewport Detection (< 768px Mobile vs. >= 768px Tablet/iPad) + Optional Preview Switcher
  const [deviceMode, setDeviceMode] = useState<DevicePreviewMode>('auto');
  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useLayoutEffect(() => {
    const root = appRootRef.current;
    if (!root) return;

    let isApplying = false;
    const runTranslation = () => {
      if (isApplying) return;
      isApplying = true;
      observer.disconnect();
      applyDomLanguage(root, lang);
      observer.observe(root, {
        childList: true,
        subtree: true,
        characterData: true,
      });
      isApplying = false;
    };

    const observer = new MutationObserver(runTranslation);
    runTranslation();

    return () => observer.disconnect();
  }, [lang, screen, deviceMode]);

  const isTablet =
    deviceMode === 'auto' ? viewportWidth >= 768 : deviceMode === 'tablet';

  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [rides, setRides] = useState<RideHop[]>(INITIAL_RIDES);

  // Requirement 1: Single Active Booking Limit (at most 1 active trip at a time)
  const [activeBooking, setActiveBooking] = useState<BookedRideDetail | null>(null);
  const [activeSeatModalRideId, setActiveSeatModalRideId] = useState<string | null>(
    null
  );
  const [activeModalInitialStep, setActiveModalInitialStep] = useState<
    ModalStepType | undefined
  >(undefined);
  const [appBannerToast, setAppBannerToast] = useState<string | null>(null);

  // Completed Trips History (including 1-5 Star Rating & Quick Review Tags)
  const [completedTrips, setCompletedTrips] = useState<CompletedTripRecord[]>([
    {
      id: 1,
      date: 'เมื่อวาน • 09:00 น.',
      origin: 'SIIT รังสิต',
      destination: 'คอนโด B',
      actualDropOffName: 'หน้า Kave TU (ติดคอนโด B)',
      hostName: 'นาย Z (แซ็ค • SIIT CPE)',
      faculty: 'SIIT • CPE ปี 3',
      vehicleLabel: 'BYD Dolphin • สีขาว',
      licensePlate: '1กฒ 8899',
      seatLabel: 'ข้างคนขับ (F1)',
      paymentMethodName: 'สแกนจ่าย PromptPay QR',
      regularFareTotal: 35,
      premiumDiscount: 5,
      promoDiscount: 5,
      netPaid: 25,
      co2SavedKg: 1.4,
      rating: 5,
      complimentTags: ['ขับรถนุ่มปลอดภัย', 'เทสเพลงดีมาก', 'คุยสนุก เป็นกันเอง'],
      reviewComment: 'เปิดเพลง Indie ดีมากครับ จอดส่งถึงหน้า Kave พอดีเลย',
    },
    {
      id: 2,
      date: '2 วันที่แล้ว • 08:30 น.',
      origin: 'SIIT รังสิต',
      destination: 'SIIT บางกระดี่',
      actualDropOffName: 'หน้าตึกหลัก SIIT บางกระดี่',
      hostName: 'ฟ้า (Fah S. • SIIT CPE)',
      faculty: 'SIIT • CPE ปี 4',
      vehicleLabel: 'Toyota Yaris Ativ • สีขาว',
      licensePlate: '4ขท 5012',
      seatLabel: 'หลังซ้าย (R1)',
      paymentMethodName: 'บัตรเครดิต / เดบิต',
      regularFareTotal: 50,
      premiumDiscount: 5,
      promoDiscount: 0,
      netPaid: 45,
      co2SavedKg: 2.8,
      rating: 5,
      complimentTags: ['ตรงต่อเวลา', 'รถสะอาด แอร์เย็น'],
      reviewComment: 'ออกตรงเวลาเป๊ะ ไปทันแล็บ 9 โมงเช้าสบายๆ ขอบคุณครับ',
    },
  ]);

  // Grab/Bolt-style Payment Methods & % Discount Coupons
  const [paymentMethods] = useState<PaymentMethod[]>(INITIAL_PAYMENT_METHODS);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>('promptpay');
  const [coupons, setCoupons] = useState<DiscountCoupon[]>(INITIAL_DISCOUNT_COUPONS);
  const [selectedCouponCode, setSelectedCouponCode] = useState<string | null>('HOP15');

  // Shared AI Assistant State (Single Source of Truth across the entire app)
  const [aiSubTab, setAiSubTab] = useState<'ai' | 'friend'>('ai');
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([
    {
      id: 'm-welcome',
      sender: 'ai',
      text: 'สวัสดีครับ! ผมคือผู้ช่วย AI ของ CAMPUSHOP พิมพ์สั่งจองรถล่วงหน้าหรือตั้งระบบรอจองอัตโนมัติแบบเรียลไทม์ด้วยภาษาธรรมชาติได้เลยครับ หากข้อมูลจุดรับ-ส่งหรือจำนวนที่นั่งยังไม่ครบ ผมจะถามต่อให้เองครับ',
      timestamp: '09:40',
    },
  ]);
  const [slotStep, setSlotStep] = useState<SlotStep>('idle');
  const [draftSlots, setDraftSlots] = useState<DraftSlots>({
    origin: '',
    destination: 'คอนโด B',
    time: '09:00 น.',
    seats: 0,
    maxWalkMeters: 0,
  });

  // Active AI Auto-Book Watchers
  const [watchers, setWatchers] = useState<AutoBookWatcher[]>([
    {
      id: 'w-initial-1',
      origin: 'SIIT รังสิต',
      destination: 'คอนโด B',
      timeLabel: 'พรุ่งนี้ • 09:00 น.',
      seats: 1,
      maxWalkMeters: 100,
      vibePreference: 'Indie • Valorant • สายชวนคุย',
      status: 'watching',
      createdAt: 'ตั้งไว้เมื่อ 5 นาทีที่แล้ว',
    },
  ]);

  // Clean Map & History states
  const [selectedMapRideId, setSelectedMapRideId] = useState<string>('hop-z');
  const [isMapFocused, setIsMapFocused] = useState<boolean>(true);
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null);

  const showHeaderAndNav = !['splash', 'login', 'otp'].includes(screen);

  useEffect(() => {
    if (screen === 'splash') {
      setSplashPhase('hopping');
      const timer1 = setTimeout(() => setSplashPhase('smiling'), 1600);
      const timer2 = setTimeout(() => setScreen('login'), 2800);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [screen]);

  const showToast = (msg: string) => {
    setAppBannerToast(msg);
    setTimeout(() => setAppBannerToast(null), 3200);
  };

  const handleOpenSeatModal = (ride: RideHop, initialStep?: ModalStepType) => {
    setActiveModalInitialStep(initialStep);
    setActiveSeatModalRideId(ride.id);
  };

  const handleConfirmBooking = (detail: BookedRideDetail) => {
    setActiveBooking(detail);
    setActiveSeatModalRideId(null);
    setActiveModalInitialStep(undefined);
    showToast('จองที่นั่งสำเร็จ! คุณมีทริปที่กำลังดำเนินการอยู่ 1 รอบ');
  };

  const handleConfirmCancelBooking = () => {
    setActiveBooking(null);
    setActiveSeatModalRideId(null);
    setActiveModalInitialStep(undefined);
    showToast('ยกเลิกการจองเรียบร้อย คุณสามารถเลือกจองทริปใหม่ได้แล้ว');
  };

  const handleFinishTripWithReview = (
    ride: RideHop,
    booking: BookedRideDetail,
    rating: number,
    complimentTags: string[],
    comment: string
  ) => {
    const paymentName =
      paymentMethods.find((p) => p.id === booking.paymentMethodId)?.name ||
      'สแกนจ่าย PromptPay QR';
    const seatLabel = booking.seatIds
      .map((id) => CAR_SEAT_POSITIONS.find((s) => s.id === id)?.shortLabel || id)
      .join(', ');

    const newCompletedRecord: CompletedTripRecord = {
      id: Date.now(),
      date: 'วันนี้ • เพิ่งจบการเดินทาง',
      origin: ride.origin,
      destination: ride.destination,
      actualDropOffName: ride.actualDropOffName,
      hostName: ride.hostName,
      faculty: ride.faculty,
      vehicleLabel: ride.vehicleLabel,
      licensePlate: ride.licensePlate,
      seatLabel,
      paymentMethodName: paymentName,
      regularFareTotal: booking.regularFareTotal,
      premiumDiscount: booking.premiumDiscount,
      promoDiscount: booking.promoDiscount,
      netPaid: booking.netPaid,
      co2SavedKg: Number((ride.co2SavedKg * booking.seatIds.length).toFixed(1)),
      rating,
      complimentTags,
      reviewComment: comment.trim() || undefined,
    };

    setCompletedTrips((prev) => [newCompletedRecord, ...prev]);
    setActiveBooking(null);
    setActiveSeatModalRideId(null);
    setActiveModalInitialStep(undefined);
    showToast(`ส่งรีวิว ${rating} ดาวเรียบร้อย! ปลดล็อกให้จองทริปใหม่ได้แล้ว`);
  };

  const handleCreateRide = (newRide: RideHop) => {
    setRides((prev) => [newRide, ...prev]);
    setScreen('explore');
    showToast('เปิดตี้สร้างทริปใหม่เรียบร้อย!');
  };

  const handleAddWatcher = (watcher: AutoBookWatcher) => {
    setWatchers((prev) => [watcher, ...prev]);
  };

  const handleRemoveWatcher = (watcherId: string) => {
    setWatchers((prev) => prev.filter((w) => w.id !== watcherId));
  };

  const handleTriggerWatcherMatch = (watcherId: string) => {
    if (activeBooking) {
      showToast(
        'คุณมีรายการจองที่กำลังดำเนินการอยู่ กรุณาจบทริปหรือยกเลิกรายการเดิมก่อนทำการจองใหม่'
      );
      return;
    }

    setWatchers((prev) =>
      prev.map((w) =>
        w.id === watcherId
          ? {
              ...w,
              status: 'booked',
              matchedHost: 'นาย Z (SIIT CPE • ห่าง 100m • 96% Match)',
            }
          : w
      )
    );
    setActiveBooking({
      rideId: 'hop-z',
      seatIds: ['F1'],
      paymentMethodId: selectedPaymentId,
      couponCode: selectedCouponCode || undefined,
      regularFareTotal: 35,
      premiumDiscount: isPremium ? 5 : 0,
      promoDiscount: 4,
      netPaid: isPremium ? 26 : 31,
    });
    showToast('ระบบ AI จับคู่และจองที่นั่งกับ นาย Z ให้อัตโนมัติเรียบร้อย!');
  };

  const handleClaimCoupon = (code: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.code === code ? { ...c, claimed: true } : c))
    );
    setSelectedCouponCode(code);
  };

  const activeModalRide = activeSeatModalRideId
    ? rides.find((r) => r.id === activeSeatModalRideId) || null
    : null;

  const activeBookedRideObj = activeBooking
    ? rides.find((r) => r.id === activeBooking.rideId) || null
    : null;

  const renderSplash = () => (
    <div className="p-6 flex-1 flex flex-col items-center justify-center bg-white relative overflow-hidden">
      {splashPhase === 'hopping' ? (
        <div className="flex flex-col items-center animate-[bounce-hop_1.2s_ease-in-out_infinite]">
          <HoppingBunnySvg width={84} height={104} />
          <h2 className="mt-4 text-xl font-black text-orange-500 animate-pulse tracking-widest">
            CAMPUSHOP
          </h2>
          <p className="text-xs font-bold text-slate-500 mt-1">
            แพลตฟอร์มหารค่ารถและหาเพื่อนร่วมทาง SIIT & มธ.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center animate-[zoom-smile_0.8s_ease-out_forwards]">
          <SmilingBunnySvg size={136} />
          <h2 className="mt-3 text-2xl font-black text-orange-500">พร้อมออกเดินทาง!</h2>
        </div>
      )}
    </div>
  );

  const renderLogin = () => (
    <div className="p-6 flex-1 flex flex-col justify-center items-center bg-white relative">
      <div className="absolute top-3 right-4">
        <button
          type="button"
          onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
          aria-label="สลับภาษา TH / EN"
          className="min-h-[44px] px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-orange-50 border border-slate-200 text-xs font-black flex items-center gap-1.5 transition"
        >
          <span className={lang === 'th' ? 'text-orange-600' : 'text-slate-400'}>
            TH
          </span>
          <span className="text-slate-300">|</span>
          <span className={lang === 'en' ? 'text-orange-600' : 'text-slate-400'}>
            EN
          </span>
        </button>
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-7">
          <button
            type="button"
            onClick={() => setScreen('splash')}
            title="ดูแอนิเมชันเปิดตัว"
            className="mx-auto flex justify-center text-orange-500 mb-2 min-h-[44px] min-w-[44px]"
          >
            <SmilingBunnySvg size={88} />
          </button>
          <h1 className="text-3xl font-black text-orange-500 tracking-tight font-display">
            CAMPUSHOP
          </h1>
          <p className="text-xs font-bold text-slate-500 mt-1">
            หารค่ารถและหาเพื่อนร่วมทาง SIIT ม.ธรรมศาสตร์
          </p>
        </div>

        <div className="space-y-3.5 px-2">
          <div>
            <input
              type="text"
              defaultValue="jetsada.a@dome.tu.ac.th"
              placeholder="อีเมลมหาวิทยาลัย"
              aria-label="อีเมลมหาวิทยาลัย"
              className="w-full min-h-[48px] text-sm font-bold bg-white border-2 border-orange-500 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 shadow-sm text-center"
            />
          </div>
          <div>
            <input
              type="password"
              defaultValue="••••••••"
              placeholder="รหัสผ่าน"
              aria-label="รหัสผ่าน"
              className="w-full min-h-[48px] text-sm font-bold bg-white border-2 border-orange-500 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 shadow-sm text-center"
            />
          </div>
          <div className="flex justify-between items-center px-1 pt-0.5">
            <button
              type="button"
              onClick={() => setScreen('otp')}
              className="min-h-[44px] px-2 text-xs font-extrabold text-rose-600 hover:underline flex items-center"
            >
              ลืมรหัสผ่าน
            </button>
            <button
              type="button"
              onClick={() => setScreen('otp')}
              className="min-h-[44px] px-2 text-xs font-extrabold text-orange-600 hover:underline flex items-center"
            >
              ยืนยันรหัส OTP นักศึกษา
            </button>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setScreen('explore')}
              className="w-full min-h-[48px] bg-orange-500 hover:bg-orange-600 text-white font-black py-3.5 rounded-xl shadow-lg transition"
            >
              เข้าสู่ระบบ
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOtp = () => (
    <div className="p-6 pt-10 flex-1 flex flex-col justify-center items-center bg-white">
      <div className="w-full max-w-md flex-1 flex flex-col justify-between">
        <div>
          <button
            type="button"
            onClick={() => setScreen('login')}
            className="min-h-[44px] text-xs font-extrabold text-orange-600 bg-orange-50 px-3.5 py-2 rounded-xl inline-flex items-center"
          >
            ← กลับหน้าเข้าสู่ระบบ
          </button>
          <h2 className="text-2xl font-black mt-6 text-slate-900">
            ยืนยันรหัสนักศึกษา
          </h2>
          <p className="text-xs text-slate-600 mt-2 font-medium">
            กรอกรหัส 6 หลักที่ส่งไปยังอีเมล{' '}
            <span className="font-bold text-slate-900">jetsada.a@dome.tu.ac.th</span>
          </p>

          <div className="grid grid-cols-6 gap-2 my-8 tabular-nums">
            {['4', '8', '2', '9', '1', '6'].map((digit, i) => (
              <div
                key={i}
                className="h-12 rounded-xl border-2 border-orange-500 bg-orange-50 text-orange-700 flex items-center justify-center text-lg font-black font-mono"
              >
                {digit}
              </div>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setScreen('profile')}
          className="w-full min-h-[48px] bg-orange-500 hover:bg-orange-600 text-white font-black py-3.5 rounded-xl shadow-md transition"
        >
          ยืนยันและตั้งค่าโปรไฟล์ →
        </button>
      </div>
    </div>
  );

  const renderMap = () => {
    const mapPinRides = rides.filter(
      (r) =>
        ['hop-z', 'hop-y', 'hop-nicha'].includes(r.id) ||
        r.id.startsWith('hop-custom-')
    );
    const mapRide =
      mapPinRides.find((r) => r.id === selectedMapRideId) || mapPinRides[0] || rides[0];
    const isBooked = activeBooking?.rideId === mapRide.id;
    const regularPerSeat = mapRide.baseFare + mapRide.commissionFee;
    const netPerSeat = regularPerSeat - (isPremium ? mapRide.commissionFee : 0);

    const getPinCoords = (rideId: string) => {
      if (rideId === 'hop-z') {
        return {
          top: '90px',
          left: '112px',
          panX: 28,
          panY: 16,
          polyline: '55,195 55,120 142,120 142,108',
          shortType: 'MG4 • สีส้ม',
        };
      }
      if (rideId === 'hop-y') {
        return {
          top: '38px',
          left: '192px',
          panX: -42,
          panY: 54,
          polyline: '55,195 55,120 160,120 160,64 222,58',
          shortType: 'Civic • สีขาว',
        };
      }
      if (rideId === 'hop-nicha') {
        return {
          top: '136px',
          left: '180px',
          panX: -32,
          panY: -22,
          polyline: '55,195 55,156 210,156',
          shortType: 'หารรถ GrabCar',
        };
      }
      return {
        top: '62px',
        left: '86px',
        panX: 44,
        panY: 36,
        polyline: '55,195 55,120 114,82',
        shortType: 'ทริปเปิดใหม่',
      };
    };

    const activePinMeta = getPinCoords(mapRide.id);

    const handleSelectMapVehicle = (rideId: string) => {
      setSelectedMapRideId(rideId);
      setIsMapFocused(true);
    };

    const mapCanvasContent = (
      <div className="flex-1 relative border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm min-h-[240px]">
        {/* Top Active Focus Status Pill */}
        <div className="absolute top-2.5 left-2.5 right-2.5 z-30 pointer-events-none flex items-center justify-between gap-2">
          <span className="bg-slate-900/90 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <span>
              กำลังโฟกัส: {mapRide.hostName} ({mapRide.vehicleLabel})
            </span>
          </span>
          <span className="bg-white/95 text-teal-800 border border-teal-300 text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm tabular-nums">
            {mapRide.dropOffMeters === 0
              ? 'ถึงจุดหมาย 0m'
              : `เดิน ${mapRide.dropOffMeters}m`}
          </span>
        </div>

        {/* Pannable / Zoomable Map Layer */}
        <div
          className="w-full h-full relative transition-transform duration-500 ease-out"
          style={{
            transform: isMapFocused
              ? `translate(${activePinMeta.panX}px, ${activePinMeta.panY}px) scale(1.12)`
              : 'translate(0px, 0px) scale(1)',
          }}
        >
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 300 260"
          >
            {/* Road Grid */}
            <line x1="0" y1="120" x2="300" y2="120" stroke="#e2e8f0" strokeWidth="10" />
            <line x1="160" y1="0" x2="160" y2="260" stroke="#e2e8f0" strokeWidth="10" />
            <line x1="0" y1="195" x2="300" y2="195" stroke="#f1f5f9" strokeWidth="6" />
            {/* Inactive Route Preview */}
            <polyline
              points="55,195 55,120 160,120 160,64 222,58"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="2.5"
              strokeDasharray="4 3"
            />
            {/* Active Highlighted Route Line to Focused Vehicle Pin */}
            <polyline
              points={activePinMeta.polyline}
              fill="none"
              stroke="#f97316"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Origin Pin: Pickup */}
          <div className="absolute top-[168px] left-[22px] text-center z-10">
            <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center border-2 border-white shadow-md mx-auto">
              <PassengerBunnySvg size={18} className="text-orange-400" />
            </div>
            <div className="text-[9px] font-black text-slate-800 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-sm mt-0.5">
              จุดรับ: SIIT รังสิต
            </div>
          </div>

          {/* Dynamic Vehicle Pins (>= 44x44px Touch Target) */}
          {mapPinRides.map((pinRide) => {
            const coords = getPinCoords(pinRide.id);
            const isSelected = mapRide.id === pinRide.id;
            const pinNet =
              pinRide.baseFare + (isPremium ? 0 : pinRide.commissionFee);

            return (
              <button
                key={pinRide.id}
                type="button"
                onClick={() => handleSelectMapVehicle(pinRide.id)}
                style={{ top: coords.top, left: coords.left }}
                className={`absolute min-w-[44px] min-h-[44px] text-center transition-all duration-300 transform ${
                  isSelected
                    ? 'z-30 scale-115'
                    : 'z-20 opacity-85 hover:opacity-100 scale-95'
                }`}
              >
                {isSelected && (
                  <div className="text-[9px] font-black bg-orange-500 text-white px-2 py-0.5 rounded-full shadow-sm mb-0.5 whitespace-nowrap">
                    ★ {pinRide.hostName}
                  </div>
                )}
                <div className="relative mx-auto w-9 h-9 flex items-center justify-center">
                  {isSelected && (
                    <span className="absolute inset-0 rounded-full bg-orange-400/50 animate-ping" />
                  )}
                  <div
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-md ${
                      isSelected
                        ? 'bg-orange-500 text-white ring-2 ring-orange-300'
                        : 'bg-slate-800 text-white'
                    }`}
                  >
                    <IconCar size={15} />
                  </div>
                </div>
                <div
                  className={`text-[9px] font-black px-2 py-0.5 rounded-full border shadow-sm mt-0.5 whitespace-nowrap tabular-nums ${
                    isSelected
                      ? 'bg-white text-orange-600 border-orange-500'
                      : 'bg-white/95 text-slate-800 border-slate-300'
                  }`}
                >
                  {pinRide.hostName} • ฿{pinNet}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );

    const focusedVehicleCard = (
      <div className="bg-white border-2 border-orange-500 rounded-2xl p-3 shadow-md space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0">
              {mapRide.hostType === 'driver' ? (
                <DriverBunnySvg size={24} />
              ) : (
                <PassengerBunnySvg size={24} />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-slate-900 truncate">
                {mapRide.hostName} • {mapRide.faculty}
              </div>
              <div className="text-[10px] font-bold text-slate-500 truncate">
                {mapRide.vehicleLabel}{' '}
                {mapRide.licensePlate ? `(${mapRide.licensePlate})` : ''} • ว่าง{' '}
                {mapRide.seatsLeft} ที่นั่ง
              </div>
              <div className="text-[10px] font-bold text-teal-700 truncate">
                จุดส่ง: {mapRide.actualDropOffName}
              </div>
            </div>
          </div>
          <div className="text-right tabular-nums shrink-0">
            <div className="text-sm font-black text-orange-600 font-mono">
              สุทธิ ฿{netPerSeat}
            </div>
            <div className="text-[9px] font-bold text-slate-500">
              ปกติ ฿{regularPerSeat}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleOpenSeatModal(mapRide)}
          className={`w-full min-h-[44px] py-2.5 rounded-xl text-white font-black text-xs shadow-sm transition ${
            isBooked
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-orange-500 hover:bg-orange-600'
          }`}
        >
          {isBooked
            ? 'กำลังเดินทาง — แตะเพื่อดูสถานะหรือจบทริป'
            : `เลือกที่นั่ง 2D และจองรถของ ${mapRide.hostName}`}
        </button>
      </div>
    );

    // TABLET / iPAD VIEW: Split-Screen Map Layout (Left Pane: Vehicle List & Details | Right Pane: Interactive Map)
    if (isTablet) {
      return (
        <div className="flex-1 flex flex-row bg-slate-50 overflow-hidden">
          {/* Left Master Pane: Route Summary, Vehicle List & Selected Vehicle Details */}
          <div className="w-[350px] lg:w-[390px] border-r border-slate-200 bg-white flex flex-col shrink-0 overflow-y-auto custom-scroll p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <IconPin size={16} className="text-orange-500" />
                <div>
                  <h2 className="text-sm font-black text-slate-900">
                    แผนที่และรายการรถ
                  </h2>
                  <p className="text-[10px] font-bold text-slate-500">
                    แตะเลือกรถด้านซ้ายเพื่อโฟกัสหมุดบนแผนที่ด้านขวา
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMapFocused(!isMapFocused)}
                className="min-h-[40px] text-[10px] font-black bg-slate-100 hover:bg-orange-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl transition"
              >
                {isMapFocused ? 'มุมกว้าง' : 'ซูมหมุด'}
              </button>
            </div>

            {/* Vehicle Selector List in Left Pane */}
            <div className="space-y-2">
              <div className="text-[10px] font-black text-slate-500 flex items-center justify-between">
                <span>รถที่กำลังเปิดตี้บนเส้นทาง ({mapPinRides.length} คัน)</span>
                <span className="text-orange-600">
                  กำลังโฟกัส: {mapRide.hostName}
                </span>
              </div>
              {mapPinRides.map((item) => {
                const isSelected = mapRide.id === item.id;
                const itemNet =
                  item.baseFare + (isPremium ? 0 : item.commissionFee);
                const meta = getPinCoords(item.id);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectMapVehicle(item.id)}
                    className={`w-full min-h-[56px] p-3 rounded-2xl border-2 text-left transition tabular-nums flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-orange-50 border-orange-500 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-black truncate ${
                            isSelected ? 'text-orange-600' : 'text-slate-900'
                          }`}
                        >
                          {item.hostName}
                        </span>
                        <span className="text-[9px] font-bold bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                          {meta.shortType}
                        </span>
                      </div>
                      <div className="text-[10px] font-bold text-slate-500 mt-0.5 truncate">
                        {item.origin} → {item.actualDropOffName}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-orange-600 font-mono">
                        ฿{itemNet}
                      </div>
                      <div className="text-[9px] font-black text-teal-700">
                        {item.dropOffMeters === 0
                          ? '0m'
                          : `เดิน ${item.dropOffMeters}m`}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-1 border-t border-slate-100">
              <div className="text-[10px] font-black text-slate-500 mb-2">
                รายละเอียดรถที่เลือกบนแผนที่
              </div>
              {focusedVehicleCard}
            </div>
          </div>

          {/* Right Detail Pane: Full Interactive Map Canvas */}
          <div className="flex-1 flex flex-col p-4 bg-slate-50">
            {mapCanvasContent}
          </div>
        </div>
      );
    }

    // MOBILE VIEW (< 768px): Full-Screen Map + Native Bottom Sheet Drawer with Drag Handle
    return (
      <div className="flex-1 flex flex-col relative bg-slate-50 pb-[82px] overflow-hidden">
        <div className="px-3.5 py-2 bg-white z-10 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <IconPin size={15} className="text-orange-500" />
            <h2 className="text-xs font-black text-slate-900">
              แผนที่จุดรับ-ส่ง (แตะการ์ดรถหรือหมุดเพื่อโฟกัส)
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsMapFocused(!isMapFocused)}
            className="min-h-[36px] text-[10px] font-black bg-slate-100 hover:bg-orange-50 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-xl transition"
          >
            {isMapFocused ? 'ดูมุมกว้าง' : 'ซูมหมุดที่เลือก'}
          </button>
        </div>

        {/* Interactive Pan & Focus Map Viewport */}
        <div className="flex-1 flex flex-col mx-3 mt-2 mb-1.5">
          {mapCanvasContent}
        </div>

        {/* Native Mobile Bottom Sheet Drawer with Drag Handle */}
        <div className="bg-white rounded-t-[28px] border-t border-slate-200 px-3 pt-2 pb-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] space-y-2 z-20">
          <div className="w-10 h-1.5 rounded-full bg-slate-300 mx-auto" />

          {focusedVehicleCard}

          {/* Bottom Vehicle Selector Cards: Clicking Focuses Map Pin & Shows Vehicle Details */}
          <div>
            <div className="text-[9px] font-black text-slate-500 mb-1 flex items-center justify-between px-0.5">
              <span>แตะเลือกรถด้านล่างเพื่อโฟกัสตำแหน่งบนแผนที่:</span>
              <span className="text-orange-600">
                กำลังเลือก: {mapRide.hostName}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {mapPinRides.slice(0, 3).map((item) => {
                const isSelected = mapRide.id === item.id;
                const itemNet =
                  item.baseFare + (isPremium ? 0 : item.commissionFee);
                const meta = getPinCoords(item.id);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectMapVehicle(item.id)}
                    className={`min-h-[56px] p-2 rounded-xl border-2 text-left transition tabular-nums ${
                      isSelected
                        ? 'bg-orange-50 border-orange-500 shadow-sm scale-[1.01]'
                        : 'bg-white border-slate-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span
                        className={`text-[10px] font-black truncate ${
                          isSelected ? 'text-orange-600' : 'text-slate-900'
                        }`}
                      >
                        {item.hostName}
                      </span>
                      <IconCar
                        size={13}
                        className={
                          isSelected ? 'text-orange-500 shrink-0' : 'text-slate-400 shrink-0'
                        }
                      />
                    </div>
                    <div className="text-[9px] font-bold text-slate-500 truncate">
                      {meta.shortType}
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-black mt-1 pt-1 border-t border-slate-100">
                      <span className="text-teal-700">
                        {item.dropOffMeters === 0
                          ? '0m'
                          : `${item.dropOffMeters}m`}
                      </span>
                      <span className="text-orange-600 font-mono">฿{itemNet}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPaymentAndPromo = () => (
    <div
      className={`flex-1 flex flex-col bg-slate-50 p-4 ${
        isTablet ? 'pb-6' : 'pb-[100px]'
      } overflow-y-auto custom-scroll space-y-3.5`}
    >
      <div>
        <h2 className="text-lg font-black text-slate-900">
          การชำระเงิน & โค้ดโปรโมชัน
        </h2>
        <p className="text-[11px] text-slate-600 font-medium">
          ชำระค่ารถเป็นเงินบาท (฿) แบบเดียวกับ Grab / Bolt พร้อมใช้ส่วนลดจากโค้ดโปรโมชัน
        </p>
      </div>

      <div className={isTablet ? 'grid grid-cols-2 gap-4 items-start' : 'space-y-3.5'}>
        {/* Grab/Bolt-style Payment Methods */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <IconWallet size={15} className="text-orange-500" />
              <span>ช่องทางชำระเงินหลัก</span>
            </h3>
            <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              ตัดจ่ายอัตโนมัติเมื่อจบทริป
            </span>
          </div>

          <div className="space-y-2">
            {paymentMethods.map((pm) => {
              const active = selectedPaymentId === pm.id;
              return (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setSelectedPaymentId(pm.id)}
                  className={`w-full min-h-[52px] text-left p-3 rounded-xl border-2 transition flex items-center justify-between gap-2 ${
                    active
                      ? 'bg-orange-50 border-orange-500 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:border-orange-300'
                  }`}
                >
                  <div>
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <span>{pm.name}</span>
                      <span className="text-[9px] font-bold bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                        {pm.badge}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                      {pm.detail}
                    </div>
                  </div>
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      active
                        ? 'bg-orange-500 border-orange-500 text-white'
                        : 'border-slate-300'
                    }`}
                  >
                    {active && <IconCheck size={12} />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Percentage (%) Discount Coupons per Trip */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <IconTicket size={15} className="text-orange-500" />
                <span>ส่วนลดจากโค้ดโปรโมชัน (% ต่อรอบ)</span>
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">
                เลือกโค้ดโปรโมชันเพื่อคำนวณราคาสุทธิที่ต้องชำระในหน้าจอง
              </p>
            </div>
            {selectedCouponCode && (
              <span className="text-[10px] font-mono font-black bg-orange-500 text-white px-2 py-0.5 rounded-lg">
                ใช้อยู่: {selectedCouponCode}
              </span>
            )}
          </div>

          <div className="space-y-2 tabular-nums">
            {coupons.map((coupon) => {
              const isSelected = selectedCouponCode === coupon.code;
              return (
                <div
                  key={coupon.code}
                  className={`p-3 rounded-2xl border-2 transition space-y-1.5 ${
                    isSelected
                      ? 'bg-orange-50 border-orange-500'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-xs bg-slate-900 text-white px-2 py-0.5 rounded-md">
                          {coupon.code}
                        </span>
                        <span className="text-xs font-black text-orange-600">
                          ลด {coupon.percent}% (สูงสุด ฿{coupon.maxDiscountBaht})
                        </span>
                      </div>
                      <div className="text-[11px] font-bold text-slate-900 mt-1">
                        {coupon.title}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {coupon.condition} • {coupon.expiryLabel}
                      </div>
                    </div>

                    {coupon.claimed ? (
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedCouponCode(isSelected ? null : coupon.code)
                        }
                        className={`min-h-[44px] px-3 py-2 rounded-xl text-[10px] font-black shrink-0 transition ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-900 text-white hover:bg-orange-500'
                        }`}
                      >
                        {isSelected ? '✓ เลือกใช้แล้ว' : 'ใช้โค้ดนี้'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleClaimCoupon(coupon.code)}
                        className="min-h-[44px] px-3 py-2 rounded-xl text-[10px] font-black bg-orange-500 hover:bg-orange-600 text-white shrink-0 transition"
                      >
                        เก็บโค้ดลด {coupon.percent}%
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderHistory = () => {
    const selectedRecord = completedTrips.find((t) => t.id === selectedHistoryId);

    if (selectedRecord) {
      return (
        <div
          className={`flex-1 p-4 bg-slate-50 ${
            isTablet ? 'pb-6' : 'pb-[100px]'
          } overflow-y-auto custom-scroll`}
        >
          <button
            type="button"
            onClick={() => setSelectedHistoryId(null)}
            className="min-h-[44px] text-xs font-extrabold text-slate-600 mb-3 flex items-center gap-1 px-2 rounded-xl hover:bg-slate-200/60"
          >
            <span>← กลับหน้ารายการย้อนหลัง</span>
          </button>

          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 space-y-3.5 max-w-2xl">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center border border-orange-200">
                  <DriverBunnySvg size={30} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {selectedRecord.hostName}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-500">
                    {selectedRecord.date} • ที่นั่ง {selectedRecord.seatLabel}
                  </p>
                </div>
              </div>
              <div className="text-right tabular-nums">
                <div className="text-lg font-black text-orange-600 font-mono">
                  ฿{selectedRecord.netPaid}
                </div>
                <div className="text-[9px] font-bold text-emerald-700">
                  ชำระสำเร็จ
                </div>
              </div>
            </div>

            <div className="flex gap-3 items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-500 shadow-sm border border-slate-200">
                <IconCar size={20} />
              </div>
              <div>
                <div className="text-xs font-black text-slate-900">
                  {selectedRecord.vehicleLabel}
                </div>
                <div className="text-[10px] font-bold text-slate-600">
                  {selectedRecord.origin} → {selectedRecord.actualDropOffName}
                </div>
              </div>
              {selectedRecord.licensePlate && (
                <span className="ml-auto text-[10px] font-mono font-bold text-slate-800 bg-slate-200 px-2 py-0.5 rounded">
                  {selectedRecord.licensePlate}
                </span>
              )}
            </div>

            {/* Requirement 2: Clear Final Price Breakdown + Eco Impact on the Very Last Line */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-1.5 text-xs tabular-nums">
              <div className="flex justify-between text-slate-700 font-bold">
                <span>ค่าโดยสารปกติ (หารต่อคน):</span>
                <span>฿{selectedRecord.regularFareTotal}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>ส่วนลดจาก HOP Premium:</span>
                <span>
                  {selectedRecord.premiumDiscount > 0
                    ? `-฿${selectedRecord.premiumDiscount}`
                    : '฿0'}
                </span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>ส่วนลดจากโค้ดโปรโมชัน:</span>
                <span>
                  {selectedRecord.promoDiscount > 0
                    ? `-฿${selectedRecord.promoDiscount}`
                    : '฿0'}
                </span>
              </div>
              <div className="pt-2 border-t-2 border-slate-200 flex justify-between items-baseline">
                <span className="text-xs font-black text-slate-900">
                  ราคาสุทธิที่ต้องชำระ (ยอดรวมสุดท้าย):
                </span>
                <span className="text-lg font-black text-orange-600 font-mono">
                  ฿{selectedRecord.netPaid}
                </span>
              </div>
              {/* Eco Impact strictly on the VERY LAST LINE */}
              <div className="pt-1.5 border-t border-slate-200/80 flex items-center justify-between text-[10px] font-black text-emerald-700">
                <span className="flex items-center gap-1">
                  <IconLeaf size={12} />
                  <span>ช่วยลดคาร์บอนและมลพิษจากทริปนี้:</span>
                </span>
                <span>ลดได้ {selectedRecord.co2SavedKg} kg CO₂</span>
              </div>
            </div>

            {/* Submitted Rating & Review Card */}
            <div className="bg-orange-50/70 border border-orange-200 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">
                  คะแนนและรีวิวของคุณ
                </span>
                <span className="text-xs font-black text-orange-600">
                  {'★'.repeat(selectedRecord.rating)}{' '}
                  <span className="text-slate-400">
                    {'★'.repeat(5 - selectedRecord.rating)}
                  </span>{' '}
                  ({selectedRecord.rating}/5)
                </span>
              </div>
              {selectedRecord.complimentTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedRecord.complimentTags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] font-black bg-orange-500 text-white px-2 py-0.5 rounded-full"
                    >
                      ✓ {tag}
                    </span>
                  ))}
                </div>
              )}
              {selectedRecord.reviewComment && (
                <p className="text-[11px] text-slate-700 font-medium italic">
                  "{selectedRecord.reviewComment}"
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`flex-1 p-4 bg-slate-50 ${
          isTablet ? 'pb-6' : 'pb-[100px]'
        } overflow-y-auto custom-scroll space-y-3`}
      >
        <h2 className="text-lg font-black text-slate-900">
          สถานะทริปและประวัติการเดินทาง
        </h2>

        {/* Single Active Trip Card (with Complete Trip & Cancel Triggers) */}
        {activeBooking && activeBookedRideObj && (
          <div className="bg-white p-3.5 rounded-2xl shadow-sm border-2 border-emerald-500 space-y-2.5">
            <div className="flex justify-between items-center tabular-nums">
              <span className="text-[10px] font-black bg-emerald-600 text-white px-2.5 py-0.5 rounded-full">
                กำลังเดินทาง (จองได้ทีละ 1 รอบ)
              </span>
              <span className="text-sm font-black text-orange-600 font-mono">
                ราคาสุทธิ ฿{activeBooking.netPaid}
              </span>
            </div>

            <div className="text-xs font-black text-slate-900">
              {activeBookedRideObj.origin} → {activeBookedRideObj.destination} (
              {activeBookedRideObj.hostName})
            </div>

            <div className="text-[10px] font-bold text-slate-600">
              ที่นั่ง:{' '}
              {activeBooking.seatIds
                .map(
                  (id) =>
                    CAR_SEAT_POSITIONS.find((s) => s.id === id)?.shortLabel || id
                )
                .join(', ')}{' '}
              • {activeBookedRideObj.vehicleLabel}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() =>
                  handleOpenSeatModal(activeBookedRideObj, 'active-status')
                }
                className="min-h-[44px] py-2 rounded-xl border border-slate-300 text-slate-700 font-black text-[11px] hover:bg-slate-100 transition"
              >
                ดูรายละเอียด / ยกเลิก
              </button>
              <button
                type="button"
                onClick={() =>
                  handleOpenSeatModal(activeBookedRideObj, 'trip-review')
                }
                className="min-h-[44px] py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-[11px] shadow-sm flex items-center justify-center gap-1 transition"
              >
                <IconCheck size={13} />
                <span>ถึงจุดหมาย / จบทริป</span>
              </button>
            </div>
          </div>
        )}

        <div className="text-xs font-black text-slate-700 pt-1">
          ทริปที่เดินทางเสร็จสิ้นแล้ว ({completedTrips.length})
        </div>

        <div className={isTablet ? 'grid grid-cols-2 gap-3.5' : 'space-y-3'}>
          {completedTrips.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedHistoryId(item.id)}
              className="w-full text-left bg-white p-3.5 rounded-2xl shadow-sm border border-slate-200 hover:border-orange-500 transition space-y-2"
            >
              <div className="flex justify-between items-center tabular-nums">
                <span className="text-[10px] font-bold text-slate-500">
                  {item.date}
                </span>
                <span className="text-sm font-black text-orange-600 font-mono">
                  สุทธิ ฿{item.netPaid}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-orange-50 border border-orange-200 text-orange-500 rounded-full flex items-center justify-center shrink-0">
                  <IconPin size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-slate-900 truncate">
                    {item.origin} → {item.destination} ({item.seatLabel})
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 mt-0.5 truncate">
                    {item.hostName} • {item.vehicleLabel}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[10px] font-bold">
                <span className="text-orange-600 font-black">
                  รีวิวของคุณ: {'★'.repeat(item.rating)} ({item.rating}/5)
                </span>
                <span className="text-emerald-700 flex items-center gap-1 font-black">
                  <IconLeaf size={11} />
                  <span>ลดคาร์บอน {item.co2SavedKg} kg CO₂</span>
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={appRootRef}
      className={`min-h-[100dvh] md:py-3 md:px-4 font-sans flex flex-col items-center justify-center transition-colors ${
        theme === 'dark' ? 'dark bg-slate-950' : 'bg-slate-200/80'
      }`}
    >
      {/* Desktop Presentation Device Preview Switcher (Visible on Screens >= 768px) */}
      {viewportWidth >= 768 && (
        <div className="mb-2.5 flex items-center gap-1.5 bg-white/95 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-full shadow-sm text-[11px] font-black z-40">
          <span className="text-slate-500 px-1">โหมดแสดงผล:</span>
          <button
            type="button"
            onClick={() => setDeviceMode('auto')}
            className={`px-3 py-1 rounded-full transition ${
              deviceMode === 'auto'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            อัตโนมัติตามจอ ({viewportWidth >= 768 ? 'แท็บเล็ต/iPad' : 'มือถือ'})
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode('mobile')}
            className={`px-3 py-1 rounded-full transition ${
              deviceMode === 'mobile'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            สมาร์ทโฟน (iOS / Android)
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode('tablet')}
            className={`px-3 py-1 rounded-full transition ${
              deviceMode === 'tablet'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            แท็บเล็ต / iPad (Split-View)
          </button>
        </div>
      )}

      {/* Native App Device Shell: Adapts Fluidly Between Mobile (390x844 / 100dvh) and Tablet/iPad (1140x820 / Split-View) */}
      <div
        className={`w-full ${
          isTablet
            ? 'max-w-[1160px] h-[100dvh] md:h-[820px] md:rounded-[36px] md:border-[8px] md:border-slate-800'
            : 'sm:max-w-[396px] h-[100dvh] sm:h-[844px] sm:rounded-[44px] sm:border-[8px] sm:border-slate-800'
        } shadow-2xl overflow-hidden flex flex-col relative transition-all duration-300 ${
          theme === 'dark'
            ? 'theme-dark bg-slate-900 text-slate-100'
            : 'bg-white text-slate-900'
        }`}
      >
        {/* Native iOS / Android Top Safe Area & Status Bar */}
        <div className="safe-top px-5 pt-1.5 pb-1 text-[10px] flex justify-between items-center font-black z-30 bg-white text-slate-900 shrink-0 tabular-nums border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span>09:41</span>
            {isTablet && (
              <span className="text-[9px] font-bold text-slate-400">
                iPadOS • CAMPUSHOP
              </span>
            )}
          </div>

          {/* Native Dynamic Island Pill on Mobile Shell */}
          {!isTablet && (
            <div
              aria-hidden="true"
              className="w-20 h-3.5 rounded-full bg-slate-950 flex items-center justify-end px-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
          )}

          <div className="flex gap-1.5 items-center">
            <span className="bg-slate-900 text-white px-1.5 py-[1px] rounded text-[8px]">
              5G
            </span>
            <span className="text-[9px] font-mono">100%</span>
          </div>
        </div>

        {/* Main Adaptive Workspace: Left Navigation Rail on Tablet/iPad + Right Content Area */}
        <div className="flex-1 flex flex-row overflow-hidden relative">
          {/* TABLET / iPAD LEFT NAVIGATION RAIL (iPadOS Sidebar / Material 3 Navigation Rail) */}
          {isTablet && showHeaderAndNav && (
            <aside
              aria-label="แถบเมนูหลักสำหรับแท็บเล็ตและไอแพด"
              className="w-[228px] lg:w-[244px] bg-white border-r border-slate-200 flex flex-col justify-between p-3.5 shrink-0 z-20"
            >
              <div className="space-y-4">
                {/* Brand Logo Header in Sidebar */}
                <button
                  type="button"
                  onClick={() => setScreen('explore')}
                  className="w-full flex items-center gap-2.5 text-left p-2 rounded-2xl hover:bg-orange-50/60 transition"
                >
                  <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0">
                    <PassengerBunnySvg size={26} />
                  </div>
                  <div>
                    <div className="text-base font-black tracking-tight text-slate-900 font-display leading-none">
                      CAMPUS<span className="text-orange-500">HOP</span>
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                      SIIT & มธ. หารค่ารถ
                    </div>
                  </div>
                </button>

                {/* Primary Create Hop Button */}
                <button
                  type="button"
                  onClick={() => setScreen('create')}
                  className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition ${
                    screen === 'create'
                      ? 'bg-slate-900 text-white'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                >
                  <IconPlus size={18} />
                  <span>เปิดตี้สร้างทริปใหม่</span>
                </button>

                {/* Sidebar Navigation Links (>= 44px Touch Target) */}
                <nav className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setScreen('explore')}
                    className={`w-full min-h-[46px] px-3.5 py-2.5 rounded-xl font-black text-xs flex items-center gap-3 transition ${
                      screen === 'explore'
                        ? 'bg-orange-50 text-orange-600 border border-orange-200'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <IconPin size={18} />
                    <span>หน้าหลัก (ค้นหาทริป)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScreen('map')}
                    className={`w-full min-h-[46px] px-3.5 py-2.5 rounded-xl font-black text-xs flex items-center gap-3 transition ${
                      screen === 'map'
                        ? 'bg-orange-50 text-orange-600 border border-orange-200'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <IconCar size={18} />
                    <span>แผนที่จุดรับ-ส่ง</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScreen('ai')}
                    className={`w-full min-h-[46px] px-3.5 py-2.5 rounded-xl font-black text-xs flex items-center gap-3 transition ${
                      screen === 'ai'
                        ? 'bg-orange-50 text-orange-600 border border-orange-200'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <IconSparkle size={18} />
                    <span>AI จองให้ & เพื่อน</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScreen('payment')}
                    className={`w-full min-h-[46px] px-3.5 py-2.5 rounded-xl font-black text-xs flex items-center gap-3 transition ${
                      screen === 'payment'
                        ? 'bg-orange-50 text-orange-600 border border-orange-200'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <IconTicket size={18} />
                    <span>ชำระเงิน & คูปอง</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScreen('history')}
                    className={`w-full min-h-[46px] px-3.5 py-2.5 rounded-xl font-black text-xs flex items-center justify-between transition ${
                      screen === 'history'
                        ? 'bg-orange-50 text-orange-600 border border-orange-200'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <IconHistory size={18} />
                      <span>ประวัติการเดินทาง</span>
                    </span>
                    {activeBooking && (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setScreen('profile')}
                    className={`w-full min-h-[46px] px-3.5 py-2.5 rounded-xl font-black text-xs flex items-center gap-3 transition ${
                      screen === 'profile'
                        ? 'bg-orange-50 text-orange-600 border border-orange-200'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <PassengerBunnySvg
                      size={20}
                      className={
                        screen === 'profile' ? 'text-orange-500' : 'text-slate-400'
                      }
                    />
                    <span>โปรไฟล์ของฉัน</span>
                  </button>
                </nav>
              </div>

              {/* Bottom Sidebar Status Card */}
              <div className="space-y-2 pt-3 border-t border-slate-200">
                {activeBooking && activeBookedRideObj && (
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenSeatModal(activeBookedRideObj, 'active-status')
                    }
                    className="w-full text-left p-2.5 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] font-black text-emerald-800">
                      <span>● ทริปที่กำลังเดินทาง</span>
                      <span className="font-mono">฿{activeBooking.netPaid}</span>
                    </div>
                    <div className="text-[11px] font-black text-slate-900 truncate">
                      {activeBookedRideObj.hostName}
                    </div>
                  </button>
                )}

                <div className="flex items-center justify-between gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmPremiumStep(false);
                      setShowPremiumModal(true);
                    }}
                    className={`flex-1 min-h-[44px] px-2.5 py-2 rounded-xl text-[11px] font-black border flex items-center justify-center gap-1 transition ${
                      isPremium
                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    <IconCrown size={13} />
                    <span>{isPremium ? 'HOP PRO' : 'อัปเกรด PRO'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
                    title="สลับภาษา (Switch Language TH / EN)"
                    aria-label="สลับภาษา TH / EN"
                    className="min-h-[44px] px-2.5 rounded-xl bg-slate-100 hover:bg-orange-50 border border-slate-200 text-[10px] font-black flex items-center gap-1 transition shrink-0"
                  >
                    <span
                      className={
                        lang === 'th' ? 'text-orange-600' : 'text-slate-400'
                      }
                    >
                      TH
                    </span>
                    <span className="text-slate-300">/</span>
                    <span
                      className={
                        lang === 'en' ? 'text-orange-600' : 'text-slate-400'
                      }
                    >
                      EN
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    aria-label="สลับโหมดสีหน้าจอ"
                    className="min-w-[44px] min-h-[44px] rounded-xl bg-slate-100 hover:bg-orange-50 border border-slate-200 text-slate-700 flex items-center justify-center transition shrink-0"
                  >
                    {theme === 'light' ? (
                      <IconMoon size={16} />
                    ) : (
                      <IconSun size={16} className="text-orange-400" />
                    )}
                  </button>
                </div>
              </div>
            </aside>
          )}

          {/* Main Content Column */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {/* Persistent App Header (Full Header on Mobile, Contextual Top Bar on Tablet) */}
            {showHeaderAndNav && (
              <header className="px-3.5 py-2 bg-white border-b border-slate-200 flex items-center justify-between gap-2 z-30 shrink-0">
                <button
                  type="button"
                  onClick={() => setScreen('explore')}
                  className="min-h-[44px] flex items-center gap-2 text-left"
                >
                  <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center">
                    <PassengerBunnySvg size={22} />
                  </div>
                  <div>
                    <div className="text-xs font-black tracking-tight text-slate-900 font-display leading-none">
                      CAMPUS<span className="text-orange-500">HOP</span>
                    </div>
                    <div className="text-[9px] font-bold text-slate-500 mt-0.5">
                      {isTablet
                        ? 'โหมดแท็บเล็ตและไอแพด (Split-View)'
                        : 'SIIT & มธ. หารค่ารถ'}
                    </div>
                  </div>
                </button>

                <div className="flex items-center gap-1">
                  {/* Language Switcher Button (TH / EN) */}
                  <button
                    type="button"
                    onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
                    title="สลับภาษา (Switch Language TH / EN)"
                    aria-label="สลับภาษา TH / EN"
                    className="min-h-[44px] px-2.5 rounded-xl bg-slate-100 hover:bg-orange-50 border border-slate-200 text-[10px] font-black flex items-center gap-1 transition"
                  >
                    <span
                      className={
                        lang === 'th'
                          ? 'bg-orange-500 text-white px-1.5 py-0.5 rounded-md'
                          : 'text-slate-500 px-1'
                      }
                    >
                      TH
                    </span>
                    <span
                      className={
                        lang === 'en'
                          ? 'bg-orange-500 text-white px-1.5 py-0.5 rounded-md'
                          : 'text-slate-500 px-1'
                      }
                    >
                      EN
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    title={
                      theme === 'light'
                        ? 'สลับเป็นโหมดมืด (Dark Mode)'
                        : 'สลับเป็นโหมดสว่าง (Light Mode)'
                    }
                    aria-label="สลับโหมดสีหน้าจอ"
                    className="min-w-[44px] min-h-[44px] rounded-xl bg-slate-100 hover:bg-orange-50 border border-slate-200 text-slate-700 flex items-center justify-center transition"
                  >
                    {theme === 'light' ? (
                      <IconMoon size={16} />
                    ) : (
                      <IconSun size={16} className="text-orange-400" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setScreen('payment')}
                    title="การชำระเงินและโค้ดโปรโมชัน"
                    className={`min-h-[44px] px-3 py-1.5 rounded-xl text-[10px] font-black border flex items-center gap-1.5 transition ${
                      screen === 'payment'
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
                    }`}
                  >
                    <IconTicket size={13} />
                    <span>คูปอง</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScreen('history')}
                    title="สถานะทริปและประวัติการเดินทาง"
                    aria-label="ประวัติการเดินทาง"
                    className={`min-w-[44px] min-h-[44px] rounded-xl border flex items-center justify-center relative transition ${
                      screen === 'history'
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:border-orange-400'
                    }`}
                  >
                    <IconHistory size={15} />
                    {activeBooking && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setConfirmPremiumStep(false);
                      setShowPremiumModal(true);
                    }}
                    title="จัดการสถานะสมาชิก HOP Premium"
                    className={`min-h-[44px] px-3 py-1.5 rounded-full text-[10px] font-black border flex items-center gap-1 transition ${
                      isPremium
                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                        : 'bg-slate-100 text-slate-700 border-slate-300 hover:border-orange-400'
                    }`}
                  >
                    <IconCrown size={12} />
                    <span>{isPremium ? 'PRO' : 'อัปเกรด'}</span>
                  </button>
                </div>
              </header>
            )}

            {/* Toast Banner inside App */}
            {appBannerToast && (
              <div className="mx-3 mt-2 bg-slate-900 text-white text-[11px] font-bold px-3.5 py-2.5 rounded-xl shadow-lg flex items-center justify-between z-40">
                <span>{appBannerToast}</span>
                <IconCheck size={14} className="text-emerald-400 shrink-0" />
              </div>
            )}

            {/* Dynamic Screen Content */}
            {screen === 'splash' && renderSplash()}
            {screen === 'login' && renderLogin()}
            {screen === 'otp' && renderOtp()}
            {screen === 'explore' && (
              <ExploreScreen
                rides={rides}
                userProfile={userProfile}
                isPremium={isPremium}
                isTablet={isTablet}
                activeBooking={activeBooking}
                onOpenSeatModal={handleOpenSeatModal}
                onOpenAiTab={() => {
                  setAiSubTab('ai');
                  setScreen('ai');
                }}
                onOpenCreateTab={() => setScreen('create')}
              />
            )}
            {screen === 'ai' && (
              <AiConciergeScreen
                isPremium={isPremium}
                isTablet={isTablet}
                onOpenPremiumModal={() => {
                  setConfirmPremiumStep(false);
                  setShowPremiumModal(true);
                }}
                messages={aiMessages}
                onChangeMessages={setAiMessages}
                slotStep={slotStep}
                onChangeSlotStep={setSlotStep}
                draftSlots={draftSlots}
                onChangeDraftSlots={setDraftSlots}
                watchers={watchers}
                onAddWatcher={handleAddWatcher}
                onRemoveWatcher={handleRemoveWatcher}
                onTriggerWatcherMatch={handleTriggerWatcherMatch}
                activeSubTab={aiSubTab}
                onChangeSubTab={setAiSubTab}
              />
            )}
            {screen === 'create' && (
              <CreateHopScreen
                userProfile={userProfile}
                isTablet={isTablet}
                onCreateRide={handleCreateRide}
              />
            )}
            {screen === 'profile' && (
              <ProfileScreen
                profile={userProfile}
                onChangeProfile={setUserProfile}
                isPremium={isPremium}
                isTablet={isTablet}
                onOpenPremiumModal={() => {
                  setConfirmPremiumStep(false);
                  setShowPremiumModal(true);
                }}
                onOpenPaymentScreen={() => setScreen('payment')}
                onOpenHistoryScreen={() => setScreen('history')}
                onLogoutToLogin={() => setScreen('login')}
              />
            )}
            {screen === 'map' && renderMap()}
            {screen === 'payment' && renderPaymentAndPromo()}
            {screen === 'history' && renderHistory()}
          </div>
        </div>

        {/* 2D Car Seat Layout, Single Active Booking Guard, Double Confirmation & Post-Trip Review Modal */}
        {activeModalRide && (
          <SeatBookingModal
            ride={activeModalRide}
            activeRide={activeBookedRideObj}
            isPremium={isPremium}
            activeBooking={activeBooking}
            paymentMethods={paymentMethods}
            selectedPaymentId={selectedPaymentId}
            onSelectPaymentId={setSelectedPaymentId}
            coupons={coupons}
            selectedCouponCode={selectedCouponCode}
            onSelectCouponCode={setSelectedCouponCode}
            onConfirmBooking={handleConfirmBooking}
            onConfirmCancelBooking={handleConfirmCancelBooking}
            onSwitchToActiveRide={() => {
              if (activeBookedRideObj) {
                setActiveModalInitialStep('active-status');
                setActiveSeatModalRideId(activeBookedRideObj.id);
              }
            }}
            onFinishTripWithReview={handleFinishTripWithReview}
            initialStep={activeModalInitialStep}
            onClose={() => {
              setActiveSeatModalRideId(null);
              setActiveModalInitialStep(undefined);
            }}
          />
        )}

        {/* HOP Premium (฿49/month) Native Bottom Sheet / Modal with Drag Handle & Double Confirmation */}
        {showPremiumModal && (
          <div
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] z-50 flex items-end md:items-center justify-center p-0 md:p-4"
            onClick={() => {
              setConfirmPremiumStep(false);
              setShowPremiumModal(false);
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white text-slate-900 w-full md:max-w-[440px] rounded-t-[32px] md:rounded-3xl p-4 pt-2.5 pb-6 md:pb-5 shadow-2xl border-2 border-orange-500 space-y-3.5 animate-[sheet-rise_0.22s_cubic-bezier(0.22,1,0.36,1)]"
            >
              {/* Native Bottom Sheet Drag Handle */}
              <div className="w-11 h-1.5 rounded-full bg-slate-300 mx-auto mb-1 md:hidden" />

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center">
                    <IconCrown size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      {confirmPremiumStep
                        ? 'ยืนยันการทำรายการสมาชิก'
                        : 'สมาชิก HOP Premium'}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold">
                      สิทธิพิเศษระบบรอจองอัตโนมัติและส่วนลดจาก HOP Premium
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmPremiumStep(false);
                    setShowPremiumModal(false);
                  }}
                  aria-label="ปิดหน้าต่าง"
                  className="min-w-[44px] min-h-[44px] rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {!confirmPremiumStep ? (
                <>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-1">
                    <div className="text-xs font-black text-slate-900">
                      1. ผู้ใช้งานทั่วไป (ใช้งานฟรี 100%)
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      ค้นหาทริป ตั้งค่าระยะทาง/Vibe เลือกที่นั่ง 2D และเปิดตี้หารค่ารถได้ครบทุกฟีเจอร์
                    </p>
                  </div>

                  <div className="bg-orange-50 border-2 border-orange-400 rounded-2xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-orange-950">
                        2. สมาชิก HOP Premium
                      </span>
                      <span className="bg-orange-500 text-white font-mono font-black text-xs px-2.5 py-0.5 rounded-full tabular-nums">
                        ฿49 / เดือน
                      </span>
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-slate-800 font-medium">
                      <li className="flex items-center gap-1.5">
                        <IconCheck size={14} className="text-orange-600 shrink-0" />
                        <span>
                          ปลดล็อก{' '}
                          <strong>ระบบรอจองอัตโนมัติแบบเรียลไทม์ (AI Auto-Book)</strong>
                        </span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <IconCheck size={14} className="text-orange-600 shrink-0" />
                        <span>
                          รับ <strong>ส่วนลดจาก HOP Premium</strong> ลดค่ารอบทุกทริปการเดินทาง
                        </span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <IconCheck size={14} className="text-orange-600 shrink-0" />
                        <span>
                          ป้าย <strong>PRO</strong> บนโปรไฟล์เพิ่มความน่าเชื่อถือ
                        </span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => setConfirmPremiumStep(true)}
                    className="w-full min-h-[48px] bg-orange-500 hover:bg-orange-600 text-white font-black text-xs py-3 rounded-xl shadow-md transition"
                  >
                    {isPremium
                      ? 'สลับเป็นโหมดผู้ใช้ทั่วไป (Free User) →'
                      : 'สมัครสมาชิก HOP Premium (฿49/เดือน) →'}
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 text-xs text-slate-800 space-y-1">
                    <div className="font-black flex items-center gap-1.5 text-slate-900">
                      <IconShieldCheck size={16} className="text-orange-500" />
                      <span>
                        {isPremium
                          ? 'ยืนยันการเปลี่ยนเป็นโหมดผู้ใช้ทั่วไป (Free User)?'
                          : 'ยืนยันการชำระเงินสมัคร HOP Premium (฿49/เดือน)?'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      {isPremium
                        ? 'เมื่อเปลี่ยนเป็นผู้ใช้ทั่วไป ระบบรอจองอัตโนมัติแบบเรียลไทม์ (AI Auto-Book) และส่วนลดจาก HOP Premium จะถูกปิดชั่วคราว'
                        : 'ระบบจะตัดชำระเงิน ฿49.00 ผ่านช่องทางชำระเงินหลักของคุณ และเปิดใช้งานสิทธิพิเศษทันที'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmPremiumStep(false)}
                      className="min-h-[44px] py-2.5 rounded-xl border border-slate-300 text-slate-700 font-black text-xs"
                    >
                      ← ย้อนกลับ
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPremium(!isPremium);
                        setConfirmPremiumStep(false);
                        setShowPremiumModal(false);
                      }}
                      className="min-h-[44px] py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md"
                    >
                      ยืนยันทำรายการ
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MOBILE Bottom Navigation Bar (< 768px or Mobile Preview Mode) */}
        {!isTablet && showHeaderAndNav && (
          <nav
            aria-label="เมนูหลักด้านล่าง"
            className="safe-bottom absolute bottom-0 left-0 right-0 h-[84px] bg-white rounded-b-[36px] shadow-[0_-8px_24px_rgba(15,23,42,0.06)] z-30 flex flex-col justify-between px-3 pt-1.5 pb-1.5 border-t border-slate-200"
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setScreen('explore')}
                className={`min-w-[56px] min-h-[48px] flex flex-col items-center justify-center transition ${
                  screen === 'explore'
                    ? 'text-orange-500'
                    : 'text-slate-400 hover:text-orange-500'
                }`}
              >
                <IconPin size={20} />
                <span className="text-[10px] font-black mt-0.5">หน้าหลัก</span>
              </button>

              <button
                type="button"
                onClick={() => setScreen('map')}
                className={`min-w-[56px] min-h-[48px] flex flex-col items-center justify-center transition ${
                  screen === 'map'
                    ? 'text-orange-500'
                    : 'text-slate-400 hover:text-orange-500'
                }`}
              >
                <IconCar size={20} />
                <span className="text-[10px] font-black mt-0.5">แผนที่</span>
              </button>

              <div className="relative -top-5 flex flex-col items-center justify-center w-16">
                <button
                  type="button"
                  onClick={() => setScreen('create')}
                  aria-label="เปิดตี้สร้างทริป"
                  className={`flex items-center justify-center w-[58px] h-[58px] rounded-full border-[5px] border-white shadow-[0_8px_20px_rgba(249,115,22,0.4)] transform transition hover:scale-105 ${
                    screen === 'create'
                      ? 'bg-slate-900 text-white'
                      : 'bg-orange-500 text-white'
                  }`}
                >
                  <IconPlus size={24} />
                </button>
                <span className="text-[10px] font-black text-slate-700 mt-0.5">
                  เปิดตี้
                </span>
              </div>

              <button
                type="button"
                onClick={() => setScreen('ai')}
                className={`min-w-[56px] min-h-[48px] flex flex-col items-center justify-center transition ${
                  screen === 'ai'
                    ? 'text-orange-500'
                    : 'text-slate-400 hover:text-orange-500'
                }`}
              >
                <IconSparkle size={20} />
                <span className="text-[10px] font-black mt-0.5">AI จองให้</span>
              </button>

              <button
                type="button"
                onClick={() => setScreen('profile')}
                className={`min-w-[56px] min-h-[48px] flex flex-col items-center justify-center transition ${
                  screen === 'profile'
                    ? 'text-orange-500'
                    : 'text-slate-400 hover:text-orange-500'
                }`}
              >
                <PassengerBunnySvg
                  size={22}
                  className={
                    screen === 'profile' ? 'text-orange-500' : 'text-slate-400'
                  }
                />
                <span className="text-[10px] font-black mt-0.5">โปรไฟล์</span>
              </button>
            </div>

            {/* Native iOS / Android Bottom Home Indicator Bar */}
            <div
              aria-hidden="true"
              className="w-32 h-1 rounded-full bg-slate-900/20 mx-auto"
            />
          </nav>
        )}

        {/* Native iPadOS Bottom Home Indicator Bar on Tablet/iPad */}
        {isTablet && (
          <div
            aria-hidden="true"
            className="safe-bottom py-1.5 bg-white border-t border-slate-100 flex justify-center shrink-0"
          >
            <div className="w-36 h-1 rounded-full bg-slate-900/20" />
          </div>
        )}
      </div>
    </div>
  );
}
