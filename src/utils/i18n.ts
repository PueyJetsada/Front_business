export type AppLang = 'th' | 'en';

// Exact & phrase-level dictionary (sorted longest-first at runtime so longer phrases match before shorter tokens)
const PHRASE_DICTIONARY: Array<[string, string]> = [
  // App Brand & Headers
  ['แพลตฟอร์มหารค่ารถและหาเพื่อนร่วมทาง SIIT & มธ.', 'SIIT & TU Social Ride-Sharing & Carpool Platform'],
  ['หารค่ารถและหาเพื่อนร่วมทาง SIIT ม.ธรรมศาสตร์', 'SIIT Thammasat Social Carpool & Ride-Sharing'],
  ['โหมดแท็บเล็ตและไอแพด (Split-View)', 'Tablet & iPad Mode (Split-View)'],
  ['SIIT & มธ. หารค่ารถ', 'SIIT & TU Carpool'],
  ['พร้อมออกเดินทาง!', 'Ready to Hop!'],
  ['ดูแอนิเมชันเปิดตัว', 'Replay Splash Animation'],
  ['อีเมลมหาวิทยาลัย', 'University Email'],
  ['รหัสผ่าน', 'Password'],
  ['ลืมรหัสผ่าน', 'Forgot Password'],
  ['ยืนยันรหัส OTP นักศึกษา', 'Verify Student OTP'],
  ['เข้าสู่ระบบ', 'Sign In'],
  ['← กลับหน้าเข้าสู่ระบบ', '← Back to Sign In'],
  ['ยืนยันรหัสนักศึกษา', 'Student OTP Verification'],
  ['กรอกรหัส 6 หลักที่ส่งไปยังอีเมล', 'Enter the 6-digit code sent to'],
  ['ยืนยันและตั้งค่าโปรไฟล์ →', 'Verify & Setup Profile →'],

  // Device Preview Bar
  ['โหมดแสดงผล:', 'Preview Mode:'],
  ['อัตโนมัติตามจอ (แท็บเล็ต/iPad)', 'Auto Responsive (Tablet/iPad)'],
  ['อัตโนมัติตามจอ (มือถือ)', 'Auto Responsive (Mobile)'],
  ['อัตโนมัติตามจอ', 'Auto Responsive'],
  ['แท็บเล็ต/iPad', 'Tablet/iPad'],
  ['มือถือ', 'Mobile'],
  ['สมาร์ทโฟน (iOS / Android)', 'Smartphone (iOS / Android)'],
  ['แท็บเล็ต / iPad (Split-View)', 'Tablet / iPad (Split-View)'],

  // Navigation & Sidebar
  ['เปิดตี้สร้างทริปใหม่', 'Create New Hop'],
  ['หน้าหลัก (ค้นหาทริป)', 'Explore (Find Rides)'],
  ['แผนที่จุดรับ-ส่ง', 'Pickup & Drop-off Map'],
  ['AI จองให้ & เพื่อน', 'AI Auto-Book & Friends'],
  ['ชำระเงิน & คูปอง', 'Payment & Promos'],
  ['ประวัติการเดินทาง', 'Trip History'],
  ['โปรไฟล์ของฉัน', 'My Profile'],
  ['● ทริปที่กำลังเดินทาง', '● Active Ongoing Trip'],
  ['อัปเกรด PRO', 'Upgrade PRO'],
  ['หน้าหลัก', 'Explore'],
  ['แผนที่', 'Map'],
  ['เปิดตี้', 'Create Hop'],
  ['AI จองให้', 'AI Concierge'],
  ['โปรไฟล์', 'Profile'],
  ['คูปอง', 'Pro'],
  ['อัปเกรด', 'Upgrade'],

  // Single Active Booking Guard & Toasts
  ['คุณมีรายการจองที่กำลังดำเนินการอยู่ กรุณาจบทริปหรือยกเลิกรายการเดิมก่อนทำการจองใหม่', 'You already have an active booking in progress. Please complete or cancel your current trip before booking a new ride.'],
  ['ไม่สามารถจองทริปซ้อนกันได้', 'Single Active Booking Limit'],
  ['รายการจองที่กำลังดำเนินการอยู่:', 'Current Active Booking:'],
  ['ดูสถานะทริปปัจจุบัน →', 'View Active Trip →'],
  ['จองที่นั่งสำเร็จ! คุณมีทริปที่กำลังดำเนินการอยู่ 1 รอบ', 'Seat booked! You now have 1 active ongoing trip.'],
  ['ยกเลิกการจองเรียบร้อย คุณสามารถเลือกจองทริปใหม่ได้แล้ว', 'Booking cancelled. You can now book a new trip.'],
  ['เปิดตี้สร้างทริปใหม่เรียบร้อย!', 'New carpool hop created!'],
  ['ระบบ AI จับคู่และจองที่นั่งกับ นาย Z ให้อัตโนมัติเรียบร้อย!', 'AI matched and auto-booked your seat with Mr. Z!'],

  // Explore Screen
  ['ทริปที่กำลังดำเนินการอยู่ (1/1 รอบ)', 'Active Ongoing Trip (1/1 Max)'],
  ['ดูสถานะ / ยกเลิกทริป', 'View Status / Cancel'],
  ['ถึงจุดหมาย / จบทริป', 'Arrived / Complete Trip'],
  ['ดูรายละเอียด / ยกเลิก', 'Details / Cancel'],
  ['เดินทางตอนนี้', 'Leave Now'],
  ['จองล่วงหน้า', 'Pre-book'],
  ['สลับต้นทาง-ปลายทาง', 'Swap Origin & Destination'],
  ['ต้นทาง', 'Origin'],
  ['ปลายทาง', 'Destination'],
  ['ทุกเส้นทาง', 'All Routes'],
  ['รูปแบบการจับคู่', 'Smart Match Priority'],
  ['ตัวกรองละเอียด', 'Filter Options'],
  ['เน้นใกล้ (ระยะทาง)', 'Closest Drop-off'],
  ['เน้น Vibe ตรงกัน', 'Shared Vibe'],
  ['ระยะเดินสูงสุด (ไม่เกิน 500m):', 'Max Walk Limit (≤ 500m):'],
  ['จำกัดระยะเดินสูงสุดไม่เกิน 500 เมตร', 'Max walk distance guardrail (≤ 500m)'],
  ['ทุก Vibe', 'All Vibes'],
  ['เรียงตาม:', 'Sort:'],
  ['ลำดับการแสดงผล', 'Sort Order'],
  ['↓ มากไปน้อย', '↓ High to Low'],
  ['↑ น้อยไปมาก', '↑ Low to High'],
  ['คะแนน Match รวม', 'Total Match %'],
  ['คะแนน Match', 'Smart Match'],
  ['Vibe ตรงกัน', 'Vibe Match'],
  ['ระยะใกล้สุด', 'Shortest Walk'],
  ['เน้นใกล้จุดหมาย', 'Closest Drop-off'],
  ['รีเซ็ตตัวกรอง', 'Reset Filters'],
  ['เปิดระบบรอจองอัตโนมัติ', 'Set AI Auto-Book'],
  ['ยังไม่มีรอบเวลาที่ต้องการ?', 'Need another departure time?'],
  ['เปิดตี้สร้างทริปเองฟรี หรือตั้งระบบรอจองอัตโนมัติแบบเรียลไทม์', 'Create your own hop for free or set a real-time AI Auto-Book watcher'],
  ['+ เปิดตี้เอง', '+ Create Hop'],
  ['รายละเอียดทริป & ผังที่นั่ง', 'Trip Details & Seat Layout'],
  ['ผังที่นั่งในรถ', 'Car Seat Layout'],
  ['หน้ารถ (ทิศทางเดินทาง ▲)', 'Front of Car (Direction ▲)'],
  ['ว่าง (แตะจอง)', 'Open (Tap)'],
  ['ราคาสุทธิที่ต้องชำระ (ต่อที่นั่ง):', 'Final Net Fare (Per Seat):'],
  ['เลือกที่นั่งและจองทริปนี้ →', 'Select Seat & Book This Ride →'],
  ['เลือกที่นั่งและจองรถของ ', 'Select Seat & Book with '],
  ['เลือกที่นั่งและจองรถ', 'Select Seat & Book'],
  ['ตั้งค่าตัวกรองการจับคู่ (Smart Match)', 'Smart Match & Walk Limit Settings'],
  ['ปรับน้ำหนักความสำคัญและเพดานระยะเดินสูงสุดไม่เกิน 500 เมตร', 'Adjust priority weights and the 500m maximum walk guardrail'],
  ['บันทึกและดูผลลัพธ์', 'Apply Filters'],

  // Price Breakdown & Eco Impact
  ['ค่าโดยสารปกติ (หารต่อคน):', 'Regular Shared Fare:'],
  ['ค่าโดยสารปกติ (หารต่อคน ', 'Regular Shared Fare ('],
  ['ส่วนลดจาก HOP Premium:', 'HOP Premium Discount:'],
  ['ส่วนลดจากโค้ดโปรโมชัน:', 'Promo Code Discount:'],
  ['ส่วนลดจากโค้ดโปรโมชัน', 'Promo Code Discount'],
  ['ราคาสุทธิที่ต้องชำระ (ยอดรวมสุดท้าย):', 'Final Net Price to Pay:'],
  ['ราคาสุทธิที่ต้องชำระ (สำหรับสมาชิก HOP Premium):', 'Final Net Fare (HOP Premium):'],
  ['ช่วยลดคาร์บอนและมลพิษจากทริปนี้:', 'Eco Carbon Saved on This Trip:'],
  ['ช่วยลดคาร์บอนจากการเดินทางร่วมกัน:', 'Eco Carbon Saved Together:'],

  // Seat Booking Modal & Post-Trip Review
  ['เลือกที่นั่งในรถ', 'Select Car Seat'],
  ['ยืนยันการจองและชำระเงิน', 'Confirm Booking & Payment'],
  ['สถานะทริปที่กำลังเดินทาง', 'Active Ongoing Trip Status'],
  ['ยืนยันการยกเลิกการจอง', 'Confirm Booking Cancellation'],
  ['สรุปการเดินทางและรีวิว', 'Trip Summary & Rating'],
  ['ที่คุณเลือก', 'Selected'],
  ['─── แถวที่นั่งผู้โดยสารด้านหลัง ───', '─── Rear Passenger Row ───'],
  ['ตำแหน่งที่เลือก:', 'Selected Seats:'],
  ['โค้ดโปรโมชัน:', 'Promo Code:'],
  ['ไม่ใช้โค้ดส่วนลด', 'No Promo Code'],
  ['วิธีชำระเงิน:', 'Payment Method:'],
  ['ดำเนินการต่อเพื่อยืนยันการจอง', 'Continue to Confirm Booking'],
  ['กรุณาตรวจสอบรายละเอียดก่อนยืนยันการจอง', 'Please Review Details Before Confirming'],
  ['สามารถจองได้ทีละ 1 ทริป เมื่อยืนยันระบบจะล็อกที่นั่งและชำระเงินทันที', 'Max 1 active trip at a time. Confirming locks your seat immediately.'],
  ['เส้นทาง:', 'Route:'],
  ['รถและคนขับ:', 'Host & Vehicle:'],
  ['ป้ายทะเบียน:', 'License Plate:'],
  ['ที่นั่งที่เลือก:', 'Selected Seat:'],
  ['← แก้ไขที่นั่ง', '← Change Seat'],
  ['ยืนยันการจอง', 'Confirm Booking'],
  ['กำลังเดินทาง • ล็อกที่นั่งแล้ว', 'Ongoing Trip • Seat Locked'],
  ['เดินทางถึงจุดหมาย / จบทริป', 'Arrived / Complete Trip'],
  ['กลับหน้าหลัก', 'Back to Explore'],
  ['ยกเลิกการจองทริปนี้', 'Cancel This Booking'],
  ['ต้องการยกเลิกที่นั่งในทริปนี้ใช่หรือไม่?', 'Cancel your seat on this trip?'],
  ['ระบบจะคืนสิทธิ์ที่นั่ง', 'Your seat'],
  ['และคืนเงิน', 'will be released and'],
  ['กลับไปยังช่องทางชำระเงินของคุณทันที', 'will be refunded to your payment method immediately'],
  ['← ไม่ยกเลิก', '← Keep Booking'],
  ['ยืนยันยกเลิกการจอง', 'Confirm Cancel'],
  ['✓ ปลดล็อกสถานะการจองแล้ว คุณสามารถจองทริปรอบถัดไปได้ทันที', '✓ Booking limit unlocked! You can now book your next trip immediately.'],
  ['ให้คะแนนเพื่อนร่วมทาง / คนขับ', 'Rate Your Host / Driver'],
  ['เขียนความประทับใจหรือข้อเสนอแนะ...', 'Share your experience or feedback...'],
  ['ส่งรีวิวและกลับสู่หน้าหลัก →', 'Submit Review & Finish →'],
  ['ไม่ว่าง', 'Taken'],
  ['✓ เลือกแล้ว', '✓ Selected'],
  ['ว่าง', 'Available'],
  ['เดินทางถึงจุดหมายเรียบร้อย!', 'You Have Arrived!'],
  ['1 ดาว — ต้องปรับปรุง', '1 Star — Needs Improvement'],
  ['2 ดาว — พอใช้', '2 Stars — Fair'],
  ['3 ดาว — ปานกลาง', '3 Stars — Good'],
  ['4 ดาว — ดีมาก', '4 Stars — Great'],
  ['5 ดาว — ประทับใจมาก!', '5 Stars — Impressive!'],
  ['เลือกคำชมด่วน (เลือกได้หลายข้อ)', 'Quick Compliment Tags (Multi-select)'],
  ['เขียนรีวิวเพิ่มเติม (ไม่บังคับ)', 'Additional Review Comment (Optional)'],

  // Quick Review Tags
  ['ขับรถนุ่มปลอดภัย', 'Smooth & Safe Driving'],
  ['ตรงต่อเวลา', 'Punctual'],
  ['เทสเพลงดีมาก', 'Great Music Taste'],
  ['คุยสนุก เป็นกันเอง', 'Friendly & Fun Chat'],
  ['รถสะอาด แอร์เย็น', 'Clean & Cool AC'],

  // Map Screen
  ['แผนที่จุดรับ-ส่ง (แตะการ์ดรถหรือหมุดเพื่อโฟกัส)', 'Interactive Map (Tap vehicle card or pin to focus)'],
  ['แผนที่และรายการรถ', 'Map & Active Vehicles'],
  ['แตะเลือกรถด้านซ้ายเพื่อโฟกัสหมุดบนแผนที่ด้านขวา', 'Tap a vehicle on the left to focus its pin on the map'],
  ['แตะเลือกรถด้านล่างเพื่อโฟกัสตำแหน่งบนแผนที่:', 'Tap a vehicle card below to focus on the map:'],
  ['รายละเอียดรถที่เลือกบนแผนที่', 'Selected Vehicle Details'],
  ['ดูมุมกว้าง', 'Wide View'],
  ['มุมกว้าง', 'Wide View'],
  ['ซูมหมุดที่เลือก', 'Focus Pin'],
  ['ซูมหมุด', 'Focus Pin'],
  ['กำลังเดินทาง — แตะเพื่อดูสถานะหรือจบทริป', 'Ongoing Trip — Tap to View or Complete'],

  // AI Concierge & Friends Screen
  ['สวัสดีครับ! ผมคือผู้ช่วย AI ของ CAMPUSHOP พิมพ์สั่งจองรถล่วงหน้าหรือตั้งระบบรอจองอัตโนมัติแบบเรียลไทม์ด้วยภาษาธรรมชาติได้เลยครับ หากข้อมูลจุดรับ-ส่งหรือจำนวนที่นั่งยังไม่ครบ ผมจะถามต่อให้เองครับ', 'Hello! I am the CAMPUSHOP AI Concierge. Type in natural language to pre-book or set a real-time Auto-Book watcher — if any pickup, drop-off, or seat info is missing, I will ask follow-up questions automatically!'],
  ['ผู้ช่วย AI จองอัตโนมัติ', 'AI Auto-Book Concierge'],
  ['แชทเพื่อนร่วมทาง (2)', 'Companion Chat (2)'],
  ['ข้อความจากเพื่อนร่วมทางของคุณ', 'Messages from Your Co-Hoppers'],
  ['"เดี๋ยวแวะรับหน้าตึก SIIT รังสิตครับ เปิดเพลง Indie รอเลย!"', '"Picking you up in front of SIIT Rangsit — Indie playlist is ready!"'],
  ['"เดี๋ยวแวะรับหน้าตึก SIIT รังสิตครับ"', '"Picking you up in front of SIIT Rangsit!"'],
  ['"มาหาร Grab กลับคอนโด B กันค่ะ เหลือว่างอีก 2 ที่นั่ง!"', '"Let\'s split a Grab back to Condo B! 2 seats left!"'],
  ['ระบบรอจองอัตโนมัติแบบเรียลไทม์ (AI Auto-Book)', 'Real-time AI Auto-Book Watcher'],
  ['ระบบรอจองอัตโนมัติ (AI Auto-Book)', 'AI Auto-Book Watchers'],
  ['สิทธิ์ HOP Premium', 'HOP Premium Active'],
  ['ล็อกอยู่ (เฉพาะ HOP Premium)', 'Locked (HOP Premium Only)'],
  ['ล็อกอยู่', 'Locked'],
  ['กำลังรอจับคู่และจองให้อัตโนมัติ', 'Watching & Auto-Booking'],
  ['จองอัตโนมัติสำเร็จ!', 'Auto-Booked!'],
  ['จำลองพบทริปตรงเงื่อนไข', 'Simulate Match Found'],
  ['ยกเลิก', 'Cancel'],
  ['จับคู่กับ:', 'Matched:'],
  ['ตั้งไว้เมื่อ 5 นาทีที่แล้ว', 'Set 5 mins ago'],
  ['5 นาทีที่แล้ว', '5 mins ago'],
  ['เมื่อสักครู่', 'Just now'],
  ['ประโยคตัวอย่างสำหรับสั่งจองอัตโนมัติ:', 'Sample natural-language prompts:'],
  ['"เห้ย ต้องการไปคอนโด B ตอน 9.00 ถ้ามีคนเปิดหารรถไปที่นี่ ให้กดจองให้เลยนะ"', '"Hey, I need to go to Condo B at 9:00. Auto-book me if anyone opens a ride!"'],
  ['"พรุ่งนี้มีเรียน SIIT บางกระดี่ 09:00 น. ถ้ามีคนเปิดตี้ให้จองให้ด้วย"', '"I have class at SIIT Bangkadi tomorrow at 09:00. Auto-book me when a hop opens!"'],
  ['1 ที่นั่งครับ', '1 seat please'],
  ['2 ที่นั่ง (ไปกับเพื่อน)', '2 seats (with a friend)'],
  ['3 ที่นั่ง', '3 seats'],
  ['ขึ้นที่หน้าตึก SIIT รังสิต เลยครับ', 'Pickup at SIIT Rangsit'],
  ['รับที่ TU Dome', 'Pickup at TU Dome'],
  ['รับที่หน้า Kave TU', 'Pickup at Kave TU'],
  ['เดินได้ไม่เกิน 100 เมตรครับ', 'Max walk 100m'],
  ['ขอจุดหมายเป๊ะ 0 เมตรเลย', 'Exact drop-off 0m'],
  ['เดินได้ไม่เกิน 300 เมตร', 'Max walk 300m'],
  ['ลองระบุเกินเพดาน: 800 เมตร', 'Test >500m guardrail: 800m'],
  ['พิมพ์สั่ง AI เช่น ไปคอนโด B ตอน 9.00...', 'Ask AI e.g. Go to Condo B at 9:00...'],
  ['พิมพ์ตอบคำถาม AI หรือเลือกปุ่มด้านบน...', 'Reply to AI or tap a quick chip above...'],
  ['ส่ง', 'Send'],
  ['รายการตั้งเวลารอจับคู่และล็อกที่นั่งให้อัตโนมัติทันทีที่มีเพื่อนเปิดทริปตรงเส้นทางและระยะเดิน ≤ 500m', 'Active watchers that automatically match and lock your seat as soon as a ride opens within ≤ 500m walk'],
  ['เพื่อนร่วมทางที่ออนไลน์ล่าสุด', 'Recently Online Co-Hoppers'],
  ['ยืนยันการยกเลิกรายการรอจองอัตโนมัติ?', 'Cancel this AI Auto-Book watcher?'],
  ['หากยกเลิก ระบบ AI จะหยุดรอจับคู่ทริปสำหรับรายการนี้ทันที คุณต้องการยืนยันใช่หรือไม่?', 'AI will stop monitoring for matching rides for this request. Confirm cancellation?'],

  // Create Hop Screen
  ['เปิดตี้สร้างทริป', 'Create a Carpool Hop'],
  ['เลือกบทบาทและระบุเส้นทางเพื่อหาเพื่อนร่วมทางในมหาวิทยาลัย', 'Choose your host role and route to share a ride with fellow students'],
  ['มีรถส่วนตัว', 'Own Car (Driver)'],
  ['รับเพื่อนที่ไปทางเดียวกัน ช่วยแบ่งเบาค่าเดินทาง', 'Offer empty seats to students heading the same way'],
  ['หารรถ Grab / Bolt', 'Split Grab / Bolt'],
  ['ตกรถตู้มธ. หาเพื่อนเรียกรถไปด้วยกัน ไม่ต้องจ่ายเต็มคนเดียว', 'Missed the campus van? Split a Grab or Bolt with co-hoppers'],
  ['ข้อมูลรถที่จะแสดงให้เพื่อนร่วมทางเห็นตอนขึ้นรถ', 'Vehicle details shown to co-hoppers at pickup'],
  ['จุดรับขึ้นรถ', 'Pickup Location'],
  ['จุดหมายปลายทาง', 'Destination'],
  ['วัน-เวลานัดหมาย', 'Scheduled Date & Time'],
  ['ระยะเดินจากจุดส่ง (≤ 500m)', 'Walk from Drop-off (≤ 500m)'],
  ['ถึงหน้าจุดหมาย (0m)', 'Exact Destination (0m)'],
  ['ป้ายใกล้เคียง (เดิน 100m)', 'Nearby Spot (Walk 100m)'],
  ['หน้าปากซอย (เดิน 200m)', 'Alley Entrance (Walk 200m)'],
  ['จำนวนที่นั่งว่าง', 'Available Seats'],
  ['ค่ารถต่อที่นั่ง (฿)', 'Fare per Seat (฿)'],
  ['เลือก Vibe ประจำทริปนี้', 'Select Trip Vibes'],
  ['ข้อความสั้นๆ ถึงเพื่อนร่วมทาง...', 'Short note for co-hoppers...'],
  ['ตรวจสอบและเปิดตี้สร้างทริป →', 'Review & Create Hop →'],
  ['ยืนยันการเปิดตี้สร้างทริป', 'Confirm New Hop Creation'],
  ['ยืนยันเปิดตี้ทันที', 'Confirm & Publish Hop'],

  // Profile Screen
  ['ส่วนลดสูงสุด 25%', 'Up to 25% OFF'],
  ['ดูใบเสร็จย้อนหลัง', 'View Past Receipts'],
  ['บทบาทการใช้งาน', 'User Role'],
  ['หาคนหารค่ารถ', 'Co-Hopper'],
  ['ทั้งสองแบบ', 'Both Roles'],
  ['เช่น คณะ สไตล์การเดินทาง เพลงที่ฟัง...', 'e.g. Faculty, travel style, favorite music...'],
  ['แนะนำตัวสั้นๆ', 'Bio'],
  ['ช่องทางติดต่อโซเชียล', 'Social Contact Links'],
  ['ไม่บังคับ', 'Optional'],
  ['ข้อมูลรถยนต์สำหรับรับเพื่อนร่วมทาง', 'Vehicle Information (Driver)'],
  ['รุ่นรถ', 'Car Model'],
  ['สีรถ', 'Color'],
  ['ป้ายทะเบียน', 'License Plate'],
  ['แท็ก Vibe และความชอบส่วนตัว', 'Personal Vibe & Interest Tags'],
  ['อัปเดตทันที', 'Live Sync'],
  ['ตั้งค่าความปลอดภัยนักศึกษา', 'Student Safety Settings'],
  ['ยืนยันรหัสนักศึกษาแล้ว', 'Verified Student ID'],
  ['จับคู่เฉพาะเพื่อนร่วมทางเพศเดียวกันเป็นค่าเริ่มต้น', 'Match with same-gender co-hoppers by default'],
  ['สมาชิก HOP Premium • ฿49/เดือน', 'HOP Premium • ฿49/month'],
  ['สถานะปัจจุบัน:', 'Current Status:'],
  ['HOP Premium (เปิดใช้งาน)', 'HOP Premium (Active)'],
  ['ผู้ใช้ทั่วไป (ฟรี)', 'Free Tier'],
  ['วิธีชำระเงิน', 'Payment'],
  ['จัดการสมาชิก HOP Premium / สลับสถานะ', 'Manage HOP Premium / Switch Tier'],
  ['บันทึกเรียบร้อย!', 'Saved!'],
  ['บันทึกโปรไฟล์', 'Save Profile'],
  ['ออกจากระบบ', 'Sign Out'],

  // Payment & Promo Screen
  ['การชำระเงิน & โค้ดโปรโมชัน', 'Payment Methods & Promo Codes'],
  ['ชำระค่ารถเป็นเงินบาท (฿) แบบเดียวกับ Grab / Bolt พร้อมใช้ส่วนลดจากโค้ดโปรโมชัน', 'Pay fares in Thai Baht (฿) just like Grab / Bolt with percentage promo discounts'],
  ['ช่องทางชำระเงินหลัก', 'Primary Payment Method'],
  ['ตัดจ่ายอัตโนมัติเมื่อจบทริป', 'Auto-charged upon trip completion'],
  ['ส่วนลดจากโค้ดโปรโมชัน (% ต่อรอบ)', 'Promo Code Discounts (% per trip)'],
  ['เลือกโค้ดโปรโมชันเพื่อคำนวณราคาสุทธิที่ต้องชำระในหน้าจอง', 'Select a promo code to automatically deduct from your final net fare'],
  ['✓ เลือกใช้แล้ว', '✓ Applied'],
  ['ใช้โค้ดนี้', 'Use Code'],
  ['สแกนจ่าย PromptPay QR', 'PromptPay QR Scan'],
  ['ชำระทันทีผ่านแอปธนาคาร ไม่มีค่าธรรมเนียมโอน', 'Instant payment via any banking app with 0฿ fee'],
  ['บัตรเครดิต / เดบิต', 'Credit / Debit Card'],
  ['VISA •••• 4821 (ตัดบัตรอัตโนมัติเมื่อจบการเดินทาง)', 'VISA •••• 4821 (Auto-charged after trip completion)'],
  ['เบอร์ 089-•••-4512 (ตัดชำระอัตโนมัติแบบเดียวกับ Grab/Bolt)', '089-•••-4512 (Seamless auto-pay like Grab/Bolt)'],
  ['ส่วนลด 15% สำหรับทริปหารค่ารถ', '15% OFF Carpool Rides'],
  ['ใช้ได้กับทุกเส้นทาง SIIT รังสิต – บางกระดี่ – คอนโด', 'Valid on all SIIT Rangsit – Bangkadi – Condo routes'],
  ['ใช้ได้ถึงสิ้นเดือนนี้', 'Valid until end of month'],
  ['ส่วนลด 20% รอบเดินทางไปเรียนเช้า', '20% OFF Morning Campus Rides'],
  ['เมื่อจองทริปล่วงหน้าหรือเดินทางร่วมกับเพื่อน SIIT / มธ.', 'When pre-booking or riding with SIIT / TU students'],
  ['ภารกิจเดินทางครบ 2 รอบ/สัปดาห์', 'Ride 2 trips/week mission'],
  ['ส่วนลด 25% สายรักษ์โลกหารครบ 3 ที่นั่ง', '25% OFF Eco 3-Seat Carpool'],
  ['รับสิทธิ์เมื่อร่วมเดินทางช่วยลดจำนวนรถบนถนนครบ 3 ครั้ง', 'Unlocked after sharing 3 eco-friendly rides'],
  ['กดรับสิทธิ์ได้ฟรี', 'Free to claim'],
  ['แนะนำ', 'Recommended'],
  ['ผูกไว้แล้ว', 'Linked'],
  ['เชื่อมต่อแล้ว', 'Connected'],

  // History Screen
  ['สถานะทริปและประวัติการเดินทาง', 'Active Trip & Ride History'],
  ['กำลังเดินทาง (จองได้ทีละ 1 รอบ)', 'Ongoing Trip (Max 1 Active Trip)'],
  ['← กลับหน้ารายการย้อนหลัง', '← Back to Trip History'],
  ['ชำระสำเร็จ', 'Paid'],
  ['คะแนนและรีวิวของคุณ', 'Your Rating & Review'],
  ['เปิดเพลง Indie ดีมากครับ จอดส่งถึงหน้า Kave พอดีเลย', 'Great Indie playlist and dropped me right in front of Kave TU!'],
  ['ออกตรงเวลาเป๊ะ ไปทันแล็บ 9 โมงเช้าสบายๆ ขอบคุณครับ', 'Departed right on time, made it to my 9 AM lab easily. Thanks!'],

  // HOP Premium Modal
  ['ยืนยันการทำรายการสมาชิก', 'Confirm Membership Change'],
  ['สมาชิก HOP Premium', 'HOP Premium Membership'],
  ['สิทธิพิเศษระบบรอจองอัตโนมัติและส่วนลดจาก HOP Premium', 'Unlock real-time AI Auto-Book and HOP Premium fare discounts'],
  ['1. ผู้ใช้งานทั่วไป (ใช้งานฟรี 100%)', '1. Free Tier (100% Free Forever)'],
  ['ค้นหาทริป ตั้งค่าระยะทาง/Vibe เลือกที่นั่ง และเปิดตี้หารค่ารถได้ครบทุกฟีเจอร์', 'Search rides, customize distance/Vibe sliders, pick seats, and create hops for free'],
  ['2. สมาชิก HOP Premium', '2. HOP Premium Member'],
  ['สลับเป็นโหมดผู้ใช้ทั่วไป (Free User) →', 'Switch to Free Tier →'],
  ['สมัครสมาชิก HOP Premium (฿49/เดือน) →', 'Subscribe to HOP Premium (฿49/mo) →'],
  ['ยืนยันการเปลี่ยนเป็นโหมดผู้ใช้ทั่วไป (Free User)?', 'Confirm switching to Free Tier?'],
  ['ยืนยันการชำระเงินสมัคร HOP Premium (฿49/เดือน)?', 'Confirm subscribing to HOP Premium (฿49/month)?'],
  ['เมื่อเปลี่ยนเป็นผู้ใช้ทั่วไป ระบบรอจองอัตโนมัติแบบเรียลไทม์ (AI Auto-Book) และส่วนลดจาก HOP Premium จะถูกปิดชั่วคราว', 'Switching to Free Tier will pause Real-time AI Auto-Book and HOP Premium fare discounts.'],
  ['ระบบจะตัดชำระเงิน ฿49.00 ผ่านช่องทางชำระเงินหลักของคุณ และเปิดใช้งานสิทธิพิเศษทันที', '฿49.00 will be charged to your primary payment method and benefits will activate immediately.'],
  ['ยืนยันทำรายการ', 'Confirm'],

  // Locations & Seat Positions & Vibes
  ['ข้างคนขับ (หน้าซ้าย)', 'Front Passenger (Left)'],
  ['แถวหลังซ้าย (ริมหน้าต่าง)', 'Rear Left (Window)'],
  ['แถวหลังกลาง', 'Rear Middle'],
  ['แถวหลังขวา (ริมหน้าต่าง)', 'Rear Right (Window)'],
  ['ข้างคนขับ', 'Front Seat'],
  ['หลังซ้าย', 'Rear Left'],
  ['หลังกลาง', 'Rear Mid'],
  ['หลังขวา', 'Rear Right'],
  ['หน้า Kave TU (ติดคอนโด B)', 'Front of Kave TU (Next to Condo B)'],
  ['ล็อบบี้ คอนโด B', 'Condo B Lobby'],
  ['ป้ายหน้าซอยคอนโด B', 'Condo B Alley Entrance'],
  ['หอพักโซนคลองหนึ่ง', 'Khlong Nueng Dorm Zone'],
  ['หน้าตึกหลัก SIIT บางกระดี่', 'SIIT Bangkadi Main Building'],
  ['ลานจอดรถนักศึกษา SIIT บางกระดี่', 'SIIT Bangkadi Student Parking'],
  ['SIIT รังสิต', 'SIIT Rangsit'],
  ['SIIT บางกระดี่', 'SIIT Bangkadi'],
  ['คอนโด B', 'Condo B'],
  ['ม.ธรรมศาสตร์ (SIIT)', 'Thammasat Univ. (SIIT)'],
  ['ม.ธรรมศาสตร์ (รังสิต)', 'Thammasat Univ. (Rangsit)'],
  ['จุฬาลงกรณ์มหาวิทยาลัย', 'Chulalongkorn Univ.'],
  ['มหาวิทยาลัยเกษตรศาสตร์', 'Kasetsart Univ.'],
  ['นาย A (เจษฎา)', 'Mr. A (Jetsada)'],
  ['นาย Z (แซ็ค • SIIT CPE)', 'Mr. Z (Zack • SIIT CPE)'],
  ['นาย Z (แซ็ค)', 'Mr. Z (Zack)'],
  ['นาย Y (ยุทธ)', 'Mr. Y (Yuth)'],
  ['ณิชา (Nicha • SIIT DE)', 'Nicha (SIIT DE)'],
  ['ณิชา (Nicha)', 'Nicha'],
  ['นาย C (ชัย)', 'Mr. C (Chai)'],
  ['ฟ้า (Fah S. • SIIT CPE)', 'Fah S. (SIIT CPE)'],
  ['ฟ้า (Fah S.)', 'Fah S.'],
  ['มินนี่ (Minnie)', 'Minnie'],
  ['เคน (Ken T.)', 'Ken T.'],
  ['นาย Z', 'Mr. Z'],
  ['นาย Y', 'Mr. Y'],
  ['นาย C', 'Mr. C'],
  ['นาย A', 'Mr. A'],
  ['แนวเพลง', 'Music'],
  ['สไตล์การเดินทาง', 'Travel Style'],
  ['ความสนใจ', 'Interests'],
  ['สายชวนคุย', 'Chatty'],
  ['สายเงียบฟังเพลง', 'Quiet & Music'],
  ['สายตี้', 'Party Vibe'],
  ['สายรีบไปเรียน', 'Fast to Class'],
  ['คาเฟ่', 'Cafe Hopping'],
  ['กีฬา', 'Sports'],
  ['อนิเมะ', 'Anime'],
  ['สายกิน', 'Foodie'],
  ['เกม', 'Game'],
  ['สีขาว', 'White'],
  ['สีเทาโซนิค', 'Sonic Grey'],
  ['สีเทา', 'Grey'],
  ['สีเงิน', 'Silver'],
  ['สีแดง', 'Red'],
  ['สีดำ', 'Black'],
  ['สีครีม', 'Cream'],
  ['สีส้ม', 'Orange'],
  ['หารรถ GrabCar', 'GrabCar Share'],
  ['หารรถ Bolt', 'Bolt Share'],
  ['ทริปเปิดใหม่', 'New Hop'],
  ['มธ. ปี 2', 'TU Yr 2'],
  ['ปี 1', 'Yr 1'],
  ['ปี 2', 'Yr 2'],
  ['ปี 3', 'Yr 3'],
  ['ปี 4', 'Yr 4'],
  ['เมื่อวาน', 'Yesterday'],
  ['2 วันที่แล้ว', '2 days ago'],
  ['พรุ่งนี้', 'Tomorrow'],
  ['วันนี้ • เพิ่งจบการเดินทาง', 'Today • Just Completed'],
  ['กำลังโฟกัส:', 'Focusing:'],
  ['กำลังเลือก:', 'Selected:'],
  ['จุดรับ:', 'Pickup:'],
  ['จุดส่ง:', 'Drop-off:'],
  ['ที่นั่ง:', 'Seats:'],
  ['ที่นั่ง ', 'Seat '],
  ['ราคาสุทธิ', 'Net'],
  ['สุทธิ', 'Net'],
  ['ปกติ', 'Reg.'],
  ['ถึงจุดหมาย 0m', 'Exact 0m'],
  ['ห่างจุดหมาย ', 'Drop-off '],
  ['เดิน ', 'Walk '],
  ['ว่าง ', 'Open '],
  [' ที่นั่ง', ' seats'],
  [' คัน', ' cars'],
  [' รายการ', ' rides'],
  ['ทริปที่จับคู่ได้', 'Matched Rides'],
  ['ดูสถานะ/จบทริป', 'Status / Complete'],
  ['กำลังเดินทาง', 'Ongoing Trip'],
  ['พร้อมออกเดินทางทันที', 'Ready now'],
  ['จุดรับห่าง ', 'Pickup '],
  ['ออกใน ', 'Departs in '],
  [' นาที', ' min'],
  ['ระยะทาง ', 'Route '],
  ['ช่วยลดคาร์บอน ', 'Saves '],
  ['ค่ารถ ', 'Fare '],
  ['บริการ ', 'Fee '],
  [' น.', ''],
  ['เดือน', 'mo'],
  ['ปิดหน้าต่าง', 'Close'],
  ['คนขับ', 'Driver'],
];

