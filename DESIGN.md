---
name: CAMPUSHOP
description: SIIT & Thammasat University social ride-sharing and carpool platform with live Smart Match % telemetry, a strict 500m walking guardrail, and HOP AI Auto-Booking Concierge (seed:ebf0b3e07db7b342).
colors:
  brand-orange: "#f97316"
  brand-orange-dark: "#ea580c"
  brand-orange-tint: "#fff7ed"
  brand-orange-border: "#fed7aa"
  brand-slate: "#0f172a"
  slate-charcoal: "#1e293b"
  slate-muted: "#475569"
  slate-subtle: "#64748b"
  brand-teal: "#0d9488"
  teal-deep: "#0f766e"
  teal-tint: "#f0fdfa"
  emerald-exact: "#059669"
  emerald-badge: "#10b981"
  amber-walk: "#fef3c7"
  amber-ink: "#78350f"
  rose-guardrail: "#e11d48"
  rose-tint: "#fff1f2"
  surface-white: "#ffffff"
  surface-bg: "#f8fafc"
  canvas-frame: "#f1f5f9"
  border-subtle: "#e2e8f0"
typography:
  display:
    fontFamily: "Nunito, IBM Plex Sans Thai, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 900
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "IBM Plex Sans Thai, system-ui, -apple-system, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 900
    lineHeight: 1.3
  title:
    fontFamily: "IBM Plex Sans Thai, system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 900
    lineHeight: 1.35
  body:
    fontFamily: "IBM Plex Sans Thai, system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.5
  label:
    fontFamily: "JetBrains Mono, IBM Plex Sans Thai, ui-monospace, monospace"
    fontSize: "0.625rem"
    fontWeight: 800
    lineHeight: 1.2
    fontFeature: "tnum"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  2xl: "24px"
  frame: "40px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  2xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.brand-orange}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
  button-primary-hover:
    backgroundColor: "{colors.brand-orange-dark}"
  button-slate:
    backgroundColor: "{colors.brand-slate}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  button-booked:
    backgroundColor: "{colors.emerald-exact}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  chip-vibe-active:
    backgroundColor: "{colors.brand-orange}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  chip-vibe-idle:
    backgroundColor: "{colors.surface-bg}"
    textColor: "{colors.slate-muted}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  card-ride-top:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.brand-slate}"
    rounded: "{rounded.xl}"
    padding: "12px"
  input-field:
    backgroundColor: "{colors.surface-bg}"
    textColor: "{colors.brand-slate}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
  nav-fab-create:
    backgroundColor: "{colors.brand-orange}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.full}"
    height: "62px"
    width: "62px"
---

# Design System: CAMPUSHOP

<!-- Provenance & Direction Contract Seed: seed:ebf0b3e07db7b342 (CampusHopOrangeUI / Front_business) -->

## Overview

**Creative North Star: "The Campus Transit Telemetry & Hop Companion"**

CAMPUSHOP (`Campus Hop`) pairs the approachable, mascot-driven warmth of the user-pinned `CampusHopOrangeUI` (`Front_business`) identity with the crisp, tabular fare and distance discipline of `seed:ebf0b3e07db7b342`. Built for SIIT and Thammasat University students commuting between Rangsit, Bangkadi, TU Dome, and nearby condominiums, the interface treats social ride-sharing as transparent, real-time math rather than a black-box feed. Energetic Campus Orange (`#f97316`) and custom stroke Bunny mascots make carpooling feel collegiate and welcoming, while high-contrast Slate (`#0f172a`) controls and monospace telemetry badges (`JetBrains Mono` with `tabular-nums`) give every meter of walking distance and every baht of split fare immediate authority.

The system is engineered for high-density, one-handed mobile operation inside a dedicated `390x844` device frame topped by a live Presenter Control Bar. Every control on the primary Explore surface—from the Real-time vs. Pre-book mode toggle to the Distance vs. Vibe weight slider and the 0–500m Max Walking Guardrail—recalculates and re-ranks ride cards instantaneously without page reloads. When entering the HOP AI Concierge (`฿49/month` HOP Premium), the surface shifts into a deep Slate-900 dark-mode command center where interactive Thai slot-filling chips and live Auto-Book Watcher strips turn natural language into structured transit rules.

