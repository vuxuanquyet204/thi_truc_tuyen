# Design System Specification: The Academic Luminary

## 1. Overview & Creative North Star
**Creative North Star: "The Editorial Institution"**

This design system transcends the typical "SaaS dashboard" aesthetic. Instead of a rigid grid of boxes, we are building a digital environment that feels like a high-end, academic journal meets a premium concierge service. The goal is to instill a sense of calm authority for candidates while providing surgical precision for administrators.

We achieve this through **Intentional Asymmetry** and **Tonal Depth**. By moving away from "standard" UI patterns—specifically by banning traditional borders and harsh shadows—we create an experience where content is separated by light and texture rather than structural scaffolding. The interface should feel like "fine paper and frosted glass," minimizing cognitive load during high-stakes examinations.

---

## 2. Colors: Tonal Architecture
The palette is built on a foundation of "Deep Blue" trust, punctuated by "Growth Teal" and "Achievement Gold." 

### The "No-Line" Rule
**Explicit Instruction:** You are prohibited from using 1px solid borders to section off content. Boundaries must be defined solely through background color shifts or subtle tonal transitions. 
*   *Example:* Place a `surface-container-low` component on a `surface` background to define its edges.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. We use the surface-container tiers to create "nested" depth:
*   **Base:** `surface` (#f3faff)
*   **Secondary Area:** `surface-container-low` (#e6f6ff)
*   **Active Component:** `surface-container-highest` (#cfe6f2)
*   **Floating Elements:** `surface-container-lowest` (#ffffff) with 20% opacity + backdrop-blur.

### The "Glass & Gradient" Rule
To avoid a flat, "out-of-the-box" look:
*   **Hero Sections:** Use a subtle linear gradient from `primary` (#003178) to `primary_container` (#0d47a1) at a 135-degree angle.
*   **Modals/Overlays:** Use `surface_container_lowest` with a 16px `backdrop-blur`. This "Glassmorphism" ensures the user feels the continuity of the platform beneath the current task.

---

## 3. Typography: The Editorial Voice
We utilize a dual-font strategy to balance intellectual authority with functional clarity.

*   **Display & Headlines (Manrope):** Chosen for its geometric modernism. Use `display-lg` and `headline-md` with tightened letter-spacing (-0.02em) to create an authoritative, "Editorial" look for exam titles and platform headers.
*   **Body & Labels (Inter):** The workhorse for the examination interface. Inter provides maximum legibility at small sizes (`body-sm`) and high-stress environments.
*   **Achievement Moments:** Use `title-lg` in `on_tertiary_fixed_variant` (#5b4300) when referencing "LearnTokens" or success states to create a distinct visual "reward" separate from functional text.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "heavy" for a clean educational environment. We utilize **Tonal Layering** and **Ambient Shadows**.

### The Layering Principle
Depth is achieved by "stacking" surface tiers. 
*   An admin sidebar should be `surface-container-high`.
*   The main content canvas should be `surface`.
*   Individual question cards should be `surface-container-lowest`.

### Ambient Shadows & Ghost Borders
*   **Floating Shadows:** For elements that truly float (e.g., tooltips, active proctoring alerts), use a highly diffused shadow: `box-shadow: 0 12px 40px rgba(7, 30, 39, 0.06)`. Note the use of `on_surface` color as the shadow base rather than pure black.
*   **The "Ghost Border" Fallback:** If a boundary is absolutely required for accessibility, use the `outline_variant` (#c3c6d4) at **15% opacity**. Never use a 100% opaque border.

---

## 5. Components: Refined Primitives

### Buttons (The "Pill" Aesthetic)
*   **Primary:** Background: `primary`; Text: `on_primary`. Shape: `full` (pill). No shadow. On hover, transition to `primary_container`.
*   **Secondary:** Background: `secondary_container`; Text: `on_secondary_container`.
*   **Achievement (LearnToken):** Background: `tertiary_fixed_dim` (#fabd00); Text: `on_tertiary_fixed`. Use for "Claim Reward" or "Submit Exam" actions.

### Cards & Lists (The "Breathable" Rule)
*   **Cards:** Forbid divider lines. Separate content using `48px` of vertical whitespace or a shift from `surface-container-lowest` to `surface-container-low`.
*   **Candidate View:** Large `xl` (1.5rem) rounded corners to reduce anxiety.
*   **Admin View:** Tighter `md` (0.75rem) corners to allow for higher information density.

### Proctoring Status Indicators
*   **Active/Safe:** A `secondary` (#006a6a) glow effect (8px blur) around the candidate's profile picture.
*   **Alert/Warning:** A sharp `error` (#ba1a1a) pulse. Use `error_container` as a soft background wash for the entire alert card to ensure the user cannot miss the state change.

### The "Progress Ribbon"
Instead of a standard progress bar, use a slim 4px ribbon that sits at the very top of the viewport, using the `secondary` color. This feels integrated into the browser/app chrome rather than an "item" on the page.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical layouts for landing pages (e.g., text aligned left, an overlapping "glass" card offset to the right).
*   **Do** prioritize whitespace. If a screen feels "busy," increase the padding to the next step in the spacing scale rather than adding a border.
*   **Do** use `surface-tint` sparingly to highlight the "active" section of the navigation.

### Don't
*   **Don't** use pure black (#000000) for text. Always use `on_surface` (#071e27) for a softer, more professional contrast.
*   **Don't** use standard "Material Design" cards with heavy shadows and 1px borders.
*   **Don't** allow "Gold" (`tertiary`) to be used for anything other than achievements or token-related actions. It must remain a "high-value" accent to keep its psychological impact.
*   **Don't** use "Inter" for headlines over 24px; always switch to "Manrope" to maintain the signature editorial look.

cáu trúc thư mục dự án: mobile_app/src/
│
├── assets/                     # Tài nguyên tĩnh (giữ nguyên)
│   ├── animations/
│   ├── icons/
│   └── images/
│
├── core/                       # Core dùng chung toàn app
│   ├── config/                 # Config app (env, baseURL…)
│   ├── constants/              # Hằng số global
│   ├── theme/                  # Colors, fonts, spacing
│   ├── types/                  # Global types
│   ├── hooks/                  # Custom hooks dùng chung
│   ├── utils/                  # Helper functions
│   └── components/             # UI dùng chung (Button, Input…)
│
├── infrastructure/             # Giao tiếp bên ngoài (API, socket…)
│   ├── http/                   # axios, interceptors
│   ├── api/                    # REST API (auth.api.ts, user.api.ts…)
│   ├── socket/
│   ├── rtc/
│   └── storage/                # AsyncStorage / SecureStorage
│
├── navigation/                 # Điều hướng
│   ├── root.navigator.tsx
│   ├── auth.navigator.tsx
│   ├── main.navigator.tsx
│   └── components/             # TabBar, Header custom
│
├── contexts/                   # React Context (Auth, Bluetooth…)
│
├── features/                   # ⭐ QUAN TRỌNG – chia theo domain
│   │
│   ├── auth/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/           # logic riêng feature (optional)
│   │   └── types/
│   │
│   ├── home/
│   │   ├── screens/
│   │   ├── components/
│   │   └── hooks/
│   │
│   ├── workout/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   │
│   ├── notification/
│   │   ├── screens/
│   │   ├── components/
│   │   └── hooks/
│   │
│   ├── profile/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── flows/              # flow nhiều bước (update profile…)
│   │   └── hooks/
│   │
│   ├── activity/
│   ├── search/
│   ├── bluetooth/
│   ├── posture/                # AI / camera
│   └── ...                     # các domain khác
│
├── shared/                     # (optional) dùng nếu core chưa đủ
│   ├── components/             # reusable nhưng phức tạp
│   ├── layouts/
│   └── modals/
│
├── data/                       # mock data / static data
│
└── App.tsx