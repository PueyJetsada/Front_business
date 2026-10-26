export type BookingMode = 'realtime' | 'prebook';
export type UserRoleType = 'driver' | 'passenger' | 'both';
export type HostType = 'driver' | 'cohopper';

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
  carLicense: string;
  carType: string;
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
  baseFare: number;
  commissionFee: number;
  vibes: string[];
  ig?: string;
  facebook?: string;
  bioNote: string;
  co2SavedKg: number;
  canonicalRole?: 'mr-y' | 'mr-z' | 'mr-c';
}

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

export const VIBE_CATEGORIES: VibeCategory[] = [
  {
    id: 'music',
    label: 'แนวเพลง (Music Genre)',
    tags: ['Indie', 'Hip-Hop', 'K-Pop', 'T-Pop', 'Rock'],
  },
  {
    id: 'game',
    label: 'เกมที่เล่น (Gaming)',
    tags: ['Valorant', 'RoV', 'Genshin', 'Console'],
  },
  {
    id: 'travel',
    label: 'สไตล์การเดินทาง (Commute Style)',
    tags: ['สายชวนคุย', 'สายเงียบฟังเพลง', 'สายตี้', 'สายรีบไปเรียน'],
  },
  {
    id: 'interest',
    label: 'ไลฟ์สไตล์ (Interests)',
    tags: ['คาเฟ่', 'กีฬา', 'อนิเมะ', 'สายกิน'],
  },
];

export const CAMPUS_LOCATIONS = [
  'SIIT รังสิต',
  'SIIT บางกระดี่',
  'คอนโด B (รังสิต)',
  'TU Dome Plaza',
  'Kave TU Rangsit',
  'Dcondo Campus',
];

export const ROUTE_PRESETS = [
  {
    id: 'case-study',
    label: 'SIIT รังสิต → คอนโด B (Case นาย Y / Z)',
    origin: 'SIIT รังสิต',
    destination: 'คอนโด B (รังสิต)',
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
    origin: 'TU Dome Plaza',
    destination: 'SIIT บางกระดี่',
  },
];

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'นาย A (Jetsada)',
  faculty: 'SIIT • CPE ปี 3',
  university: 'Thammasat University (SIIT)',
  role: 'both',
  bio: 'เด็ก CPE SIIT เดินทางรังสิต-บางกระดี่ & กลับคอนโด B ชอบฟังเพลง Indie เล่น Valorant ทักหารค่ารถได้ครับ!',
  ig: '@jetsada.siit',
  facebook: 'fb.com/jetsada.tu',
  vibes: ['Indie', 'Valorant', 'สายชวนคุย', 'คาเฟ่', 'T-Pop'],
  carBrand: 'Honda Civic FE',
  carLicense: 'กข 1234',
  carType: '4-Seat Sedan (Gas/E20)',
  womenOnlyDefault: false,
};

