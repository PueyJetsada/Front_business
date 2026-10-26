# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React 19, TypeScript, Vite, Tailwind CSS (Mobile-First Responsive Web Application; rendered inside a centered mobile device frame on desktop viewports for presentation clarity, and full-bleed on mobile devices).

## Users

- **Primary Users:** SIIT (Sirindhorn International Institute of Technology), Thammasat University students commuting between Rangsit Campus, Bangkadi Campus, TU Dome, and nearby Rangsit condominiums/dormitories, as well as students from the same faculty/university or nearby commuters.
- **User Roles:**
  1. **Driver / Host (คนมีรถ):** Students with personal cars (gas, hybrid, or EV) looking to split fuel/charging costs with peers heading the same way.
  2. **Passenger / Hopper (คนนั่ง / หาคนหาร):** Students who missed the fixed-schedule campus shuttle van or want to split a Grab/Bolt ride instead of paying full solo fare.
  3. **Both (ทั้งคู่):** Flexible commuters who sometimes drive and sometimes hop.

## Product Purpose

**CAMPUSHOP (Campus Hop)** is a social ride-sharing and carpool platform tailored for university campus commuting. It solves the pain point of fixed-schedule campus shuttle vans and expensive solo Grab/Bolt rides when students miss the bus, while turning shared commutes into safe, vibe-matched social connections with lower carbon emissions.

Success means:
- Students can immediately compare and book **Real-time Hops (Now)** or **Pre-book / Schedule** upcoming rides.
- Users can dynamically tune their **Smart Match %** priority between **Route Proximity (Pickup/Drop-off Distance)** and **Social Compatibility (Vibe/Genre Similarity)** under a strict **500-meter maximum walking distance guardrail**.
- **HOP Premium (฿49/month)** subscribers can delegate ride hunting to the **HOP AI Concierge** via natural Thai chat with interactive slot-filling and automated booking watchers, while **Free Tier** users retain 100% access to manual GUI search, filtering, trip creation, and booking.

## Positioning

Unlike generic ride-hailing apps (Grab, Bolt) or static campus Facebook/LINE carpool groups, CAMPUSHOP combines **verified campus identity + Vibe/Genre social matching (Music, Games, Travel Style, Lifestyle)** with a **user-controllable Match Score algorithm bounded by a 500m walking guardrail** (proving when a 100m walk with a high-vibe peer like Mr. Z beats or trails an exact 0m drop-off like Mr. Y), plus an **AI Auto-Booking Watcher** for recurring student schedules.

## Operating Context

- Used by students rushing between classes (e.g., 09:00 morning lectures at SIIT Bangkadi or returning to Rangsit condos/TU Dome), waiting at campus shuttle stops, or planning next-day commutes from their dorms.
- Evaluated in a live university group presentation where presenters toggle between `Free User` and `HOP Premium User` in the header, adjust the Distance vs. Vibe weight slider and 0–500m walking limit in real time, converse with the HOP AI Concierge, create trips, and inspect transparent fare & platform commission breakdowns.

## Capabilities and Constraints

- **User Profile & Vibe/Genre Identity:** Nickname, faculty/year (e.g., SIIT TU), avatar, role (`มีรถ` / `หาคนหาร` / `ทั้งคู่`), short bio, optional Instagram (IG) and Facebook links, and multi-category Vibe & Genre tags:
  - Music: Indie, Hip-Hop, K-Pop, T-Pop, Rock
  - Games: Valorant, RoV, Genshin, Console
  - Travel Style: สายชวนคุย, สายเงียบฟังเพลง, สายตี้, สายรีบไปเรียน
  - Interests: คาเฟ่, กีฬา, อนิเมะ, สายกิน
