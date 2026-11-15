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
  IconChatBubble,
  IconCheck,
  IconCrown,
  IconEye,
  IconEyeOff,
  IconFacebook,
  IconHistory,
  IconInstagram,
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
import { RealTimeMap, getLandmarkCoords } from './components/RealTimeMap';
import { SeatBookingModal } from './components/SeatBookingModal';
import {
  getSeatPositionsForRide,
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
  type UserRoleType,
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
  | 'confirm-finish'
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
  const [pendingBookingRideId, setPendingBookingRideId] = useState<string | null>(null);
  const [appBannerToast, setAppBannerToast] = useState<string | null>(null);

  // Synchronized Destination State (Shared between Explore & RealTimeMap)
  const [destinationName, setDestinationName] = useState<string>('คอนโด B');
  const [destinationPos, setDestinationPos] = useState<[number, number]>([14.0668, 100.6105]);

  const handleDestinationChange = (name: string, pos: [number, number]) => {
    // If active trip is booked, prevent modifying destination
    if (activeBooking) return;
    setDestinationName(name);
    setDestinationPos(pos);
  };

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

  // Shared AI Assistant & Companion Chat State (Single Source of Truth across the entire app)
  const [aiSubTab, setAiSubTab] = useState<'ai' | 'friend'>('ai');
  const [selectedFriendRideId, setSelectedFriendRideId] = useState<string | null>(
    null
  );
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
      vibePreference: 'Indie • Game • สายชวนคุย',
      status: 'watching',
      createdAt: 'ตั้งไว้เมื่อ 5 นาทีที่แล้ว',
    },
  ]);

  // Clean Map & History states
  const [selectedMapRideId, setSelectedMapRideId] = useState<string | null>(null);
  const [mapSelectTrigger, setMapSelectTrigger] = useState<number>(0);
  const [recenterTrigger, setRecenterTrigger] = useState<number>(0);
  const [isMobileDrawerExpanded, setIsMobileDrawerExpanded] = useState<boolean>(true);
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null);

  // Authentication & Registration States (Linked with SQL & Real OTP)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState<string>('jetsada.a@dome.tu.ac.th');
  const [authPassword, setAuthPassword] = useState<string>('password123');
  const [authStudentId, setAuthStudentId] = useState<string>('');
  const [authName, setAuthName] = useState<string>('');
  const [authFaculty, setAuthFaculty] = useState<string>('SIIT • CPE ปี 3');
  const [authError, setAuthError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [modalFieldErrors, setModalFieldErrors] = useState<{ [key: string]: string }>({});
  const [enableTwoFactor, setEnableTwoFactor] = useState<boolean>(false);
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState<boolean>(false);
  const [otpMailPreviewUrl, setOtpMailPreviewUrl] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [showProfileSetupModal, setShowProfileSetupModal] = useState<boolean>(false);
  const [setupProfile, setSetupProfile] = useState<{
    name: string;
    studentId: string;
    email: string;
    password?: string;
    gender: 'male' | 'female' | 'other';
    role: UserRoleType;
    faculty: string;
    university: string;
    bio: string;
    ig: string;
    facebook: string;
  }>({
    name: '',
    studentId: '',
    email: '',
    gender: 'other',
    role: 'both',
    faculty: 'SIIT • CPE ปี 1',
    university: 'ม.ธรรมศาสตร์ (SIIT)',
    bio: '',
    ig: '',
    facebook: '',
  });

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
    setSelectedMapRideId(ride.id);
    if (!activeBooking) {
      const targetDest = ride.actualDropOffName || ride.destination;
      if (targetDest) {
        setDestinationName(targetDest);
        setDestinationPos(getLandmarkCoords(targetDest));
      }
    }
  };

  const handleSelectMapVehicle = (rideId: string) => {
    if (activeBooking) return;
    setSelectedMapRideId(rideId);
    setMapSelectTrigger((prev) => prev + 1);
    const targetRide = rides.find((r) => r.id === rideId);
    if (targetRide) {
      const targetDest = targetRide.actualDropOffName || targetRide.destination;
      if (targetDest) {
        setDestinationName(targetDest);
        setDestinationPos(getLandmarkCoords(targetDest));
      }
    }
  };

  const handleOpenDriverChat = (ride: RideHop) => {
    setActiveSeatModalRideId(null);
    setActiveModalInitialStep(undefined);
    setSelectedFriendRideId(ride.id);
    setAiSubTab('friend');
    setScreen('ai');
  };

  const handleConfirmBooking = (detail: BookedRideDetail) => {
    setActiveBooking(detail);
    setActiveSeatModalRideId(null);
    setActiveModalInitialStep(undefined);
    setSelectedMapRideId(detail.rideId);
    if (detail.destination) {
      setDestinationName(detail.destination);
      setDestinationPos(getLandmarkCoords(detail.destination));
    }
    showToast('จองที่นั่งสำเร็จ! ปลดล็อกช่องทางติดต่อ IG/FB และห้องแชทคนขับแล้ว');
  };

  const handleConfirmCancelBooking = () => {
    setActiveBooking(null);
    setActiveSeatModalRideId(null);
    setSelectedMapRideId(null);
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
      .map(
        (id) =>
          getSeatPositionsForRide(ride).find((s) => s.id === id)?.shortLabel || id
      )
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
    setSelectedMapRideId(null); // Spec: After the end of trip it shouldn't be there, make that you need to choose again!
    setActiveModalInitialStep(undefined);
    setScreen('explore');
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

  const handleUpdateUserProfile = async (updated: UserProfile) => {
    setUserProfile(updated);
    if (updated.id) {
      try {
        await fetch(`http://localhost:3000/api/users/${updated.id}/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: updated.name,
            gender: updated.gender || 'other',
            role: updated.role,
            faculty: updated.faculty,
            university: updated.university,
            bio: updated.bio,
            ig_handle: updated.ig,
            facebook_url: updated.facebook,
          }),
        });
      } catch (e) {
        console.log('Background profile sync note:', e);
      }
    }
  };

  const handleToggleTwoFactor = async (val: boolean) => {
    setEnableTwoFactor(val);
    if (userProfile.id) {
      try {
        await fetch(`http://localhost:3000/api/users/${userProfile.id}/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ two_factor_enabled: val ? 1 : 0 }),
        });
      } catch (e) {
        console.log('2FA sync note:', e);
      }
    }
    showToast(
      val
        ? (lang === 'en' ? '2-Step Verification enabled' : 'เปิดการยืนยันตัวตน 2 ขั้นตอนแล้ว')
        : (lang === 'en' ? '2-Step Verification disabled' : 'ปิดการยืนยันตัวตน 2 ขั้นตอนแล้ว')
    );
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const errors: { [key: string]: string } = {};
    if (!authEmail.trim()) {
      errors.loginEmail = lang === 'en' ? 'Please enter your email' : 'กรุณากรอกอีเมล';
    } else if (!authEmail.includes('@')) {
      errors.loginEmail = lang === 'en' ? 'Invalid email format (must include @)' : 'รูปแบบอีเมลไม่ถูกต้อง (ต้องมี @)';
    }
    if (!authPassword) {
      errors.loginPassword = lang === 'en' ? 'Please enter your password' : 'กรุณากรอกรหัสผ่าน';
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setAuthError(lang === 'en' ? 'Please fill in required fields' : 'กรุณากรอกข้อมูลในช่องที่ไฮไลต์สีแดงให้ครบถ้วน');
      return;
    }
    setFieldErrors({});
    setAuthError(null);
    setAuthLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setAuthError(data.message || (lang === 'en' ? 'Invalid email or password' : 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'));
        setAuthLoading(false);
        return;
      }

      setUserProfile({
        id: data.user.user_id,
        studentId: data.user.student_id,
        email: data.user.email,
        gender: data.user.gender,
        name: data.user.name,
        faculty: data.user.faculty,
        university: data.user.university || 'ม.ธรรมศาสตร์ (SIIT)',
        role: data.user.role,
        bio: data.user.bio || '',
        ig: data.user.ig_handle || '',
        facebook: data.user.facebook_url || '',
        vibes: data.user.vibes && data.user.vibes.length > 0 ? data.user.vibes : ['Indie', 'Game'],
        carBrand: 'Honda Civic FE',
        carColor: 'สีเทาโซนิค',
        carLicense: 'กข 1234',
        carType: 'sedan',
        womenOnlyDefault: false,
      });

      // User spec: Check if user enabled 2-step verification in profile; if enabled, send OTP; if disabled, direct sign-in!
      const userTwoFactor =
        data.user.two_factor_enabled !== undefined && data.user.two_factor_enabled !== null
          ? Boolean(data.user.two_factor_enabled)
          : enableTwoFactor;
      setEnableTwoFactor(userTwoFactor);

      if (userTwoFactor) {
        showToast(lang === 'en' ? 'Password verified! Sending 2-Step OTP to your email...' : 'รหัสผ่านถูกต้อง! กำลังส่งรหัส OTP ยืนยัน 2 ขั้นตอนไปยังอีเมล...');
        handleSendOtp(authEmail);
      } else {
        showToast(lang === 'en' ? `Welcome back, ${data.user.name}!` : `เข้าสู่ระบบสำเร็จ ยินดีต้อนรับ ${data.user.name}`);
        setScreen('explore');
      }
    } catch {
      setAuthError(lang === 'en' ? 'Unable to connect to backend SQL server' : 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ฐานข้อมูลได้');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSendOtp = async (targetEmail: string) => {
    if (!targetEmail || !targetEmail.includes('@')) {
      setAuthError(lang === 'en' ? 'Please enter a valid email address' : 'กรุณากรอกอีเมลที่ถูกต้อง');
      return;
    }
    setAuthError(null);
    setAuthLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setAuthError(data.message || 'Failed to send OTP');
        setAuthLoading(false);
        return;
      }
      // User spec: Never expose OTP in UI or auto-fill! User must check real email and type it!
      setOtpDigits(['', '', '', '', '', '']);
      if (data.previewUrl) {
        setOtpMailPreviewUrl(data.previewUrl);
      } else {
        setOtpMailPreviewUrl(null);
      }
      showToast(data.message || (lang === 'en' ? `OTP sent to ${targetEmail}. Please check your email inbox!` : `ส่งรหัส OTP ไปยังอีเมล ${targetEmail} แล้ว กรุณาเปิดเช็ครหัสในอีเมลของคุณ`));
      setScreen('otp');
    } catch {
      setAuthError(lang === 'en' ? 'Failed to connect to email service' : 'เกิดข้อผิดพลาดในการเชื่อมต่อระบบส่งเมล');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const code = otpDigits.join('');
    if (code.length < 6) {
      setAuthError(lang === 'en' ? 'Please fill in all 6 OTP digits' : 'กรุณากรอกรหัส OTP ให้ครบ 6 หลัก');
      return;
    }
    setAuthError(null);
    setAuthLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, otp: code }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setAuthError(data.message || (lang === 'en' ? 'Invalid or expired OTP' : 'รหัส OTP ไม่ถูกต้องหรือหมดอายุ'));
        setAuthLoading(false);
        return;
      }

      if (data.isNewUser) {
        setSetupProfile({
          name: authName || '',
          studentId: authStudentId || '',
          email: authEmail,
          password: authPassword || 'password123',
          gender: 'other',
          role: 'both',
          faculty: authFaculty || 'SIIT • CPE ปี 1',
          university: 'ม.ธรรมศาสตร์ (SIIT)',
          bio: 'นิสิต SIIT ยินดีที่ได้รู้จักครับ/ค่ะ!',
          ig: '',
          facebook: '',
        });
        setShowProfileSetupModal(true);
      } else if (data.user) {
        setUserProfile({
          id: data.user.user_id,
          studentId: data.user.student_id,
          email: data.user.email,
          gender: data.user.gender,
          name: data.user.name,
          faculty: data.user.faculty,
          university: data.user.university || 'ม.ธรรมศาสตร์ (SIIT)',
          role: data.user.role,
          bio: data.user.bio || '',
          ig: data.user.ig_handle || '',
          facebook: data.user.facebook_url || '',
          vibes: data.user.vibes && data.user.vibes.length > 0 ? data.user.vibes : ['Indie', 'Game'],
          carBrand: 'Honda Civic FE',
          carColor: 'สีเทาโซนิค',
          carLicense: 'กข 1234',
          carType: 'sedan',
          womenOnlyDefault: false,
        });
        showToast(lang === 'en' ? `Welcome back, ${data.user.name}!` : `เข้าสู่ระบบสำเร็จ ยินดีต้อนรับ ${data.user.name}`);
        setScreen('explore');
      }
    } catch {
      setAuthError(lang === 'en' ? 'Error communicating with server' : 'เกิดข้อผิดพลาดในการตรวจสอบ OTP');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterSubmit = async () => {
    const errors: { [key: string]: string } = {};
    const cleanName = setupProfile.name.trim();
    const cleanStudentId = setupProfile.studentId.trim();
    const cleanFaculty = setupProfile.faculty.trim();

    if (!cleanName) {
      errors.name = lang === 'en' ? 'Please enter your name' : 'กรุณากรอกชื่อ-นามสกุล / ชื่อเล่น';
    } else if (!/^[a-zA-Z\u0E00-\u0E7F\s]+$/.test(cleanName)) {
      errors.name = lang === 'en' ? 'Name must only contain letters (no digits or symbols)' : 'ชื่อ-นามสกุลต้องเป็นตัวอักษรเท่านั้น (ไม่มีตัวเลขหรือสัญลักษณ์)';
    }

    if (!cleanStudentId) {
      errors.studentId = lang === 'en' ? 'Please enter your student ID' : 'กรุณากรอกรหัสนักศึกษา';
    } else if (cleanStudentId.length !== 10) {
      errors.studentId = lang === 'en' ? `Student ID must be 10 digits (currently ${cleanStudentId.length} digits)` : `รหัสนักศึกษาต้องเป็นตัวเลข 10 หลัก (ปัจจุบันมี ${cleanStudentId.length} หลัก)`;
    }

    if (!cleanFaculty) {
      errors.faculty = lang === 'en' ? 'Please enter faculty and year' : 'กรุณากรอกคณะและชั้นปี';
    }

    if (Object.keys(errors).length > 0) {
      setModalFieldErrors(errors);
      showToast(lang === 'en' ? 'Please check the highlighted fields below' : 'กรุณาแก้ไขข้อมูลในช่องที่มีข้อความสีแดง');
      return;
    }
    setModalFieldErrors({});
    setAuthLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: setupProfile.email,
          password: setupProfile.password || 'password123',
          student_id: cleanStudentId,
          name: cleanName,
          gender: setupProfile.gender,
          role: setupProfile.role,
          faculty: setupProfile.faculty.trim(),
          university: setupProfile.university,
          bio: setupProfile.bio,
          ig_handle: setupProfile.ig,
          facebook_url: setupProfile.facebook,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.message || 'Registration failed');
        setAuthLoading(false);
        return;
      }

      setUserProfile({
        id: data.user.user_id,
        studentId: data.user.student_id,
        email: data.user.email,
        gender: data.user.gender,
        name: data.user.name,
        faculty: data.user.faculty,
        university: data.user.university || 'ม.ธรรมศาสตร์ (SIIT)',
        role: data.user.role,
        bio: data.user.bio || '',
        ig: data.user.ig_handle || '',
        facebook: data.user.facebook_url || '',
        vibes: ['Indie', 'Game', 'สายชวนคุย'],
        carBrand: 'Honda Civic FE',
        carColor: 'สีเทาโซนิค',
        carLicense: 'กข 1234',
        carType: 'sedan',
        womenOnlyDefault: false,
      });

      setShowProfileSetupModal(false);
      showToast(lang === 'en' ? 'Profile saved to SQL database successfully!' : 'บันทึกโปรไฟล์ลงฐานข้อมูล SQL เรียบร้อย!');
      // User spec: 2-step verification is ALWAYS required on sign up
      showToast(lang === 'en' ? 'Profile saved! Sending 2-Step OTP to your email...' : 'บันทึกโปรไฟล์สำเร็จ! กำลังส่งรหัส OTP ยืนยัน 2 ขั้นตอนไปยังอีเมล...');
      handleSendOtp(setupProfile.email);
    } catch {
      showToast(lang === 'en' ? 'Error saving to SQL database' : 'เกิดข้อผิดพลาดในการบันทึกลงฐานข้อมูล SQL');
    } finally {
      setAuthLoading(false);
    }
  };

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
        <div className="text-center mb-5">
          <button
            type="button"
            onClick={() => setScreen('splash')}
            title="ดูแอนิเมชันเปิดตัว"
            className="mx-auto flex justify-center text-orange-500 mb-2 min-h-[44px] min-w-[44px]"
          >
            <SmilingBunnySvg size={84} />
          </button>
          <h1 className="text-3xl font-black text-orange-500 tracking-tight font-display">
            CAMPUSHOP
          </h1>
          <p className="text-xs font-bold text-slate-500 mt-1">
            {lang === 'en'
              ? 'Thammasat & SIIT Smart Carpooling Platform'
              : 'หารค่ารถและหาเพื่อนร่วมทาง SIIT ม.ธรรมศาสตร์'}
          </p>
        </div>

        {/* Auth Mode Toggle Tabs (Login vs Register) */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-4 border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setAuthTab('login');
              setAuthError(null);
              setFieldErrors({});
            }}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition ${
              authTab === 'login'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {lang === 'en' ? 'Log In' : 'เข้าสู่ระบบ'}
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthTab('register');
              setAuthError(null);
              setFieldErrors({});
            }}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition ${
              authTab === 'register'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {lang === 'en' ? 'Sign Up (New User)' : 'สมัครสมาชิกใหม่'}
          </button>
        </div>

        {authError && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-between animate-fade-in">
            <span>⚠️ {authError}</span>
            <button type="button" onClick={() => setAuthError(null)} className="text-rose-500 hover:text-rose-800 font-black ml-2">✕</button>
          </div>
        )}

        {authTab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-3 px-1 text-left">
            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                {lang === 'en' ? 'Email Address *' : 'อีเมล *'}
              </label>
              <input
                type="text"
                value={authEmail}
                onChange={(e) => {
                  const val = e.target.value;
                  setAuthEmail(val);
                  if (fieldErrors.loginEmail && val.trim() && val.includes('@')) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.loginEmail;
                      return next;
                    });
                  }
                }}
                placeholder={lang === 'en' ? 'e.g. name@dome.tu.ac.th' : 'เช่น name@dome.tu.ac.th'}
                aria-label={lang === 'en' ? 'Email' : 'อีเมล'}
                className={`w-full min-h-[46px] text-xs font-bold bg-white border-2 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 shadow-sm transition focus:outline-none focus:ring-2 ${
                  fieldErrors.loginEmail
                    ? 'border-rose-500 bg-rose-50/25 focus:ring-rose-400 text-rose-900'
                    : 'border-orange-500 focus:ring-orange-400'
                }`}
              />
              {fieldErrors.loginEmail && (
                <p className="mt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1 animate-fade-in">
                  <span>❌</span>
                  <span>{fieldErrors.loginEmail}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                {lang === 'en' ? 'Password *' : 'รหัสผ่าน *'}
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={authPassword}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAuthPassword(val);
                    if (fieldErrors.loginPassword && val) {
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.loginPassword;
                        return next;
                      });
                    }
                  }}
                  placeholder={lang === 'en' ? 'Enter password' : 'กรอกรหัสผ่านของคุณ'}
                  aria-label={lang === 'en' ? 'Password' : 'รหัสผ่าน'}
                  className={`w-full min-h-[46px] text-xs font-bold bg-white border-2 rounded-xl pl-4 pr-11 py-2.5 text-slate-800 placeholder-slate-400 shadow-sm transition focus:outline-none focus:ring-2 ${
                    fieldErrors.loginPassword
                      ? 'border-rose-500 bg-rose-50/25 focus:ring-rose-400 text-rose-900'
                      : 'border-orange-500 focus:ring-orange-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-orange-600 active:scale-95 transition"
                  title={showLoginPassword ? (lang === 'en' ? 'Password visible (click to hide)' : 'กำลังแสดงรหัสผ่าน (คลิกเพื่อซ่อน)') : (lang === 'en' ? 'Password hidden (click to show)' : 'ซ่อนรหัสผ่านอยู่ (คลิกเพื่อดู)')}
                >
                  {showLoginPassword ? <IconEye size={18} className="text-orange-500" /> : <IconEyeOff size={18} className="text-slate-400" />}
                </button>
              </div>
              {fieldErrors.loginPassword && (
                <p className="mt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1 animate-fade-in">
                  <span>❌</span>
                  <span>{fieldErrors.loginPassword}</span>
                </p>
              )}
            </div>

            <div className="flex justify-between items-center px-1 pt-0.5">
              <button
                type="button"
                onClick={() => handleSendOtp(authEmail)}
                className="min-h-[40px] px-2 text-xs font-extrabold text-rose-600 hover:underline flex items-center"
              >
                {lang === 'en' ? 'Forgot Password?' : 'ลืมรหัสผ่าน'}
              </button>
              <button
                type="button"
                onClick={() => handleSendOtp(authEmail)}
                className="min-h-[40px] px-2 text-xs font-extrabold text-orange-600 hover:underline flex items-center"
              >
                {lang === 'en' ? 'Verify Student OTP' : 'ยืนยันรหัส OTP นักศึกษา'}
              </button>
            </div>

            <div className="pt-1.5">
              <button
                type="submit"
                disabled={authLoading}
                className="w-full min-h-[48px] bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-black py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                {authLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>{lang === 'en' ? 'Log In' : 'เข้าสู่ระบบ'}</span>
                )}
              </button>
            </div>
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthTab('register');
                  setAuthError(null);
                  setFieldErrors({});
                }}
                className="text-xs font-extrabold text-slate-500 hover:text-orange-600 transition"
              >
                {lang === 'en' ? "Don't have an account? Sign Up" : 'ยังไม่มีบัญชีผู้ใช้? สมัครสมาชิกใหม่'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3 px-1 text-left">
            {/* Email Field with Label & Validation */}
            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                {lang === 'en' ? 'Email Address *' : 'อีเมล *'}
              </label>
              <input
                type="text"
                value={authEmail}
                onChange={(e) => {
                  const val = e.target.value;
                  setAuthEmail(val);
                  if (fieldErrors.email && val.trim() && val.includes('@') && val.includes('.')) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.email;
                      return next;
                    });
                  }
                }}
                placeholder={lang === 'en' ? 'e.g. name@dome.tu.ac.th' : 'เช่น yourname@dome.tu.ac.th'}
                className={`w-full min-h-[46px] text-xs font-bold bg-white border-2 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 shadow-sm transition focus:outline-none focus:ring-2 ${
                  fieldErrors.email
                    ? 'border-rose-500 bg-rose-50/25 focus:ring-rose-400 text-rose-900'
                    : 'border-orange-500 focus:ring-orange-400'
                }`}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1 animate-fade-in">
                  <span>❌</span>
                  <span>{fieldErrors.email}</span>
                </p>
              )}
            </div>

            {/* Password Field with Label & Validation */}
            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                {lang === 'en' ? 'Create Password (min. 6 chars) *' : 'กำหนดรหัสผ่าน (อย่างน้อย 6 ตัวอักษร) *'}
              </label>
              <div className="relative">
                <input
                  type={showRegisterPassword ? 'text' : 'password'}
                  value={authPassword}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAuthPassword(val);
                    if (fieldErrors.password && val.length >= 6) {
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.password;
                        return next;
                      });
                    }
                  }}
                  placeholder={lang === 'en' ? 'At least 6 characters' : 'รหัสผ่านอย่างน้อย 6 ตัวอักษร'}
                  className={`w-full min-h-[46px] text-xs font-bold bg-white border-2 rounded-xl pl-4 pr-11 py-2.5 text-slate-800 placeholder-slate-400 shadow-sm transition focus:outline-none focus:ring-2 ${
                    fieldErrors.password
                      ? 'border-rose-500 bg-rose-50/25 focus:ring-rose-400 text-rose-900'
                      : 'border-orange-500 focus:ring-orange-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-orange-600 active:scale-95 transition"
                  title={showRegisterPassword ? (lang === 'en' ? 'Password visible (click to hide)' : 'กำลังแสดงรหัสผ่าน (คลิกเพื่อซ่อน)') : (lang === 'en' ? 'Password hidden (click to show)' : 'ซ่อนรหัสผ่านอยู่ (คลิกเพื่อดู)')}
                >
                  {showRegisterPassword ? <IconEye size={18} className="text-orange-500" /> : <IconEyeOff size={18} className="text-slate-400" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1 animate-fade-in">
                  <span>❌</span>
                  <span>{fieldErrors.password}</span>
                </p>
              )}
            </div>

            {/* Student ID Field with Label, Char Counter & Validation */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-black text-slate-700">
                  {lang === 'en' ? 'Student ID (10 digits) *' : 'รหัสนักศึกษา (10 หลัก) *'}
                </label>
                <span className={`text-[10px] font-mono font-bold ${
                  authStudentId.length === 10 ? 'text-emerald-600' : 'text-slate-400'
                }`}>
                  {authStudentId.length}/10
                </span>
              </div>
              <input
                type="text"
                value={authStudentId}
                onChange={(e) => {
                  const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setAuthStudentId(clean);
                  if (fieldErrors.studentId && clean.length === 10) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.studentId;
                      return next;
                    });
                  }
                }}
                inputMode="numeric"
                maxLength={10}
                placeholder={lang === 'en' ? 'e.g. 6722781927' : 'เช่น 6722781927'}
                className={`w-full min-h-[46px] text-xs font-bold bg-white border-2 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 shadow-sm transition focus:outline-none focus:ring-2 font-mono ${
                  fieldErrors.studentId
                    ? 'border-rose-500 bg-rose-50/25 focus:ring-rose-400 text-rose-900'
                    : 'border-orange-500 focus:ring-orange-400'
                }`}
              />
              {fieldErrors.studentId && (
                <p className="mt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1 animate-fade-in">
                  <span>❌</span>
                  <span>{fieldErrors.studentId}</span>
                </p>
              )}
            </div>

            {/* Full Name Field with Label & Letters-Only Validation */}
            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                {lang === 'en' ? 'Full Name / Nickname (Letters only) *' : 'ชื่อ-นามสกุล / ชื่อเล่น (ตัวอักษรเท่านั้น) *'}
              </label>
              <input
                type="text"
                value={authName}
                onChange={(e) => {
                  const clean = e.target.value.replace(/[^a-zA-Z\u0E00-\u0E7F\s]/g, '');
                  setAuthName(clean);
                  if (fieldErrors.name && clean.trim().length > 0) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.name;
                      return next;
                    });
                  }
                }}
                placeholder={lang === 'en' ? 'e.g. Zack' : 'เช่น นาย บี (ต้น)'}
                className={`w-full min-h-[46px] text-xs font-bold bg-white border-2 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 shadow-sm transition focus:outline-none focus:ring-2 ${
                  fieldErrors.name
                    ? 'border-rose-500 bg-rose-50/25 focus:ring-rose-400 text-rose-900'
                    : 'border-orange-500 focus:ring-orange-400'
                }`}
              />
              {fieldErrors.name && (
                <p className="mt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1 animate-fade-in">
                  <span>❌</span>
                  <span>{fieldErrors.name}</span>
                </p>
              )}
            </div>

            {/* Faculty & Year Field with Label & Validation */}
            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                {lang === 'en' ? 'Faculty & Year *' : 'คณะและชั้นปี *'}
              </label>
              <input
                type="text"
                value={authFaculty}
                onChange={(e) => {
                  const clean = e.target.value.replace(/[^a-zA-Z0-9\u0E00-\u0E7F\s.•\-\/]/g, '');
                  setAuthFaculty(clean);
                  if (fieldErrors.faculty && clean.trim().length > 0) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.faculty;
                      return next;
                    });
                  }
                }}
                placeholder={lang === 'en' ? 'e.g. SIIT • CPE Year 1' : 'เช่น SIIT • CPE ปี 1'}
                className={`w-full min-h-[46px] text-xs font-bold bg-white border-2 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 shadow-sm transition focus:outline-none focus:ring-2 ${
                  fieldErrors.faculty
                    ? 'border-rose-500 bg-rose-50/25 focus:ring-rose-400 text-rose-900'
                    : 'border-orange-500 focus:ring-orange-400'
                }`}
              />
              {fieldErrors.faculty && (
                <p className="mt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1 animate-fade-in">
                  <span>❌</span>
                  <span>{fieldErrors.faculty}</span>
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  const errors: { [key: string]: string } = {};
                  const cleanEmail = authEmail.trim();
                  if (!cleanEmail) {
                    errors.email = lang === 'en' ? 'Please enter your email' : 'กรุณากรอกอีเมล';
                  } else if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
                    errors.email = lang === 'en'
                      ? 'Invalid email format (must include @ and domain e.g. name@dome.tu.ac.th)'
                      : 'รูปแบบอีเมลไม่ถูกต้อง (ต้องมี @ และโดเมน เช่น name@dome.tu.ac.th)';
                  }

                  if (!authPassword || authPassword.length < 6) {
                    errors.password = lang === 'en'
                      ? 'Password must be at least 6 characters'
                      : 'กรุณากำหนดรหัสผ่านอย่างน้อย 6 ตัวอักษร';
                  }

                  const cleanStudentId = authStudentId.trim();
                  if (!cleanStudentId) {
                    errors.studentId = lang === 'en'
                      ? 'Please enter student ID'
                      : 'กรุณากรอกรหัสนักศึกษา';
                  } else if (cleanStudentId.length !== 10) {
                    errors.studentId = lang === 'en'
                      ? `Student ID must be 10 digits (currently ${cleanStudentId.length} digits)`
                      : `รหัสนักศึกษาต้องเป็นตัวเลข 10 หลัก (ปัจจุบันมี ${cleanStudentId.length} หลัก)`;
                  }

                  const cleanName = authName.trim();
                  if (!cleanName) {
                    errors.name = lang === 'en' ? 'Please enter your name' : 'กรุณากรอกชื่อ-นามสกุล';
                  } else if (!/^[a-zA-Z\u0E00-\u0E7F\s]+$/.test(cleanName)) {
                    errors.name = lang === 'en'
                      ? 'Name must only contain letters (no digits or symbols)'
                      : 'ชื่อ-นามสกุลต้องเป็นตัวอักษรเท่านั้น (ไม่มีตัวเลขหรือสัญลักษณ์)';
                  }

                  const cleanFaculty = authFaculty.trim();
                  if (!cleanFaculty) {
                    errors.faculty = lang === 'en' ? 'Please enter faculty and year' : 'กรุณากรอกคณะและชั้นปี';
                  }

                  if (Object.keys(errors).length > 0) {
                    setFieldErrors(errors);
                    setAuthError(lang === 'en' ? 'Please check and fix the red highlighted fields below' : 'กรุณาตรวจสอบและแก้ไขข้อมูลในช่องที่มีกรอบสีแดงด้านล่าง');
                    return;
                  }

                  setFieldErrors({});
                  setAuthError(null);
                  setSetupProfile({
                    name: cleanName,
                    studentId: cleanStudentId,
                    email: cleanEmail,
                    password: authPassword || 'password123',
                    gender: 'other',
                    role: 'both',
                    faculty: cleanFaculty,
                    university: 'ม.ธรรมศาสตร์ (SIIT)',
                    bio: 'นิสิต SIIT ยินดีที่ได้รู้จักครับ/ค่ะ!',
                    ig: '',
                    facebook: '',
                  });
                  setShowProfileSetupModal(true);
                }}
                className="w-full min-h-[48px] bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-black py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <span>{lang === 'en' ? 'Continue & Set Up Profile →' : 'สมัครสมาชิก & ตั้งค่าโปรไฟล์ →'}</span>
              </button>
            </div>
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthTab('login');
                  setAuthError(null);
                  setFieldErrors({});
                }}
                className="text-xs font-extrabold text-slate-500 hover:text-orange-600 transition"
              >
                {lang === 'en' ? 'Already have an account? Log In' : 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderOtp = () => (
    <div className="p-6 pt-10 flex-1 flex flex-col justify-center items-center bg-white">
      <div className="w-full max-w-md flex-1 flex flex-col justify-between">
        <div>
          <button
            type="button"
            onClick={() => {
              setAuthError(null);
              setScreen('login');
            }}
            className="min-h-[44px] text-xs font-extrabold text-orange-600 bg-orange-50 px-3.5 py-2 rounded-xl inline-flex items-center"
          >
            {lang === 'en' ? '← Back to Login' : '← กลับหน้าเข้าสู่ระบบ'}
          </button>
          <h2 className="text-2xl font-black mt-6 text-slate-900">
            {lang === 'en' ? 'Verify Student OTP' : 'ยืนยันรหัส OTP นักศึกษา'}
          </h2>
          <p className="text-xs text-slate-600 mt-2 font-medium">
            {lang === 'en' ? 'Enter the 6-digit code sent to ' : 'กรอกรหัส 6 หลักที่ส่งไปยังอีเมล '}
            <span className="font-bold text-slate-900">{authEmail}</span>
          </p>

          {otpMailPreviewUrl && (
            <div className="mt-3 p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-[11px] font-bold text-orange-950 flex items-center justify-between gap-2">
              <span className="truncate">
                {lang === 'en'
                  ? '✉️ Email dispatched to sandbox mailbox'
                  : '✉️ ส่งอีเมลแล้ว (คลิกเปิดดูกล่องจดหมายจำลอง)'}
              </span>
              <a
                href={otpMailPreviewUrl}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-[10px] font-black shrink-0 whitespace-nowrap"
              >
                {lang === 'en' ? 'Open Preview ↗' : 'เปิดดูอีเมล ↗'}
              </a>
            </div>
          )}

          {authError && (
            <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
              ⚠️ {authError}
            </div>
          )}

          {/* 6-Digit OTP Interactive Input Grid */}
          <div className="grid grid-cols-6 gap-2 my-8 tabular-nums">
            {otpDigits.map((digit, i) => (
              <input
                key={i}
                id={`otp-input-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  const next = [...otpDigits];
                  next[i] = val.slice(-1);
                  setOtpDigits(next);
                  if (val && i < 5) {
                    const nextInput = document.getElementById(`otp-input-${i + 1}`);
                    nextInput?.focus();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !otpDigits[i] && i > 0) {
                    const prevInput = document.getElementById(`otp-input-${i - 1}`);
                    prevInput?.focus();
                  }
                }}
                className="h-12 w-full text-center rounded-xl border-2 border-orange-500 bg-orange-50/70 focus:bg-white text-orange-700 focus:text-orange-900 text-lg font-black font-mono focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            ))}
          </div>

          <div className="flex justify-between items-center text-xs">
            <button
              type="button"
              onClick={() => handleSendOtp(authEmail)}
              className="font-extrabold text-orange-600 hover:underline"
            >
              {lang === 'en' ? 'Resend OTP to email' : 'ส่งรหัส OTP ใหม่อีกครั้ง'}
            </button>
          </div>
        </div>

        <div className="space-y-2 pt-4">
          <button
            type="button"
            onClick={handleVerifyOtp}
            disabled={authLoading}
            className="w-full min-h-[48px] bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-black py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            {authLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{lang === 'en' ? 'Verify OTP & Continue →' : 'ยืนยันรหัส OTP และดำเนินการต่อ →'}</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setScreen('explore');
              showToast(lang === 'en' ? 'Direct access granted! Welcome to CampusHop.' : 'เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับสู่ CampusHop');
            }}
            className="w-full py-2.5 text-center text-xs font-black text-slate-500 hover:text-orange-600 active:scale-95 transition"
          >
            {lang === 'en' ? '⚡ Skip OTP & Enter App Directly →' : '⚡ ข้ามขั้นตอน OTP และเข้าสู่ระบบทันที →'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderMap = () => {
    const isBooked = Boolean(activeBooking);
    const mapPinRides = rides.filter(
      (r) =>
        ['hop-z', 'hop-y', 'hop-nicha'].includes(r.id) ||
        r.id.startsWith('hop-custom-')
    );
    const mapRide = isBooked
      ? (activeBookedRideObj || mapPinRides[0] || rides[0])
      : (selectedMapRideId ? (mapPinRides.find((r) => r.id === selectedMapRideId) || null) : null);
    const regularPerSeat = mapRide ? (mapRide.baseFare + mapRide.commissionFee) : 35;
    const netPerSeat = mapRide ? (regularPerSeat - (isPremium ? mapRide.commissionFee : 0)) : 30;

    const currentDestName = (isBooked && activeBookedRideObj)
      ? (activeBookedRideObj.actualDropOffName || activeBookedRideObj.destination)
      : destinationName;

    const currentDestPos = (isBooked && activeBookedRideObj)
      ? getLandmarkCoords(activeBookedRideObj.actualDropOffName || activeBookedRideObj.destination)
      : destinationPos;

    const handleSelectMapVehicle = (rideId: string) => {
      if (isBooked) return;
      setSelectedMapRideId(rideId);
      setMapSelectTrigger((prev) => prev + 1);
      const targetRide = mapPinRides.find((r) => r.id === rideId);
      if (targetRide) {
        const targetDest = targetRide.actualDropOffName || targetRide.destination;
        if (targetDest) {
          setDestinationName(targetDest);
          setDestinationPos(getLandmarkCoords(targetDest));
        }
      }
    };

    const mapCanvasContent = (
      <RealTimeMap
        rides={mapPinRides}
        selectedRideId={mapRide?.id || null}
        isPremium={isPremium}
        isBooked={isBooked}
        lang={lang}
        destinationName={currentDestName}
        destinationPos={currentDestPos}
        onDestinationChange={handleDestinationChange}
        onSelectRide={handleSelectMapVehicle}
        selectionTrigger={mapSelectTrigger}
        recenterTrigger={recenterTrigger}
        isModalOpen={Boolean(activeSeatModalRideId || pendingBookingRideId)}
        onRequestFinishTrip={() =>
          handleOpenSeatModal(activeBookedRideObj || mapRide || mapPinRides[0], 'trip-review')
        }
        className="flex-1 min-h-[200px]"
      />
    );

    const focusedVehicleCard = mapRide ? (
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
                {mapRide.licensePlate ? `(${mapRide.licensePlate})` : ''} •{' '}
                {lang === 'en'
                  ? `${mapRide.seatsLeft} seat(s) left`
                  : `ว่าง ${mapRide.seatsLeft} ที่นั่ง`}
              </div>
              <div className="text-[10px] font-bold text-teal-700 truncate">
                {lang === 'en' ? 'Drop-off: ' : 'จุดหมายปลายทาง: '}
                {mapRide.actualDropOffName}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right tabular-nums">
              <div className="text-sm font-black text-orange-600 font-mono">
                {lang === 'en' ? 'Net ฿' : 'สุทธิ ฿'}{netPerSeat}
              </div>
              <div className="text-[9px] font-bold text-slate-500">
                {lang === 'en' ? 'Reg ฿' : 'ปกติ ฿'}{regularPerSeat}
              </div>
            </div>
            {!isBooked && (
              <button
                type="button"
                onClick={() => setSelectedMapRideId(null)}
                className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 text-xs font-bold flex items-center justify-center transition"
                title={lang === 'en' ? 'Close' : 'ปิด'}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {!isBooked && (
          <div className="px-2.5 py-1.5 bg-orange-50/80 border border-orange-200/90 rounded-xl flex items-center gap-1.5 text-[11px] font-bold text-orange-800">
            <span>🔒</span>
            <span>
              {lang === 'en'
                ? 'Route preview mode — Driver live location is hidden until you select / book driver'
                : 'โหมดดูเส้นทาง — ไม่แสดงตำแหน่งรถคนขับจนกว่าจะเลือกคนขับและจองที่นั่ง'}
            </span>
          </div>
        )}

        {isBooked && mapRide.mode === 'prebook' && (
          <div className="px-2.5 py-1.5 bg-amber-50/80 border border-amber-200/90 rounded-xl flex items-center gap-1.5 text-[11px] font-bold text-amber-800">
            <span>📅</span>
            <span>
              {lang === 'en'
                ? 'Scheduled Pre-Book: Driver live tracking activates on departure day'
                : 'ทริปจองล่วงหน้า: จะแสดงตำแหน่งคนขับแบบเรียลไทม์เมื่อถึงวันและเวลาออกเดินทาง'}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={() => handleOpenSeatModal(mapRide, isBooked ? 'active-status' : 'select-seat')}
          className={`w-full min-h-[46px] py-2.5 px-3 rounded-xl text-white font-black text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-1.5 ${
            isBooked
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-orange-500 hover:bg-orange-600'
          }`}
        >
          {isBooked
            ? (lang === 'en'
                ? 'On the way — Tap to view status or finish trip'
                : 'กำลังเดินทาง — แตะเพื่อดูสถานะหรือจบทริป')
            : (lang === 'en'
                ? `Select Seats & Book Ride with ${mapRide.hostName} →`
                : `เลือกคนขับคนนี้ & เลือกที่นั่ง (${mapRide.hostName}) →`)}
        </button>
      </div>
    ) : null;

    // TABLET / iPAD VIEW: Split-Screen Map Layout (Driver Privacy Compliant)
    if (isTablet) {
      return (
        <div className="flex-1 flex flex-row bg-slate-50 overflow-hidden">
          {/* Left Master Pane: Privacy Protection Notice & Active Booking (No Public Driver Tracking) */}
          <div className="w-[350px] lg:w-[390px] border-r border-slate-200 bg-white flex flex-col shrink-0 overflow-y-auto custom-scroll p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <IconPin size={16} className="text-orange-500" />
                <div>
                  <h2 className="text-sm font-black text-slate-900">
                    {lang === 'en' ? 'Pickup & Drop-off Map' : 'แผนที่จุดรับ-ส่ง & การเดินทาง'}
                  </h2>
                  <p className="text-[10px] font-bold text-slate-500">
                    {lang === 'en'
                      ? 'Destination matches driver’s trip'
                      : 'จุดหมายปลายทางตรงกับที่คนขับต้องการไป'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRecenterTrigger((prev) => prev + 1)}
                className="min-h-[36px] px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 text-xs font-black flex items-center gap-1 shadow-sm transition active:scale-95 shrink-0"
                title={lang === 'en' ? 'Center Map' : 'จัดกึ่งกลางแผนที่'}
              >
                <span>🎯</span>
                <span>{lang === 'en' ? 'Center Map' : 'จัดกึ่งกลาง'}</span>
              </button>
            </div>

            {/* Active Booking Card or Driver Selection */}
            {isBooked ? (
              <div className="space-y-2">
                <div className="text-[10px] font-black text-emerald-700 flex items-center justify-between">
                  <span>{lang === 'en' ? 'Your Ongoing Trip:' : 'ทริปที่คุณกำลังเดินทาง:'}</span>
                  <span>{mapRide?.hostName}</span>
                </div>
                {focusedVehicleCard}
              </div>
            ) : mapRide ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-black text-orange-600">
                  <span>{lang === 'en' ? 'Selected Driver' : 'คนขับที่คุณเลือก'}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedMapRideId(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    {lang === 'en' ? '✕ Deselect' : '✕ ยกเลิกเลือก'}
                  </button>
                </div>
                {focusedVehicleCard}
              </div>
            ) : (
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-2xl">
                  🗺️
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900">
                    {lang === 'en' ? 'No Driver Selected' : 'ยังไม่ได้เลือกคนขับ'}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-500 mt-1">
                    {lang === 'en'
                      ? 'Please choose a driver from the Home screen to view their route on the map.'
                      : 'กรุณาเลือกคนขับจากหน้าหลัก เพื่อดูตำแหน่งและเส้นทางบนแผนที่'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setScreen('explore')}
                  className="w-full py-2.5 px-3 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <span>🏠</span>
                  <span>{lang === 'en' ? 'Go to Home Screen to Select Driver' : 'ไปที่หน้าหลักเพื่อเลือกคนขับ'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Detail Pane: Full Interactive Map Canvas */}
          <div className="flex-1 flex flex-col p-4 bg-slate-50 min-h-[580px] relative">
            {mapCanvasContent}
          </div>

          {/* Tablet Floating Confirmation for Pending Booking */}
          {pendingBookingRideId && (
            <div className="fixed bottom-8 right-8 z-50 bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-2xl border-2 border-orange-500 backdrop-blur-md flex items-center justify-between gap-3 animate-bounce-short">
              <div className="min-w-0 pr-1">
                <div className="text-[10px] font-black text-orange-400 uppercase tracking-wider flex items-center gap-1">
                  <span>🗺️</span>
                  <span>{lang === 'en' ? 'Map Drop-off Mode' : 'โหมดเลือกจุดส่งในแผนที่'}</span>
                </div>
                <div className="text-xs font-black truncate mt-0.5 flex items-center gap-1 text-white">
                  <span>📍</span>
                  <span className="truncate">{destinationName}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActiveSeatModalRideId(pendingBookingRideId);
                    setPendingBookingRideId(null);
                  }}
                  className="px-3.5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs rounded-xl shadow-lg shadow-orange-500/30 flex items-center gap-1 transition active:scale-95"
                >
                  <span>✓</span>
                  <span>{lang === 'en' ? 'Use This & Book' : 'ใช้จุดส่งนี้ & กลับไปจอง'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPendingBookingRideId(null)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition"
                  title="Cancel"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    // MOBILE VIEW (< 768px): Full-Screen Map + Privacy Compliant Bottom Sheet
    return (
      <div className="flex-1 flex flex-col relative bg-slate-50 pb-[88px] overflow-hidden">
        <div className="px-3.5 py-2 bg-white z-10 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <IconPin size={15} className="text-orange-500" />
            <h2 className="text-xs font-black text-slate-900">
              {lang === 'en'
                ? 'Pickup & Route Map'
                : 'แผนที่จุดรับ-ส่ง & เส้นทาง'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setRecenterTrigger((prev) => prev + 1)}
            className="min-h-[34px] px-2.5 py-1 text-[11px] font-black bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 rounded-xl shadow-sm transition active:scale-95 flex items-center gap-1 shrink-0"
            title={lang === 'en' ? 'Center Map' : 'จัดกึ่งกลางแผนที่'}
          >
            <span>🎯</span>
            <span>{lang === 'en' ? 'Center' : 'จัดกึ่งกลาง'}</span>
          </button>
        </div>

        {/* Interactive Pan & Focus Map Viewport */}
        <div className="flex-1 flex flex-col mx-3 mt-2 mb-1.5 min-h-[200px]">
          {mapCanvasContent}
        </div>

        {/* Floating Banner when picking dropoff on Mobile */}
        {pendingBookingRideId && (
          <div className="mx-3 mb-2 bg-slate-900/95 text-white p-3 rounded-2xl shadow-xl border-2 border-orange-500 backdrop-blur-md flex items-center justify-between gap-2.5 z-30">
            <div className="min-w-0 pr-1">
              <div className="text-[9.5px] font-black text-orange-400 uppercase tracking-wider flex items-center gap-1">
                <span>🗺️</span>
                <span>{lang === 'en' ? 'Map Drop-off Mode' : 'โหมดเลือกจุดส่งในแผนที่'}</span>
              </div>
              <div className="text-xs font-black truncate mt-0.5 flex items-center gap-1 text-white">
                <span>📍</span>
                <span className="truncate">{destinationName}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveSeatModalRideId(pendingBookingRideId);
                  setPendingBookingRideId(null);
                }}
                className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1 transition active:scale-95"
              >
                <span>✓</span>
                <span>{lang === 'en' ? 'Use & Book' : 'ใช้จุดส่งนี้ & กลับไปจอง'}</span>
              </button>
              <button
                type="button"
                onClick={() => setPendingBookingRideId(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-xs font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Native Mobile Bottom Sheet Drawer with Drag Handle */}
        <div className="shrink-0 bg-white rounded-t-[28px] border-t border-slate-200 px-3.5 pt-2 pb-4 shadow-[0_-8px_24px_rgba(15,23,42,0.12)] space-y-2 z-20">
          <div
            onClick={() => setIsMobileDrawerExpanded(!isMobileDrawerExpanded)}
            className="w-full flex flex-col items-center py-1 cursor-pointer select-none active:opacity-70"
            title={isMobileDrawerExpanded ? 'ย่อแถบ' : 'ขยายแถบ'}
          >
            <div className="w-12 h-1.5 rounded-full bg-slate-300 hover:bg-slate-400 transition mb-0.5" />
            <div className="text-[9px] font-bold text-slate-400">
              {isMobileDrawerExpanded
                ? (lang === 'en' ? '▼ Tap to slide down' : '▼ แตะเพื่อเลื่อนลง')
                : (lang === 'en' ? '▲ Tap to slide up' : '▲ แตะเพื่อเลื่อนขึ้น')}
            </div>
          </div>

          {isMobileDrawerExpanded ? (
            isBooked ? (
              focusedVehicleCard
            ) : mapRide ? (
              <div className="space-y-2">
                {focusedVehicleCard}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-3 border border-slate-200 text-center space-y-2.5">
                <div className="w-10 h-10 mx-auto rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-lg">
                  🗺️
                </div>
                <div>
                  <div className="text-xs font-black text-slate-800">
                    {lang === 'en' ? 'No Driver Selected' : 'ยังไม่ได้เลือกคนขับ'}
                  </div>
                  <p className="text-[10.5px] font-bold text-slate-500 mt-0.5">
                    {lang === 'en'
                      ? 'Please choose a driver from the Home screen'
                      : 'กรุณาเลือกคนขับจากหน้าหลัก เพื่อดูเส้นทางบนแผนที่'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setScreen('explore')}
                  className="w-full py-2.5 px-3 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <span>🏠</span>
                  <span>{lang === 'en' ? 'Go to Home Screen' : 'ไปที่หน้าหลักเพื่อเลือกคนขับ'}</span>
                </button>
              </div>
            )
          ) : (
            <div
              onClick={() => {
                if (mapRide || isBooked) {
                  setIsMobileDrawerExpanded(true);
                } else {
                  setScreen('explore');
                }
              }}
              className="flex items-center justify-between gap-2 p-2 bg-slate-50 hover:bg-orange-50/50 border border-slate-200 rounded-2xl cursor-pointer transition active:scale-98"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0 text-xs">
                  {mapRide ? '🚗' : '🗺️'}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-slate-900 truncate">
                    {mapRide ? `${mapRide.hostName} (${mapRide.vehicleLabel})` : (lang === 'en' ? 'No driver selected' : 'ยังไม่ได้เลือกคนขับ')}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 truncate">
                    {isBooked
                      ? (lang === 'en' ? 'Ongoing Trip' : 'ทริปที่กำลังเดินทาง')
                      : mapRide
                      ? (lang === 'en' ? `฿${netPerSeat} • ${mapRide.seatsLeft} seat(s) left` : `฿${netPerSeat} • ว่าง ${mapRide.seatsLeft} ที่นั่ง`)
                      : (lang === 'en' ? 'Tap to choose from Home screen' : 'แตะเพื่อไปเลือกคนขับที่หน้าหลัก')}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (mapRide) {
                    handleOpenSeatModal(mapRide, isBooked ? 'active-status' : 'select-seat');
                  } else {
                    setScreen('explore');
                  }
                }}
                className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-[11px] rounded-xl shadow-sm shrink-0 transition active:scale-95"
              >
                {isBooked ? (lang === 'en' ? 'Status' : 'สถานะ') : mapRide ? (lang === 'en' ? 'Book' : 'จอง') : (lang === 'en' ? 'Choose' : 'เลือก')}
              </button>
            </div>
          )}
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

        {/* Single Active Trip Card (with Unlocked Social Contacts + Co-Hopper Chat + Complete Trip & Cancel Triggers) */}
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
                    getSeatPositionsForRide(activeBookedRideObj).find(
                      (s) => s.id === id
                    )?.shortLabel || id
                )
                .join(', ')}{' '}
              • {activeBookedRideObj.vehicleLabel}
            </div>

            {/* Unlocked Social Contacts + Co-Hopper Chat Button (Points 8 & 9) */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 text-white p-2.5 rounded-xl">
              <div className="flex flex-wrap items-center gap-1.5">
                {activeBookedRideObj.ig && (
                  <a
                    href={`https://instagram.com/${activeBookedRideObj.ig.replace(
                      '@',
                      ''
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[9.5px] bg-pink-600 hover:bg-pink-500 text-white px-2.5 py-1 rounded-full font-extrabold inline-flex items-center gap-1 transition"
                  >
                    <IconInstagram size={10} />
                    <span>{activeBookedRideObj.ig}</span>
                  </a>
                )}
                {activeBookedRideObj.facebook && (
                  <a
                    href={`https://facebook.com/search/top/?q=${encodeURIComponent(
                      activeBookedRideObj.facebook
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[9.5px] bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded-full font-extrabold inline-flex items-center gap-1 transition"
                  >
                    <IconFacebook size={10} />
                    <span>Facebook</span>
                  </a>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleOpenDriverChat(activeBookedRideObj)}
                className="min-h-[34px] px-3 py-1 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-[10px] flex items-center gap-1 active:scale-95 transition shadow-sm"
              >
                <IconChatBubble size={12} />
                <span>แชทเพื่อนร่วมทาง</span>
              </button>
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
                  handleOpenSeatModal(activeBookedRideObj, 'confirm-finish')
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
        <div
          className={`mb-2.5 flex items-center gap-1.5 border px-3 py-1.5 rounded-full shadow-sm text-[11px] font-black z-40 ${
            theme === 'dark'
              ? 'bg-slate-900 border-slate-700 text-slate-100'
              : 'bg-white/95 border-slate-300 text-slate-800'
          }`}
        >
          <span
            className={
              theme === 'dark' ? 'text-slate-300 px-1' : 'text-slate-500 px-1'
            }
          >
            {lang === 'en' ? 'Preview Mode:' : 'โหมดแสดงผล:'}
          </span>
          <button
            type="button"
            onClick={() => setDeviceMode('auto')}
            className={`px-3 py-1 rounded-full transition ${
              deviceMode === 'auto'
                ? 'bg-orange-500 text-white shadow-sm'
                : theme === 'dark'
                  ? 'text-slate-200 hover:bg-slate-800'
                  : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {lang === 'en'
              ? `Auto Responsive (${viewportWidth >= 768 ? 'Tablet/iPad' : 'Mobile'})`
              : `อัตโนมัติตามจอ (${viewportWidth >= 768 ? 'แท็บเล็ต/iPad' : 'มือถือ'})`}
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode('mobile')}
            className={`px-3 py-1 rounded-full transition ${
              deviceMode === 'mobile'
                ? 'bg-orange-500 text-white shadow-sm'
                : theme === 'dark'
                  ? 'text-slate-200 hover:bg-slate-800'
                  : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {lang === 'en' ? 'Smartphone (iOS / Android)' : 'สมาร์ทโฟน (iOS / Android)'}
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode('tablet')}
            className={`px-3 py-1 rounded-full transition ${
              deviceMode === 'tablet'
                ? 'bg-orange-500 text-white shadow-sm'
                : theme === 'dark'
                  ? 'text-slate-200 hover:bg-slate-800'
                  : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {lang === 'en' ? 'Tablet / iPad (Split-View)' : 'แท็บเล็ต / iPad (Split-View)'}
          </button>
        </div>
      )}

      {/* Native App Device Shell: Adapts Fluidly Between Mobile (390x844 / 100dvh) and Tablet/iPad (1140x820 / Split-View) */}
      <div
        className={`w-full ${
          isTablet
            ? 'max-w-[1160px] h-[100dvh] md:h-[min(820px,calc(100dvh-3.5rem))] md:rounded-[36px] md:border-[8px] md:border-slate-800'
            : 'sm:max-w-[396px] h-[100dvh] sm:h-[min(844px,calc(100dvh-3.5rem))] sm:rounded-[44px] sm:border-[8px] sm:border-slate-800'
        } shadow-2xl overflow-hidden flex flex-col relative transition-all duration-300 ${
          theme === 'dark'
            ? 'theme-dark bg-slate-900 text-slate-100'
            : 'bg-white text-slate-900'
        }`}
      >
        {/* Main Adaptive Workspace: Left Navigation Rail on Tablet/iPad + Right Content Area */}
        <div className="flex-1 flex flex-row overflow-hidden relative">
          {/* TABLET / iPAD LEFT NAVIGATION RAIL (iPadOS Sidebar / Material 3 Navigation Rail) */}
          {isTablet && showHeaderAndNav && (
            <aside
              aria-label="แถบเมนูหลักสำหรับแท็บเล็ตและไอแพด"
              className="w-[228px] lg:w-[244px] bg-white border-r border-slate-200 flex flex-col justify-between p-3.5 shrink-0 z-20"
            >
              <div className="space-y-4">
                {/* Brand Logo Header in Sidebar (Original Rabbit Logo & Clean Brand Name) */}
                <button
                  type="button"
                  onClick={() => setScreen('explore')}
                  className="w-full flex items-center gap-2.5 text-left p-2 rounded-2xl hover:bg-orange-50/60 transition"
                >
                  <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0">
                    <PassengerBunnySvg size={26} />
                  </div>
                  <div className="text-base font-black tracking-tight text-slate-900 font-display leading-none">
                    CAMPUS<span className="text-orange-500">HOP</span>
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
                    <span>{lang === 'en' ? 'Explore (Find Rides)' : 'หน้าหลัก (ค้นหาทริป)'}</span>
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
                    <span>{lang === 'en' ? 'Pickup & Drop-off Map' : 'แผนที่จุดรับ-ส่ง'}</span>
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
                    <span>{lang === 'en' ? 'AI Concierge & Chat' : 'AI จองให้ & เพื่อน'}</span>
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
                    <span>{lang === 'en' ? 'Payment & Coupons' : 'ชำระเงิน & คูปอง'}</span>
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
                      <span>{lang === 'en' ? 'Trip History' : 'ประวัติการเดินทาง'}</span>
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
                    <span>{lang === 'en' ? 'My Profile' : 'โปรไฟล์ของฉัน'}</span>
                  </button>
                </nav>
              </div>

              {/* Bottom Sidebar Status Card (Only shown when an active trip is ongoing) */}
              {activeBooking && activeBookedRideObj && (
                <div className="pt-3 border-t border-slate-200">
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
                </div>
              )}
            </aside>
          )}

          {/* Main Content Column */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {/* Persistent App Header (Original Rabbit Logo, CODE Button, No Mobile Overflow) */}
            {showHeaderAndNav && (
              <header className="px-3.5 py-2 bg-white border-b border-slate-200 flex items-center justify-between gap-2 z-30 shrink-0 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setScreen('explore')}
                  className="min-h-[44px] flex items-center gap-2 text-left min-w-0 shrink-0"
                >
                  <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0">
                    <PassengerBunnySvg size={22} />
                  </div>
                  <div className="text-xs font-black tracking-tight text-slate-900 font-display leading-none truncate">
                    CAMPUS<span className="text-orange-500">HOP</span>
                  </div>
                </button>

                <div className="flex items-center gap-1 shrink-0">
                  {/* Language Switcher Button (TH / EN) */}
                  <button
                    type="button"
                    onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
                    title="สลับภาษา (Switch Language TH / EN)"
                    aria-label="สลับภาษา TH / EN"
                    className="min-h-[40px] px-2 rounded-xl bg-slate-100 hover:bg-orange-50 border border-slate-200 text-[10px] font-black flex items-center gap-0.5 transition shrink-0"
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
                    className="min-w-[40px] min-h-[40px] rounded-xl bg-slate-100 hover:bg-orange-50 border border-slate-200 text-slate-700 flex items-center justify-center transition shrink-0"
                  >
                    {theme === 'light' ? (
                      <IconMoon size={15} />
                    ) : (
                      <IconSun size={15} className="text-orange-400" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setScreen('payment')}
                    title="การชำระเงินและโค้ดโปรโมชัน"
                    className={`min-h-[40px] px-2.5 py-1.5 rounded-xl text-[10px] font-black border flex items-center gap-1 transition shrink-0 ${
                      screen === 'payment'
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
                    }`}
                  >
                    <IconTicket size={13} />
                    <span>CODE</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScreen('history')}
                    title="สถานะทริปและประวัติการเดินทาง"
                    aria-label="ประวัติการเดินทาง"
                    className={`min-w-[40px] min-h-[40px] rounded-xl border flex items-center justify-center relative transition shrink-0 ${
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

                  {/* Point 1: Remove PRO button from top-right header on mobile view; only show on Tablet where space is abundant */}
                  {isTablet && (
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmPremiumStep(false);
                        setShowPremiumModal(true);
                      }}
                      title="จัดการสถานะสมาชิก HOP Premium"
                      className={`min-h-[40px] px-3 py-1.5 rounded-full text-[10px] font-black border flex items-center gap-1 transition shrink-0 ${
                        isPremium
                          ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                          : 'bg-slate-100 text-slate-700 border-slate-300 hover:border-orange-400'
                      }`}
                    >
                      <IconCrown size={12} />
                      <span>{isPremium ? 'PRO' : 'อัปเกรด'}</span>
                    </button>
                  )}
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
                destinationName={destinationName}
                destinationPos={destinationPos}
                onDestinationChange={handleDestinationChange}
                onOpenSeatModal={handleOpenSeatModal}
                onOpenDriverChat={handleOpenDriverChat}
                onOpenAiTab={() => {
                  setAiSubTab('ai');
                  setScreen('ai');
                }}
                onOpenCreateTab={() => setScreen('create')}
                onOpenMapTab={() => setScreen('map')}
                onSelectRideForMap={(rideId) => {
                  handleSelectMapVehicle(rideId);
                  setScreen('map');
                }}
                lang={lang}
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
                rides={rides}
                activeBooking={activeBooking}
                selectedFriendRideId={selectedFriendRideId}
                onSelectFriendRideId={setSelectedFriendRideId}
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
                onChangeProfile={handleUpdateUserProfile}
                isPremium={isPremium}
                isTablet={isTablet}
                enableTwoFactor={enableTwoFactor}
                onToggleTwoFactor={handleToggleTwoFactor}
                lang={lang}
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
            onOpenDriverChat={handleOpenDriverChat}
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
            lang={lang}
            currentDestination={destinationName}
            onDestinationChange={(name, pos) => {
              if (pos) {
                handleDestinationChange(name, pos);
              } else {
                setDestinationName(name);
                setDestinationPos(getLandmarkCoords(name));
              }
            }}
            onPickOnMap={() => {
              if (activeModalRide) {
                setPendingBookingRideId(activeModalRide.id);
                setActiveSeatModalRideId(null);
                setScreen('map');
                showToast(
                  lang === 'en'
                    ? '🗺️ Tap map, drag pin, or search to pick drop-off, then tap [Use & Book]'
                    : '🗺️ จิ้มแผนที่ ลากหมุด หรือค้นหาเพื่อเลือกจุดส่ง แล้วกด [ใช้จุดส่งนี้ & กลับไปจอง]'
                );
              }
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
                      ค้นหาทริป ตั้งค่าระยะทาง/Vibe เลือกที่นั่ง และเปิดตี้หารค่ารถได้ครบทุกฟีเจอร์
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
                <span className="text-[10px] font-black mt-0.5">
                  {lang === 'en' ? 'Explore' : 'หน้าหลัก'}
                </span>
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
                <span className="text-[10px] font-black mt-0.5">
                  {lang === 'en' ? 'Map' : 'แผนที่'}
                </span>
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
                  {lang === 'en' ? 'Create' : 'เปิดตี้'}
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
                <span className="text-[10px] font-black mt-0.5">
                  {lang === 'en' ? 'AI Auto' : 'AI จองให้'}
                </span>
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
                <span className="text-[10px] font-black mt-0.5">
                  {lang === 'en' ? 'Profile' : 'โปรไฟล์'}
                </span>
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

        {/* Profile Setup / Edit Modal for New User Registration (Linked with MySQL) */}
        {showProfileSetupModal && (
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowProfileSetupModal(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white text-slate-900 w-full max-w-[460px] rounded-3xl p-5 shadow-2xl border-2 border-orange-500 space-y-3.5 my-auto animate-[sheet-rise_0.22s_cubic-bezier(0.22,1,0.36,1)] max-h-[92vh] overflow-y-auto custom-scroll"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl shrink-0">
                    🐰
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      {lang === 'en' ? 'Set Up Your Profile' : '🐰 ตั้งค่าโปรไฟล์ผู้ใช้ใหม่'}
                    </h3>
                    <p className="text-[10.5px] text-slate-500 font-bold">
                      {lang === 'en'
                        ? 'Saved securely to SQL database'
                        : 'บันทึกข้อมูลเข้าสู่ฐานข้อมูล SQL ระบบ CAMPUSHOP'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProfileSetupModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-black text-xs flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    {lang === 'en' ? 'Email (Linked)' : 'อีเมลที่สมัคร (เชื่อมโยงในระบบ)'}
                  </label>
                  <input
                    type="text"
                    disabled
                    value={setupProfile.email}
                    className="w-full min-h-[42px] px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-bold text-xs cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">
                      {lang === 'en' ? 'Full Name / Nickname *' : 'ชื่อ-นามสกุล / ชื่อเล่น *'}
                    </label>
                    <input
                      type="text"
                      value={setupProfile.name}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^a-zA-Z\u0E00-\u0E7F\s]/g, '');
                        setSetupProfile({ ...setupProfile, name: clean });
                        if (modalFieldErrors.name && clean.trim().length > 0) {
                          setModalFieldErrors((prev) => {
                            const next = { ...prev };
                            delete next.name;
                            return next;
                          });
                        }
                      }}
                      placeholder={lang === 'en' ? 'Letters only (e.g. Zack)' : 'ตัวอักษรเท่านั้น เช่น นาย บี (ต้น)'}
                      className={`w-full min-h-[42px] px-3 py-2 bg-white border rounded-xl text-slate-900 font-bold text-xs focus:outline-none transition ${
                        modalFieldErrors.name
                          ? 'border-rose-500 bg-rose-50/25'
                          : 'border-slate-300 focus:border-orange-500'
                      }`}
                    />
                    {modalFieldErrors.name && (
                      <p className="mt-1 text-[10px] font-bold text-rose-600 flex items-center gap-1">
                        <span>❌</span>
                        <span>{modalFieldErrors.name}</span>
                      </p>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-black text-slate-700">
                        {lang === 'en' ? 'Student ID *' : 'รหัสนักศึกษา *'}
                      </label>
                      <span className={`text-[10px] font-mono font-bold ${
                        setupProfile.studentId.length === 10 ? 'text-emerald-600' : 'text-slate-400'
                      }`}>
                        {setupProfile.studentId.length}/10
                      </span>
                    </div>
                    <input
                      type="text"
                      value={setupProfile.studentId}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setSetupProfile({ ...setupProfile, studentId: clean });
                        if (modalFieldErrors.studentId && clean.length === 10) {
                          setModalFieldErrors((prev) => {
                            const next = { ...prev };
                            delete next.studentId;
                            return next;
                          });
                        }
                      }}
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="6622040001 (10 หลัก)"
                      className={`w-full min-h-[42px] px-3 py-2 bg-white border rounded-xl text-slate-900 font-bold text-xs focus:outline-none font-mono transition ${
                        modalFieldErrors.studentId
                          ? 'border-rose-500 bg-rose-50/25'
                          : 'border-slate-300 focus:border-orange-500'
                      }`}
                    />
                    {modalFieldErrors.studentId && (
                      <p className="mt-1 text-[10px] font-bold text-rose-600 flex items-center gap-1">
                        <span>❌</span>
                        <span>{modalFieldErrors.studentId}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">
                      {lang === 'en' ? 'Gender' : 'เพศ'}
                    </label>
                    <select
                      value={setupProfile.gender}
                      onChange={(e) => setSetupProfile({ ...setupProfile, gender: e.target.value as 'male' | 'female' | 'other' })}
                      className="w-full min-h-[42px] px-3 py-2 bg-white border border-slate-300 focus:border-orange-500 rounded-xl text-slate-900 font-bold text-xs focus:outline-none"
                    >
                      <option value="male">{lang === 'en' ? 'Male' : 'ชาย'}</option>
                      <option value="female">{lang === 'en' ? 'Female' : 'หญิง'}</option>
                      <option value="other">{lang === 'en' ? 'Other' : 'อื่นๆ'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">
                      {lang === 'en' ? 'Role' : 'บทบาทการใช้งาน'}
                    </label>
                    <select
                      value={setupProfile.role}
                      onChange={(e) => setSetupProfile({ ...setupProfile, role: e.target.value as UserRoleType })}
                      className="w-full min-h-[42px] px-3 py-2 bg-white border border-slate-300 focus:border-orange-500 rounded-xl text-slate-900 font-bold text-xs focus:outline-none"
                    >
                      <option value="both">{lang === 'en' ? 'Both (Driver & Passenger)' : 'ทั้งสองแบบ (คนขับ & ผู้โดยสาร)'}</option>
                      <option value="passenger">{lang === 'en' ? 'Passenger Only' : 'หาคนหารค่ารถ (ผู้โดยสาร)'}</option>
                      <option value="driver">{lang === 'en' ? 'Driver Only' : 'มีรถส่วนตัว (คนขับ)'}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">
                      {lang === 'en' ? 'Faculty & Year *' : 'คณะและชั้นปี *'}
                    </label>
                    <input
                      type="text"
                      value={setupProfile.faculty}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^a-zA-Z0-9\u0E00-\u0E7F\s.•\-\/]/g, '');
                        setSetupProfile({ ...setupProfile, faculty: clean });
                        if (modalFieldErrors.faculty && clean.trim().length > 0) {
                          setModalFieldErrors((prev) => {
                            const next = { ...prev };
                            delete next.faculty;
                            return next;
                          });
                        }
                      }}
                      placeholder={lang === 'en' ? 'e.g. SIIT • CPE Year 2' : 'เช่น SIIT • CPE ปี 2'}
                      className={`w-full min-h-[42px] px-3 py-2 bg-white border rounded-xl text-slate-900 font-bold text-xs focus:outline-none transition ${
                        modalFieldErrors.faculty
                          ? 'border-rose-500 bg-rose-50/25'
                          : 'border-slate-300 focus:border-orange-500'
                      }`}
                    />
                    {modalFieldErrors.faculty && (
                      <p className="mt-1 text-[10px] font-bold text-rose-600 flex items-center gap-1">
                        <span>❌</span>
                        <span>{modalFieldErrors.faculty}</span>
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">
                      {lang === 'en' ? 'University' : 'มหาวิทยาลัย'}
                    </label>
                    <input
                      type="text"
                      value={setupProfile.university}
                      onChange={(e) => setSetupProfile({ ...setupProfile, university: e.target.value })}
                      placeholder={lang === 'en' ? 'e.g. Thammasat (SIIT)' : 'เช่น ม.ธรรมศาสตร์ (SIIT)'}
                      className="w-full min-h-[42px] px-3 py-2 bg-white border border-slate-300 focus:border-orange-500 rounded-xl text-slate-900 font-bold text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    {lang === 'en' ? 'Bio (Intro)' : 'Bio แนะนำตัวสั้นๆ'}
                  </label>
                  <textarea
                    rows={2}
                    value={setupProfile.bio}
                    onChange={(e) => setSetupProfile({ ...setupProfile, bio: e.target.value })}
                    placeholder={lang === 'en' ? 'Tell co-passengers about your travel vibe...' : 'บอกเพื่อนร่วมทางเกี่ยวกับ vibe หรือเส้นทางเดินทางของคุณ...'}
                    className="w-full px-3 py-2 bg-white border border-slate-300 focus:border-orange-500 rounded-xl text-slate-900 font-bold text-xs focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">
                      Instagram
                    </label>
                    <input
                      type="text"
                      value={setupProfile.ig}
                      onChange={(e) => setSetupProfile({ ...setupProfile, ig: e.target.value.replace(/[^a-zA-Z0-9._@]/g, '') })}
                      placeholder="@your.instagram"
                      className="w-full min-h-[42px] px-3 py-2 bg-white border border-slate-300 focus:border-orange-500 rounded-xl text-slate-900 font-bold text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">
                      Facebook
                    </label>
                    <input
                      type="text"
                      value={setupProfile.facebook}
                      onChange={(e) => setSetupProfile({ ...setupProfile, facebook: e.target.value.replace(/[^a-zA-Z0-9._\-\/]/g, '') })}
                      placeholder="fb.com/yourname"
                      className="w-full min-h-[42px] px-3 py-2 bg-white border border-slate-300 focus:border-orange-500 rounded-xl text-slate-900 font-bold text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 grid grid-cols-2 gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setShowProfileSetupModal(false)}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-xl text-xs transition active:scale-95 text-center"
                >
                  {lang === 'en' ? 'Cancel' : 'ยกเลิก'}
                </button>
                <button
                  type="button"
                  onClick={handleRegisterSubmit}
                  disabled={authLoading}
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-black rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5 text-center px-2"
                >
                  {authLoading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="truncate">{lang === 'en' ? 'Save Profile →' : 'บันทึกโปรไฟล์ & เริ่มใช้งาน →'}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