// Sort longest Thai phrases first so longer matches take precedence
const SORTED_DICTIONARY = [...PHRASE_DICTIONARY].sort(
  (a, b) => b[0].length - a[0].length
);

const HAS_THAI_REGEX = /[\u0E00-\u0E7F]/;

export function translateThaiTextToEn(input: string): string {
  if (!input || !HAS_THAI_REGEX.test(input)) return input;

  let result = input;
  for (const [th, en] of SORTED_DICTIONARY) {
    if (result.includes(th)) {
      result = result.split(th).join(en);
    }
  }

  // Dynamic pattern replacements for remaining composite numbers/phrases
  result = result
    .replace(/\/คน/g, '/seat')
    .replace(/ส่วนลด HOP Premium/g, 'HOP Premium')
    .replace(/ค่าโดยสารปกติ/g, 'Regular')
    .replace(/ลด\s*(\d+)%\s*\(สูงสุด\s*฿(\d+)\)/g, '$1% OFF (Max ฿$2)')
    .replace(/เก็บโค้ดลด\s*(\d+)%/g, 'Claim $1% OFF')
    .replace(/ลดได้\s*([\d.]+)\s*kg/g, 'Saved $1 kg')
    .replace(/ลดคาร์บอน\s*([\d.]+)\s*kg/g, 'Saved $1 kg')
    .replace(/รีวิวของคุณ:/g, 'Your Rating:')
    .replace(/ทริปที่เดินทางเสร็จสิ้นแล้ว/g, 'Completed Trips')
    .replace(/รถที่กำลังเปิดตี้บนเส้นทาง/g, 'Active Vehicles on Route')
    .replace(/แตะเพื่อเลือกแท็กที่ใช้คำนวณ % Match\s*\((\d+)\s*แท็ก\)/g, 'Tap to select tags used for Smart Match ($1 tags)')
    .replace(/\((\d+)\/300\s*ตัวอักษร\)/g, '($1/300 chars)')
    .replace(/เกินระยะ\s*\((\d+)\)/g, 'Over Limit ($1)')
    .replace(/ซ่อน/g, 'Hide')
    .replace(/ห่าง\s*(\d+)m/g, '$1m away')
    .replace(/ใช้อยู่:/g, 'Active:');

  return result;
}

