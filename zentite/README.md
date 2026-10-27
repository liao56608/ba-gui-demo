# Unicorn+ RF System — Web Prototype

A functional, clickable HTML5/CSS/JS web prototype generated from the decompiled
Android APK of **Unicorn+ RF System** by Peninsula Laser
(`com.peninsulalaser`).

This prototype reproduces the app's real navigation flow, dialogs, theming, and
screen layouts as a self-contained static site — no server, no build step, no
external dependencies.

---

## Quick Start

Open `index.html` in any modern browser. That's it.

For best results (treatment screen layout is designed for a tablet aspect ratio),
use a viewport of at least 720px width.

---

## File Structure

```
unicorn-rf-prototype/
├── index.html                    ← MainMenuActivity (home / module grid)
├── splash_video_activity.html    ← SplashVideoActivity (auto-redirects to home)
├── set_activity.html             ← SetActivity (Language / Volume / Upgrade / Engineer)
├── artist_activity.html          ← ArtistActivity (RF treatment screen)
├── microrf_activity.html         ← MicrorfActivity (RF treatment + depth + pump)
├── pureplus_activity.html        ← PurePlusActivity (RF treatment screen)
├── memory_activity.html          ← MemoryActivity (saved profiles, keyed by ?src=)
├── setting_activity.html         ← SettingActivity (engineer: calibration / handler / record / version)
├── ageing_activity.html          ← AgeingActivity (engineer: aging test)
├── handler_select_activity.html  ← HandlerSelectActivity (engineer: handpiece model select)
├── anti_activity.html            ← AntiActivity (engineer: anti-counterfeit module)
├── burn_activity.html            ← BurnActivity (engineer: handpiece flash burn)
├── version_activity.html         ← VersionActivity (engineer: firmware versions)
├── net_debug_activity.html       ← NetDebugActivity (engineer: Wi-Fi diagnostics)
├── network_test_activity.html    ← NetworkTestActivity (engineer: upload/download test)
├── log_activity.html             ← logActivity (engineer: event logs)
├── full_screen_activity.html     ← FullScreenActivity (engineer: display test)
├── img/                          ← 240 PNG assets (from mipmap-mdpi/)
├── css/
│   └── styles.css                ← Image-based layout using real APK assets + exact XML coordinates
├── js/
│   └── app.js                    ← Shared helpers, dialog builders, data models, state machines
└── README.md                     ← This file
```

---

## Navigation Tree

Below is the full navigation graph reconstructed from the APK source code
(primarily `PswDialog.java`, `MainMenuActivity.java`, and `MainActivity.java`).

```
SplashVideoActivity
  └──► index.html (MainMenuActivity — home)

MainMenuActivity (index.html)
  ├── btn_set ──────────► SetActivity (set_activity.html)
  ├── iv_fun1 (MicroRF) ─► MicrorfActivity (microrf_activity.html)
  ├── iv_fun2 (Artist) ─► ArtistActivity (artist_activity.html)
  └── iv_fun3 (Pure+) ──► PurePlusActivity (pureplus_activity.html)
  (iv_fun4 Model Select is visibility=gone in activity_mainmenu.xml)

SetActivity (set_activity.html)
  ├── cardLang ─────► LangDialog (modal: language selection)
  ├── cardSound ────► SoundDialog (modal: 3 volume sliders)
  ├── cardUpgrade ──► VersionDialog (modal: version + progress)
  └── cardEngineer ─► PswDialog (numeric keypad)
       │
       │  PswDialog.passwordIsCorrect() routes by password index:
       │
       ├── pwd[0-4] ──► SettingActivity (setting_activity.html)
       ├── pwd[5] ────► AgeingActivity (ageing_activity.html)
       ├── pwd[12] ───► HandlerSelectActivity (handler_select_activity.html)
       ├── pwd[6] ────► AntiActivity (anti_activity.html)
       ├── pwd[14] ───► BurnActivity (burn_activity.html)
       ├── pwd[7] ────► VersionActivity (version_activity.html)
       ├── pwd[15] ───► NetDebugActivity (net_debug_activity.html)
       ├── "123654" ──► NetworkTestActivity (network_test_activity.html)
       ├── "12312318"► logActivity (log_activity.html)
       └── "012" ────► FullScreenActivity (full_screen_activity.html)

       (In the prototype, any valid code opens an Engineer Menu modal
        listing all 10 routes as clickable links.)

Treatment Screens (Artist / MicroRF / Pure+)
  ├── back ──────► MainMenuActivity (index.html)
  ├── memory ────► MemoryActivity (memory_activity.html?src={artist|microrf|pureplus})
  │                   ├── back ──► {src}_activity.html (dynamic)
  │                   ├── add ───► MemoryNameDialog (modal: text input)
  │                   ├── edit ──► long-press card to edit name + params
  │                   ├── delete ─► × button on card (confirm dialog)
  │                   └── treat ─► returns to {src}_activity.html with selected profile
  ├── standby ───► StandBy → Ready → Running state machine (slide to start)
  └── [MicroRF only]
       ├── pumpBtn ──► PumpSettingDialog (modal: Low/Med/High + edit)
       └── modeSwitch ─► toggles Normal / Expert multi-layer table
```

