export type BookingMode = 'realtime' | 'prebook';
export type UserRoleType = 'driver' | 'passenger' | 'both';
export type HostType = 'driver' | 'cohopper';
export type SeatId = 'F1' | 'R1' | 'R2' | 'R3';

export interface SeatPositionMeta {
  id: SeatId;
  code: string;
  label: string;
  shortLabel: string;
}

export const CAR_SEAT_POSITIONS: SeatPositionMeta[] = [
  { id: 'F1', code: 'F1', label: 'ข้างคนขับ (หน้าซ้าย)', shortLabel: 'ข้างคนขับ' },
  { id: 'R1', code: 'R1', label: 'แถวหลังซ้าย (ริมหน้าต่าง)', shortLabel: 'หลังซ้าย' },
  { id: 'R2', code: 'R2', label: 'แถวหลังกลาง', shortLabel: 'หลังกลาง' },
  { id: 'R3', code: 'R3', label: 'แถวหลังขวา (ริมหน้าต่าง)', shortLabel: 'หลังขวา' },
];

export interface VibeCategory {
  id: string;
  label: string;
  tags: string[];
}

export interface UserProfile {
  name: string;
  faculty: string;
  university: string;
  role: UserRoleType;
  bio: string;
  ig: string;
  facebook: string;
  vibes: string[];
  carBrand: string;
  carColor: string;
  carLicense: string;
  womenOnlyDefault: boolean;
}

export interface RideHop {
  id: string;
  hostName: string;
  faculty: string;
  rating: number;
  hostType: HostType;
  vehicleLabel: string;
  licensePlate?: string;
  origin: string;
  destination: string;
  actualDropOffName: string;
  pickupMeters: number;
  dropOffMeters: number;
  mode: BookingMode;
  departMinutes?: number;
  scheduleLabel?: string;
  seatsLeft: number;
  totalSeats: number;
  occupiedSeats: SeatId[];
  baseFare: number;
  commissionFee: number;
  vibes: string[];
  ig?: string;
  facebook?: string;
  bioNote: string;
  co2SavedKg: number;
  canonicalRole?: 'mr-y' | 'mr-z' | 'mr-c';
}

export interface BookedRideDetail {
  rideId: string;
  seatIds: SeatId[];
  paymentMethodId: string;
  couponCode?: string;
  regularFareTotal: number;
  premiumDiscount: number;
  promoDiscount: number;
  netPaid: number;
}

export interface CompletedTripRecord {
  id: number;
  date: string;
  origin: string;
  destination: string;
  actualDropOffName: string;
  hostName: string;
  faculty: string;
  vehicleLabel: string;
  licensePlate?: string;
  seatLabel: string;
  paymentMethodName: string;
  regularFareTotal: number;
  premiumDiscount: number;
  promoDiscount: number;
  netPaid: number;
  co2SavedKg: number;
  rating: number;
  complimentTags: string[];
  reviewComment?: string;
}

export const QUICK_REVIEW_TAGS: string[] = [
  'ขับรถนุ่มปลอดภัย',
  'ตรงต่อเวลา',
  'เทสเพลงดีมาก',
  'คุยสนุก เป็นกันเอง',
  'รถสะอาด แอร์เย็น',
];

export interface AutoBookWatcher {
  id: string;
  origin: string;
  destination: string;
  timeLabel: string;
  seats: number;
  maxWalkMeters: number;
  vibePreference: string;
  status: 'watching' | 'booked';
  matchedHost?: string;
  createdAt: string;
}

export interface ChatMessage {
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

export interface DiscountCoupon {
  code: string;
  percent: number;
  maxDiscountBaht: number;
  title: string;
  condition: string;
  expiryLabel: string;
  claimed: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  detail: string;
  badge: string;
}

export const INITIAL_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'promptpay',
    name: 'สแกนจ่าย PromptPay QR',
    detail: 'ชำระทันทีผ่านแอปธนาคาร ไม่มีค่าธรรมเนียมโอน',
    badge: 'แนะนำ',
  },
  {
    id: 'card-visa',
    name: 'บัตรเครดิต / เดบิต',
    detail: 'VISA •••• 4821 (ตัดบัตรอัตโนมัติเมื่อจบการเดินทาง)',
    badge: 'ผูกไว้แล้ว',
  },
  {
    id: 'truemoney',
    name: 'TrueMoney Wallet',
    detail: 'เบอร์ 089-•••-4512 (ตัดชำระอัตโนมัติแบบเดียวกับ Grab/Bolt)',
    badge: 'เชื่อมต่อแล้ว',
  },
];