Confirmed visual rejections: the system refuses static decorative mock cards that fail to recalculate or filter when sliders move, refuses unguarded drop-off walks exceeding 500 meters, and refuses gating manual GUI search or trip creation behind a paywall.

**Key Characteristics:**
- **Signature Orange & Slate Polarity:** Vibrant Campus Orange (`#f97316`) for primary actions, active Vibe tags, and top-ranked match highlights balanced against authoritative Slate-900 (`#0f172a`) for Pre-book mode, seat-locking CTAs, and the AI Concierge workspace.
- **Traffic-Light Distance Semantics:** Instantaneous spatial coding for drop-off proximity—Teal/Emerald (`#0d9488` / `#059669`) for exact 0m stops, Amber (`#fef3c7` / `#78350f`) for acceptable walks (1m–500m), and Rose (`#fff1f2` / `#e11d48`) for trips blocked by the 500m walking guardrail.
- **Tabular Telemetry Discipline (`seed:ebf0b3e07db7b342`):** Mandatory `tabular-nums` (`font-variant-numeric: tabular-nums`) and `JetBrains Mono` badges for Match %, walking distance in meters, countdown minutes, license plates, and per-person fare splits (`฿35/คน`).
- **Role-Aware Mascot Iconography:** Custom `1.8px`–`2.2px` stroke SVG Bunny mascots that visually distinguish Passenger Hoppers (`PassengerBunnySvg`) from Vehicle Hosts wearing a filled orange driver cap (`DriverBunnySvg`).
- **Presentation-Ready Mobile Frame:** Centered `390x844` phone viewport (`40px` outer radius, `8px` Slate-800 bezel) paired with an external dark-slate Presenter Control Bar for one-tap switching across all 9 screens and instant `Free User` vs. `HOP Premium` state comparisons.

## Colors

The palette combines high-visibility Campus Orange and deep Slate with semantic transit indicators (Teal, Emerald, Amber, Rose) over crisp White and cool Slate-50 surfaces.

### Primary
- **Campus Hop Orange** (`#f97316` / `--brand-orange`): Primary brand accent, active navigation states, `#1` Smart Match rank badges, active Vibe filter pills, custom range slider thumbs, and the raised center "เปิดตี้" (Create Hop) floating action button.
- **Deep Hop Orange** (`#ea580c` / `--brand-orange-dark`): Hover and active press state for primary orange buttons, slider thumb hover state, per-person price callouts (`text-orange-600`), and the visor stroke on `DriverBunnySvg`.
- **Warm Hop Tint** (`#fff7ed` / `brand-orange-tint`): Soft warm background for mascot avatar circles, preset route pills, fare-split summary boxes, and secondary surfaces on Map and Carrot Wallet screens.
- **Soft Apricot Border** (`#fed7aa` / `brand-orange-border`): Hairline border pairing for `brand-orange-tint` containers, avatar rings, and fare breakdown dividers.

### Secondary
- **Campus Slate Ink** (`#0f172a` / `--brand-slate`): Primary body typography, default "จองที่นั่งหารค่ารถ" (Lock Seat) action buttons, active Pre-book mode toggle, Presenter Control Bar background, and the dark-mode canvas for the HOP AI Concierge.
- **Charcoal Bezel Slate** (`#1e293b` / `slate-charcoal`): `8px` mobile hardware frame border, AI chat message bubbles, watcher cards, and dark-mode input fields.

