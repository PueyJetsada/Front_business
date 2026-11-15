import React, { useState, useEffect } from 'react';
import {
  getSeatPositionsForRide,
  QUICK_REVIEW_TAGS,
  type BookedRideDetail,
  type DiscountCoupon,
  type PaymentMethod,
  type RideHop,
  type SeatId,
} from '../data/mockData';
import {
  DriverBunnySvg,
  IconChatBubble,
  IconCheck,
  IconFacebook,
  IconInstagram,
  IconLeaf,
  IconLock,
  IconPin,
  IconShieldCheck,
  IconSteeringWheel,
  IconTicket,
  IconWallet,
  PassengerBunnySvg,
} from './Icons';
interface SeatBookingModalProps {
  ride: RideHop;
  activeRide?: RideHop | null;
  isPremium: boolean;
  activeBooking: BookedRideDetail | null;
  paymentMethods: PaymentMethod[];
  selectedPaymentId: string;
  onSelectPaymentId: (id: string) => void;
  coupons: DiscountCoupon[];
  selectedCouponCode: string | null;
  onSelectCouponCode: (code: string | null) => void;
  onConfirmBooking: (detail: BookedRideDetail) => void;
  onConfirmCancelBooking: (rideId: string) => void;
  onSwitchToActiveRide: () => void;
  onOpenDriverChat?: (ride: RideHop) => void;
  onFinishTripWithReview: (
    ride: RideHop,
    booking: BookedRideDetail,
    rating: number,
    complimentTags: string[],
    comment: string
  ) => void;
  initialStep?:
    | 'select-seat'
    | 'confirm-book'
    | 'active-status'
    | 'confirm-finish'
    | 'confirm-cancel'
    | 'trip-review';
  onClose: () => void;
  lang?: 'th' | 'en';
  onPickOnMap?: () => void;
  currentDestination?: string;
  onDestinationChange?: (name: string, pos?: [number, number]) => void;
}

