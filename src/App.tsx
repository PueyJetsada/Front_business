import { useEffect, useState } from 'react';
import { AiConciergeScreen } from './components/AiConciergeScreen';
import { CreateHopScreen } from './components/CreateHopScreen';
import { ExploreScreen } from './components/ExploreScreen';
import {
  DriverBunnySvg,
  HoppingBunnySvg,
  IconCar,
  IconChatBubble,
  IconCheck,
  IconCrown,
  IconPin,
  IconPlus,
  IconSparkle,
  PassengerBunnySvg,
  SmilingBunnySvg,
} from './components/Icons';
import { ProfileScreen } from './components/ProfileScreen';
import {
  INITIAL_RIDES,
  INITIAL_USER_PROFILE,
  type AutoBookWatcher,
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
  | 'carrot'
  | 'history';

export default function App() {
  // Default to 'explore' so the core SIIT TU Matching & Guardrail UI is visible immediately,
  // while keeping 'splash', 'login', 'otp', 'map', 'carrot', 'history' in the Presenter Bar!
  const [screen, setScreen] = useState<ScreenKey>('explore');
  const [splashPhase, setSplashPhase] = useState<'hopping' | 'smiling'>('hopping');
  const [isPremium, setIsPremium] = useState<boolean>(true);
  const [showPremiumModal, setShowPremiumModal] = useState<boolean>(false);

  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [rides, setRides] = useState<RideHop[]>(INITIAL_RIDES);
  const [lockedRideIds, setLockedRideIds] = useState<Record<string, boolean>>({});

  // Active AI Auto-Book Watchers
  const [watchers, setWatchers] = useState<AutoBookWatcher[]>([
    {
      id: 'w-initial-1',
      origin: 'SIIT รังสิต',
      destination: 'คอนโด B (รังสิต)',
      timeLabel: 'พรุ่งนี้ • 09:00 น.',
      seats: 1,
      maxWalkMeters: 100,
      vibePreference: 'Indie • Valorant • สายชวนคุย',
      status: 'watching',
      createdAt: 'ตั้งไว้เมื่อ 5 นาทีที่แล้ว',
    },
  ]);

  // Map & History & Floating Chat states from Front_business
  const [showMapFilter, setShowMapFilter] = useState<boolean>(false);
  const [selectedHistory, setSelectedHistory] = useState<number | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatTab, setChatTab] = useState<'ai' | 'friend'>('ai');

  const showHeaderAndNav = !['splash', 'login', 'otp'].includes(screen);

  useEffect(() => {
    if (screen === 'splash') {
      setSplashPhase('hopping');
      const timer1 = setTimeout(() => setSplashPhase('smiling'), 1800);
      const timer2 = setTimeout(() => setScreen('login'), 3200);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [screen]);

  const handleToggleLockRide = (rideId: string) => {
    setLockedRideIds((prev) => ({
      ...prev,
      [rideId]: !prev[rideId],
    }));
  };

  const handleCreateRide = (newRide: RideHop) => {
    setRides((prev) => [newRide, ...prev]);
    setScreen('explore');
  };

  const handleAddWatcher = (watcher: AutoBookWatcher) => {
    setWatchers((prev) => [watcher, ...prev]);
  };

  const handleTriggerWatcherMatch = (watcherId: string) => {
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
    setLockedRideIds((prev) => ({ ...prev, 'hop-z': true }));
  };

  const renderSplash = () => (
    <div className="p-6 flex-1 flex flex-col items-center justify-center bg-white relative overflow-hidden">
      {splashPhase === 'hopping' ? (
        <div className="flex flex-col items-center animate-[bounce-hop_1.2s_ease-in-out_infinite]">
          <HoppingBunnySvg width={84} height={104} />
          <h2 className="mt-4 text-xl font-black text-orange-500 animate-pulse tracking-widest">
            CAMPUSHOP
          </h2>
          <p className="text-xs font-bold text-slate-500 mt-1">
            SIIT & TU Social Ride-Sharing
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center animate-[zoom-smile_0.8s_ease-out_forwards]">
          <SmilingBunnySvg size={136} />
          <h2 className="mt-3 text-2xl font-black text-orange-500">Ready to Hop!</h2>
        </div>
      )}
    </div>
  );

  const renderLogin = () => (
    <div className="p-6 flex-1 flex flex-col justify-center bg-white">
      <div className="text-center mb-7">
        <div className="mx-auto flex justify-center text-orange-500 mb-2">
          <SmilingBunnySvg size={88} />
        </div>
        <h1 className="text-3xl font-black text-orange-500 tracking-tight font-display">
          CAMPUSHOP
        </h1>
        <p className="text-xs font-bold text-slate-500 mt-1">
          หารค่ารถ & หาเพื่อนร่วมทาง SIIT ม.ธรรมศาสตร์
        </p>
      </div>

      <div className="space-y-3.5 px-2">
        <div>
          <input
            type="text"
            defaultValue="jetsada.a@dome.tu.ac.th"
            placeholder="TU / SIIT Email or Username"
            aria-label="ชื่อผู้ใช้หรืออีเมลมหาวิทยาลัย"
            className="w-full text-sm font-bold bg-white border-2 border-orange-500 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 shadow-sm text-center"
          />
        </div>
        <div>
          <input
            type="password"
            defaultValue="••••••••"
            placeholder="Password"
            aria-label="รหัสผ่าน"
            className="w-full text-sm font-bold bg-white border-2 border-orange-500 rounded-xl px-4 py-3 text-slate-800 placeholder-rose-400 shadow-sm text-center"
          />
        </div>
        <div className="flex justify-between items-center px-1 pt-0.5">
          <button
            type="button"
            onClick={() => setScreen('otp')}
            className="text-[11px] font-extrabold text-rose-600 hover:underline"
          >
            ลืมรหัสผ่าน (Forgot password)
          </button>
          <button
            type="button"
            onClick={() => setScreen('otp')}
            className="text-[11px] font-extrabold text-orange-600 hover:underline"
          >
            ยืนยันตัวตนนักศึกษา (Verify OTP)
          </button>
        </div>
        <div className="pt-4">
          <button
            type="button"
            onClick={() => setScreen('explore')}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-3.5 rounded-xl shadow-lg transition"
          >
            เข้าสู่ระบบ (Log In)
          </button>
        </div>
      </div>
    </div>
  );

  const renderOtp = () => (
    <div className="p-6 pt-12 flex-1 flex flex-col justify-between bg-white">
      <div>
        <button
          type="button"
          onClick={() => setScreen('login')}
          className="text-xs font-extrabold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg"
        >
          ← กลับหน้าเข้าสู่ระบบ
        </button>
        <h2 className="text-2xl font-black mt-6 text-slate-900">
          ยืนยันรหัสนักศึกษา SIIT / TU
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
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-3.5 rounded-xl shadow-md transition"
      >
        ยืนยันและตั้งค่าโปรไฟล์ Vibe →
      </button>
    </div>
  );

  const renderMap = () => (
    <div className="flex-1 flex flex-col relative bg-orange-50 pb-[86px]">
      <div className="px-4 py-2.5 bg-white z-10 shadow-sm border-b border-orange-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-slate-900">
            แผนที่จุดนัดพบ (SIIT รังสิต → คอนโด B)
          </h2>
          <p className="text-[10px] text-slate-500 font-medium">
            แสดงจุดส่งของ นาย Y (0m) และ นาย Z (ห่าง 100m ในรัศมี ≤ 500m)
          </p>
        </div>
        <span className="text-[10px] font-mono font-black bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-lg tabular-nums">
          ≤ 500m Zone
        </span>
      </div>

      <div className="flex-1 relative border-2 border-orange-300 m-3 rounded-2xl bg-white overflow-hidden shadow-inner">
        {/* Top Search Pill */}
        <div className="absolute top-3 left-3 right-3 bg-teal-700 text-white text-xs font-bold py-2 px-3.5 rounded-full shadow-md flex justify-between items-center z-20">
          <span className="flex items-center gap-1.5">
            <IconPin size={14} />
            <span>SIIT รังสิต → คอนโด B</span>
          </span>
          <span className="bg-teal-900 px-2 py-0.5 rounded-full text-[10px] font-mono tabular-nums">
            รัศมีเดิน 500m
          </span>
        </div>

        {/* Route Polylines & 500m Walking Guardrail Circle */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 300 300"
        >
          {/* Subtle campus road grid */}
          <line x1="0" y1="110" x2="300" y2="110" stroke="#f1f5f9" strokeWidth="8" />
          <line x1="160" y1="0" x2="160" y2="300" stroke="#f1f5f9" strokeWidth="8" />
          {/* 500m Max Walking Guardrail Circle around Destination */}
          <circle
            cx="235"
            cy="78"
            r="46"
            fill="rgba(16, 185, 129, 0.08)"
            stroke="#10b981"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <polyline
            points="60,185 60,115 160,115 160,85 235,78"
            fill="none"
            stroke="#f97316"
            strokeWidth="3"
          />
        </svg>

        {/* Origin Pin: นาย A (You) */}
        <div className="absolute top-[168px] left-[32px] text-center z-10">
          <div className="w-9 h-9 bg-orange-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-md mx-auto">
            <PassengerBunnySvg size={22} className="text-white" />
          </div>
          <div className="text-[9px] font-black text-slate-800 bg-white/90 px-1.5 py-0.5 rounded shadow-sm mt-1">
            นาย A (SIIT รังสิต)
          </div>
        </div>

        {/* Driver Z Pin (100m walk) */}
        <div className="absolute top-[92px] left-[128px] text-center z-10">
          <div className="text-[9px] font-black text-orange-800 mb-0.5 bg-orange-100 border border-orange-300 px-1.5 py-0.5 rounded-full">
            นาย Z • 96% Match
          </div>
          <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center border-2 border-white shadow-md mx-auto">
            <IconCar size={15} />
          </div>
          <div className="text-[9px] font-bold text-teal-700 mt-0.5 tabular-nums">
            ห่างจุดส่ง 100m
          </div>
        </div>

        {/* Destination Condo B Pin (0m exact) */}
        <div className="absolute top-[52px] left-[198px] text-center z-10">
          <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center border-2 border-white shadow-md mx-auto">
            <IconPin size={15} />
          </div>
          <div className="text-[9px] font-black text-teal-900 bg-white/95 px-1.5 py-0.5 rounded shadow-sm mt-0.5">
            คอนโด B (นาย Y 0m)
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowMapFilter(!showMapFilter)}
          className="absolute bottom-3 right-3 bg-teal-700 hover:bg-teal-800 text-white px-3 py-1.5 rounded-xl shadow-md z-20 text-[10px] font-black transition"
        >
          ตัวกรองความปลอดภัย (Filters)
        </button>

        {showMapFilter && (
          <div className="absolute bottom-12 right-3 bg-white border-2 border-teal-600 p-3 rounded-xl shadow-xl text-[10px] font-bold text-teal-950 w-44 z-30 space-y-1.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-orange-500" />
              <span>เฉพาะนักศึกษา SIIT / มธ.</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-orange-500" />
              <span>ระยะเดินไม่เกิน 500m</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-orange-500" />
              <span>Women-Only Ride</span>
            </label>
          </div>
        )}
      </div>

      {/* Bottom Vehicle Quick Selector Grid from Front_business */}
      <div className="mx-3 mb-2 border-2 border-teal-600 bg-white grid grid-cols-3 divide-x-2 divide-teal-600 rounded-2xl overflow-hidden z-10 shadow-sm">
        <button
          type="button"
          onClick={() => setScreen('explore')}
          className="p-2.5 text-center hover:bg-orange-50 transition"
        >
          <div className="flex justify-center text-orange-500 mb-1">
            <IconCar size={20} />
          </div>
          <div className="text-[10px] font-black text-teal-900">
            นาย Z (EV Car)
            <span className="text-[9px] font-semibold text-slate-500 block tabular-nums">
              เดิน 100m • 96%
            </span>
          </div>
          <div className="flex justify-between text-[9px] mt-1 font-black text-slate-700 tabular-nums">
            <span>ว่าง 2 ที่</span>
            <span className="text-orange-600">฿30</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setScreen('explore')}
          className="p-2.5 text-center hover:bg-orange-50 transition"
        >
          <div className="flex justify-center text-teal-600 mb-1">
            <IconCar size={20} />
          </div>
          <div className="text-[10px] font-black text-teal-900">
            นาย Y (Civic)
            <span className="text-[9px] font-semibold text-slate-500 block tabular-nums">
              ตรงเป๊ะ 0m • 84%
            </span>
          </div>
          <div className="flex justify-between text-[9px] mt-1 font-black text-slate-700 tabular-nums">
            <span>ว่าง 1 ที่</span>
            <span className="text-orange-600">฿35</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setScreen('explore')}
          className="p-2.5 text-center hover:bg-orange-50 transition"
        >
          <div className="flex justify-center text-slate-800 mb-1">
            <IconCar size={20} />
          </div>
          <div className="text-[10px] font-black text-teal-900">
            Nicha (Grab)
            <span className="text-[9px] font-semibold text-slate-500 block tabular-nums">
              เดิน 180m • 89%
            </span>
          </div>
          <div className="flex justify-between text-[9px] mt-1 font-black text-slate-700 tabular-nums">
            <span>ว่าง 2 ที่</span>
            <span className="text-orange-600">฿32</span>
          </div>
        </button>
      </div>
    </div>
  );

  const renderCarrot = () => (
    <div className="flex-1 flex flex-col relative bg-orange-50 p-4 pb-[100px] overflow-y-auto custom-scroll space-y-3.5">
      <div className="text-center pt-1">
        <h2 className="text-2xl font-black text-orange-500 font-display">
          Carrot Wallet & HOP Perks
        </h2>
        <p className="text-[11px] text-slate-600 font-medium">
          แต้มสะสมจากการหารค่ารถช่วยลดมลพิษและแลกส่วนลดค่าธรรมเนียม
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 tabular-nums">
        <div className="border-2 border-orange-400 bg-white p-3 text-center text-teal-900 font-bold text-xs rounded-2xl shadow-sm">
          <span>Premium Carrots</span>
          <span className="text-orange-600 font-black block text-lg mt-0.5">
            120 Carrots
          </span>
        </div>
        <div className="border-2 border-teal-500 bg-white p-3 text-center text-teal-900 font-bold text-xs rounded-2xl shadow-sm">
          <span>Free Eco Carrots</span>
          <span className="text-teal-700 font-black block text-lg mt-0.5">
            45 Carrots
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 tabular-nums">
        {[
          { amount: 150, price: 30 },
          { amount: 300, price: 55 },
          { amount: 500, price: 89 },
        ].map((pack, i) => (
          <div
            key={i}
            className="border-2 border-teal-600 bg-white flex flex-col justify-between p-3 text-center rounded-2xl hover:border-orange-500 cursor-pointer transition shadow-sm"
          >
            <div>
              <div className="font-black text-teal-900 text-sm">{pack.amount}</div>
              <div className="font-bold text-teal-700 text-[10px] mb-1">Carrots</div>
              <div className="text-[9px] text-slate-500 font-medium">ไม่มีวันหมดอายุ</div>
            </div>
            <div className="font-black text-orange-600 text-sm mt-2">฿{pack.price}</div>
          </div>
        ))}
      </div>

      <div className="border-2 border-teal-600 bg-white p-3.5 rounded-2xl shadow-sm space-y-2.5">
        <h3 className="text-center font-black text-teal-900 text-sm">
          เช็กอินเดินทางลดคาร์บอนรายวัน (Daily Eco Harvest)
        </h3>
        <div className="grid grid-cols-3 gap-2 tabular-nums">
          {[
            { c: 10, d: 1, done: true },
            { c: 15, d: 2, done: true },
            { c: 20, d: 3, done: true },
            { c: 20, d: 4, done: false },
            { c: 25, d: 5, done: false },
            { c: 30, d: 6, done: false, hl: true },
          ].map((day, i) => (
            <div
              key={i}
              className={`border p-2 rounded-xl text-center ${
                day.hl
                  ? 'border-2 border-orange-500 bg-orange-50'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="text-teal-900 font-black text-xs">+{day.c} แต้ม</div>
              <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                วันที่ {day.d} {day.done ? '✓' : ''}
              </div>
            </div>
          ))}
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-2 text-center">
          <p className="text-[10px] font-bold text-orange-900">
            สมาชิก HOP Premium (฿49/เดือน) รับแต้ม Carrot x2 ทุกทริปและฟรีค่าธรรมเนียมแพลตฟอร์ม!
          </p>
        </div>
      </div>
    </div>
  );

  const renderHistory = () => {
    if (selectedHistory) {
      return (
        <div className="flex-1 p-4 bg-slate-50 pb-[100px] overflow-y-auto custom-scroll">
          <button
            type="button"
            onClick={() => setSelectedHistory(null)}
            className="text-xs font-extrabold text-slate-600 mb-3 flex items-center gap-1"
          >
            <span>← กลับหน้ารายการย้อนหลัง</span>
          </button>

          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center border border-orange-200">
                  <DriverBunnySvg size={30} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    นาย Z (Zack • SIIT CPE)
                  </h3>
                  <p className="text-[10px] font-bold text-orange-600">
                    96% Vibe Match • ห่างจุดหมาย 100m
                  </p>
                </div>
              </div>
              <div className="text-right tabular-nums">
                <div className="text-lg font-black text-orange-600 font-mono">฿35</div>
                <div className="text-[9px] font-bold text-slate-400">หารต่อคน</div>
              </div>
            </div>

            <div className="flex gap-3 items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className="w-12 h-10 bg-white rounded-xl flex items-center justify-center text-orange-500 shadow-sm border border-slate-200">
                <IconCar size={20} />
              </div>
              <div>
                <div className="text-xs font-black text-slate-900">
                  BYD Dolphin EV • White
                </div>
                <div className="text-[10px] font-mono font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded mt-0.5 inline-block">
                  1กฒ 8899
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 tabular-nums">
              <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                <div className="text-[10px] font-bold text-orange-900">
                  ระยะเดินจากจุดส่ง
                </div>
                <div className="text-sm font-black text-orange-600">
                  100 เมตร (≤ 500m)
                </div>
              </div>
              <div className="bg-teal-50 p-3 rounded-xl border border-teal-100">
                <div className="text-[10px] font-bold text-teal-900">
                  ผู้ร่วมทางในทริป
                </div>
                <div className="text-sm font-black text-teal-700">3 / 3 ที่นั่ง</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 p-4 bg-slate-50 pb-[100px] overflow-y-auto custom-scroll space-y-3">
        <h2 className="text-lg font-black text-slate-900">
          ประวัติการเดินทาง (Trip History)
        </h2>
        {[
          {
            id: 1,
            date: 'วันนี้ • 09:00 น.',
            price: 35,
            route: 'SIIT รังสิต → คอนโด B (เดิน 100m)',
            driver: 'นาย Z (SIIT CPE) • 96% Match',
          },
          {
            id: 2,
            date: 'เมื่อวาน • 08:30 น.',
            price: 45,
            route: 'SIIT รังสิต → SIIT บางกระดี่ (0m)',
            driver: 'Fah S. (SIIT CPE) • 94% Match',
          },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedHistory(item.id)}
            className="w-full text-left bg-white p-3.5 rounded-2xl shadow-sm border border-slate-200 hover:border-orange-500 transition"
          >
            <div className="flex justify-between items-center mb-2 tabular-nums">
              <span className="text-[10px] font-bold text-slate-500">{item.date}</span>
              <span className="text-sm font-black text-orange-600 font-mono">
                ฿{item.price}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-50 border border-orange-200 text-orange-500 rounded-full flex items-center justify-center shrink-0">
                <IconPin size={16} />
              </div>
              <div>
                <div className="text-xs font-black text-slate-900">{item.route}</div>
                <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                  Host: {item.driver}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 sm:py-3 sm:px-3 font-sans flex flex-col items-center justify-start">
      {/* Top Presenter Control Bar (for live university group presentation) */}
      <div className="w-full max-w-[390px] sm:max-w-[410px] sm:mb-2.5 bg-slate-900 text-white p-2 sm:rounded-2xl shadow-lg border-b sm:border border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between gap-2 px-1">
          <span className="text-[9px] font-black text-slate-300 tracking-wide">
            DEMO BAR:
          </span>
          <button
            type="button"
            onClick={() => setIsPremium(!isPremium)}
            className={`px-2.5 py-0.5 rounded-full text-[9px] font-black flex items-center gap-1 transition ${
              isPremium
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
            }`}
          >
            <IconCrown size={11} />
            <span>
              โหมด: {isPremium ? 'HOP Premium (฿49/ด.)' : 'Free User'}
            </span>
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-1">
          {(
            [
              { key: 'explore', label: '1. Explore' },
              { key: 'ai', label: '2. AI Bot' },
              { key: 'create', label: '3. Create' },
              { key: 'profile', label: '4. Profile' },
              { key: 'map', label: 'Map' },
              { key: 'carrot', label: 'Wallet' },
              { key: 'history', label: 'History' },
              { key: 'splash', label: 'Splash' },
              { key: 'login', label: 'Login' },
            ] as { key: ScreenKey; label: string }[]
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setScreen(t.key)}
              className={`px-2 py-0.5 rounded-lg text-[9px] font-black transition ${
                screen === t.key
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Centered Mobile App Frame (390x844 on Desktop, full-width on Mobile) */}
      <div className="w-full max-w-[390px] h-[844px] bg-white text-slate-900 sm:rounded-[40px] shadow-2xl sm:border-[8px] sm:border-slate-800 overflow-hidden flex flex-col relative">
        {/* Phone Status Bar */}
        <div className="px-5 pt-1.5 pb-0.5 text-[10px] flex justify-between items-center font-black z-30 bg-white text-slate-900 shrink-0 tabular-nums">
          <span>09:41</span>
          <div className="flex gap-1.5 items-center">
            <span className="bg-slate-900 text-white px-1.5 py-[1px] rounded text-[8px]">
              5G
            </span>
            <span className="text-[9px] font-mono">100%</span>
          </div>
        </div>

        {/* Persistent App Header with Logo, Free/HOP Premium Switch & Chat Popup Trigger */}
        {showHeaderAndNav && (
          <header className="px-3 py-1.5 bg-white border-b border-slate-200 flex items-center justify-between gap-1.5 z-30 shrink-0">
            <button
              type="button"
              onClick={() => setScreen('explore')}
              className="flex items-center gap-1.5 text-left"
            >
              <div className="w-7 h-7 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center">
                <PassengerBunnySvg size={20} />
              </div>
              <div>
                <div className="text-xs font-black tracking-tight text-slate-900 font-display leading-none">
                  CAMPUS<span className="text-orange-500">HOP</span>
                </div>
                <div className="text-[8px] font-bold text-slate-500">
                  SIIT & TU Carpool
                </div>
              </div>
            </button>

            <div className="flex items-center gap-1">
              {/* Toggle Free vs HOP Premium right in the header */}
              <button
                type="button"
                onClick={() => setIsPremium(!isPremium)}
                title="สลับสถานะ Free User / HOP Premium สำหรับพรีเซนต์"
                className={`px-2 py-1 rounded-full text-[9px] font-black border flex items-center gap-1 transition ${
                  isPremium
                    ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:border-orange-400'
                }`}
              >
                <IconCrown size={10} />
                <span>{isPremium ? 'HOP Premium' : 'Free User'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPremiumModal(true)}
                className="text-[9px] font-black text-orange-600 bg-orange-50 border border-orange-200 px-1.5 py-1 rounded-lg hover:bg-orange-100 transition tabular-nums"
              >
                ฿49
              </button>

              <button
                type="button"
                onClick={() => setIsChatOpen(!isChatOpen)}
                aria-label="เปิดหน้าต่างแชท AI และเพื่อนร่วมทาง"
                className="w-7 h-7 rounded-lg bg-slate-900 text-orange-400 flex items-center justify-center hover:bg-slate-800 transition"
              >
                <IconChatBubble size={14} />
              </button>
            </div>
          </header>
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
            lockedRideIds={lockedRideIds}
            onToggleLockRide={handleToggleLockRide}
            onOpenAiTab={() => setScreen('ai')}
            onOpenCreateTab={() => setScreen('create')}
          />
        )}
        {screen === 'ai' && (
          <AiConciergeScreen
            isPremium={isPremium}
            onUnlockPremium={() => setIsPremium(true)}
            onOpenPremiumModal={() => setShowPremiumModal(true)}
            watchers={watchers}
            onAddWatcher={handleAddWatcher}
            onTriggerWatcherMatch={handleTriggerWatcherMatch}
          />
        )}
        {screen === 'create' && (
          <CreateHopScreen
            userProfile={userProfile}
            onCreateRide={handleCreateRide}
          />
        )}
        {screen === 'profile' && (
          <ProfileScreen
            profile={userProfile}
            onChangeProfile={setUserProfile}
            isPremium={isPremium}
            onTogglePremium={() => setIsPremium(!isPremium)}
            onOpenPremiumModal={() => setShowPremiumModal(true)}
          />
        )}
        {screen === 'map' && renderMap()}
        {screen === 'carrot' && renderCarrot()}
        {screen === 'history' && renderHistory()}

        {/* Messenger-style Floating Chat Popup (from Front_business) */}
        {showHeaderAndNav && (
          <div
            className={`absolute bottom-[88px] right-4 w-[335px] h-[490px] bg-white rounded-3xl shadow-2xl border-2 border-slate-800 z-40 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${
              isChatOpen
                ? 'scale-100 opacity-100 translate-y-0'
                : 'scale-0 opacity-0 translate-y-8 pointer-events-none'
            }`}
          >
            <div className="bg-slate-900 p-3 rounded-t-2xl z-10">
              <div className="flex justify-between items-center mb-2 px-1">
                <h3 className="text-white font-black text-xs">
                  CAMPUSHOP Messenger & AI
                </h3>
                <button
                  type="button"
                  onClick={() => setIsChatOpen(false)}
                  className="text-slate-400 hover:text-white bg-slate-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-2 bg-slate-800 rounded-xl p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setChatTab('ai')}
                  className={`text-[11px] font-black py-1.5 rounded-lg transition ${
                    chatTab === 'ai'
                      ? 'bg-orange-500 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  HOP AI Agent
                </button>
                <button
                  type="button"
                  onClick={() => setChatTab('friend')}
                  className={`text-[11px] font-black py-1.5 rounded-lg transition ${
                    chatTab === 'friend'
                      ? 'bg-orange-500 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  แชทเพื่อนร่วมทาง (2)
                </button>
              </div>
            </div>

            {chatTab === 'ai' ? (
              <AiConciergeScreen
                isPremium={isPremium}
                onUnlockPremium={() => setIsPremium(true)}
                onOpenPremiumModal={() => setShowPremiumModal(true)}
                watchers={watchers}
                onAddWatcher={handleAddWatcher}
                onTriggerWatcherMatch={handleTriggerWatcherMatch}
                compact
              />
            ) : (
              <div className="flex-1 bg-slate-50 p-3 space-y-2.5 overflow-y-auto custom-scroll">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center border border-orange-200 relative shrink-0">
                    <DriverBunnySvg size={26} />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-xs font-black text-slate-900">
                        นาย Z (Zack • SIIT CPE)
                      </h4>
                      <span className="text-[9px] text-orange-600 font-bold">
                        96% Match
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 font-medium mt-0.5">
                      "เดี๋ยวแวะรับหน้าตึก SIIT รังสิตครับ เปิดเพลง Indie รอเลย!"
                    </p>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center border border-orange-200 relative shrink-0">
                    <PassengerBunnySvg size={26} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-xs font-black text-slate-900">
                        Nicha K. (SIIT DE)
                      </h4>
                      <span className="text-[9px] text-slate-400 font-bold">
                        5 นาทีที่แล้ว
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 font-medium mt-0.5">
                      "มาหาร Grab กลับคอนโด B กันค่ะ เหลือว่างอีก 2 ที่นั่ง!"
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* HOP Premium (฿49/month) & Monetization Modal */}
        {showPremiumModal && (
          <div className="absolute inset-0 bg-slate-950/75 z-50 flex items-end sm:items-center justify-center p-3">
            <div className="bg-white text-slate-900 w-full rounded-3xl p-4 shadow-2xl border-2 border-orange-500 space-y-3.5 animate-[sheet-rise_0.2s_ease-out]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center">
                    <IconCrown size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      โมเดลธุรกิจ & HOP Premium
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold">
                      CAMPUSHOP Monetization Architecture
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPremiumModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {/* 1. Primary Revenue */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-1">
                <div className="text-xs font-black text-slate-900">
                  1. รายได้หลัก (Primary Revenue): Platform Commission
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  หักค่าธรรมเนียมแพลตฟอร์มจากค่ารอบการเดินทางแต่ละครั้ง (รอบละ ฿4–฿5 คล้ายระบบ Grab/Bolt) โดยแสดงราคาหารต่อคนอย่างโปร่งใส และผู้ใช้สายฟรีใช้งาน GUI ได้ครบ 100%
                </p>
              </div>

              {/* 2. Secondary Revenue: HOP Premium 49 THB */}
              <div className="bg-orange-50 border-2 border-orange-400 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-orange-950">
                    2. รายได้เสริม (Secondary): HOP Premium
                  </span>
                  <span className="bg-orange-500 text-white font-mono font-black text-xs px-2.5 py-0.5 rounded-full tabular-nums">
                    ฿49 / เดือน
                  </span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-800 font-medium">
                  <li className="flex items-center gap-1.5">
                    <IconCheck size={14} className="text-orange-600 shrink-0" />
                    <span>
                      ปลดล็อก <strong>AI Auto-Booking Assistant</strong> สั่งจองอัตโนมัติผ่านแชท
                    </span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <IconCheck size={14} className="text-orange-600 shrink-0" />
                    <span>
                      <strong>ฟรีค่าธรรมเนียมแพลตฟอร์ม</strong> และรับส่วนลดค่ารถในแต่ละรอบ
                    </span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <IconCheck size={14} className="text-orange-600 shrink-0" />
                    <span>
                      ป้าย <strong>HOP Premium Badge</strong> บนโปรไฟล์เพิ่มความน่าเชื่อถือ
                    </span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPremium(!isPremium);
                    setShowPremiumModal(false);
                  }}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs py-3 rounded-xl shadow-md transition"
                >
                  {isPremium
                    ? 'สลับเป็นโหมด Free User (ทดสอบ Paywall)'
                    : 'สมัคร / เปิดโหมด HOP Premium (฿49/ด.)'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sleek Bottom Navigation Bar + Floating AI Trigger */}
        {showHeaderAndNav && (
          <nav
            aria-label="เมนูหลักด้านล่าง"
            className="absolute bottom-0 left-0 right-0 h-[78px] bg-white rounded-b-[32px] shadow-[0_-8px_24px_rgba(15,23,42,0.06)] z-30 flex items-center justify-between px-5 pb-2 pt-1.5 border-t border-slate-200"
          >
            <button
              type="button"
              onClick={() => setScreen('explore')}
              className={`flex flex-col items-center justify-center w-14 transition ${
                screen === 'explore'
                  ? 'text-orange-500'
                  : 'text-slate-400 hover:text-orange-500'
              }`}
            >
              <IconPin size={21} />
              <span className="text-[9px] font-black mt-0.5">Explore</span>
            </button>

            <button
              type="button"
              onClick={() => setScreen('map')}
              className={`flex flex-col items-center justify-center w-14 transition ${
                screen === 'map'
                  ? 'text-orange-500'
                  : 'text-slate-400 hover:text-orange-500'
              }`}
            >
              <IconCar size={21} />
              <span className="text-[9px] font-black mt-0.5">Map</span>
            </button>

            {/* Raised Center Orange Button: Create Hop */}
            <div className="relative -top-6 flex flex-col items-center justify-center w-16">
              <button
                type="button"
                onClick={() => setScreen('create')}
                aria-label="สร้างทริปหารค่ารถ"
                className={`flex items-center justify-center w-[62px] h-[62px] rounded-full border-[5px] border-white shadow-[0_8px_20px_rgba(249,115,22,0.4)] transform transition hover:scale-105 ${
                  screen === 'create'
                    ? 'bg-slate-900 text-white'
                    : 'bg-orange-500 text-white'
                }`}
              >
                <IconPlus size={26} />
              </button>
              <span className="text-[9px] font-black text-slate-700 mt-0.5">
                เปิดตี้
              </span>
            </div>

            <button
              type="button"
              onClick={() => setScreen('ai')}
              className={`flex flex-col items-center justify-center w-14 transition ${
                screen === 'ai'
                  ? 'text-orange-500'
                  : 'text-slate-400 hover:text-orange-500'
              }`}
            >
              <IconSparkle size={21} />
              <span className="text-[9px] font-black mt-0.5">AI Auto</span>
            </button>

            <button
              type="button"
              onClick={() => setScreen('profile')}
              className={`flex flex-col items-center justify-center w-14 transition ${
                screen === 'profile'
                  ? 'text-orange-500'
                  : 'text-slate-400 hover:text-orange-500'
              }`}
            >
              <PassengerBunnySvg
                size={23}
                className={
                  screen === 'profile' ? 'text-orange-500' : 'text-slate-400'
                }
              />
              <span className="text-[9px] font-black mt-0.5">Profile</span>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