### Tertiary
- **Transit Teal** (`#0d9488` / `--brand-teal`): Exact-stop (`0m`) distance emphasis, route destination pins, and "เน้นใกล้" (Distance Priority) quick-preset active state.
- **Deep Route Teal** (`#0f766e` / `teal-deep`): Map route search pill background, map safety filter button, and route proximity percentage readouts (`ใกล้จุดหมาย: 25%`).
- **Mint Stop Tint** (`#f0fdfa` / `teal-tint`): Background fill for `≤ 500m Zone` map badges and exact-stop indicators.
- **Exact-Match Emerald** (`#059669` / `emerald-exact`): Confirmed booked-seat button state (`จองที่นั่งสำเร็จ!`), 500m guardrail shield icon, and CO₂ savings badges.
- **Live Signal Emerald** (`#10b981` / `emerald-badge`): Active AI Auto-Book Watcher confirmation pill and the dashed 500m walking radius boundary on the campus map.
- **Walk Caution Amber** (`#fef3c7` / `amber-walk`) & **Amber Ink** (`#78350f` / `amber-ink`): Badge background and text for valid non-zero walking distances (`ห่างจุดหมาย 100m`) and the 500m guardrail notice.
- **Guardrail Reject Rose** (`#e11d48` / `rose-guardrail`) & **Rose Alert Tint** (`#fff1f2` / `rose-tint`): Blocked trip cards exceeding `maxWalkLimit` or `500m`, safety lock panels (`Gender & Campus Safety Lock`), and Instagram handle pills.

### Neutral
- **Pure Card White** (`#ffffff` / `surface-white`): Primary surface for Ride Cards, route control panels, profile sections, and bottom navigation bar.
- **Cool Campus Paper** (`#f8fafc` / `--surface-bg`): Primary scrolling screen canvas inside the mobile frame (`Explore`, `Create Hop`, `Profile`, `History`) and subtle inset route summary boxes.
- **Presentation Stage Gray** (`#f1f5f9` / `canvas-frame`): Outer desktop viewport backdrop behind the `390x844` mobile frame and segmented control tracks.
- **Muted Slate Copy** (`#475569` / `slate-muted`): Secondary descriptions, inactive segmented toggle labels, and unselected Vibe chip text.
- **Subtle Metadata Slate** (`#64748b` / `slate-subtle`): Timestamps, sub-captions, and vehicle metadata.
- **Hairline Divider Slate** (`#e2e8f0` / `border-subtle`): Default `1px` and `2px` card borders, input strokes, and range slider tracks.

### Named Rules
**The Orange-Slate Action Polarity Rule.** Use Campus Hop Orange (`#f97316`) for discovery, filtering, `#1` match ranking, and trip creation; use Campus Slate Ink (`#0f172a`) for per-card seat-booking CTAs (`จองที่นั่งหารค่ารถ`) and Pre-book mode selection so ride cards never drown in competing orange buttons, shifting the CTA to Exact-Match Emerald (`#059669`) immediately upon booking.

**The Traffic-Light Distance Semantics Rule.** Every drop-off distance badge must encode walking effort by color: Teal/Emerald (`#f0fdfa` / `#0d9488`) for `0m` exact destination matches, Amber (`#fef3c7` / `#78350f`) for walks between `1m` and `500m`, and Rose (`#fff1f2` / `#e11d48`) for trips filtered out by the user's walking guardrail.

**The Dark-Mode AI Concierge Inversion Rule.** While manual GUI screens (`Explore`, `Create Hop`, `Profile`) operate on a high-key light canvas (`#f8fafc` and `#ffffff`), the HOP AI Concierge (`AiConciergeScreen` and the floating Messenger drawer) always inverts to a `#0f172a` / `#1e293b` dark-slate workspace with `#f97316` user bubbles and `#10b981` watcher confirmations.

## Typography

**Display Font:** `Nunito`, with fallback to `IBM Plex Sans Thai`, `sans-serif`
**Body Font:** `IBM Plex Sans Thai`, with fallback to `system-ui`, `-apple-system`, `sans-serif`
**Label/Mono Font:** `JetBrains Mono`, with fallback to `IBM Plex Sans Thai`, `ui-monospace`, `monospace`

**Character:** Rounded, energetic geometric English display headings (`Nunito` 900) paired with crisp, highly legible loopless Thai UI typography (`IBM Plex Sans Thai` 500–700) and technical monospace numerals (`JetBrains Mono` 700–800) for real-time transit telemetry.

