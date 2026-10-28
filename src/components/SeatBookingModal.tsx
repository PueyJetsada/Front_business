import React, { useState } from 'react';
import {
  CAR_SEAT_POSITIONS,
  QUICK_REVIEW_TAGS,
  type BookedRideDetail,
  type DiscountCoupon,
  type PaymentMethod,
  type RideHop,
  type SeatId,
} from '../data/mockData';
import {
  DriverBunnySvg,
  IconCheck,
  IconLeaf,
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
    | 'confirm-cancel'
    | 'trip-review';
  onClose: () => void;
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
  onFinishTripWithReview,
  initialStep,
  onClose,
}) => {
  const isThisRideBooked = activeBooking?.rideId === ride.id;
  const isBlockedByOtherRide =
    Boolean(activeBooking) && activeBooking?.rideId !== ride.id;

  const firstFreeSeat =
    CAR_SEAT_POSITIONS.find((s) => !ride.occupiedSeats.includes(s.id))?.id || 'F1';

  const [selectedSeats, setSelectedSeats] = useState<SeatId[]>(
    isThisRideBooked && activeBooking?.seatIds?.length
      ? activeBooking.seatIds
      : [firstFreeSeat]
  );

  const [step, setStep] = useState<
    | 'select-seat'
    | 'confirm-book'
    | 'active-status'
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
    .map((id) => CAR_SEAT_POSITIONS.find((s) => s.id === id)?.shortLabel || id)
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
                ไม่สามารถจองทริปซ้อนกันได้
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="ปิดหน้าต่าง"
              className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center shrink-0 active:scale-95 transition"
            >
              ✕
            </button>
          </div>

          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 text-xs text-slate-800 leading-relaxed font-bold">
            คุณมีรายการจองที่กำลังดำเนินการอยู่ กรุณาจบทริปหรือยกเลิกรายการเดิมก่อนทำการจองใหม่
          </div>

          {activeRide && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-1.5 text-xs tabular-nums">
              <div className="text-[10px] font-black text-orange-600">
                รายการจองที่กำลังดำเนินการอยู่:
              </div>
              <div className="font-black text-slate-900">
                {activeRide.origin} → {activeRide.destination} ({activeRide.hostName})
              </div>
              <div className="text-[11px] text-slate-600 font-bold">
                ที่นั่ง: {activeBooking.seatIds.join(', ')} • ยอดชำระสุทธิ ฿
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
              ปิดหน้าต่าง
            </button>
            <button
              type="button"
              onClick={onSwitchToActiveRide}
              className="min-h-[46px] py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md active:scale-95 transition"
            >
              ดูสถานะทริปปัจจุบัน →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderSeatButton = (seatId: SeatId) => {
    const meta = CAR_SEAT_POSITIONS.find((s) => s.id === seatId)!;
    const isOccupied = ride.occupiedSeats.includes(seatId);
    const isSelected = selectedSeats.includes(seatId);

    return (
      <button
        key={seatId}
        type="button"
        disabled={isOccupied}
        onClick={() => toggleSeat(seatId)}
        className={`relative h-16 rounded-2xl border-2 flex flex-col items-center justify-center p-1.5 transition select-none ${
          isOccupied
            ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed opacity-75'
            : isSelected
              ? 'bg-orange-500 border-orange-600 text-white shadow-md scale-[1.03]'
              : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-400 text-emerald-950 cursor-pointer'
        }`}
      >
        <span
          className={`w-8 h-1.5 rounded-full mb-1 ${
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
        <span className="text-[9px] font-bold mt-0.5 leading-tight text-center">
          {meta.shortLabel}
        </span>
        <span className="text-[8px] font-extrabold mt-0.5 opacity-90">
          {isOccupied ? 'ไม่ว่าง' : isSelected ? '✓ เลือกแล้ว' : 'ว่าง'}
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
          ค่าโดยสารปกติ (หารต่อคน ฿{regularPerPerson} × {seatsCount} ที่นั่ง):
        </span>
        <span>฿{regTotal}</span>
      </div>

      <div className="flex justify-between text-emerald-700 font-bold">
        <span>ส่วนลดจาก HOP Premium:</span>
        <span>{premDisc > 0 ? `-฿${premDisc}` : '฿0'}</span>
      </div>

      <div className="flex justify-between text-emerald-700 font-bold">
        <span>
          ส่วนลดจากโค้ดโปรโมชัน{couponCodeUsed ? ` (${couponCodeUsed})` : ''}:
        </span>
        <span>{promDisc > 0 ? `-฿${promDisc}` : '฿0'}</span>
      </div>

      {/* Prominent Final Net Price */}
      <div className="pt-2 border-t-2 border-slate-200 flex justify-between items-baseline">
        <span className="text-xs font-black text-slate-900">
          ราคาสุทธิที่ต้องชำระ (ยอดรวมสุดท้าย):
        </span>
        <span className="text-lg font-black text-orange-600 font-mono">
          ฿{finalNet}
        </span>
      </div>

      {/* Eco Impact strictly on the VERY LAST LINE after Final Net Price */}
      <div className="pt-1.5 border-t border-slate-200/80 flex items-center justify-between text-[10px] font-black text-emerald-700">
        <span className="flex items-center gap-1">
          <IconLeaf size={12} />
          <span>ช่วยลดคาร์บอนและมลพิษจากทริปนี้:</span>
        </span>
        <span>ลดได้ {(ride.co2SavedKg * seatsCount).toFixed(1)} kg CO₂</span>
      </div>
    </div>
  );

  const ratingLabels: Record<number, string> = {
    1: '1 ดาว — ต้องปรับปรุง',
    2: '2 ดาว — พอใช้',
    3: '3 ดาว — ปานกลาง',
    4: '4 ดาว — ดีมาก',
    5: '5 ดาว — ประทับใจมาก!',
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
        className="bg-white text-slate-900 w-full md:max-w-[460px] max-h-[90dvh] overflow-y-auto custom-scroll rounded-t-[32px] md:rounded-3xl p-4 pb-6 md:pb-5 shadow-2xl border-2 border-orange-500 space-y-3 animate-[sheet-rise_0.22s_cubic-bezier(0.22,1,0.36,1)] safe-bottom"
      >
        {/* Native Bottom Sheet Drag Handle */}
        <div
          className="w-11 h-1.5 rounded-full bg-slate-300 mx-auto mb-1"
          aria-hidden="true"
        />

        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
          <div>
            <h3 className="text-sm font-black text-slate-900">
              {step === 'select-seat' && 'เลือกที่นั่งในรถ (ผัง 2D)'}
              {step === 'confirm-book' && 'ยืนยันการจองและชำระเงิน'}
              {step === 'active-status' && 'สถานะทริปที่กำลังเดินทาง'}
              {step === 'confirm-cancel' && 'ยืนยันการยกเลิกการจอง'}
              {step === 'trip-review' && 'สรุปการเดินทางและรีวิว'}
            </h3>
            <p className="text-[10px] text-slate-500 font-bold">
              {ride.hostName} • {ride.vehicleLabel}
              {ride.licensePlate ? ` (${ride.licensePlate})` : ''}
            </p>
          </div>
          {step !== 'trip-review' && (
            <button
              type="button"
              onClick={onClose}
              aria-label="ปิดหน้าต่าง"
              className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center shrink-0 active:scale-95 transition"
            >
              ✕
            </button>
          )}
        </div>

        {/* STEP 1: 2D Visual Car Seat Picker */}
        {step === 'select-seat' && (
          <>
            {/* Legend */}
            <div className="grid grid-cols-4 gap-1 text-[9px] font-bold text-center bg-slate-50 p-2 rounded-xl border border-slate-200">
              <div className="flex items-center justify-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-slate-800 inline-block" />
                <span>คนขับ</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-slate-300 inline-block" />
                <span>ไม่ว่าง</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-400 inline-block" />
                <span>ว่าง</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-orange-500 inline-block" />
                <span>ที่คุณเลือก</span>
              </div>
            </div>

            {/* 2D Top-Down Car Cabin Frame */}
            <div className="mx-auto max-w-[265px] bg-slate-100 border-[3px] border-slate-700 rounded-t-[44px] rounded-b-[26px] p-3 shadow-inner space-y-2.5 relative">
              <div className="h-5 bg-sky-100/90 border-2 border-slate-400 rounded-t-[28px] rounded-b-lg flex items-center justify-center text-[9px] font-black text-slate-600 tracking-wider">
                หน้ารถ (ทิศทางเดินทาง ▲)
              </div>

              <div className="grid grid-cols-2 gap-4 px-2">
                {renderSeatButton('F1')}

                <div className="h-16 rounded-2xl border-2 border-slate-700 bg-slate-800 text-white flex flex-col items-center justify-center p-1.5 select-none">
                  <IconSteeringWheel size={16} className="text-orange-400 mb-0.5" />
                  <span className="text-[10px] font-black">คนขับ</span>
                  <span className="text-[8px] text-slate-300 font-bold truncate max-w-full">
                    {ride.hostName.split(' ')[0]}
                  </span>
                </div>
              </div>

              <div className="text-center text-[8px] font-bold text-slate-400 tracking-widest">
                ─── แถวที่นั่งผู้โดยสารด้านหลัง ───
              </div>

              <div className="grid grid-cols-3 gap-2">
                {renderSeatButton('R1')}
                {renderSeatButton('R2')}
                {renderSeatButton('R3')}
              </div>
            </div>

            {/* Seat + Promo + Payment Selectors */}
            <div className="bg-white border border-slate-200 rounded-2xl p-2.5 space-y-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-600">ตำแหน่งที่เลือก:</span>
                <span className="font-black text-orange-600">
                  {selectedSeatLabels} ({seatCount} ที่นั่ง)
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-slate-600 flex items-center gap-1 shrink-0">
                  <IconTicket size={13} className="text-orange-500" />
                  <span>โค้ดโปรโมชัน:</span>
                </span>
                <select
                  value={selectedCouponCode || ''}
                  onChange={(e) =>
                    onSelectCouponCode(e.target.value ? e.target.value : null)
                  }
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-[10px] font-black text-slate-900"
                >
                  <option value="">ไม่ใช้โค้ดส่วนลด</option>
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
                  <span>วิธีชำระเงิน:</span>
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
              onClick={() => setStep('confirm-book')}
              className="w-full min-h-[46px] bg-orange-500 hover:bg-orange-600 text-white font-black text-xs py-3 rounded-xl shadow-md active:scale-95 transition"
            >
              ดำเนินการต่อเพื่อยืนยันการจอง (฿{netTotal}) →
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
                  กรุณาตรวจสอบรายละเอียดก่อนยืนยันการจอง
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5">
                  สามารถจองได้ทีละ 1 ทริป เมื่อยืนยันระบบจะล็อกที่นั่งและชำระเงินทันที
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">เส้นทาง:</span>
                <span className="font-black text-slate-900 flex items-center gap-1">
                  <IconPin size={12} className="text-orange-500" />
                  {ride.origin} → {ride.actualDropOffName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">รถและคนขับ:</span>
                <span className="font-black text-slate-900">
                  {ride.hostName} ({ride.vehicleLabel})
                </span>
              </div>
              {ride.licensePlate && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">ป้ายทะเบียน:</span>
                  <span className="font-mono font-black text-slate-900 bg-slate-200 px-2 py-0.5 rounded text-[11px]">
                    {ride.licensePlate}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">ที่นั่งที่เลือก:</span>
                <span className="font-black text-orange-600">
                  {selectedSeatLabels} ({seatCount} ที่นั่ง)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">วิธีชำระเงิน:</span>
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
                ← แก้ไขที่นั่ง
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
                  })
                }
                className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-1 transition"
              >
                <IconCheck size={14} />
                <span>ยืนยันการจอง (฿{netTotal})</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Active Trip Status View (with "เดินทางถึงจุดหมาย / จบทริป" button) */}
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
                    กำลังเดินทาง • ล็อกที่นั่งแล้ว
                  </span>
                  <div className="text-xs font-black text-slate-900 mt-1">
                    {ride.origin} → {ride.destination}
                  </div>
                </div>
              </div>
              <div className="text-right tabular-nums">
                <div className="text-xs font-black text-emerald-800">
                  ที่นั่ง {activeBooking.seatIds.join(', ')}
                </div>
                <div className="text-[10px] font-bold text-slate-500">
                  {ride.licensePlate || ride.vehicleLabel}
                </div>
              </div>
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

            {/* Primary Action: Complete Trip & Open Rating/Review UI */}
            <button
              type="button"
              onClick={() => setStep('trip-review')}
              className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition"
            >
              <IconCheck size={15} />
              <span>เดินทางถึงจุดหมาย / จบทริป</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2 rounded-xl border border-slate-300 text-slate-700 font-black text-xs hover:bg-slate-100 transition"
              >
                กลับหน้าหลัก
              </button>
              <button
                type="button"
                onClick={() => setStep('confirm-cancel')}
                className="py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-black text-xs transition"
              >
                ยกเลิกการจองทริปนี้
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Double Confirmation for Canceling an Existing Booking */}
        {step === 'confirm-cancel' && activeBooking && (
          <div className="space-y-3">
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-xs text-rose-900 space-y-1">
              <div className="font-black">ต้องการยกเลิกที่นั่งในทริปนี้ใช่หรือไม่?</div>
              <p className="text-[11px] text-slate-600">
                ระบบจะคืนสิทธิ์ที่นั่ง{' '}
                <strong className="text-slate-900">
                  {activeBooking.seatIds.join(', ')}
                </strong>{' '}
                และคืนเงิน{' '}
                <strong className="text-orange-600">฿{activeBooking.netPaid}</strong>{' '}
                กลับไปยังช่องทางชำระเงินของคุณทันที
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
                ← ไม่ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => onConfirmCancelBooking(ride.id)}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition"
              >
                ยืนยันยกเลิกการจอง
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
                  <span>เดินทางถึงจุดหมายเรียบร้อย!</span>
                </span>
                <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full tabular-nums">
                  ชำระสำเร็จ ฿{activeBooking.netPaid}
                </span>
              </div>
              <div className="text-[11px] font-bold text-slate-700">
                {ride.origin} → {ride.actualDropOffName} ({ride.hostName})
              </div>
              <div className="text-[10px] font-bold text-emerald-800">
                ✓ ปลดล็อกสถานะการจองแล้ว คุณสามารถจองทริปรอบถัดไปได้ทันที
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
                ให้คะแนนเพื่อนร่วมทาง / คนขับ ({ride.hostName})
              </div>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = star <= rating;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      aria-label={`ให้คะแนน ${star} ดาว`}
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
                เลือกคำชมด่วน (เลือกได้หลายข้อ)
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_REVIEW_TAGS.map((tag) => {
                  const isSelected = selectedCompliments.includes(tag);
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
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Optional Review Comment Box */}
            <div>
              <label className="text-[11px] font-black text-slate-700 block mb-1">
                เขียนรีวิวเพิ่มเติม (ไม่บังคับ)
              </label>
              <textarea
                rows={2}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="เขียนความประทับใจหรือข้อเสนอแนะ..."
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
              ส่งรีวิวและกลับสู่หน้าหลัก →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
