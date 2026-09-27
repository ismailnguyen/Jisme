---
name: Jisme
description: A client-side-encrypted vault where every item is a sealed window envelope on fibre-flecked paper.
colors:
  paper: "#f7f8f6"
  sheet: "#fdfdfb"
  white: "#ffffff"
  field: "#f1f3f6"
  chip-fill: "#eef1f4"
  rule: "#dfe3e9"
  tint: "#c9d1dc"
  edge: "#bfc8d4"
  code-edge: "#aab4c3"
  mute: "#8a96a8"
  ink-3: "#66728a"
  ink-2: "#4f5c72"
  ink: "#2e3a4f"
  carbon-ink: "#27344a"
  ink-deep: "#243044"
  overlay-ink: "#1e2634"
  slip-shadow-ink: "#141c28"
  red: "#b3261e"
  red-edge: "#efcfcc"
  red-wash: "#fbeceb"
typography:
  display:
    fontFamily: "Public Sans, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(30px, 8.4vw, 52px)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Public Sans, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  headline-sm:
    fontFamily: "Public Sans, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 800
    letterSpacing: "-0.02em"
  title-lg:
    fontFamily: "Public Sans, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 800
  title-step:
    fontFamily: "Public Sans, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 800
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Public Sans, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
    fontFeature: "tnum"
  title:
    fontFamily: "Public Sans, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    letterSpacing: "-0.01em"
  body-compact:
    fontFamily: "Public Sans, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif"
    fontSize: "14.5px"
    fontWeight: 400
    lineHeight: 1.45
  body-sm:
    fontFamily: "Public Sans, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label-lg:
    fontFamily: "Public Sans, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif"
    fontSize: "13.5px"
    fontWeight: 600
  caption:
    fontFamily: "Public Sans, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.45
  label:
    fontFamily: "Public Sans, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 600
  label-sm:
    fontFamily: "Public Sans, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
  chip:
    fontFamily: "Public Sans, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif"
    fontSize: "11.5px"
    fontWeight: 600
    lineHeight: 1.5
  caption-xs:
    fontFamily: "Public Sans, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 500
  carbon-code:
    fontFamily: "Courier Prime, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "0.06em"
  carbon-value:
    fontFamily: "Courier Prime, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "17.5px"
    fontWeight: 400
    lineHeight: 1.25
    fontFeature: "tnum"
  carbon-strip:
    fontFamily: "Courier Prime, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "17px"
    fontWeight: 400
    fontFeature: "tnum"
  carbon-field:
    fontFamily: "Courier Prime, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "16px"
    fontWeight: 400
  carbon-small:
    fontFamily: "Courier Prime, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "13.5px"
    fontWeight: 400
  carbon-id:
    fontFamily: "Courier Prime, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "12px"
    fontWeight: 400
rounded:
  hairline: "3px"
  tag: "4px"
  window: "5px"
  sm: "6px"
  plate: "8px"
  segment: "9px"
  md: "10px"
  control: "12px"
  lg: "14px"
  sheet-top: "16px"
  xl: "20px"
  slip: "24px"
  pill: "999px"