### Hierarchy
- **Display** (`900`, `1.5rem` / `24px` to `1.875rem` / `30px`, `line-height: 1.15`, `letter-spacing: -0.025em`): Brand wordmarks (`CAMPUSHOP`), Splash/Login hero titles, and `Carrot Wallet & HOP Perks` headers using `font-display`.
- **Headline** (`900`, `1.125rem` / `18px`, `line-height: 1.3`): Top-level screen titles such as `เปิดตี้สร้างทริป (Create Hop)` and `ประวัติการเดินทาง (Trip History)`.
- **Title** (`900`, `0.875rem` / `14px` and `0.75rem` / `12px`, `line-height: 1.35`): Modal headers, Ride Card host names (`นาย Z (Zack • SIIT CPE)`), section headers (`ทริปที่แมตช์กับคุณ`), and AI Concierge header titles.
- **Body** (`500`–`700`, `0.75rem` / `12px` and `0.6875rem` / `11px`, `line-height: 1.5`): Conversational Thai AI slot-filling messages, route origin/destination selectors, paywall feature lists, and form controls.
- **Label** (`700`–`900`, `0.625rem` / `10px` down to `0.5625rem` / `9px`, `line-height: 1.2`, `font-variant-numeric: tabular-nums`): Smart Match % badges (`#1 • 96% Match`), walking distance pills (`≤ 350m / ลิมิต 500m`), license plates (`1กฒ 8899`), Vibe tags, and per-person fare splits (`฿35/คน`).

### Named Rules
**The Tabular Telemetry Rule (`seed:ebf0b3e07db7b342`).** Every element displaying a dynamic number—Match %, slider weights (`ใกล้จุดหมาย: 25%` / `Vibe ตรงกัน: 75%`), walking distance in meters, countdown minutes, seat counts, OTP boxes, and Baht fares—must apply `.tabular-nums` (`font-variant-numeric: tabular-nums`) and/or `font-mono` (`JetBrains Mono`) so live slider dragging never causes horizontal layout jitter.

**The Compact Campus Bilingual Rule.** Pair natural Thai student vernacular (`เปิดตี้`, `คนมีรถหาคนหาร`, `สายชวนคุย`, `ตรงเป๊ะ 0m`) with concise English transit terms in parentheses (`Now`, `Pre-book`, `Smart Match %`, `Guardrail`, `HOP Premium`) using heavy `700`–`900` weights to maintain legibility at compact `9px`–`12px` mobile sizes.

## Layout

CAMPUSHOP uses a **Presentation-Framed Mobile Shell** architecture designed to function both as a live university presentation artifact on desktop viewports and a native-feeling web app on mobile screens:

- **Outer Presentation Stage:** Full-viewport `min-h-screen bg-slate-100` flex column centered horizontally (`items-center justify-start`) with `12px` (`sm:py-3 sm:px-3`) desktop breathing room.
- **Top Presenter Control Bar:** Sits directly above the mobile frame (`w-full max-w-[390px] sm:max-w-[410px] sm:mb-2.5 bg-slate-900 p-2 sm:rounded-2xl`). Houses the live `Free User` / `HOP Premium (฿49/ด.)` mode switch and 9 screen-jump pills (`1. Explore`, `2. AI Bot`, `3. Create`, `4. Profile`, `Map`, `Wallet`, `History`, `Splash`, `Login`).
- **Fixed Mobile Device Viewport (`390x844`):** Constrained to `w-full max-w-[390px] h-[844px]` with `sm:rounded-[40px]` and an `8px` hardware bezel (`sm:border-[8px] sm:border-slate-800`) on `sm` (`640px+`) viewports. Inside the frame, vertical flex stacking (`flex flex-col relative overflow-hidden`) pins three persistent chrome layers:
  1. **Phone Status Bar (`22px` height):** `px-5 pt-1.5 pb-0.5` showing `09:41`, `5G` badge, and `100%` battery.
  2. **Persistent App Header (`44px` height):** `px-3 py-1.5 bg-white border-b border-slate-200` containing the Bunny logo, `CAMPUSHOP` title, interactive `HOP Premium / Free User` pill toggle, `฿49` modal trigger, and floating Messenger/AI toggle button.
  3. **Scrollable Screen Canvas (`flex-1 overflow-y-auto custom-scroll`):** Uses tight `8px`–`12px` (`px-3 py-2 space-y-2` on Explore; `p-4 space-y-3.5` on Create/Profile) vertical rhythm so the Route Bar, Smart Match & 500m Guardrail Panel, and the top two Ride Cards (`นาย Z` and `นาย Y`) remain visible without excessive scrolling. Bottom padding (`pb-24` / `96px` to `pb-28` / `112px`) clears the `78px` fixed bottom navigation bar.