export const SeatBookingModal: React.FC<SeatBookingModalProps> = ({
  ride,
  activeRide,
  isPremium,
  activeBooking,
  paymentMethods,
  selectedPaymentId,
  onSelectPaymentId,
  coupons,
  selectedCouponCode,
  onSelectCouponCode,
  onConfirmBooking,
  onConfirmCancelBooking,
  onSwitchToActiveRide,
  onOpenDriverChat,
  onFinishTripWithReview,
  initialStep,
  onClose,
  lang = 'th',
  currentDestination,
}) => {
  const isThisRideBooked = activeBooking?.rideId === ride.id;
  const isBlockedByOtherRide =
    Boolean(activeBooking) && activeBooking?.rideId !== ride.id;

  const isSuvLayout = ride.vehicleType === 'suv' || ride.totalSeats >= 6;
  const seatPositions = getSeatPositionsForRide(ride);

  const firstFreeSeat =
    seatPositions.find((s) => !ride.occupiedSeats.includes(s.id))?.id || 'F1';

  const [selectedSeats, setSelectedSeats] = useState<SeatId[]>(
    isThisRideBooked && activeBooking?.seatIds?.length
      ? activeBooking.seatIds
      : [firstFreeSeat]
  );

  const [chosenDestination, setChosenDestination] = useState<string>(
    activeBooking?.destination || ride.actualDropOffName || ride.destination || currentDestination || ''
  );

  // Sync when currentDestination updates (e.g. from user picking on map)
  useEffect(() => {
    if (currentDestination) {
      setChosenDestination(currentDestination);
    }
  }, [currentDestination]);

  // Sync when selected ride changes (driver's drop-off)
  useEffect(() => {
    if (!isThisRideBooked) {
      setChosenDestination(ride.actualDropOffName || ride.destination);
    }
  }, [ride.id, isThisRideBooked, ride.actualDropOffName, ride.destination]);

  // Sync initialStep when it changes dynamically (e.g. Auto-finish trip -> trip-review)
  useEffect(() => {
    if (initialStep) {
      setStep(initialStep);
    }
  }, [initialStep]);

  const [step, setStep] = useState<
    | 'select-seat'
    | 'confirm-book'
    | 'active-status'
    | 'confirm-finish'
    | 'confirm-cancel'
    | 'trip-review'
  >(
    initialStep ||
      (isThisRideBooked ? 'active-status' : 'select-seat')
  );

  // Review state (1-5 stars, compliment tags, comment)
  const [rating, setRating] = useState<number>(5);
  const [selectedCompliments, setSelectedCompliments] = useState<string[]>([
    'ขับรถนุ่มปลอดภัย',
    'ตรงต่อเวลา',
  ]);
  const [reviewComment, setReviewComment] = useState<string>('');

  const toggleCompliment = (tag: string) => {
    setSelectedCompliments((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleSeat = (seatId: SeatId) => {
    if (ride.occupiedSeats.includes(seatId)) return;
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.length > 1 ? prev.filter((id) => id !== seatId) : prev;
      }
      return [...prev, seatId];
    });
  };

  const seatCount = selectedSeats.length;
  // Regular fare per person (base fare + standard platform service fee)
  const regularPerPerson = ride.baseFare + ride.commissionFee;
  const regularFareTotal = regularPerPerson * seatCount;

  // Discount from HOP Premium (waives platform commission fee)
  const premiumDiscount = isPremium ? ride.commissionFee * seatCount : 0;
  const fareAfterPremium = regularFareTotal - premiumDiscount;

  // Discount from Promo Code (%)
  const claimedCoupons = coupons.filter((c) => c.claimed);
  const activeCoupon = claimedCoupons.find((c) => c.code === selectedCouponCode);
  const promoDiscount = activeCoupon
    ? Math.min(
        activeCoupon.maxDiscountBaht,
        Math.round((fareAfterPremium * activeCoupon.percent) / 100)
      )
    : 0;

  const netTotal = Math.max(1, fareAfterPremium - promoDiscount);

  const activePayment =
    paymentMethods.find((p) => p.id === selectedPaymentId) || paymentMethods[0];

  const selectedSeatLabels = selectedSeats
    .map((id) => seatPositions.find((s) => s.id === id)?.shortLabel || id)
    .join(', ');

  // 1. SINGLE ACTIVE BOOKING GUARD: Block booking if another trip is already active (Bottom Sheet on Mobile, Dialog on Tablet)
  if (isBlockedByOtherRide && activeBooking) {
    return (
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white text-slate-900 w-full md:max-w-[420px] rounded-t-[32px] md:rounded-3xl p-4 pb-6 md:pb-4 shadow-2xl border-2 border-orange-500 space-y-3.5 animate-[sheet-rise_0.22s_cubic-bezier(0.22,1,0.36,1)] safe-bottom"
        >
          {/* Native Bottom Sheet Drag Handle */}
          <div
            className="w-11 h-1.5 rounded-full bg-slate-300 mx-auto mb-1"
            aria-hidden="true"
          />

          <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
            <div className="flex items-center gap-2 text-rose-600">
              <IconShieldCheck size={20} className="shrink-0" />
              <h3 className="text-sm font-black text-slate-900">
                {lang === 'en' ? 'Cannot book overlapping trips' : 'ไม่สามารถจองทริปซ้อนกันได้'}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={lang === 'en' ? 'Close modal' : 'ปิดหน้าต่าง'}
              className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center shrink-0 active:scale-95 transition"
            >
              ✕
            </button>
          </div>

          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 text-xs text-slate-800 leading-relaxed font-bold">
            {lang === 'en'
              ? 'You have an active ongoing trip. Please complete or cancel your current trip before booking a new one.'
              : 'คุณมีรายการจองที่กำลังดำเนินการอยู่ กรุณาจบทริปหรือยกเลิกรายการเดิมก่อนทำการจองใหม่'}
          </div>

          {activeRide && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-1.5 text-xs tabular-nums">
              <div className="text-[10px] font-black text-orange-600">
                {lang === 'en' ? 'Active Ongoing Trip:' : 'รายการจองที่กำลังดำเนินการอยู่:'}
              </div>
              <div className="font-black text-slate-900">
                {activeRide.origin} → {activeRide.destination} ({activeRide.hostName})
              </div>
              <div className="text-[11px] text-slate-600 font-bold">
                {lang === 'en' ? 'Seats:' : 'ที่นั่ง:'} {activeBooking.seatIds.join(', ')} • {lang === 'en' ? 'Net Paid ฿' : 'ยอดชำระสุทธิ ฿'}
                {activeBooking.netPaid}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[46px] py-2.5 rounded-xl border border-slate-300 text-slate-700 font-black text-xs hover:bg-slate-100 active:scale-95 transition"
            >
              {lang === 'en' ? 'Close' : 'ปิดหน้าต่าง'}
            </button>
            <button
              type="button"
              onClick={onSwitchToActiveRide}
              className="min-h-[46px] py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md active:scale-95 transition"
            >
              {lang === 'en' ? 'View Current Trip →' : 'ดูสถานะทริปปัจจุบัน →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderSeatButton = (seatId: SeatId) => {
    const meta = seatPositions.find((s) => s.id === seatId) || {
      id: seatId,
      code: seatId,
      label: seatId,
      shortLabel: seatId,
    };
    const isOccupied = ride.occupiedSeats.includes(seatId);
    const isSelected = selectedSeats.includes(seatId);

    return (
      <button
        key={seatId}
        type="button"
        disabled={isOccupied}
        onClick={() => toggleSeat(seatId)}
        className={`relative h-14 rounded-2xl border-2 flex flex-col items-center justify-center p-1 transition select-none ${
          isOccupied
            ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed opacity-75'
            : isSelected
              ? 'bg-orange-500 border-orange-600 text-white shadow-md scale-[1.03]'
              : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-400 text-emerald-950 cursor-pointer'
        }`}
      >
        <span
          className={`w-7 h-1.5 rounded-full mb-0.5 ${
            isOccupied
              ? 'bg-slate-400'
              : isSelected
                ? 'bg-orange-200'
                : 'bg-emerald-400'
          }`}
        />
        <span className="text-[10px] font-black font-mono leading-none">
          {meta.code}
        </span>
        <span className="text-[8.5px] font-bold mt-0.5 leading-tight text-center">
          {meta.shortLabel}
        </span>
        <span className="text-[8px] font-extrabold mt-0.5 opacity-90">
          {lang === 'en'
            ? (isOccupied ? 'Occupied' : isSelected ? '✓ Selected' : 'Available')
            : (isOccupied ? 'ไม่ว่าง' : isSelected ? '✓ เลือกแล้ว' : 'ว่าง')}
        </span>
      </button>
    );
  };

  // Reusable Clear Final Price Breakdown + Eco Impact at the very bottom
  const renderPriceBreakdownBox = (
    regTotal: number,
    premDisc: number,
    promDisc: number,
    finalNet: number,
    seatsCount: number,
    couponCodeUsed?: string
  ) => (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-1.5 text-xs tabular-nums">
      <div className="flex justify-between text-slate-700 font-bold">
        <span>
          {lang === 'en'
            ? `Regular Fare (฿${regularPerPerson} × ${seatsCount} seat${seatsCount > 1 ? 's' : ''}):`
            : `ค่าโดยสารปกติ (หารต่อคน ฿${regularPerPerson} × ${seatsCount} ที่นั่ง):`}
        </span>
        <span>฿{regTotal}</span>
      </div>

      <div className="flex justify-between text-emerald-700 font-bold">
        <span>{lang === 'en' ? 'HOP Premium Discount:' : 'ส่วนลดจาก HOP Premium:'}</span>
        <span>{premDisc > 0 ? `-฿${premDisc}` : '฿0'}</span>
      </div>

      <div className="flex justify-between text-emerald-700 font-bold">
        <span>
          {lang === 'en'
            ? `Promo Code Discount${couponCodeUsed ? ` (${couponCodeUsed})` : ''}:`
            : `ส่วนลดจากโค้ดโปรโมชัน${couponCodeUsed ? ` (${couponCodeUsed})` : ''}:`}
        </span>
        <span>{promDisc > 0 ? `-฿${promDisc}` : '฿0'}</span>
      </div>

      {/* Prominent Final Net Price */}
      <div className="pt-2 border-t-2 border-slate-200 flex justify-between items-baseline">
        <span className="text-xs font-black text-slate-900">
          {lang === 'en' ? 'Total Net to Pay (Final):' : 'ราคาสุทธิที่ต้องชำระ (ยอดรวมสุดท้าย):'}
        </span>
        <span className="text-lg font-black text-orange-600 font-mono">
          ฿{finalNet}
        </span>
      </div>

      {/* Eco Impact strictly on the VERY LAST LINE after Final Net Price */}
      <div className="pt-1.5 border-t border-slate-200/80 flex items-center justify-between text-[10px] font-black text-emerald-700">
        <span className="flex items-center gap-1">
          <IconLeaf size={12} />
          <span>{lang === 'en' ? 'CO₂ & emissions saved:' : 'ช่วยลดคาร์บอนและมลพิษจากทริปนี้:'}</span>
        </span>
        <span>
          {lang === 'en'
            ? `Saved ${(ride.co2SavedKg * seatsCount).toFixed(1)} kg CO₂`
            : `ลดได้ ${(ride.co2SavedKg * seatsCount).toFixed(1)} kg CO₂`}
        </span>
      </div>
    </div>
  );

  const ratingLabels: Record<number, string> = {
    1: lang === 'en' ? '1 Star — Needs Improvement' : '1 ดาว — ต้องปรับปรุง',
    2: lang === 'en' ? '2 Stars — Fair' : '2 ดาว — พอใช้',
    3: lang === 'en' ? '3 Stars — Average' : '3 ดาว — ปานกลาง',
    4: lang === 'en' ? '4 Stars — Very Good' : '4 ดาว — ดีมาก',
    5: lang === 'en' ? '5 Stars — Impressive!' : '5 ดาว — ประทับใจมาก!',
  };

  return (
    <div
      onClick={() => {
        if (step !== 'trip-review') onClose();
      }}
      className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] z-50 flex items-end md:items-center justify-center p-0 md:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white text-slate-900 w-full md:max-w-[460px] max-h-[min(92dvh,calc(100%-1rem))] flex flex-col rounded-t-[32px] md:rounded-3xl shadow-2xl border-2 border-orange-500 animate-[sheet-rise_0.22s_cubic-bezier(0.22,1,0.36,1)] overflow-hidden"
      >
        {/* Fixed Header */}
        <div className="p-4 pb-2.5 border-b border-slate-200 shrink-0 bg-white">
          {/* Native Bottom Sheet Drag Handle */}
          <div
            className="w-11 h-1.5 rounded-full bg-slate-300 mx-auto mb-1.5"
            aria-hidden="true"
          />

          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                {step === 'select-seat' && (lang === 'en' ? 'Select Seats & Destination' : 'เลือกที่นั่งในรถ')}
                {step === 'confirm-book' && (lang === 'en' ? 'Confirm Booking & Pay' : 'ยืนยันการจองและชำระเงิน')}
                {step === 'active-status' && (lang === 'en' ? 'Ongoing Trip' : 'สถานะทริปที่กำลังเดินทาง')}
                {step === 'confirm-finish' && (lang === 'en' ? 'Confirm Finish Trip' : 'ยืนยันการสิ้นสุดการเดินทาง (จบทริป)')}
                {step === 'confirm-cancel' && (lang === 'en' ? 'Confirm Cancel Booking' : 'ยืนยันการยกเลิกการจอง')}
                {step === 'trip-review' && (lang === 'en' ? 'Trip Review' : 'สรุปการเดินทางและรีวิว')}
              </h3>
              <p className="text-[10px] text-slate-500 font-bold">
                {ride.hostName} • {ride.vehicleLabel}
                {ride.licensePlate ? ` (${ride.licensePlate})` : ''}
              </p>
            </div>
            {step !== 'trip-review' && step !== 'confirm-finish' && (
              <button
                type="button"
                onClick={onClose}
                aria-label="ปิดหน้าต่าง"
                className="w-10 h-10 min-h-[40px] min-w-[40px] rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center shrink-0 active:scale-95 transition"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-3">

        {/* STEP 1: 2D Visual Car Seat Picker */}
        {step === 'select-seat' && (
          <>
            {/* Legend */}
            <div className="grid grid-cols-4 gap-1 text-[9px] font-bold text-center bg-slate-50 p-2 rounded-xl border border-slate-200">
              <div className="flex items-center justify-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-slate-800 inline-block" />
                <span>{lang === 'en' ? 'Driver' : 'คนขับ'}</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-slate-300 inline-block" />
                <span>{lang === 'en' ? 'Occupied' : 'ไม่ว่าง'}</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-400 inline-block" />
                <span>{lang === 'en' ? 'Available' : 'ว่าง'}</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-orange-500 inline-block" />
                <span>{lang === 'en' ? 'Selected' : 'ที่คุณเลือก'}</span>
              </div>
            </div>

            {/* 2D Top-Down Car Cabin Frame (Dynamic Sedan 2-Row vs SUV/MPV 3-Row) */}
            <div className="mx-auto max-w-[275px] bg-slate-100 border-[3px] border-slate-700 rounded-t-[44px] rounded-b-[26px] p-3 shadow-inner space-y-2 relative">
              <div className="h-5 bg-sky-100/90 border-2 border-slate-400 rounded-t-[28px] rounded-b-lg flex items-center justify-between px-2.5 text-[8.5px] font-black text-slate-700 tracking-wider">
                <span>{lang === 'en' ? 'Front (Heading ▲)' : 'หน้ารถ (ทิศทางเดินทาง ▲)'}</span>
                <span className="bg-slate-800 text-orange-400 px-1.5 py-0.5 rounded font-mono text-[8px]">
                  {isSuvLayout
                    ? (lang === 'en' ? 'SUV / 7 Seats' : 'SUV / 7 ที่นั่ง')
                    : (lang === 'en' ? 'Sedan / 4 Seats' : 'รถเก๋ง / 4 ที่นั่ง')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 px-2">
                {renderSeatButton('F1')}

                <div className="h-14 rounded-2xl border-2 border-slate-700 bg-slate-800 text-white flex flex-col items-center justify-center p-1 select-none">
                  <IconSteeringWheel size={15} className="text-orange-400 mb-0.5" />
                  <span className="text-[10px] font-black leading-none">
                    {lang === 'en' ? 'Driver' : 'คนขับ'}
                  </span>
                  <span className="text-[8px] text-slate-300 font-bold truncate max-w-full mt-0.5">
                    {ride.hostName.split(' ')[0]}
                  </span>
                </div>
              </div>

              {isSuvLayout ? (
                <>
                  <div className="text-center text-[8px] font-bold text-slate-400 tracking-widest">
                    {lang === 'en'
                      ? '─── Row 2 • Middle Row (3 Seats) ───'
                      : '─── แถวที่ 2 • เบาะแถวกลาง (3 ที่นั่ง) ───'}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {renderSeatButton('M1')}
                    {renderSeatButton('M2')}
                    {renderSeatButton('M3')}
                  </div>
                  <div className="text-center text-[8px] font-bold text-slate-400 tracking-widest">
                    {lang === 'en'
                      ? '─── Row 3 • Rear Row (2 Seats) ───'
                      : '─── แถวที่ 3 • เบาะหลังสุด (2 ที่นั่ง) ───'}
                  </div>
                  <div className="grid grid-cols-2 gap-4 px-5">
                    {renderSeatButton('B1')}
                    {renderSeatButton('B2')}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center text-[8px] font-bold text-slate-400 tracking-widest">
                    {lang === 'en'
                      ? '─── Row 2 • Back Row (3 Seats) ───'
                      : '─── แถวที่ 2 • เบาะหลัง (3 ที่นั่ง) ───'}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {renderSeatButton('R1')}
                    {renderSeatButton('R2')}
                    {renderSeatButton('R3')}
                  </div>
                </>
              )}
            </div>

            {/* Locked Driver Destination Card (Spec: จุดส่งที่คนขับต้องการไป กับล่างนั้น) */}
            <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100/60 border-2 border-orange-400 rounded-2xl p-3 space-y-2 text-xs shadow-sm">
              <div className="bg-white rounded-xl p-2.5 border border-orange-200/80 shadow-xs flex items-center gap-2.5">
                <span className="text-xl shrink-0">🎯</span>
                <div className="min-w-0 flex-1">
                  <div className="text-[9px] font-extrabold text-orange-600 uppercase tracking-wider">
                    {lang === 'en' ? "Driver's Drop-off Location" : 'จุดส่งที่คนขับต้องการไป'}
                  </div>
                  <div className="text-xs font-black text-slate-900 truncate mt-0.5">
                    {ride.actualDropOffName || ride.destination}
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-600 font-bold leading-relaxed">
                {lang === 'en'
                  ? '🔒 Passengers carpool to the same destination as the driver to match vibe and share fares fairly.'
                  : '🔒 ผู้โดยสารเดินทางไปจุดหมายเดียวกับคนขับ เพื่อให้ตรงตาม Vibe และแชร์ค่ารถอย่างปลอดภัย (ไม่เปลี่ยนปลายทาง)'}
              </p>
            </div>

            {/* Privacy Gate Notice for Social Contacts */}
            <div className="bg-slate-900 text-slate-100 rounded-xl px-3 py-2 flex items-center justify-between gap-2 text-[10px] font-bold">
              <span className="flex items-center gap-1.5 text-amber-300">
                <IconLock size={13} className="shrink-0" />
                <span>
                  {lang === 'en'
                    ? 'Driver IG / Facebook and Chat'
                    : 'ช่องทางติดต่อ IG / Facebook และห้องแชทคนขับ'}
                </span>
              </span>
              <span className="text-[9.5px] font-black text-emerald-300 shrink-0">
                {lang === 'en' ? 'Unlocked after payment' : 'ปลดล็อกหลังชำระเงิน'}
              </span>
            </div>

            {/* Seat + Promo + Payment Selectors */}
            <div className="bg-white border border-slate-200 rounded-2xl p-2.5 space-y-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-600">
                  {lang === 'en' ? 'Selected seats:' : 'ตำแหน่งที่เลือก:'}
                </span>
                <span className="font-black text-orange-600">
                  {selectedSeatLabels} ({seatCount} {lang === 'en' ? 'seat(s)' : 'ที่นั่ง'})
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-slate-600 flex items-center gap-1 shrink-0">
                  <IconTicket size={13} className="text-orange-500" />
                  <span>{lang === 'en' ? 'Promo code:' : 'โค้ดโปรโมชัน:'}</span>
                </span>
                <select
                  value={selectedCouponCode || ''}
                  onChange={(e) =>
                    onSelectCouponCode(e.target.value ? e.target.value : null)
                  }
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-[10px] font-black text-slate-900"
                >
                  <option value="">
                    {lang === 'en' ? 'No promo code' : 'ไม่ใช้โค้ดส่วนลด'}
                  </option>
                  {claimedCoupons.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} — ลด {c.percent}% (สูงสุด ฿{c.maxDiscountBaht})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-slate-600 flex items-center gap-1 shrink-0">
                  <IconWallet size={13} className="text-teal-600" />
                  <span>{lang === 'en' ? 'Payment method:' : 'วิธีชำระเงิน:'}</span>
                </span>
                <select
                  value={selectedPaymentId}
                  onChange={(e) => onSelectPaymentId(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-[10px] font-black text-slate-900"
                >
                  {paymentMethods.map((pm) => (
                    <option key={pm.id} value={pm.id}>
                      {pm.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step-by-Step Price Breakdown + Eco Impact at the Bottom */}
            {renderPriceBreakdownBox(
              regularFareTotal,
              premiumDiscount,
              promoDiscount,
              netTotal,
              seatCount,
              activeCoupon?.code
            )}

            <button
              type="button"
              disabled={selectedSeats.length === 0}
              onClick={() =>
                onConfirmBooking({
                  rideId: ride.id,
                  seatIds: selectedSeats,
                  paymentMethodId: activePayment.id,
                  couponCode: activeCoupon?.code,
                  regularFareTotal,
                  premiumDiscount,
                  promoDiscount,
                  netPaid: netTotal,
                  destination: chosenDestination,
                })
              }
              className={`w-full min-h-[48px] text-white font-black text-xs py-3 rounded-xl shadow-lg flex items-center justify-center gap-1.5 active:scale-95 transition ${
                selectedSeats.length === 0
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/30'
              }`}
            >
              <IconCheck size={16} />
              <span>
                {selectedSeats.length === 0
                  ? (lang === 'en' ? 'Please select seat' : 'กรุณาเลือกที่นั่ง')
                  : (lang === 'en'
                      ? `Confirm Booking (฿${netTotal})`
                      : `ยืนยันการจองที่นั่ง (฿${netTotal})`)}
              </span>
            </button>
          </>
        )}

        {/* STEP 2: Double Confirmation Modal (Prevent Accidental Clicks) */}
        {step === 'confirm-book' && (
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 text-[11px] text-amber-950 font-bold flex items-start gap-2">
              <IconShieldCheck size={16} className="text-orange-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-black text-slate-900">
                  {lang === 'en'
                    ? 'Please verify details before booking'
                    : 'กรุณาตรวจสอบรายละเอียดก่อนยืนยันการจอง'}
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5">
                  {lang === 'en'
                    ? 'Only 1 active trip allowed. Confirming will lock seats and charge payment immediately.'
                    : 'สามารถจองได้ทีละ 1 ทริป เมื่อยืนยันระบบจะล็อกที่นั่งและชำระเงินทันที'}
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-3 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">
                  {lang === 'en' ? 'Route:' : 'เส้นทาง:'}
                </span>
                <span className="font-black text-slate-900 flex items-center gap-1 text-right">
                  <IconPin size={12} className="text-orange-500 shrink-0" />
                  <span>{ride.origin} → {chosenDestination}</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">
                  {lang === 'en' ? 'Vehicle & Driver:' : 'รถและคนขับ:'}
                </span>
                <span className="font-black text-slate-900">
                  {ride.hostName} ({ride.vehicleLabel})
                </span>
              </div>
              {ride.licensePlate && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">
                    {lang === 'en' ? 'License Plate:' : 'ป้ายทะเบียน:'}
                  </span>
                  <span className="plate-badge font-mono font-black text-amber-300 bg-slate-900 border border-amber-400 px-2 py-0.5 rounded-md text-[11px] tracking-wider shadow-sm">
                    {ride.licensePlate}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">
                  {lang === 'en' ? 'Selected Seats:' : 'ที่นั่งที่เลือก:'}
                </span>
                <span className="font-black text-orange-600">
                  {selectedSeatLabels} ({seatCount} {lang === 'en' ? 'seat(s)' : 'ที่นั่ง'})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">
                  {lang === 'en' ? 'Payment Method:' : 'วิธีชำระเงิน:'}
                </span>
                <span className="font-bold text-slate-900">{activePayment.name}</span>
              </div>
            </div>

            {/* Step-by-Step Price Breakdown + Eco Impact at the Bottom */}
            {renderPriceBreakdownBox(
              regularFareTotal,
              premiumDiscount,
              promoDiscount,
              netTotal,
              seatCount,
              activeCoupon?.code
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStep('select-seat')}
                className="py-2.5 rounded-xl border border-slate-300 text-slate-700 font-black text-xs hover:bg-slate-100 transition"
              >
                {lang === 'en' ? '← Change Seats' : '← แก้ไขที่นั่ง'}
              </button>
              <button
                type="button"
                onClick={() =>
                  onConfirmBooking({
                    rideId: ride.id,
                    seatIds: selectedSeats,
                    paymentMethodId: activePayment.id,
                    couponCode: activeCoupon?.code,
                    regularFareTotal,
                    premiumDiscount,
                    promoDiscount,
                    netPaid: netTotal,
                    destination: chosenDestination,
                  })
                }
                className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-1 transition"
              >
                <IconCheck size={14} />
                <span>
                  {lang === 'en'
                    ? `Confirm Booking (฿${netTotal})`
                    : `ยืนยันการจอง (฿${netTotal})`}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Active Trip Status View (with Unlocked Social Contacts + Co-Hopper Chat + Finish Trip) */}
        {step === 'active-status' && activeBooking && (
          <div className="space-y-3">
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-white border border-emerald-300 flex items-center justify-center shrink-0">
                  {ride.hostType === 'driver' ? (
                    <DriverBunnySvg size={24} />
                  ) : (
                    <PassengerBunnySvg size={24} />
                  )}
                </div>
                <div>
                  <span className="text-[9px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                    {lang === 'en' ? 'Ongoing Trip • Seats Locked' : 'กำลังเดินทาง • ล็อกที่นั่งแล้ว'}
                  </span>
                  <div className="text-xs font-black text-slate-900 mt-1">
                    {ride.origin} → {ride.destination}
                  </div>
                </div>
              </div>
              <div className="text-right tabular-nums">
                <div className="text-xs font-black text-emerald-800">
                  {lang === 'en' ? 'Seats: ' : 'ที่นั่ง '}
                  {activeBooking.seatIds.join(', ')}
                </div>
                <div className="text-[10px] font-bold text-slate-500">
                  {ride.licensePlate || ride.vehicleLabel}
                </div>
              </div>
            </div>

            {/* Unlocked Social Contacts + Direct Co-Hopper Chat Box */}
            <div className="bg-slate-900 text-white rounded-2xl p-3 space-y-2.5 border border-slate-700">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10.5px] font-black text-emerald-400 flex items-center gap-1">
                  <IconCheck size={13} />
                  <span>
                    {lang === 'en'
                      ? 'Driver contact and trip chat unlocked'
                      : 'ปลดล็อกช่องทางติดต่อคนขับและแชทในทริปแล้ว'}
                  </span>
                </span>
                <span className="text-[9.5px] font-bold text-slate-300">
                  {ride.hostName}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {ride.ig && (
                  <a
                    href={`https://instagram.com/${ride.ig.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10.5px] bg-pink-600 hover:bg-pink-500 text-white px-2.5 py-1.5 rounded-full font-extrabold inline-flex items-center gap-1 transition shadow-sm"
                  >
                    <IconInstagram size={12} />
                    <span>{ride.ig}</span>
                  </a>
                )}
                {ride.facebook && (
                  <a
                    href={`https://facebook.com/search/top/?q=${encodeURIComponent(
                      ride.facebook
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10.5px] bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1.5 rounded-full font-extrabold inline-flex items-center gap-1 transition shadow-sm"
                  >
                    <IconFacebook size={12} />
                    <span>{ride.facebook}</span>
                  </a>
                )}
              </div>

              {onOpenDriverChat && (
                <button
                  type="button"
                  onClick={() => onOpenDriverChat(ride)}
                  className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition"
                >
                  <IconChatBubble size={14} />
                  <span>
                    {lang === 'en'
                      ? `💬 Chat with ${ride.hostName.split(' ')[0]} / Pickup info`
                      : `💬 แชทเพื่อนร่วมทาง / นัดจุดรับกับ ${ride.hostName.split(' ')[0]}`}
                  </span>
                </button>
              )}
            </div>

            {/* Step-by-Step Price Breakdown + Eco Impact at the Bottom */}
            {renderPriceBreakdownBox(
              activeBooking.regularFareTotal,
              activeBooking.premiumDiscount,
              activeBooking.promoDiscount,
              activeBooking.netPaid,
              activeBooking.seatIds.length,
              activeBooking.couponCode
            )}

            {/* Primary Action: Complete Trip & Open Confirmation Modal */}
            <button
              type="button"
              onClick={() => setStep('confirm-finish')}
              className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <IconCheck size={15} />
              <span>
                {lang === 'en'
                  ? 'Arrived at Destination / Finish Trip'
                  : 'เดินทางถึงจุดหมาย / จบทริป'}
              </span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2 rounded-xl border border-slate-300 text-slate-700 font-black text-xs hover:bg-slate-100 transition"
              >
                {lang === 'en' ? 'Back to Home' : 'กลับหน้าหลัก'}
              </button>
              <button
                type="button"
                onClick={() => setStep('confirm-cancel')}
                className="py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-black text-xs transition"
              >
                {lang === 'en' ? 'Cancel this booking' : 'ยกเลิกการจองทริปนี้'}
              </button>
            </div>
          </div>
        )}

        {/* STEP: Double Confirmation for Finishing/Completing the Trip */}
        {step === 'confirm-finish' && activeBooking && (
          <div className="space-y-3">
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-4 text-xs text-emerald-950 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
                  ✓
                </div>
                <div>
                  <div className="font-black text-sm text-emerald-900">
                    {lang === 'en'
                      ? 'Confirm you have reached your destination?'
                      : 'ยืนยันว่าคุณเดินทางถึงจุดหมายแล้ว?'}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold">
                    {lang === 'en'
                      ? 'Please ensure the driver has arrived at your destination before completing.'
                      : 'โปรดยืนยันว่าคนขับส่งคุณถึงที่หมายจริงก่อนทำการจบทริป'}
                  </div>
                </div>
              </div>

              <div className="bg-white/90 rounded-xl p-3 text-xs space-y-1.5 text-slate-700 border border-emerald-200">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">
                    {lang === 'en' ? 'Destination:' : 'จุดหมายปลายทาง:'}
                  </span>
                  <span className="font-black text-slate-900 text-right">
                    {activeBooking.destination || ride.actualDropOffName || ride.destination}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">
                    {lang === 'en' ? 'Driver:' : 'คนขับ:'}
                  </span>
                  <span className="font-black text-slate-900">
                    {ride.hostName} ({ride.vehicleLabel})
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                  <span className="text-slate-500 font-bold">
                    {lang === 'en' ? 'Net charged:' : 'ยอดสุทธิที่ตัดจ่าย:'}
                  </span>
                  <span className="font-black text-emerald-700 text-sm font-mono">
                    ฿{activeBooking.netPaid}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                {lang === 'en'
                  ? '* Confirming will complete payment and take you to rate and review the driver.'
                  : '* เมื่อกดยืนยันจบ Trip ระบบจะตัดชำระเงินและพาคุณไปยังหน้าต่างให้คะแนนและรีวิวคนขับทันที'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStep('active-status')}
                className="py-3 rounded-xl border border-slate-300 text-slate-700 font-black text-xs hover:bg-slate-100 transition active:scale-95"
              >
                {lang === 'en' ? '← Not finished / Continue' : '← ยังไม่จบ / เดินทางต่อ'}
              </button>
              <button
                type="button"
                onClick={() => setStep('trip-review')}
                className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <IconCheck size={15} />
                <span>{lang === 'en' ? 'Confirm Finish Trip' : 'ยืนยันจบ Trip'}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Double Confirmation for Canceling an Existing Booking */}
        {step === 'confirm-cancel' && activeBooking && (
          <div className="space-y-3">
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-xs text-rose-900 space-y-1">
              <div className="font-black">
                {lang === 'en'
                  ? 'Are you sure you want to cancel this booking?'
                  : 'ต้องการยกเลิกที่นั่งในทริปนี้ใช่หรือไม่?'}
              </div>
              <p className="text-[11px] text-slate-600">
                {lang === 'en' ? (
                  <>
                    The system will release seats{' '}
                    <strong className="text-slate-900">
                      {activeBooking.seatIds.join(', ')}
                    </strong>{' '}
                    and refund{' '}
                    <strong className="text-orange-600">฿{activeBooking.netPaid}</strong>{' '}
                    to your payment method immediately.
                  </>
                ) : (
                  <>
                    ระบบจะคืนสิทธิ์ที่นั่ง{' '}
                    <strong className="text-slate-900">
                      {activeBooking.seatIds.join(', ')}
                    </strong>{' '}
                    และคืนเงิน{' '}
                    <strong className="text-orange-600">฿{activeBooking.netPaid}</strong>{' '}
                    กลับไปยังช่องทางชำระเงินของคุณทันที
                  </>
                )}
              </p>
            </div>

            {renderPriceBreakdownBox(
              activeBooking.regularFareTotal,
              activeBooking.premiumDiscount,
              activeBooking.promoDiscount,
              activeBooking.netPaid,
              activeBooking.seatIds.length,
              activeBooking.couponCode
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStep('active-status')}
                className="py-2.5 rounded-xl border border-slate-300 text-slate-700 font-black text-xs hover:bg-slate-100 transition"
              >
                {lang === 'en' ? '← Keep Booking' : '← ไม่ยกเลิก'}
              </button>
              <button
                type="button"
                onClick={() => onConfirmCancelBooking(ride.id)}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition"
              >
                {lang === 'en' ? 'Confirm Cancellation' : 'ยืนยันยกเลิกการจอง'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Trip Completed, Rating & Review UI (Requirement 3) */}
        {step === 'trip-review' && activeBooking && (
          <div className="space-y-3">
            {/* 1. Completed Trip & Payment Summary + Unlocked Notice */}
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-900 flex items-center gap-1">
                  <IconCheck size={15} className="text-emerald-600" />
                  <span>
                    {lang === 'en'
                      ? 'Arrived at Destination Successfully!'
                      : 'เดินทางถึงจุดหมายเรียบร้อย!'}
                  </span>
                </span>
                <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full tabular-nums">
                  {lang === 'en' ? 'Paid ฿' : 'ชำระสำเร็จ ฿'}{activeBooking.netPaid}
                </span>
              </div>
              <div className="text-[11px] font-bold text-slate-700">
                {ride.origin} → {ride.actualDropOffName || ride.destination} ({ride.hostName})
              </div>
              <div className="text-[10px] font-bold text-emerald-800">
                {lang === 'en'
                  ? '✓ Booking unlocked. You can now book your next trip anytime.'
                  : '✓ ปลดล็อกสถานะการจองแล้ว คุณสามารถจองทริปรอบถัดไปได้ทันที'}
              </div>
            </div>

            {/* Final Price Breakdown with Eco Impact on the very last line */}
            {renderPriceBreakdownBox(
              activeBooking.regularFareTotal,
              activeBooking.premiumDiscount,
              activeBooking.promoDiscount,
              activeBooking.netPaid,
              activeBooking.seatIds.length,
              activeBooking.couponCode
            )}

            {/* 2. 1 - 5 Star Rating */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center space-y-2">
              <div className="text-xs font-black text-slate-900">
                {lang === 'en'
                  ? `Rate carpool buddy / driver (${ride.hostName})`
                  : `ให้คะแนนเพื่อนร่วมทาง / คนขับ (${ride.hostName})`}
              </div>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = star <= rating;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      aria-label={lang === 'en' ? `Rate ${star} stars` : `ให้คะแนน ${star} ดาว`}
                      className={`w-11 h-11 min-h-[44px] min-w-[44px] rounded-xl border-2 text-lg flex items-center justify-center transition transform active:scale-95 ${
                        active
                          ? 'bg-orange-500 border-orange-500 text-white scale-105 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-300 hover:border-orange-300'
                      }`}
                    >
                      ★
                    </button>
                  );
                })}
              </div>
              <div className="text-[11px] font-black text-orange-600">
                {ratingLabels[rating]}
              </div>
            </div>

            {/* 3. Quick Compliment Tags */}
            <div className="space-y-1.5">
              <div className="text-xs font-black text-slate-900">
                {lang === 'en'
                  ? 'Quick compliments (Multi-select)'
                  : 'เลือกคำชมด่วน (เลือกได้หลายข้อ)'}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_REVIEW_TAGS.map((tag) => {
                  const isSelected = selectedCompliments.includes(tag);
                  const tagLabelMap: Record<string, string> = {
                    'ขับรถนุ่มปลอดภัย': lang === 'en' ? 'Smooth & safe driving' : 'ขับรถนุ่มปลอดภัย',
                    'ตรงต่อเวลา': lang === 'en' ? 'Punctual & on time' : 'ตรงต่อเวลา',
                    'เทสเพลงดีมาก': lang === 'en' ? 'Great music taste' : 'เทสเพลงดีมาก',
                    'คุยสนุก เป็นกันเอง': lang === 'en' ? 'Friendly & conversational' : 'คุยสนุก เป็นกันเอง',
                    'รถสะอาด แอร์เย็น': lang === 'en' ? 'Clean car & cool AC' : 'รถสะอาด แอร์เย็น',
                  };
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleCompliment(tag)}
                      className={`text-[10px] px-2.5 py-1.5 rounded-full font-black border transition flex items-center gap-1 ${
                        isSelected
                          ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-orange-300'
                      }`}
                    >
                      {isSelected && <IconCheck size={11} />}
                      <span>{tagLabelMap[tag] || tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Optional Review Comment Box */}
            <div>
              <label className="text-[11px] font-black text-slate-700 block mb-1">
                {lang === 'en'
                  ? 'Additional feedback (Optional)'
                  : 'เขียนรีวิวเพิ่มเติม (ไม่บังคับ)'}
              </label>
              <textarea
                rows={2}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder={
                  lang === 'en'
                    ? 'Write impressions or recommendations...'
                    : 'เขียนความประทับใจหรือข้อเสนอแนะ...'
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-medium text-slate-800 resize-none"
              />
            </div>

            <button
              type="button"
              onClick={() =>
                onFinishTripWithReview(
                  ride,
                  activeBooking,
                  rating,
                  selectedCompliments,
                  reviewComment
                )
              }
              className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-lg transition"
            >
              {lang === 'en'
                ? 'Submit Review & Back to Home →'
                : 'ส่งรีวิวและกลับสู่หน้าหลัก →'}
            </button>
          </div>
        )}
        </div>

        {/* ALWAYS VISIBLE STICKY FOOTER ACTION BAR (Never Hidden or Pushed Off-Screen) */}
        {step === 'select-seat' && (
          <div className="p-3 bg-white border-t border-slate-200 shrink-0 flex items-center justify-between gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] safe-bottom z-10">
            <div className="min-w-0 pr-1">
              <div className="text-[9.5px] font-bold text-slate-500">
                {lang === 'en' ? 'Total to Pay' : 'ราคาสุทธิที่ต้องชำระ'}
              </div>
              <div className="text-xl font-black text-orange-600 font-mono leading-none mt-0.5">
                ฿{netTotal}
              </div>
              <div className="text-[8.5px] font-bold text-slate-400 truncate mt-0.5">
                {selectedSeatLabels} ({seatCount} {lang === 'en' ? 'seat' : 'ที่นั่ง'})
              </div>
            </div>

            <button
              type="button"
              disabled={selectedSeats.length === 0}
              onClick={() =>
                onConfirmBooking({
                  rideId: ride.id,
                  seatIds: selectedSeats,
                  paymentMethodId: activePayment.id,
                  couponCode: activeCoupon?.code,
                  regularFareTotal,
                  premiumDiscount,
                  promoDiscount,
                  netPaid: netTotal,
                  destination: chosenDestination,
                })
              }
              className={`flex-1 min-h-[48px] text-white font-black text-xs py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition active:scale-95 ${
                selectedSeats.length === 0
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/30'
              }`}
            >
              <IconCheck size={16} />
              <span>
                {selectedSeats.length === 0
                  ? (lang === 'en' ? 'Please select seat' : 'กรุณาเลือกที่นั่ง')
                  : (lang === 'en'
                      ? `Confirm Booking (฿${netTotal})`
                      : `ยืนยันการจองที่นั่ง (฿${netTotal})`)}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