- **Smart Match % & Customizable Sorting with Guardrails:**
  - Calculates Match Score (%) from Pickup Distance, Drop-off Distance, and Vibe/Genre + Faculty similarity.
  - Interactive user weight control between Route Proximity (Distance) and Vibe Similarity.
  - Mandatory **Hard Limit (Max Walking Distance Limit): 0 to 500 meters** slider and guardrail notice (trips exceeding the user's selected walking radius or >500m are filtered/flagged because students will not walk over 0.5 km solely for Vibe).
  - Canonical demonstration scenario built-in: User **นาย A** heading to **คอนโด B** comparing **นาย Y** (exact destination คอนโด B, 0m drop-off distance, lower Vibe overlap) vs. **นาย Z** (destination 100m away from คอนโด B, very high Vibe overlap).
- **Dual Booking Modes:**
  - **Real-time Hop (เดินทางตอนนี้ / Now):** Departing shortly nearby with live countdown timers and remaining seat counts.
  - **Pre-booking / Schedule (จองล่วงหน้า):** Scheduled campus hops (e.g., tomorrow 09:00 AM to SIIT Bangkadi) and trip creation.
- **HOP AI Concierge (AI Auto-Booking Assistant):**
  - Exclusive to **HOP Premium** (shows a clear, persuasive ฿49/month upgrade paywall when in `Free User` mode, while keeping manual GUI 100% free).
  - Supports natural-language Thai requests (e.g., *"เห้ย ต้องการไปคอนโด B ตอน 9.00 ถ้ามีคนเปิดหารรถไปที่นี่ ให้กดจองให้เลยนะ"*).
  - **Interactive Slot-Filling:** Prompts naturally for missing parameters (number of seats, pickup point such as SIIT Rangsit front building, maximum acceptable drop-off walking distance ≤500m) before activating an **Auto-Booking Watcher** rule.
- **Monetization & Demo Controls:**
  - Primary revenue: Transparent platform commission fee displayed in per-person fare split summaries.
  - Secondary revenue: **HOP Premium (฿49/month)** offering AI Auto-Booking Assistant, platform fee/fare discounts, and a profile badge.
  - Persistent header demo toggle to switch instantaneously between `Free User` and `HOP Premium User`.

## Brand Commitments

- **Name:** CAMPUSHOP (Campus Hop)
- **Incumbent Reference World (User-Pinned):** Inherited from the user's `campushop-app` repository (`https://github.com/PueyJetsada/Front_business` / `CampusHopOrangeUI`):
  - **Palette:** Signature Campus Orange (`#f97316` / `#ea580c`), High-Contrast Slate (`#0f172a` / `#1e293b`), Transit Teal & Emerald (`#0d9488` / `#059669`), and clean White (`#ffffff`), Slate-50 (`#f8fafc`), and Orange-50 (`#fff7ed`) grounds.
  - **Mascot & Iconography:** Custom SVG Hopping Bunny mascot (Passenger Bunny and Driver Bunny wearing an orange cap) plus consistent stroke SVG icons.
  - **Shell & Presentation Frame:** Top dark-slate Presenter Control Bar above a centered `390x844` mobile phone frame (`rounded-[40px] border-[8px] border-slate-800`), sleek bottom navigation bar with a raised circular Orange-500 center action button, and floating AI Agent chat trigger/drawer.
- **Language:** Thai primary interface copy mixed naturally with campus/tech English terms (`Real-time Hop`, `Pre-book`, `Vibe Match`, `SIIT`, `HOP Premium`, `Auto-Book`).

## Evidence on Hand

- Canonical demonstration dataset representing SIIT Thammasat University routes (`SIIT รังสิต`, `SIIT บางกระดี่`, `TU Dome`, `คอนโด B (รังสิต)`, `Kave TU`, `Dcondo Campus`) and student personas (`นาย A`, `นาย Y`, `นาย Z`, plus additional realistic SIIT/TU hosts and co-hoppers). All trip, profile, and AI chat data is synthetic demonstration material built for interactive validation.

## Product Principles

1. **Transparent Math over Black-Box Matching:** Every Match % badge exposes its exact breakdown (Pickup distance, Drop-off distance in meters, shared Vibe tags) and responds immediately when the student shifts weight between Distance and Vibe.
2. **Hard Physical Guardrails:** Social compatibility never overrides physical practicality—drop-off walking distance is strictly capped at 500 meters.
3. **100% Free Core Utility, Convenience-Driven Premium:** Manual search, filtering, and booking remain completely free for all students; HOP Premium (฿49/month) earns its price through autonomous AI slot-filling and fee savings.
4. **Mobile-First Campus Speed:** Designed for one-handed operation at a shuttle stop or between lectures, with instant mode switching and zero dead-end buttons during live demos.