export const INITIAL_DISCOUNT_COUPONS: DiscountCoupon[] = [
  {
    code: 'HOP15',
    percent: 15,
    maxDiscountBaht: 15,
    title: 'ส่วนลด 15% สำหรับทริปหารค่ารถ',
    condition: 'ใช้ได้กับทุกเส้นทาง SIIT รังสิต – บางกระดี่ – คอนโด',
    expiryLabel: 'ใช้ได้ถึงสิ้นเดือนนี้',
    claimed: true,
  },
  {
    code: 'SIIT20',
    percent: 20,
    maxDiscountBaht: 25,
    title: 'ส่วนลด 20% รอบเดินทางไปเรียนเช้า',
    condition: 'เมื่อจองทริปล่วงหน้าหรือเดินทางร่วมกับเพื่อน SIIT / มธ.',
    expiryLabel: 'ภารกิจเดินทางครบ 2 รอบ/สัปดาห์',
    claimed: true,
  },
  {
    code: 'GREEN25',
    percent: 25,
    maxDiscountBaht: 30,
    title: 'ส่วนลด 25% สายรักษ์โลกหารครบ 3 ที่นั่ง',
    condition: 'รับสิทธิ์เมื่อร่วมเดินทางช่วยลดจำนวนรถบนถนนครบ 3 ครั้ง',
    expiryLabel: 'กดรับสิทธิ์ได้ฟรี',
    claimed: false,
  },
];

export const VIBE_CATEGORIES: VibeCategory[] = [
  {
    id: 'music',
    label: 'แนวเพลง',
    tags: ['Indie', 'Hip-Hop', 'K-Pop', 'T-Pop', 'Rock'],
  },
  {
    id: 'game',
    label: 'เกม',
    tags: ['Game', 'RoV', 'Genshin', 'Console'],
  },
  {
    id: 'travel',
    label: 'สไตล์การเดินทาง',
    tags: ['สายชวนคุย', 'สายเงียบฟังเพลง', 'สายตี้', 'สายรีบไปเรียน'],
  },
  {
    id: 'interest',
    label: 'ความสนใจ',
    tags: ['คาเฟ่', 'กีฬา', 'อนิเมะ', 'สายกิน'],
  },
];

export const CAMPUS_LOCATIONS = [
  'SIIT รังสิต',
  'SIIT บางกระดี่',
  'คอนโด B',
  'TU Dome',
  'Kave TU',
  'Dcondo',
];

export const ROUTE_PRESETS = [
  {
    id: 'case-study',
    label: 'SIIT รังสิต → คอนโด B',
    origin: 'SIIT รังสิต',
    destination: 'คอนโด B',
  },
  {
    id: 'inter-campus',
    label: 'SIIT รังสิต → SIIT บางกระดี่',
    origin: 'SIIT รังสิต',
    destination: 'SIIT บางกระดี่',
  },
  {
    id: 'tudome-bangkadi',
    label: 'TU Dome → SIIT บางกระดี่',
    origin: 'TU Dome',
    destination: 'SIIT บางกระดี่',
  },
];

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'นาย A (เจษฎา)',
  faculty: 'SIIT • CPE ปี 3',
  university: 'ม.ธรรมศาสตร์ (SIIT)',
  role: 'both',
  bio: 'เด็ก CPE SIIT เดินทางรังสิต-บางกระดี่ และกลับคอนโด B ชอบฟังเพลง Indie เล่น Game ทักหารค่ารถได้ครับ!',
  ig: '@jetsada.siit',
  facebook: 'fb.com/jetsada.tu',
  vibes: ['Indie', 'Game', 'สายชวนคุย', 'คาเฟ่', 'T-Pop'],
  carBrand: 'Honda Civic FE',
  carColor: 'สีเทาโซนิค',
  carLicense: 'กข 1234',
  womenOnlyDefault: false,
};