spacing:
  2xs: "4px"
  xs: "6px"
  sm: "8px"
  sm-md: "10px"
  md: "12px"
  md-lg: "14px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.ink-deep}"
    textColor: "{colors.white}"
  button-primary-disabled:
    backgroundColor: "{colors.mute}"
    textColor: "{colors.white}"
  button-primary-footer:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.sheet-top}"
    height: "56px"
  button-outline:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    height: "44px"
  button-outline-hover:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
  action-row:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    height: "52px"
  action-row-danger:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.red}"
  action-row-danger-hover:
    backgroundColor: "{colors.red-wash}"
    textColor: "{colors.red}"
  text-button:
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "0 12px"
  text-button-hover:
    backgroundColor: "{colors.field}"
  icon-button:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    size: "44px"
  icon-button-done:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
  round-button:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    size: "44px"
  input-field:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    height: "48px"
    padding: "10px 14px"
  input-field-focus:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
  input-field-readonly:
    backgroundColor: "{colors.field}"
  segmented-track:
    backgroundColor: "{colors.field}"
    rounded: "{rounded.control}"
    padding: "3px"
  segmented-option-active:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.segment}"
    height: "40px"
  search-slot:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "48px"
  envelope-row:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    height: "68px"
  envelope-seal:
    rounded: "{rounded.sm}"
    width: "70px"
  envelope-window:
    rounded: "{rounded.window}"
    height: "46px"
  mini-envelope:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    height: "58px"
  hero-envelope:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.headline}"
    rounded: "{rounded.plate}"
    padding: "46px 14px 14px"
  secret-strip:
    backgroundColor: "{colors.white}"
    textColor: "{colors.carbon-ink}"
    typography: "{typography.carbon-strip}"
    rounded: "{rounded.sm}"
    height: "44px"
  secret-strip-label:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.pill}"
  secret-strip-empty:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink-3}"
  quick-sheet-row:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.carbon-value}"
    rounded: "{rounded.md}"
    height: "76px"
    padding: "12px 12px 12px 16px"
  form-sheet:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  form-field:
    padding: "14px 16px 16px"
  field-label:
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
  form-step:
    textColor: "{colors.ink}"
    typography: "{typography.title-step}"
  choice:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.md}"
    height: "64px"
    padding: "10px 12px"
  choice-compact:
    typography: "{typography.body-sm}"
    height: "48px"
  record-line:
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
  details-toggle:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.md}"
    height: "70px"
  state-pill:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    height: "32px"
    padding: "0 12px 0 10px"
  state-pill-offline:
    backgroundColor: "{colors.red-wash}"
    textColor: "{colors.red}"
  chip:
    backgroundColor: "{colors.chip-fill}"
    textColor: "{colors.ink}"
    typography: "{typography.chip}"
    rounded: "{rounded.tag}"
    padding: "1px 6px"
  badge-danger:
    backgroundColor: "{colors.red-wash}"
    textColor: "{colors.red}"
    rounded: "{rounded.tag}"
  tag-pill:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.pill}"
    height: "36px"
    padding: "0 12px"
  type-counter:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "56px"
    padding: "8px"
  type-counter-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
  home-dock:
    backgroundColor: "{colors.sheet}"
    rounded: "{rounded.xl}"
    height: "68px"
  home-dock-new:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.lg}"
    height: "52px"
  home-dock-side:
    textColor: "{colors.ink}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.lg}"
    width: "64px"
    height: "56px"
  sheet-bar:
    height: "64px"
    padding: "10px 12px"
  action-menu:
    backgroundColor: "{colors.sheet}"
    rounded: "{rounded.lg}"
    padding: "6px"
  action-menu-item:
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.md}"
    height: "48px"
  menu-tray:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.xl}"
    padding: "12px"
  sign-in-card:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "26px 20px 20px"
  toast-slip:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.slip}"
    height: "48px"
  toast-slip-danger:
    backgroundColor: "{colors.red}"
    textColor: "{colors.white}"
---

# Design System: Jisme

## Overview

**Creative North Star: "The Security Envelope"**

Every item in the vault is a sealed window envelope. Its identity (logo, name, login) shows through a glassine window on the left; its secret stays under a blue-grey security-tint seal on the right, divided from the window by a perforation. Revealing a secret peels the tint away, and it slides back on its own. The world is office stationery for secrets: fibre-flecked paper, bright sheets, ink, carbon-printed values, and one red that means "out in the open".

Density is phone-first and thumb-led: 68px envelope rows stacked with a 6px overlap like a pile on a desk, 44px targets everywhere, a floating dock in the thumb zone. Colour stays almost entirely in the ink-on-paper range; the primary action is ink-filled, not a hue. Depth comes from paper physics (raised sheets, recessed windows and fields), always shadowed in ink blue-grey, never black. Editing is a printed form on the same paper: ruled form sheets, labelled fields, tick-box choices, and a perforated tear line where the envelope opens. The world refuses the category default of a white favicon list, a blue button and a shield.