const textNodeStore = new WeakMap<
  Text,
  { rawTh: string; lastTranslated: string }
>();

const elementAttrStore = new WeakMap<
  Element,
  Record<string, { rawTh: string; lastTranslated: string }>
>();

const TRANSLATABLE_ATTRS = ['placeholder', 'title', 'aria-label'] as const;

export function applyDomLanguage(
  root: HTMLElement | null,
  lang: AppLang
): void {
  if (!root) return;

  // 1. Translate all Text nodes losslessly
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode() as Text | null;

  while (current) {
    const val = current.nodeValue ?? '';
    const record = textNodeStore.get(current);

    if (lang === 'en') {
      const rawTh =
        !record || (val !== record.lastTranslated && HAS_THAI_REGEX.test(val))
          ? val
          : record.rawTh;

      const translated = translateThaiTextToEn(rawTh);
      if (val !== translated) {
        current.nodeValue = translated;
      }
      textNodeStore.set(current, { rawTh, lastTranslated: translated });
    } else if (record) {
      // Restore original Thai when switching back to 'th'
      if (val === record.lastTranslated && val !== record.rawTh) {
        current.nodeValue = record.rawTh;
      }
      textNodeStore.set(current, {
        rawTh: record.rawTh,
        lastTranslated: record.rawTh,
      });
    }

    current = walker.nextNode() as Text | null;
  }

  // 2. Translate placeholder, title, aria-label attributes
  const elements = root.querySelectorAll(
    '[placeholder], [title], [aria-label]'
  );
  elements.forEach((el) => {
    let attrMap = elementAttrStore.get(el);
    if (!attrMap) {
      attrMap = {};
      elementAttrStore.set(el, attrMap);
    }

    for (const attr of TRANSLATABLE_ATTRS) {
      const val = el.getAttribute(attr);
      if (!val) continue;

      const rec = attrMap[attr];
      if (lang === 'en') {
        const rawTh =
          !rec || (val !== rec.lastTranslated && HAS_THAI_REGEX.test(val))
            ? val
            : rec.rawTh;
        const translated = translateThaiTextToEn(rawTh);
        if (val !== translated) {
          el.setAttribute(attr, translated);
        }
        attrMap[attr] = { rawTh, lastTranslated: translated };
      } else if (rec) {
        if (val === rec.lastTranslated && val !== rec.rawTh) {
          el.setAttribute(attr, rec.rawTh);
        }
        attrMap[attr] = { rawTh: rec.rawTh, lastTranslated: rec.rawTh };
      }
    }
  });
}