export const INITIAL_RIDES: RideHop[] = [
  {
    id: 'hop-z',
    hostName: 'นาย Z (แซ็ค)',
    faculty: 'SIIT • CPE ปี 3',
    rating: 4.9,
    hostType: 'driver',
    vehicleLabel: 'BYD Dolphin • สีขาว',
    licensePlate: '1กฒ 8899',
    origin: 'SIIT รังสิต',
    destination: 'คอนโด B',
    actualDropOffName: 'หน้า Kave TU (ติดคอนโด B)',
    pickupMeters: 30,
    dropOffMeters: 100,
    mode: 'realtime',
    departMinutes: 5,
    seatsLeft: 2,
    totalSeats: 4,
    occupiedSeats: ['R2', 'R3'],
    baseFare: 30,
    commissionFee: 5,
    vibes: ['Indie', 'Game', 'สายชวนคุย', 'คาเฟ่', 'T-Pop'],
    ig: '@zack_siit.cpe',
    facebook: 'fb.com/zack.cpe',
    bioNote: 'จอดส่งหน้า Kave ห่างคอนโด B แค่ 100 เมตร เปิดเพลย์ลิสต์ Indie ตลอดทาง คุยเรื่อง Game ได้ยาวๆ',
    co2SavedKg: 1.4,
    canonicalRole: 'mr-z',
  },
  {
    id: 'hop-y',
    hostName: 'นาย Y (ยุทธ)',
    faculty: 'SIIT • IE ปี 4',
    rating: 4.8,
    hostType: 'driver',
    vehicleLabel: 'Honda Civic • สีเทา',
    licensePlate: 'กข 1234',
    origin: 'SIIT รังสิต',
    destination: 'คอนโด B',
    actualDropOffName: 'ล็อบบี้ คอนโด B',
    pickupMeters: 40,
    dropOffMeters: 0,
    mode: 'realtime',
    departMinutes: 8,
    seatsLeft: 2,
    totalSeats: 4,
    occupiedSeats: ['F1', 'R2'],
    baseFare: 35,
    commissionFee: 5,
    vibes: ['สายเงียบฟังเพลง', 'สายรีบไปเรียน', 'คาเฟ่', 'T-Pop'],
    ig: '@yuth_ie.tu',
    facebook: 'fb.com/yuth.siit',
    bioNote: 'เข้าจอดส่งถึงหน้าล็อบบี้คอนโด B เลย (0 เมตร) เน้นขับนิ่งๆ เงียบๆ แอร์เย็น',
    co2SavedKg: 1.2,
    canonicalRole: 'mr-y',
  },
  {
    id: 'hop-nicha',
    hostName: 'ณิชา (Nicha)',
    faculty: 'SIIT • DE ปี 2',
    rating: 5.0,
    hostType: 'cohopper',
    vehicleLabel: 'หารรถ GrabCar • สีเงิน',
    licensePlate: 'ทศ 9421',
    origin: 'SIIT รังสิต',
    destination: 'คอนโด B',
    actualDropOffName: 'ป้ายหน้าซอยคอนโด B',
    pickupMeters: 60,
    dropOffMeters: 220,
    mode: 'realtime',
    departMinutes: 4,
    seatsLeft: 2,
    totalSeats: 4,
    occupiedSeats: ['R1', 'R2'],
    baseFare: 32,
    commissionFee: 4,
    vibes: ['K-Pop', 'สายกิน', 'อนิเมะ'],
    ig: '@nicha.de26',
    bioNote: 'ตกรถตู้มธ. หาคนหาร Grab กลับโซนคอนโด B ตอนนี้เลยค่ะ ประหยัดกว่านั่งคนเดียวครึ่งๆ',
    co2SavedKg: 1.1,
  },
  {
    id: 'hop-c-guardrail',
    hostName: 'นาย C (ชัย)',
    faculty: 'SIIT • ME ปี 4',
    rating: 4.7,
    hostType: 'driver',
    vehicleLabel: 'Mazda 2 • สีแดง',
    licensePlate: '9กพ 4412',
    origin: 'SIIT รังสิต',
    destination: 'คอนโด B',
    actualDropOffName: 'หอพักโซนคลองหนึ่ง',
    pickupMeters: 50,
    dropOffMeters: 650,
    mode: 'realtime',
    departMinutes: 6,
    seatsLeft: 2,
    totalSeats: 4,
    occupiedSeats: ['R2', 'R3'],
    baseFare: 25,
    commissionFee: 4,
    vibes: ['Indie', 'Game', 'สายชวนคุย', 'คาเฟ่'],
    ig: '@chai_me.siit',
    bioNote: 'Vibe ตรงกันทุกแท็ก แต่จุดส่งห่างจากคอนโด B ถึง 650 เมตร (เกินลิมิตเดิน 500 เมตร)',
    co2SavedKg: 1.3,
    canonicalRole: 'mr-c',
  },
  {
    id: 'hop-fah-bangkadi',
    hostName: 'ฟ้า (Fah S.)',
    faculty: 'SIIT • CPE ปี 4',
    rating: 4.9,
    hostType: 'driver',
    vehicleLabel: 'Toyota Yaris Ativ • สีขาว',
    licensePlate: '4ขท 5012',
    origin: 'SIIT รังสิต',
    destination: 'SIIT บางกระดี่',
    actualDropOffName: 'หน้าตึกหลัก SIIT บางกระดี่',
    pickupMeters: 20,
    dropOffMeters: 0,
    mode: 'prebook',
    scheduleLabel: 'พรุ่งนี้ • 08:30 น.',
    seatsLeft: 3,
    totalSeats: 4,
    occupiedSeats: ['R2'],
    baseFare: 45,
    commissionFee: 5,
    vibes: ['Indie', 'Game', 'สายชวนคุย', 'คาเฟ่'],
    ig: '@fah_cpe.siit',
    facebook: 'fb.com/fah.siit',
    bioNote: 'มีแล็บที่บางกระดี่รอบ 9:00 น. ออกเดินทางจากหน้าตึก SIIT รังสิต 08:15 น. มาหารค่ารถกัน!',
    co2SavedKg: 2.8,
  },
  {
    id: 'hop-minnie-prebook',
    hostName: 'มินนี่ (Minnie)',
    faculty: 'TBS • มธ. ปี 2',
    rating: 5.0,
    hostType: 'cohopper',
    vehicleLabel: 'หารรถ Bolt • สีดำ',
    licensePlate: '7กอ 3108',
    origin: 'SIIT รังสิต',
    destination: 'คอนโด B',
    actualDropOffName: 'ล็อบบี้ คอนโด B',
    pickupMeters: 45,
    dropOffMeters: 0,
    mode: 'prebook',
    scheduleLabel: 'พรุ่งนี้ • 09:00 น.',
    seatsLeft: 2,
    totalSeats: 4,
    occupiedSeats: ['R1', 'R2'],
    baseFare: 30,
    commissionFee: 4,
    vibes: ['T-Pop', 'K-Pop', 'สายชวนคุย', 'คาเฟ่'],
    ig: '@minnie.tbs',
    bioNote: 'เปิดตี้หาร Bolt ล่วงหน้าตอน 09:00 น. ไปคอนโด B จุดส่งตรงเป๊ะ 0 เมตร',
    co2SavedKg: 1.1,
  },
  {
    id: 'hop-ken-bangkadi',
    hostName: 'เคน (Ken T.)',
    faculty: 'SIIT • MT ปี 3',
    rating: 4.8,
    hostType: 'driver',
    vehicleLabel: 'ORA Good Cat • สีครีม',
    licensePlate: '3ขล 9090',
    origin: 'TU Dome',
    destination: 'SIIT บางกระดี่',
    actualDropOffName: 'ลานจอดรถนักศึกษา SIIT บางกระดี่',
    pickupMeters: 35,
    dropOffMeters: 80,
    mode: 'prebook',
    scheduleLabel: 'พรุ่งนี้ • 08:40 น.',
    seatsLeft: 2,
    totalSeats: 4,
    occupiedSeats: ['F1', 'R2'],
    baseFare: 42,
    commissionFee: 5,
    vibes: ['Hip-Hop', 'RoV', 'สายตี้', 'สายกิน'],
    ig: '@ken_mt.tu',
    bioNote: 'ออกจาก TU Dome ไปบางกระดี่ แอร์เย็น นั่งสบาย มาหารค่ารถกันครับ',
    co2SavedKg: 3.1,
  },
];

