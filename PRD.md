# Product Requirements Document: GearGrab

## 1. Executive Summary
**GearGrab** is a secure, AI-powered peer-to-peer marketplace for outdoor and adventure gear in South Africa. It addresses the fraud and friction common on platforms like Facebook Marketplace by introducing **Verified Profiles (KYC)**, **Escrow-style payments**, and an **AI Listing Engine** that reduces listing time to seconds.

**Core Value Proposition:**
* **Speed:** "List in seconds, sell in minutes" via AI image analysis.
* **Trust:** Identity verification (Orca) + Privacy-first contact requests + Escrow.
* **Relevance:** 16 tailored categories for SA's outdoor lifestyle.

---

## 2. User Roles
1.  **Guest:** Can browse, search, and view listings. Cannot view seller contact info.
2.  **Buyer (Auth):** Can favorite items, create contact requests, chat, and purchase via escrow.
3.  **Seller (Auth + KYC):** Can list items, manage inventory, accept/decline contact requests.
4.  **Admin:** Can review "Other" category suggestions, manage disputes, and oversee platform health.

---

## 3. Core Features & Functional Requirements

### 3.1 Authentication & Profile (Trust Layer)
* **Auth:** Email/Password + Phone Number (Mandatory for SA market context).
* **KYC Integration:**
    * Integration with **Orca Fraud API** to verify user identity.
    * "Verified Badge" displayed on profiles.
* **Profile Privacy:** Phone numbers are **encrypted/hidden** by default. Only revealed via the "Contact Request" handshake.

### 3.2 The AI Listing Engine (The "Wow" Factor)
* **Flow:** Upload Photos (1-5) → Client-side Background Removal → AI Analysis → Review → Publish.
* **Background Removal:** Toggle switch using **Transformers.js (WebGPU)** to strip backgrounds in the browser.
* **AI Analysis:** Send image to **Gemini 2.5 Flash**.
    * **Output:** Title, Brand, Model, Category, Condition (1-10), Est. Retail Price (ZAR), Suggested Description.

### 3.3 Marketplace & Discovery
* **Search:** Full-text search (Title, Description, Brand).
* **Filtering:** Category (16 types), Price Range (ZAR), Condition, Brand.
* **SEO:** Server-Side Rendering (Next.js) for all listing pages to capture organic traffic (e.g., "Used Garmin Fenix Cape Town").

### 3.4 The "Contact Handshake" (Privacy)
* **Logic:** Buyers cannot just call Sellers. They must send a **Contact Request**.
* **States:** `Pending` → `Accepted` (Phone revealed + Chat opens) or `Declined`.
* **Channels:**
    * **In-App Chat:** Supabase Realtime.
    * **WhatsApp:** Phone number revealed for external communication (if Seller enables `allow_whatsapp`).

### 3.5 Payments (Escrow)
* **Model:** Funds are held in a secure escrow account until the buyer confirms receipt/satisfaction.
* **Integration:** (Mocked for V1 MVP, designed for PayShap/Stripe/Ozow future integration).

---

## 4. Technical Architecture

### 4.1 Stack
* **Framework:** Next.js 15 (App Router).
* **Language:** TypeScript.
* **Styling:** Tailwind CSS + Shadcn UI.
* **State:** React Query (Server State) + URL Search Params (Filter State).

### 4.2 Backend & Data (Supabase)
* **Auth:** Supabase Auth (with custom claims for Role).
* **Database:** PostgreSQL.
* **Storage:** Buckets for `listing-images` (public) and `kyc-documents` (private).
* **Realtime:** Enabled for `conversations` and `notifications`.

### 4.3 AI Services
* **Vision:** Google Gemini 2.5 Flash (via Vercel AI SDK or direct API).
* **Local ML:** HuggingFace Transformers.js (`Xenova/segformer-b0-finetuned-ade-512-512`) for background removal.

---

## 5. Database Schema (Simplified ERD)

* `profiles`: id, display_name, phone (private), is_verified, avatar_url.
* `listings`: id, title, price, images[], category, status (active/sold/hidden).
* `contact_requests`: id, buyer_id, seller_id, listing_id, status.
* `conversations`: id, listing_id, participants[].
* `messages`: id, conversation_id, content, sender_id.
* `reviews`: id, target_user_id, rating, comment.

---

## 6. The Ralph Wiggum Build Plan (Phases)

*Each phase is a loop. We do not proceed until the completion promise is met.*

### Phase 1: Foundation (Current)
* **Goal:** Next.js 15 setup, DB Schema applied, Auth pages working.
* **Promise:** "User can sign up, create a profile, and land on the dashboard."

### Phase 2: The Core (Inventory)
* **Goal:** Database functionality for Listings. RLS Policies (Security).
* **Promise:** "Unit tests pass for creating, reading, updating, and deleting listings with strict ownership security."

### Phase 3: The AI Engine
* **Goal:** The `/list` page with Drag-n-Drop, WebGPU removal, and Gemini Stub.
* **Promise:** "Playwright test: Upload image -> Click Remove BG -> Click Analyze -> Form Auto-fills."

### Phase 4: Marketplace & Privacy
* **Goal:** Search Grid and the Contact Request Handshake.
* **Promise:** "Buyer can request contact; Seller approves; Phone number becomes visible."

### Phase 5: Trust & Safety
* **Goal:** Orca KYC Mock & Escrow UI.
* **Promise:** "Verified Badge appears on profile; Payment flow directs to Escrow status page."