- **Grid & Internal Alignment:** Controls use 2-column (`grid-cols-2`) and 3-column (`grid-cols-3` or `grid-cols-[1fr_auto_1fr]` for Origin ⇄ Destination swap) CSS grids with `4px`–`10px` (`gap-1` to `gap-2.5`) gutters.

## Elevation & Depth

CAMPUSHOP employs a **Structural Border + Tactile Accent Glow** depth model. Rather than relying on diffuse Material-style drop shadows to separate white cards on a light-gray canvas, surfaces are delineated primarily by crisp `1px`, `2px`, and `3px` solid borders (`#e2e8f0` at rest, `#f97316` for active/top-ranked priority, and `#0d9488` for map/wallet modules) paired with restrained `shadow-sm` elevation. Deep ambient shadows are reserved for the outer `390x844` device frame, floating overlays (Messenger popup, Sort dropdown, HOP Premium modal), and the raised center Create Hop FAB.

### Shadow Vocabulary
- **Card Rest Elevation** (`box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05)` / `shadow-sm`): Applied to all white Ride Cards, route filter boxes, and active segmented pills, always paired with an explicit border.
- **Slider Thumb Shadow** (`box-shadow: 0 1px 4px rgba(15, 23, 42, 0.3)`): Applied to the `16px` circular orange `.hop-slider` thumb (`border: 2.5px solid #ffffff`) so it reads as a physical handle over the `6px` track.
- **Bottom Nav Bar Shelf** (`box-shadow: 0 -8px 24px rgba(15, 23, 42, 0.06)`): Soft upward ambient shadow separating the `78px` bottom navigation bar from scrolling Ride Cards.
- **Raised Center FAB Glow** (`box-shadow: 0 8px 20px rgba(249, 115, 22, 0.4)`): Warm orange halo beneath the `62x62px` circular "เปิดตี้" button (`border: 5px solid #ffffff`), lifting it `-24px` (`-top-6`) above the navigation bar.
- **Device Frame & Modal Depth** (`box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25)` / `shadow-2xl`): Separates the `390x844` phone hardware shell from the desktop presentation backdrop and lifts the floating Messenger drawer (`w-[335px] h-[490px]`) and HOP Premium business model sheet.

### Named Rules
**The Top-Match 3px Frame Rule.** In the Explore ride list, the `#1` ranked Smart Match card receives a `3px` solid Campus Hop Orange border (`border-[3px] border-orange-500`) and a solid orange rank badge, while subsequent cards use a `2px` neutral slate border (`border-2 border-slate-200`). When the user drags the Distance vs. Vibe slider and `นาย Y` overtakes `นาย Z`, the `3px` orange frame transfers immediately to the new leader.

**The Raised Center Hop Rule.** Only the central "เปิดตี้" (Create Hop) navigation action may break the plane of its parent bar (`-top-6`, `62x62px` circle, `5px` white ring, orange drop glow). All other navigation items and in-card CTAs stay flush within their container bounds.

## Shapes

The form language balances nested concentric squircles inside a rounded mobile hardware shell with pill-shaped telemetry tags and custom round-cap stroke illustrations:

- **Concentric Viewport & Card Radii:** The outer desktop device shell uses a `40px` radius (`sm:rounded-[40px]`) with an `8px` bezel, nesting a `32px` bottom navigation radius (`rounded-b-[32px]`). Floating sheets and modals step down to `24px` (`rounded-3xl`), primary cards and control panels use `16px` (`rounded-2xl`), and inner route summary boxes, buttons, and inputs use `12px` (`rounded-xl`).
- **Telemetry Badges vs. Vibe Pills:** Algorithmic and numeric status indicators (`#1 • 96% Match`, `จุดหมายเดียวกัน 0m`, `≤ 350m / ลิมิต 500m`, license plates) use compact `6px`–`8px` (`rounded-md` / `rounded-lg`) corners so they read as structured data readouts. Social identity tags (`Indie`, `Valorant`, `สายชวนคุย`), route presets, and header mode switches use full `9999px` (`rounded-full`) capsules.
- **Directional Chat Bubbles:** In the HOP AI Concierge, user messages use `16px` rounded corners with a sharp top-right corner (`rounded-2xl rounded-tr-none`), while AI responses use `16px` rounded corners with a sharp top-left corner (`rounded-2xl rounded-tl-none`).
- **Custom Stroke Bunny Mascots:** All illustrations (`PassengerBunnySvg`, `DriverBunnySvg`, `HoppingBunnySvg`, `SmilingBunnySvg`) and UI icons are custom inline SVGs built on a `24x24` grid with `1.8px`–`2.2px` uniform strokes (`stroke-linecap="round"`, `stroke-linejoin="round"`). `DriverBunnySvg` adds a filled `#f97316` cap with an `#ea580c` visor stroke (`2.8px`).

## Components

### Buttons
Tactile, high-contrast action triggers with `900` (`font-black`) Thai/English labels and `2px` orange focus rings.
- **Shape:** `12px` radius (`rounded-xl`) for standard CTAs; `16px` (`rounded-2xl`) for full-width form submit buttons; `9999px` (`rounded-full`) for header mode switches and the center navigation FAB.
- **Primary Orange (`button-primary`):** Campus Hop Orange background (`#f97316`), pure white text (`#ffffff`), `font-weight: 900`, `12px 16px` (`py-3` to `py-3.5`) padding, `shadow-md` or `shadow-lg`. Used for `เข้าสู่ระบบ (Log In)`, `เปิดตี้สร้างทริปตอนนี้เลย →`, `สั่ง AI จองให้`, and `ทดลองเปิด HOP Premium ทันที (฿49/ด.)`.
- **Hover / Focus / Active:** Shifts to Deep Hop Orange (`#ea580c`) on hover, scales to `0.99` (`active:scale-[0.99]`) on press, and displays a `2px solid #f97316` outline (`outline-offset: 2px`) on `:focus-visible`.
- **Slate Action (`button-slate`) & Booked State (`button-booked`):** Ride Card seat-booking buttons default to Campus Slate Ink (`#0f172a`, `py-2 rounded-xl text-xs font-black text-white`) displaying the exact split price (`จองที่นั่งหารค่ารถ (จ่าย ฿30)`). When clicked, the button transitions to Exact-Match Emerald (`#059669`, `hover:bg-emerald-700`) with a checkmark icon (`จองที่นั่งสำเร็จ! (แตะเพื่อยกเลิก)`) and decrements the card's available seat count in real time.

### Chips
Compact pill selectors used for route presets, Vibe filtering, and AI conversational slot-filling.
- **Style:** `9999px` (`rounded-full`) for Vibe filters, route presets, and AI slot-filling replies; `8px` (`rounded-lg`) for multi-category Vibe selection in Profile. `9px`–`10px` (`0.5625rem`–`0.625rem`) bold/black typography with `1px` solid border.
- **State:**
  - **Vibe Filter / Tag Active:** `#f97316` background, `#ffffff` text, `#f97316` border (`✓ Indie`).
  - **Vibe Filter / Tag Unselected:** `#f8fafc` or `#f1f5f9` background, `#475569` text, `#e2e8f0` border, shifting border to `#fdba74` (`hover:border-orange-300`) on hover.
  - **AI Slot-Filling Prompt Chip:** Translucent orange fill (`rgba(249, 115, 22, 0.2)` / `bg-orange-500/20`), `#fed7aa` text (`text-orange-200`), `1px solid rgba(249, 115, 22, 0.5)` border, filling solid `#f97316` with white text on hover.