The system ships light only (`color-scheme: light`). Dark mode is not a brand commitment and has not been designed.

**Key Characteristics:**
- Window envelopes: glassine window for identity, tinted perforated seal for the secret.
- Ink-on-paper palette; the only hue is one red, reserved for revealed, delete and error.
- Two voices: Public Sans for the interface, Courier Prime "carbon copy" for every stored value.
- Paper depth: raised sheets, recessed fields, all shadows tinted with ink.
- Hold or tap to reveal, auto-reseal; the verification code rides a 30-second ring.
- Editing is a printed form: ruled sheets, tick-box choices, a perforated tear line.

## Colors

A cool ink-and-paper stationery palette with a single red used as an exposure signal.

### Primary
- **Envelope Ink** (`ink`): the one voice of the system. Body text, headings, focus outlines, primary buttons, the dock's New item button, the selected type counter and choice, the copied state of an icon button, the TOTP arc, the progress bar. Hover and pressed deepen to **Pressed Ink** (`ink-deep`). Ink at low alpha is the only shadow, selection and hairline tint in the product.
- **Carbon Ink** (`carbon-ink`): the slightly darker ink used only by carbon-printed values (Courier Prime), with a faint offset text-shadow of itself so values look typed onto paper.

### Secondary
- **Exposure Red** (`red`): the only hue. It marks a secret that is currently visible (the strip's 1.5px red inset outline and the "Visible · reseals in Ns" timer), destructive actions (Delete in the action menu, the red action row), errors (invalid code, danger toast) and the Offline vault state. Paired with **Red Wash** (`red-wash`) as its background and **Red Edge** (`red-edge`) as its border.

### Neutral
- **Fibre Paper** (`paper`): the desk. Page, sheet and tray backgrounds, always layered under an 8.5%-opacity ink-coloured fractal-noise fleck.
- **Bright Sheet** (`sheet`): anything picked up off the desk. Envelopes, form sheets, fields, buttons, pills, choices, the dock, the quick-copy sheet.
- **Plate White** (`white`): the brightest surface. Hovered controls, focused fields, the secret-strip face, the barcode plate, text on ink.
- **Field Grey** (`field`): quiet fills. Hover wash on text buttons, menu items and dock sides; segmented-control track; read-only fields; the empty strip seal; tray icon discs.
- **Chip Grey** (`chip-fill`): printed tags, badges and active search filters.
- **Hairline Rule** (`rule`): dividers between rows and form fields, pill, choice and counter borders.
- **Tint Border** (`tint`): field and search borders, hover border on choices and tag pills, drag handle, loading placeholders, scrollbar thumb.
- **Control Edge** (`edge`): the harder edge of raised controls (icon buttons, outline and light buttons). **Code Edge** (`code-edge`) outlines the small "Code" tag.
- **Secondary Ink** (`ink-2`, 6.4:1 on paper): labels, secondary text, icons inside actions.
- **Tertiary Ink** (`ink-3`, 4.6:1 on sheet): placeholders, notes, the ending TOTP ring, disabled button text.
- **Mute** (`mute`): dashed "not yet made" borders, checkbox strokes and the disabled primary fill. Never text.
- **Overlay Ink** (`overlay-ink`): the darker ink used at alpha for scrims (32%) and for the long drop under sheets and the tray (18–25%).
- **Slip Shadow Ink** (`slip-shadow-ink`): the deepest ink, used at 20–25% only for the shadow under the dark toast slip, so an ink object still casts an ink shadow rather than a black one.

### Named Rules
**The Sealed-Only Tint Rule.** The security tint (a 28×7 ink wave over a blue-grey crosshatch) appears only where a secret is sealed: the seal of an envelope that holds a copyable secret, and the face of the Secret Strip. An envelope with nothing to copy gets a plain ruled seal instead (faint 4px ruled lines, ink-dotted perforation). If it is tinted, there is a secret under it.

**The One Red Rule.** Red (`red`) means exposed, destructive or broken: a revealed secret, a delete, an error, the offline state. It never decorates, never marks a brand moment, never serves as a hover colour.

**The Ink, Not Blue Rule.** The primary action is ink-filled with an ink-tinted lift shadow. No hue accent, no blue button, no blue focus ring.

## Typography

**Display Font:** Public Sans (variable 400–800, self-hosted, OFL), falling back to the system UI stack
**Body Font:** Public Sans
**Label/Mono Font:** Courier Prime (400 and 700, self-hosted, OFL), falling back to ui-monospace

**Character:** a plain, sturdy civic sans runs the interface; a typewriter face prints the stored data, so chrome and content can be told apart at a glance. Tabular numerals are on across the body. Headings default to 700 at −0.015em.

### Hierarchy
The ramp is dense and phone-scaled; every step below is in use, and a new size must land on one of them.
- **Display** (800, clamp(30px, 8.4vw, 52px), 1.04, −0.035em, max 14ch, balanced wrap): the sign-in headline only.
- **Headline** (800, 24px, 1.1, −0.025em): the item name in the hero envelope.
- **Headline small** (800, 22px, −0.02em): the sign-in card title, the sign-in wordmark and the one-time-code digits.
- **Title large** (800, 20px): the empty-vault title and the letter initial in a hero logo plate.
- **Step title** (800, 18px, −0.015em): form step titles ("What is it?"); the type-counter count uses the same size at 700.
- **Body** (400, 16px, 1.55, max 40ch for prose): lede text, inputs (always 16px so iOS does not zoom), text buttons and action rows (16px 600–700), round-button icons.
- **Title** (700, 15px, −0.01em): envelope names, the Details toggle, choice names, action-menu items (600), the search input.
- **Body compact** (400, 14.5px, 1.45): the toast title (600), menu-tray rows, the empty-vault lede, the hero subtitle.
- **Body small** (400, 14px, 1.5): the sign-in lede, the empty-list note, three-across choice names (600), section heads (700, −0.005em).
- **Label large** (600, 13.5px): tag pills and the strip's "Hold to reveal" label.
- **Caption** (500, 13px, 1.45): helper text under fields, the state pill (600), section counts, the toast message, filter chips, footer links.
- **Label** (600, 12.5px, `ink-2`): field labels, quick-row labels, the details summary, the record line, choice captions (400), mini-envelope names, the reseal timer.
- **Label small** (600, 12px): dock labels, the TOTP seconds (700, tabular), tray meta, toast mark.
- **Chip** (600, 11.5px, 1.5): chips, badges, counter captions (500), the hero return address.
- **Caption extra-small** (500, 11px): counter captions on screens narrower than 381px. This is the floor for any text.
- **Carbon code** (Courier Prime 700, 28px, 1.1, 0.06em): the live verification code, grouped in threes.
- **Carbon value** (Courier Prime 400, 17.5px, 1.25): logins, URLs and other values in quick-copy rows.
- **Carbon strip** (Courier Prime 400, 17px): a revealed secret on the strip.
- **Carbon field** (Courier Prime 400, 16px): values in the expanded detail accordions.
- **Carbon small** (Courier Prime 400, 13.5px): envelope subtitles (the login under a name).
- **Carbon id** (Courier Prime 400, 12px): the account id at the foot of an item.

Icon glyphs are sized with `font-size` but are not type: 8–11px inside discs and tags, 14px chevrons, 16–20px in buttons. They follow the icon's container, not the ramp.

### Named Rules
**The Carbon Copy Rule.** Every value the user stored is printed in Courier Prime with the carbon text-shadow; every piece of interface is in Public Sans. Never set a label, a button or a heading in the carbon face, and never set a stored value in the UI face (the one exception is an error message in a value slot, which switches to Public Sans 15px in red).

**The Sentence Case Rule.** Labels, section heads and buttons are sentence case at their natural tracking. The build carries no uppercase labels and no eyebrows above headings.

**The 11px Floor Rule.** No text below 11px. Anything smaller is an icon or it is a defect.

## Layout

Phone first at 390px; desktop inherits the same pieces rearranged, never a different product.

- **Phone (<768px):** one column with 16px side gutters. Summary (brand row 56px, 48px search, a row of four type counters, a horizontally scrolling tag row, three mini envelopes for favourites), then the envelope stack. The list keeps 110px plus the safe-area inset free at the bottom for the floating dock (68px tall, 14px above the safe area, max 420px wide). Sheets rise from the bottom to full height minus 8px, with 16px top corners and a drag handle; the page behind scales to 0.96 and desaturates slightly, and the dock hides while a sheet is open. The menu is a short paper tray 12px from the screen edges.
- **Narrow phone (≤380px):** the counter row tightens to a 5px gap and captions drop to 11px.
- **Desktop (≥768px):** a 1760px desk. A sticky 380px summary pane on the left (types drop to a 2×2 grid; the pane keeps 100px clear at the bottom for the dock), the stack on the right with 32px padding. Below Favourites and Recently opened, desktop adds **All items**: the whole vault A to Z, 60 at a time with a full-width "Show more" button. Envelope stacks become a grid with as many 300px-minimum columns as fit (14px column gap, 10px row gap) with no overlap. Sheets slide in from the right at min(560px, 100%); the menu becomes a 380px left rail with 20px right corners; the dock anchors under the summary pane at 332px.
- **Sign-in:** a single 420px sheet card centred on the paper, 26px top and 20px side padding.
- **Rhythm:** 4 / 6 / 8 / 10 / 12 / 14 / 16 / 24px. 6–8px between siblings in a group (counters, tags, mini envelopes, choices, tray rows), 12px between form rows and from sheet to sheet, 14px inside the hero envelope and above plates, 18px above a section head and 8px below it.
- **The stack:** envelopes overlap by 6px (−6px top margin), each with a slight upward shadow so the one below appears tucked under.
- **Form sheets:** a form sheet groups related fields; each field is padded 14px 16px 16px with an 8px gap between label and control, and fields are divided by hairline rules. Choices sit two across (three across for short options) with an 8px gap.
- **Touch:** every interactive element is at least 44×44px; 36px tag pills extend their hit area with the row's padding.

## Elevation & Depth

A paper hybrid: sheets are raised with soft, layered, ink-tinted shadows, while anything you look into or type into (windows, fields, the strip face, the search slot) is recessed with an inset shadow. Every shadow uses ink (`ink`) at alpha, or the darker `overlay-ink` and `slip-shadow-ink` for the longest drops; none are black and none are hard offsets. Overlays dim the desk with `overlay-ink` at 32%.

### Shadow Vocabulary
- **Rest** (`box-shadow: 0 1px 2px rgba(46, 58, 79, 0.12)`): round header buttons, sheet close, the active segment.
- **Sheet** (`box-shadow: 0 0 0 1px rgba(46, 58, 79, 0.07), 0 1px 2px rgba(46, 58, 79, 0.1), 0 6px 16px rgba(46, 58, 79, 0.06)`): form sheets, quick-copy sheet, details toggle, accordions, action rows, barcode plate.
- **Float** (`box-shadow: 0 0 0 1px rgba(46, 58, 79, 0.08), 0 -2px 8px rgba(46, 58, 79, 0.06), 0 10px 24px rgba(46, 58, 79, 0.16)`): the floating dock.
- **Ink lift** (`box-shadow: 0 1px 0 rgba(255, 255, 255, 0.15) inset, 0 2px 4px rgba(46, 58, 79, 0.3), 0 8px 16px rgba(46, 58, 79, 0.22)`): primary ink buttons.
- **Popover** (`box-shadow: 0 0 0 1px rgba(46, 58, 79, 0.08), 0 4px 10px rgba(46, 58, 79, 0.12), 0 16px 32px rgba(46, 58, 79, 0.16)`): the ⋯ action menu.
- **Envelope in stack** (`box-shadow: 0 -1px 0 rgba(46, 58, 79, 0.07), 0 -3px 6px rgba(46, 58, 79, 0.06), 0 1px 2px rgba(46, 58, 79, 0.12)`): the row sits partly under its neighbour.
- **Sheet drop** (`box-shadow: 0 -8px 30px rgba(30, 38, 52, 0.18)`) and **Tray drop** (`0 0 0 1px rgba(46, 58, 79, 0.08), 0 10px 30px rgba(30, 38, 52, 0.25)`): full sheets and the menu tray.
- **Slip drop** (`box-shadow: 0 4px 10px rgba(20, 28, 40, 0.25), 0 12px 24px rgba(20, 28, 40, 0.2)`): the toast slip only.
- **Recess**: fields and search (`inset 0 1px 2px rgba(46, 58, 79, 0.07)`), glassine windows (`inset 0 1px 2px rgba(46, 58, 79, 0.14), inset 0 -1px 0 rgba(255, 255, 255, 0.8)`), the strip face (`inset 0 0 0 1px rgba(46, 58, 79, 0.22), inset 0 1px 3px rgba(46, 58, 79, 0.18)`).
- **Raised control**: icon buttons carry a white top highlight and a two-step drop; on press they move 1px down and the drop collapses.

### Named Rules
**The Ink Shadow Rule.** Shadows are tinted with ink and soft. A black or hard-offset shadow is foreign to the world.

**The Pressed-In Rule.** Surfaces that hold or reveal content are recessed; surfaces you act on are raised. A field never floats, and a button is never inset.

## Shapes

Stationery corners: small on paper, larger on the hands-on controls, round only for state and tags.

- Loading placeholder bars are 3px; printed chips, tags and favourite icons are 4px; glassine windows are 5px; envelope rows, mini envelopes and the Secret Strip are 6px.
- The hero envelope and logo plates are 8px; the checked segment inside a 12px segmented track is 9px (concentric with the 3px track padding); fields, counters, choices, form sheets, quick sheets and menu items are 10px; icon buttons, the search slot, hero logo and the sign-in card are 12px; buttons, action rows, dock buttons and the action menu are 14px; sheets are 16px at the top and sheet-footer primaries 16px all round; the dock and tray are 20px; the toast slip is 24px.
- State pills, tag pills, strip labels, the drag handle and round header buttons are full pills or circles.
- **Envelope devices:** the perforation (a 3px column of 1px dots on a 5px repeat) divides window from seal; the tear line (a 3px row of 1px ink dots on a 6px repeat, 8px in from each side) marks where an item's Details & edit opens; a hairline flap crease (two faint diagonals meeting under the top edge) marks the hero envelope and the sign-in card; a 1.5px dashed `mute` border marks something not yet made (the new-item envelope from search, "more" tags, the add-filter button). Inside a form field, a dashed hairline rule separates a secondary group (such as extra fields under a password).

## Components

### Buttons
Tactile stationery: ink for the one thing to do, raised paper for everything else.
- **Shape:** 14px corners; icon buttons 12px; header buttons circular.
- **Primary:** ink fill, white text, 600–700 weight, ink-lift shadow; hover and press go to Pressed Ink. Full-width primaries are 52px tall (56px with 16px corners in sheet footers, which pin to the bottom over a paper fade).
- **Outline / Light:** sheet fill, 1px Control Edge, ink text; hover goes to white with an ink border.
- **Action row:** a full-width 52px sheet row with a 20px icon column in `ink-2`, 16px 700 text, Sheet shadow. The red variant keeps the sheet fill with red text and icon and washes red on hover.
- **Icon button (44px):** raised sheet square with a white highlight; the quiet variant drops to transparent in `ink-2`; after a copy it flips to ink fill with a check.
- **Text button:** transparent, 44px tall, 16px 600, Field Grey on hover; link buttons are underlined at a 3px offset.
- **Focus:** a 2px ink outline at 2px offset on every control.

### Chips
- **Printed chip / badge:** Chip Grey fill, hairline rule border, 4px corners, 11.5px 600. The danger badge uses Red Wash, Red Edge and red text.
- **Code tag:** an outlined tag (Code Edge) with a clock icon, next to an envelope name when the item has a verification code.
- **Tag pill:** a 36px sheet pill with a hairline border, 13.5px 600; "more" is dashed in `ink-2`.
- **State pill:** a 32px sheet pill, always an icon plus a word ("Unlocked · synced", "Syncing", "Offline"); the synced check sits in a 16px ink disc; Offline turns the pill red.

### Cards / Containers
- **Envelope row:** see the signature component below.
- **Mini envelope (favourites):** a 58px sheet with a full glassine window, 18px icon and a two-line 12.5px name; three per row on phones.
- **Type counter:** a 56px sheet tile with a hairline border, 18px 700 count and an 11.5px caption; the selected tile goes ink-filled with white text.
- **Quick-copy sheet (copy-first rows):** a 10px sheet of 76px rows divided by hairline rules. Each row has a label, a carbon value and an icon button on the right; the pair variant splits into two columns with a vertical rule. It sits directly under the hero envelope, before any editing.
- **Hero envelope:** an 8px sheet with the flap crease, a small logo-and-name return address top left, the state pill top right, and a large glassine window with a 48px logo plate and the 24px item name.
- **Barcode plate:** white, 10px, Sheet shadow, 12.5px hint beneath.
- **Details toggle:** a 70px sheet (15px 700 "Details & edit" plus a 12.5px summary of chips and dates) with a rotating chevron; when open it squares its bottom corners and the tear line appears beneath it.

### Form Sheets
Editing and adding are a printed form on the envelope's paper.
- **Form step:** an 18px 800 title above each group ("What is it?", "Sign-in details").
- **Form sheet:** a 10px sheet with the Sheet shadow holding one or more fields separated by hairline rules.
- **Field:** a 12.5px 600 `ink-2` label with a 14px-wide icon, then the control 8px below.
- **Choice grid:** tick-box choices two across (64px, 15px 700 name, 12.5px caption) or three across for short options (48px, 14px 600, centred). Hover raises the border to Tint; the chosen one takes an ink border doubled with a 1px ink ring.
- **Record line:** a centred 12.5px line under the form recording when the item was created and last changed.

### Inputs / Fields
- **Style:** 48px sheet field, 1px Tint Border, 10px corners, 16px text, inset recess; placeholders in `ink-3`; labels 12.5px 600 `ink-2` above; helper text 13px `ink-2` below.
- **Focus:** the border turns ink, the background goes white, and a 3px ink ring at 15% appears.
- **Read-only:** Field Grey fill.
- **Search slot:** a 12px sheet slot with the same focus ring on `:focus-within`; its icon buttons have no chrome until hovered; active type and tag filters print as chips inside it, in front of the text input, which never hides (the placeholder names the selected type, e.g. "Search documents"). A clear button resets the words and the filters together.
- **Segmented control:** a Field Grey track with 3px padding; the checked segment is a raised sheet in ink, the others `ink-2`.
- **Checkbox:** 22px, 5px corners, 1.5px Mute stroke, ink when checked.
- **One-time code:** six 52px slots in a row (10px corners, 22px 600 tabular digits); the active slot takes the ink focus outline.

### Navigation
- **Home dock:** a 68px floating sheet (20px corners, Float shadow) holding Menu and Lock as 64×56 icon-over-label side buttons (12px 600) around a flexible 52px ink New item button. The expanded side button takes a Field Grey wash.
- **Menu tray:** a paper tray with a 40px avatar header and action rows whose icons sit in 32px Field Grey discs; bottom sheet on phones, left rail on desktop; slides in over 0.42s.
- **Sheet bar:** a 64px bar with a circular back or close button, a centred 16px 700 title, and a ⋯ action menu (a 14px sheet popover with 48px rows; Delete in red).
- **Back behaviour:** the system Back gesture closes the open sheet or tray before it leaves the page, and sign-in steps replace history, so Back never lands on a half-finished sign-in step.

### Toast Slip
A dark ink slip (24px radius, 48px tall, white text) with a 28px white disc for the mark, a 14.5px title and a 13px message; red for danger. It drops in from the top on phones and rises at the bottom right on desktop. It confirms an action ("Password copied"); it never carries a secret value.

### Secret Strip (signature)
The reveal field. A 44px recessed white face, 6px corners, holds the carbon value under an absolutely positioned security-tint seal. On the seal, a floating sheet pill reads "Hold to reveal" with a fingerprint icon. A press longer than 300ms reveals only while held; a tap (or Enter/Space) reveals for 20 seconds. Either way the seal clips off to the right over 0.42s on the brand ease and the face gains a 1.5px red inset outline; for a tap reveal a red "Visible · reseals in Ns" timer with an underlined "Reseal now" appears below. On release or at zero the tint slides back. With no value saved, the seal becomes a Field Grey fill with "No password saved" in `ink-3`.

### Envelope Row (signature)
A 68px sheet with 6px corners. On the left is a glassine window (5px, a translucent blue-grey gradient with a diagonal sheen and an inset recess) holding a 30px logo plate, the 15px 700 name, an optional Code tag and a 13.5px carbon subtitle (for documents, cards and bank accounts the holder's name leads, then the masked number, so family members' passports tell apart without opening); the window brightens its sheen on hover. On the right is a 70px seal behind a dotted perforation. It is tinted, with a raised 44px copy button, when the item has a copyable secret; otherwise it is plainly ruled with a quiet chevron or barcode button. The loading variant uses Tint placeholder bars; the "new item" variant is a dashed outline with an ink logo plate.

### TOTP Ring
A 44px ring: a 3.5px Hairline Rule track with an ink arc that empties over 30 seconds (0.9s linear steps), the remaining seconds printed at the centre (12px 700 tabular). For the last 5 seconds it fades to `ink-3`, never red.

### Motion
One ease-out, cubic-bezier(0.16, 1, 0.3, 1): 0.15s for press and hover, 0.2–0.25s for overlays and the details chevron, 0.35s for toasts and the desk scale, 0.42s for sheets, the tray and the strip peel. Errors shake 10px sideways over 0.3s. `prefers-reduced-motion` collapses every animation and transition.

### Locking
The vault locks itself after 5 minutes in the background or 10 minutes idle, and the Lock button in the dock is always one tap away. The state pill shows the result; nothing is left inferred.

## Do's and Don'ts

### Do:
- **Do** put identity in a glassine window and the secret under a tinted, perforated seal; that division is the unit of the whole system.
- **Do** keep every stored value in Courier Prime with the carbon shadow, and every piece of interface in Public Sans.
- **Do** use ink (`ink`, hover `ink-deep`) for the single primary action on a surface, with the ink-lift shadow.
- **Do** make surfaces you read or type into recessed (inset shadow) and surfaces you press raised, all in ink-tinted shadows.
- **Do** show the vault state as a pill with an icon and a word; never rely on colour alone.
- **Do** keep 44px minimum targets, 16px input text and 11px minimum for any text.
- **Do** re-hide anything revealed: a visible secret carries the red outline, reseals itself after 20 seconds, and offers a reseal control.
- **Do** build edit and add screens from form sheets: a step title, ruled fields with icon labels, tick-box choices.
- **Do** let the system Back gesture close sheets, and replace history between sign-in steps.
- **Do** pick font sizes, radii and colours from the tokens above; a new value is a design-system change, not a local fix.

### Don't:
- **Don't** use the security tint anywhere nothing is sealed; plain rows get the ruled seal.
- **Don't** use red for anything but revealed, delete, error and offline, and don't introduce a second hue.
- **Don't** use a blue primary button, a shield motif or a plain white favicon list; that is the category default this world refuses.
- **Don't** use black or hard-offset shadows.
- **Don't** set labels in uppercase or add eyebrow text above headings.
- **Don't** show a secret value in a toast.
- **Don't** recolour or redraw the Jisme logo to fit the ink palette; it keeps its own colours.
- **Don't** use `mute` for text; the lowest text ink is `ink-3`.
- **Don't** design a dark theme piecemeal; the world is light only until one is designed whole.