export const INITIAL_RIDES: RideHop[] = [
  {
    id: 'hop-z',
    hostName: 'นาย Z (Zack)',
    faculty: 'SIIT • CPE ปี 3',
    rating: 4.9,
    hostType: 'driver',
    vehicleLabel: 'BYD Dolphin EV (ชาร์จไฟ)',
    licensePlate: '1กฒ 8899',
    origin: 'SIIT รังสิต',
    destination: 'คอนโด B (รังสิต)',
    actualDropOffName: 'หน้า Kave Condo (ติดคอนโด B)',
    pickupMeters: 30,
    dropOffMeters: 100,
    mode: 'realtime',
    departMinutes: 5,
    seatsLeft: 2,
    totalSeats: 3,
    baseFare: 30,
    commissionFee: 5,
    vibes: ['Indie', 'Valorant', 'สายชวนคุย', 'คาเฟ่', 'T-Pop'],
    ig: '@zack_siit.cpe',
    facebook: 'fb.com/zack.cpe',
    bioNote: 'จอดส่งหน้า Kave ห่างคอนโด B แค่ 100m เปิดเพลย์ลิสต์ Indie ตลอดทาง คุยเรื่อง Valorant ได้ยาวๆ',
    co2SavedKg: 1.4,
    canonicalRole: 'mr-z',
  },
  {
    id: 'hop-y',
    hostName: 'นาย Y (Yuth)',
    faculty: 'SIIT • IE ปี 4',
    rating: 4.8,
    hostType: 'driver',
    vehicleLabel: 'Honda Civic (น้ำมัน)',
    licensePlate: 'กข 1234',
    origin: 'SIIT รังสิต',
    destination: 'คอนโด B (รังสิต)',
    actualDropOffName: 'ล็อบบี้ คอนโด B (ถึงจุดหมายเป๊ะ)',
    pickupMeters: 40,
    dropOffMeters: 0,
    mode: 'realtime',
    departMinutes: 8,
    seatsLeft: 1,
    totalSeats: 3,
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
    hostName: 'Nicha K.',
    faculty: 'SIIT • DE ปี 2',
    rating: 5.0,
    hostType: 'cohopper',
    vehicleLabel: 'หาร GrabCar (4 ที่นั่ง)',
    origin: 'SIIT รังสิต',
    destination: 'คอนโด B (รังสิต)',
    actualDropOffName: 'ป้ายหน้าซอยคอนโด B',
    pickupMeters: 60,
    dropOffMeters: 220,
    mode: 'realtime',
    departMinutes: 4,
    seatsLeft: 2,
    totalSeats: 3,
    baseFare: 32,
    commissionFee: 4,
    vibes: ['K-Pop', 'สายกิน', 'อนิเมะ'],
    ig: '@nicha.de26',
    bioNote: 'ตกรถตู้มธ. หาคนหาร Grab กลับโซนคอนโด B ตอนนี้เลยค่ะ ประหยัดกว่านั่งคนเดียวครึ่งๆ',
    co2SavedKg: 1.1,
  },
  {
    id: 'hop-c-guardrail',
    hostName: 'นาย C (Chai)',
    faculty: 'SIIT • ME ปี 4',
    rating: 4.7,
    hostType: 'driver',
    vehicleLabel: 'Mazda 2 Sedan',
    licensePlate: '9กพ 4412',
    origin: 'SIIT รังสิต',
    destination: 'คอนโด B (รังสิต)',
    actualDropOffName: 'หอพักโซนคลองหนึ่ง (เลยคอนโด B ไปไกล)',
    pickupMeters: 50,
    dropOffMeters: 650,
    mode: 'realtime',
    departMinutes: 6,
    seatsLeft: 2,
    totalSeats: 3,
    baseFare: 25,
    commissionFee: 4,
    vibes: ['Indie', 'Valorant', 'สายชวนคุย', 'คาเฟ่'],
    ig: '@chai_me.siit',
    bioNote: 'Vibe ตรงกันทุกแท็ก แต่จุดส่งห่างจากคอนโด B ถึง 650 เมตร (เกินลิมิตเดิน 500m ของระบบ)',
    co2SavedKg: 1.3,
    canonicalRole: 'mr-c',
  },
  {
    id: 'hop-fah-bangkadi',
    hostName: 'Fah S.',
    faculty: 'SIIT • CPE ปี 4',
    rating: 4.9,
    hostType: 'driver',
    vehicleLabel: 'Toyota Yaris Ativ',
    licensePlate: '4ขท 5012',
    origin: 'SIIT รังสิต',
    destination: 'SIIT บางกระดี่',
    actualDropOffName: 'หน้าตึกหลัก SIIT บางกระดี่',
    pickupMeters: 20,
    dropOffMeters: 0,
    mode: 'prebook',
    scheduleLabel: 'พรุ่งนี้ • 08:30 น. (ทันเรียน 9 โมง)',
    seatsLeft: 3,
    totalSeats: 4,
    baseFare: 45,
    commissionFee: 5,
    vibes: ['Indie', 'Valorant', 'สายชวนคุย', 'คาเฟ่'],
    ig: '@fah_cpe.siit',
    facebook: 'fb.com/fah.siit',
    bioNote: 'มีแล็บที่บางกระดี่รอบ 9:00 น. ออกเดินทางจากหน้าตึก SIIT รังสิต 08:15 น. หารค่าน้ำมันกัน!',
    co2SavedKg: 2.8,
  },
  {
    id: 'hop-minnie-prebook',
    hostName: 'Minnie P.',
    faculty: 'TBS • TU ปี 2',
    rating: 5.0,
    hostType: 'cohopper',
    vehicleLabel: 'หาร Bolt Economy',
    origin: 'SIIT รังสิต',
    destination: 'คอนโด B (รังสิต)',
    actualDropOffName: 'ล็อบบี้ คอนโด B',
    pickupMeters: 45,
    dropOffMeters: 0,
    mode: 'prebook',
    scheduleLabel: 'พรุ่งนี้ • 09:00 น.',
    seatsLeft: 2,
    totalSeats: 3,
    baseFare: 30,
    commissionFee: 4,
    vibes: ['T-Pop', 'K-Pop', 'สายชวนคุย', 'คาเฟ่'],
    ig: '@minnie.tbs',
    bioNote: 'เปิดตี้หาร Bolt ล่วงหน้าตอน 09:00 น. ไปคอนโด B จุดส่งตรงเป๊ะ 0 เมตร',
    co2SavedKg: 1.1,
  },
  {
    id: 'hop-ken-bangkadi',
    hostName: 'Ken T.',
    faculty: 'SIIT • MT ปี 3',
    rating: 4.8,
    hostType: 'driver',
    vehicleLabel: 'ORA Good Cat EV',
    licensePlate: '3ขล 9090',
    origin: 'TU Dome Plaza',
    destination: 'SIIT บางกระดี่',
    actualDropOffName: 'ลานจอดรถนักศึกษา SIIT บางกระดี่ (เดิน 80m)',
    pickupMeters: 35,
    dropOffMeters: 80,
    mode: 'prebook',
    scheduleLabel: 'พรุ่งนี้ • 08:40 น.',
    seatsLeft: 2,
    totalSeats: 3,
    baseFare: 42,
    commissionFee: 5,
    vibes: ['Hip-Hop', 'RoV', 'สายตี้', 'สายกิน'],
    ig: '@ken_mt.tu',
    bioNote: 'ออกจาก TU Dome ไปบางกระดี่ รถไฟฟ้า EV เงียบกริบ หารค่าชาร์จไฟเบาๆ',
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