---

## Layout ↔ Code Mapping

Each HTML page maps 1:1 to an Android Activity and its layout XML.
The table below documents the correspondence.

| HTML File                  | Android Activity         | Layout XML                    | Key UI Elements                                   |
| -------------------------- | ------------------------ | ----------------------------- | ------------------------------------------------- |
| `index.html`               | MainMenuActivity         | `activity_mainmenu.xml`       | Module grid (3 visible cards), top-bar with set button |
| `splash_video_activity.html` | SplashVideoActivity    | `activity_splash_video.xml`   | Progress bar, auto-redirect to home               |
| `set_activity.html`        | SetActivity              | `activity_set.xml`            | 4 settings cards (Language/Volume/Upgrade/Engineer)|
| `artist_activity.html`     | ArtistActivity           | `activity_artist.xml`         | Param-panel, power gauge, standby slide, memory btn|
| `microrf_activity.html`    | MicrorfActivity          | `activity_microrf.xml`        | Same as Artist + depth stepper + pump dialog + expert mode table |
| `pureplus_activity.html`   | PurePlusActivity         | `activity_pureplus.xml`       | Param-panel, power gauge, standby slide, memory btn|
| `memory_activity.html`     | MemoryActivity           | `activity_memory.xml`         | Memory grid (cards), add/delete, empty state       |
| `setting_activity.html`    | SettingActivity          | `activity_setting.xml`        | 6 fragment tabs (Calibration/Handler/Record/Pure/UltraWay/Version) |
| `ageing_activity.html`     | AgeingActivity           | `activity_ageing.xml`         | Aging test progress, start/stop controls           |
| `handler_select_activity.html` | HandlerSelectActivity | `activity_handlerselect.xml` | Handpiece model list (3 items)                     |
| `anti_activity.html`       | AntiActivity             | `activity_anti.xml`           | Anti-counterfeit module status                     |
| `burn_activity.html`       | BurnActivity             | `activity_burn.xml`           | Handpiece flash burn interface                     |
| `version_activity.html`    | VersionActivity          | `activity_version.xml`        | Firmware version list, upgrade button              |
| `net_debug_activity.html`  | NetDebugActivity         | `activity_net_debug.xml`      | Wi-Fi diagnostics (SSID, IP, signal)               |
| `network_test_activity.html` | NetworkTestActivity    | `activity_network_test.xml`   | Upload/download speed test                         |
| `log_activity.html`        | logActivity              | `activity_log.xml`            | Event log table (timestamp, type, message)         |
| `full_screen_activity.html` | FullScreenActivity      | `activity_full_screen.xml`    | Full-screen color test (red/green/blue/white/black)|

### Android Widget → HTML Component Mapping

| Android Widget              | HTML/CSS Component                                          |
| --------------------------- | ----------------------------------------------------------- |
| ConstraintLayout            | CSS absolute positioning with exact `marginTop`/`marginStart` |
| PowerSeekBar                | `seekbar_power.png` background with overlaid value text     |
| ImageView / ImageButton     | `<div>` / `<button>` with `background-image: url('img/...')` |
| Button / TextView@click     | `<a>` or `<button>` with click handler                      |
| Drawable selector (state_pressed) | CSS `:active` or `.pressed` class toggle              |
| FrameLayout (fragment host) | `.fragment-placeholder` (dashed border)                     |
| Dialog (`*Dialog.java`)     | Modal overlay via `openModal()` using `.modal-box`          |
| PswDialog keypad            | Numeric keypad grid (0-9, clear, confirm)                   |
| RecyclerView / GridLayout   | CSS Grid with JS-driven re-render                           |
| Background gradient (bg_home.xml) | `bg_main.png` / `bg_setting.png` as screen background  |

All 240 PNG assets from `mipmap-mdpi/` are used directly as `background-image`
in CSS, preserving the exact visual appearance of the original Android app.
Layout coordinates (dp values at mdpi baseline) are mapped 1:1 to CSS pixel values
via absolute positioning.

---

## Dialogs (Modals)

All dialogs mirror their real `*Dialog.java` counterparts:

| Dialog Class              | JS Function              | Features                                          |
| ------------------------- | ------------------------ | ------------------------------------------------- |
| `LangDialog`              | `openLangDialog()`       | 2 language buttons (English / Chinese)            |
| `SoundDialog`             | `openSoundDialog()`      | 3 volume sliders with defaults                    |
| `VersionDialog`           | `openVersionDialog()`    | Version string + simulated upgrade progress       |
| `PswDialog`               | `openPswDialog()`        | Numeric keypad (0-9), routes via `onCode` callback|
| `PumpSettingDialog`       | `openPumpDialog()`       | Low/Med/High levels + edit steppers               |
| `MemoryNameDialog`        | `openMemoryNameDialog()` | Text input for profile naming                     |
| `AuthDialog`              | `openAuthDialog()`       | QR code display (device authorization)            |
| `LockDialog`              | `openLockDialog()`       | Self-check status + WLAN info                     |
| `DisassemblyDialog`       | `openDisassemblyDialog()`| Disassembly instructions                          |
| `CommonDialog`            | `openCommonDialog()`     | Generic info dialog (title + body)                |

---

## Data Models (In-Memory)

| Model                | Purpose                                      | Persistence        |
| -------------------- | -------------------------------------------- | ------------------ |
| `MemoryStore`        | Saved treatment profiles, keyed by `src`     | Session (JS array) |
| `HandlerStore`       | 3 handpiece models with serial/status        | Session (JS array) |
| `makeStandbyController` | StandBy→Ready→Running state machine       | Per-page instance  |
| `wireStepper`        | Generic ± stepper for numeric params          | Per-element        |

---

## Theme

The prototype uses **real PNG assets** from the APK's `mipmap-mdpi/` directory,
reproducing the exact visual appearance of the original Android app.

| Screen Type       | Background Asset      | Appearance                              |
| ----------------- | --------------------- | --------------------------------------- |
| Main menu / Settings | `bg_main.png`      | Light gradient (white → light gray)     |
| Treatment screens | `bg_setting.png`      | Light treatment background              |
| Engineer screens  | Light CSS theme       | White/light gray with green accents     |

Key visual elements are all image-based:
- **Module buttons** (MicroRF / Artist / Pure+) use `bg_microrf.png` / `bg_artist.png` / `bg_pure_plus.png`
- **Settings cards** use `bg_set.png` / `bg_setting_volume.png` / `bg_setting_upgrade.png` / `bg_setting_eng.png` with pressed variants
- **Parameter panels** use `bg_parameter_area.png` (296×696) or `bg_parameter_area_short.png` (296×613)
- **PowerSeekBar** uses `seekbar_power.png` (223×159) as background with overlaid value text
- **Stepper buttons** use `btn_reduce_normal.png` / `btn_add_normal.png` / `btn_left_normal.png` / `btn_right_normal.png` (45×45 each)
- **Standby/Ready slides** use `ic_standby_slide.png` / `ic_ready_slide.png` (249×94) with thumb images (104×104)
- **Memory cards** use `bg_memory_singlelayer.png` (188×210) with add/selected variants
- **Bottom message bar** uses `bg_bottom_msg.png` (768×45)
- **Dialogs** use `.modal-box` with dark background (#1a2640) and green border (#10ae27)

The green accent color `#10ae27` is derived from `colors.xml` (`color_standby_text`).
Titles and most labels remain white (`color_title` was white in the title style).

---

## Validation Checklist

- [x] All 17 HTML files present and accounted for
- [x] All `href` targets resolve to existing files (0 broken links)
- [x] All 10 engineer menu routes (JS-generated) point to existing files
- [x] All 79 CSS `url()` image references resolve to existing PNGs
- [x] All 5 inline HTML `background:url()` references resolve to existing PNGs
- [x] All 240 PNG assets from `mipmap-mdpi/` copied to `img/`
- [x] `href="#"` only used on interactive dialog triggers (not navigation)
- [x] Splash auto-redirect → `index.html` works
- [x] Memory back-button dynamically routes to correct treatment page via `?src=`
- [x] `js/app.js` passes `node --check` (no syntax errors)
- [x] `wireStepper()` accepts positional args: `(minusId, plusId, valId, min, max, step, init, decimals?)`
- [x] `makeStandbyController()` accepts options object with element IDs
- [x] `MemoryStore.add()` accepts object `{name, power, time, depth}` and `MemoryStore.delete()` works
- [x] `MemoryStore.update()` added for profile editing
- [x] `openModal()` generates HTML with `.modal-box`/`.modal-title`/`.modal-body`/`.modal-actions`/`.modal-btn` matching CSS
- [x] All dialog content styles present in CSS (keypad, language, volume, version, pump, auth)
- [x] MicroRF expert mode table: on/off toggles, editable values, layer navigation
- [x] Pure+ real-time temp widget uses `line_short.png` + `treat_platform.png` per XML

---

## Source APK

- **App**: Unicorn+ RF System
- **Package**: `com.peninsulalaser`
- **Decompiled with**: JADX
- **Source paths**: `D:/Simulated_UI/1040E/resources` + `D:/Simulated_UI/1040E/sources`

## Limitations

This is a UI prototype, not a functional device controller:
- All data is in-memory (lost on page refresh)
- RF energy delivery, sensor readings, and hardware communication are simulated
- Bluetooth/Wi-Fi pairing shows UI only — no real connectivity
- Fragment contents within `SettingActivity` use placeholder blocks