### Cards / Containers
Structured, border-anchored modules that pack multi-dimensional transit and social metadata into a `390px` viewport.
- **Corner Style:** `16px` (`rounded-2xl`) for Ride Cards, Route & Guardrail panels, and Profile sections; `24px` (`rounded-3xl`) for the HOP Premium paywall card and Trip History detail card.
- **Background:** Pure White (`#ffffff`) over a `#f8fafc` screen canvas, with nested `#f8fafc` (`bg-slate-50`) route summary boxes inside each Ride Card.
- **Shadow Strategy:** `shadow-sm` (`0 1px 2px rgba(0,0,0,0.05)`) paired with structural borders (`3px solid #f97316` for `#1` ranked match card; `2px solid #e2e8f0` for other ride cards; `1px solid #e2e8f0` for form/profile cards).
- **Internal Padding:** `12px` (`p-3`) on Ride Cards and Create Hop sections; `8px` (`p-2`) on compact above-the-fold Explore filter panels; `14px`–`16px` (`p-3.5` to `p-4`) on Profile and Modal cards.

### Inputs / Fields
High-clarity form controls and custom range sliders tailored for rapid campus route configuration.
- **Style:** Standard selects, text inputs, and number inputs use `#f8fafc` (`bg-slate-50`) background, `1px solid #cbd5e1` (`border-slate-300`) stroke, `12px` (`rounded-xl`) radius, and `12px` (`text-xs font-bold text-slate-900`) text. Login fields use `2px solid #f97316` borders on `#ffffff` backgrounds, and AI Concierge dark-mode inputs use `#1e293b` (`bg-slate-800`) with `#334155` (`border-slate-700`) borders.
- **Custom Range Sliders (`input[type='range'].hop-slider`):** `6px` pill track (`#e2e8f0`) paired with a `16x16px` circular `#f97316` thumb, `2.5px solid #ffffff` border, and `0 1px 4px rgba(15, 23, 42, 0.3)` shadow that scales to `1.12x` (`#ea580c`) on hover (`cubic-bezier(0.22, 1, 0.36, 1)`).
- **Focus:** Universal `2px solid #f97316` outline with `2px` offset (`outline-offset: 2px`) across all buttons, inputs, selects, textareas, and range sliders.

### Navigation
Dual-layer navigation system separating presenter evaluation controls from the in-app student experience.
- **Bottom App Navigation Bar (`78px` height):** Pinned to the bottom of the `390x844` frame (`bg-white rounded-b-[32px] border-t border-slate-200 px-5`). Houses 5 destinations: `Explore`, `Map`, raised center `เปิดตี้` (`Create Hop`), `AI Auto` (`HOP AI Concierge`), and `Profile` (rendered with `PassengerBunnySvg`). Active tab uses `#f97316` icon and `9px font-black` label; inactive tabs use `#94a3b8` (`text-slate-400`).
- **In-App Segmented Mode Toggle:** Full-width 2-column pill tray (`bg-slate-100 p-1 rounded-xl`) switching between `เดินทางตอนนี้ (Now)` (active `#f97316` fill) and `จองล่วงหน้า (Pre-book)` (active `#0f172a` fill).
- **Presenter Control Bar:** External `#0f172a` bar above the phone frame allowing one-tap navigation across all 9 prototype screens and instant `Free User` / `HOP Premium` state toggling.