export interface MatchBreakdown {
  pickupScore: number;
  dropOffScore: number;
  routeScore: number;
  vibeScore: number;
  sharedVibes: string[];
  totalMatch: number;
}

export function calculateSmartMatch(
  ride: RideHop,
  userVibes: string[],
  userFaculty: string,
  vibeWeightPercent: number
): MatchBreakdown {
  // 1. Pickup proximity score (0 - 100)
  const pickupScore = Math.max(40, Math.round(100 - ride.pickupMeters * 0.35));

  // 2. Drop-off proximity score (0m = 100%, 100m = 86%, 500m = 30%)
  const dropOffScore =
    ride.dropOffMeters === 0
      ? 100
      : Math.max(0, Math.round(100 - ride.dropOffMeters * 0.14));

  const routeScore = Math.round(dropOffScore * 0.8 + pickupScore * 0.2);

  // 3. Vibe & Faculty similarity score (0 - 100)
  const sharedVibes = ride.vibes.filter((tag) => userVibes.includes(tag));
  const denom = Math.max(1, Math.min(ride.vibes.length, Math.max(3, userVibes.length)));
  const rawTagRatio = sharedVibes.length / denom;
  const sameInstitute =
    ride.faculty.toLowerCase().includes('siit') &&
    userFaculty.toLowerCase().includes('siit');
  const sameMajor =
    ride.faculty.toLowerCase().includes('cpe') &&
    userFaculty.toLowerCase().includes('cpe');

  const baseVibe = Math.round(rawTagRatio * 82) + (sameInstitute ? 12 : 6) + (sameMajor ? 4 : 0);
  const vibeScore = Math.min(98, Math.max(32, baseVibe));

  const distWeight = 100 - vibeWeightPercent;
  const totalMatch = Math.round(
    (routeScore * distWeight + vibeScore * vibeWeightPercent) / 100
  );

  return {
    pickupScore,
    dropOffScore,
    routeScore,
    vibeScore,
    sharedVibes,
    totalMatch,
  };
}