### Smart Match & 500m Guardrail Control Panel
The signature interactive control module at the top of `ExploreScreen` (`border-2 border-orange-500/80 bg-white p-2 rounded-2xl`):
- **Priority Weight Slider (`0%`–`100%`):** Balances `ใกล้จุดหมาย (Route Distance)` in `#0f766e` against `Vibe ตรงกัน (Vibe Similarity)` in `#ea580c`, paired with two quick-preset buttons: `เน้นใกล้ (นาย Y นำ)` (`#0d9488` active) and `เน้น Vibe (นาย Z นำ)` (`#f97316` active).
- **500m Hard Limit Walking Guardrail (`0m`–`500m`):** Enforces the product rule that no student walks over `0.5 km` solely for Vibe. Displays a live monospace readout (`≤ 350m / ลิมิต 500m` on `#ecfdf5` emerald tint) and a collapsible amber/rose tray (`ถูกตัดออก (N)`) exposing any trips rejected for exceeding the walking radius.

### HOP AI Concierge Slot-Filling Bubble & Watcher Strip
The signature autonomous booking interface inside `AiConciergeScreen`:
- **Active Auto-Book Watchers Strip:** Pinned dark-slate header tray (`bg-slate-950/70 border-b border-slate-800`) listing active watchers with route, time, seat count, `เดิน ≤ Nm` guardrail, and an interactive `จำลองคนเปิดทริปตรงเงื่อนไข` simulation trigger that flips the watcher card to `#064e3b` / `#10b981` (`จองอัตโนมัติสำเร็จ!`) and locks the matching ride seat.
- **Structured Slot-Summary Footer:** Inside AI reply bubbles (`#1e293b`), a `2-column` monospace telemetry grid (`font-mono text-[10px] text-orange-300 border-t border-slate-700/80`) tracks captured vs. missing parameters (`ต้นทาง`, `ปลายทาง`, `เวลา`, `ที่นั่ง`, and `ระยะเดินสูงสุด ≤ 500m`) alongside step-specific quick-reply chips (`ask_seats` → `ask_pickup` → `ask_walk`).

## Do's and Don'ts

### Do:
- **Do** apply `tabular-nums` (`font-variant-numeric: tabular-nums`) and `JetBrains Mono` (`font-mono`) to all Match %, walking distances in meters (`0m`, `100m`, `≤ 500m`), countdown timers, seat counts, and Baht fare splits (`฿35/คน`).
- **Do** enforce the `0m`–`500m` hard ceiling on all walking distance sliders and AI Concierge slot-filling rules, automatically clamping any user input above `500m` down to `500m` with an explicit guardrail notice.
- **Do** highlight the `#1` ranked ride card with a `3px` solid Campus Hop Orange border (`#f97316`) and solid orange badge while keeping lower-ranked cards at a `2px` neutral border (`#e2e8f0`).
- **Do** display transparent fare breakdowns on every ride card and creation form, distinguishing Host Base Fare (`ค่ารถ ฿30`) from Platform Commission (`+บริการ ฿4` for Free Users vs. `ฟรีค่าธรรมเนียม (PRO)` in `#047857` for HOP Premium).
- **Do** use `PassengerBunnySvg` for passengers/co-hoppers and `DriverBunnySvg` (with the filled `#f97316` cap) for vehicle hosts so users can identify trip roles at a glance.

### Don't:
- **Don't** render static Match % badges or static ride lists that ignore changes to the Distance vs. Vibe weight slider, the 0–500m Max Walking Guardrail slider, or the user's selected Profile Vibe tags.
- **Don't** gate manual GUI search, route filtering, Vibe sorting, or trip creation behind the HOP Premium (`฿49/month`) paywall; HOP Premium must only gate the autonomous HOP AI Concierge, platform fee waivers, and profile badge perks.
- **Don't** use Campus Hop Orange (`#f97316`) for default in-card "Lock Seat" buttons on Explore ride cards; keep default card CTAs in Campus Slate Ink (`#0f172a`) and booked states in Exact-Match Emerald (`#059669`) to preserve visual hierarchy.
- **Don't** allow drop-off walking distances above `500m` into the valid ranked match feed; trips exceeding the guardrail must be filtered into the collapsible Rose guardrail-blocked tray (`#fff1f2` / `#e11d48`).
