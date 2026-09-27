---
name: Jisme
description: A client-side-encrypted vault that reads as if it shipped with the iPhone, Apple Passwords for lists and reveal, Wallet for cards and IDs.
colors:
  system-blue: "#0071e3"
  system-blue-pressed: "#0058b0"
  system-blue-fill: "rgba(0, 113, 227, 0.12)"
  system-blue-dark: "#0a84ff"
  system-red: "#d70015"
  system-red-fill: "rgba(215, 0, 21, 0.1)"
  system-red-dark: "#ff453a"
  system-green: "#248a3d"
  system-green-dark: "#30d158"
  system-orange: "#c93400"
  system-orange-dark: "#ff9f0a"
  category-document: "#d15d00"
  category-document-dark: "#c94f00"
  category-bank: "#5856d6"
  category-bank-dark: "#5e5ce6"
  grouped-background: "#f2f2f7"
  cell: "#ffffff"
  label: "#000000"
  label-secondary: "#6c6c70"
  label-tertiary: "#737378"
  label-quaternary: "#c7c7cc"
  separator: "rgba(60, 60, 67, 0.29)"
  fill: "rgba(120, 120, 128, 0.2)"
  fill-secondary: "rgba(120, 120, 128, 0.16)"
  fill-tertiary: "rgba(118, 118, 128, 0.12)"
  fill-quaternary: "rgba(116, 116, 128, 0.08)"
  bar-material: "rgba(249, 249, 249, 0.86)"
  bar-material-thick: "rgba(242, 242, 247, 0.92)"
  menu-material: "rgba(237, 237, 237, 0.86)"
  scrim: "rgba(0, 0, 0, 0.3)"
  grouped-background-dark: "#000000"
  cell-dark: "#1c1c1e"
  cell-dark-raised: "#2c2c2e"
  label-dark: "#ffffff"
  label-secondary-dark: "#aeaeb2"
  label-tertiary-dark: "#98989f"
  label-quaternary-dark: "#48484a"
  separator-dark: "rgba(84, 84, 88, 0.65)"
  bar-material-dark: "rgba(22, 22, 23, 0.84)"
  monogram-grey: "#858a96"
typography:
  large-title:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Display\", \"Helvetica Neue\", \"Segoe UI\", Roboto, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.012em"
  title-1:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Display\", \"Helvetica Neue\", \"Segoe UI\", Roboto, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "0.01em"
  title-3:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Display\", \"Helvetica Neue\", \"Segoe UI\", Roboto, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"Helvetica Neue\", \"Segoe UI\", Roboto, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    letterSpacing: "-0.022em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"Helvetica Neue\", \"Segoe UI\", Roboto, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "-0.022em"
  subheadline:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"Helvetica Neue\", \"Segoe UI\", Roboto, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  footnote:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"Helvetica Neue\", \"Segoe UI\", Roboto, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    letterSpacing: "-0.005em"
  caption:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"Helvetica Neue\", \"Segoe UI\", Roboto, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    letterSpacing: "0"
  code:
    fontFamily: "ui-monospace, \"SF Mono\", SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "30px"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "0.04em"
    fontFeature: "\"tnum\""
  secret:
    fontFamily: "ui-monospace, \"SF Mono\", SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: "0"
    fontFeature: "\"tnum\""
rounded:
  sm: "7px"
  md: "10px"
  lg: "12px"
  xl: "14px"
  card: "16px"
  icon-small: "7.5px"
  icon-grid: "13px"
  capsule: "999px"
spacing:
  hairline: "1px"
  xs: "4px"
  sm: "8px"
  md: "12px"
  gutter: "16px"
  section: "26px"
  hit-target: "44px"
  toolbar: "49px"
  cell-height: "60px"
components:
  button-filled:
    backgroundColor: "{colors.system-blue}"
    textColor: "{colors.cell}"
    typography: "{typography.headline}"
    rounded: "{rounded.lg}"
    height: "50px"
  button-filled-pressed:
    backgroundColor: "{colors.system-blue-pressed}"
    textColor: "{colors.cell}"
  button-gray:
    backgroundColor: "{colors.fill-tertiary}"
    textColor: "{colors.system-blue}"
    rounded: "{rounded.md}"
    height: "44px"
  button-bar-text:
    textColor: "{colors.system-blue}"
    typography: "{typography.body}"
    height: "44px"
    padding: "0 10px"
  list-cell:
    backgroundColor: "{colors.cell}"
    textColor: "{colors.label}"
    typography: "{typography.body}"
    height: "60px"
    padding: "8px 12px 8px 16px"
  list-cell-selected:
    backgroundColor: "{colors.system-blue}"
    textColor: "{colors.cell}"
  category-tile:
    backgroundColor: "{colors.cell}"
    textColor: "{colors.label}"
    rounded: "{rounded.lg}"
    height: "80px"
    padding: "10px 12px 9px"
  search-field:
    backgroundColor: "{colors.fill-tertiary}"
    textColor: "{colors.label}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    height: "40px"
  search-token:
    backgroundColor: "{colors.system-blue}"
    textColor: "{colors.cell}"
    typography: "{typography.subheadline}"
    rounded: "6px"
    height: "28px"
    padding: "0 8px"
  tag-pill:
    backgroundColor: "{colors.cell}"
    textColor: "{colors.label}"
    typography: "{typography.subheadline}"
    rounded: "{rounded.capsule}"
    height: "34px"
    padding: "0 14px"
  text-field:
    backgroundColor: "{colors.fill-tertiary}"
    textColor: "{colors.label}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "10px 14px"
  switch:
    backgroundColor: "{colors.fill}"
    rounded: "16px"
    width: "51px"
    height: "31px"
  switch-on:
    backgroundColor: "{colors.system-green}"
  wallet-card:
    textColor: "{colors.cell}"
    rounded: "{rounded.card}"
    padding: "16px 18px"
    width: "400px"
  code-chip:
    backgroundColor: "{colors.fill-tertiary}"
    textColor: "{colors.label-secondary}"
    rounded: "{rounded.capsule}"
    height: "18px"
    padding: "0 6px"
---

# Design System: Jisme

## Overview

**Creative North Star: "Shipped With the iPhone"**

Jisme plays the iOS canon straight: Apple Passwords for lists, detail and reveal; Wallet for cards, documents and bank accounts. There is no bespoke metaphor. Grouped backgrounds carry inset cells with hairline separators, the system font does all the talking, one accessible system blue is the only tint, and a single system red means "exposed, destructive, failed or offline". It follows the system appearance, light or dark, with the iOS dark ramp (black page, #1c1c1e cells, #2c2c2e raised cells).

Density is Apple's: 17px body, 60px list cells, 44px minimum targets, 16px gutters. Secrets sit behind dots until asked for, then show in SF Mono with a visible countdown before hiding themselves again. Every iOS system colour is taken in its higher-contrast variant wherever it carries text, so labels clear WCAG AA on both appearances; the canon is matched by eye, not by pixel.

Structure follows device class the way iOS and iPadOS do: a single navigation stack on phones (items push in from the right, a new item rises as a modal card), a two-column split view from 768px and a three-column sidebar | list | detail from 1100px, where the detail pane hosts both the open item and the new-item form.

**Key Characteristics:**
- Inset grouped lists on a grouped background; hairline separators inset past the leading icon.
- The system font stack everywhere; SF Mono only for machine strings (revealed secrets, one-time codes, card numbers, record IDs).
- One tint (system blue); red reserved for revealed, destructive, error and offline.
- Category colour as a white-glyph circle; favicons as app-icon squircles.
- Translucent, blurred bars and menus; shadows only on things that float.
- Wallet card faces with deep, hash-picked gradients for cards, documents and bank accounts.
- The iOS spring, approximated as one easing curve (cubic-bezier(0.32, 0.72, 0, 1)).

## Colors

The iOS system palette, lifted to its higher-contrast variants where it carries text, with the matching iOS dark values swapped in under `prefers-color-scheme: dark`.

### Primary
- **System Blue** (`system-blue`; dark `system-blue-dark`): the single tint. Links, bar buttons, glyph buttons, the filled button, the caret, focus rings (2px), the selected list cell in split view, search tokens, live TOTP codes and their ring, the checked radio. Its pressed state is `system-blue-pressed`; its wash (`system-blue-fill`) marks selection and active gray buttons.

### Secondary
- **System Red** (`system-red`; dark `system-red-dark`): one red with four jobs: a revealed secret's "Visible · hides in Ns" line, destructive actions (Delete, Sign out), errors and the offline vault state. Its wash (`system-red-fill`) backs red badges and the danger button.
- **System Green** (`system-green`; dark `system-green-dark`): the on-state of switches, the success banner mark, the Cards category.
- **System Orange** (`system-orange`; dark `system-orange-dark`): cautions that are not failures: the demo-vault status, the password clue label, the warning banner mark.

### Tertiary
- **Category colours**: each category tile carries a white glyph on a colour circle, every pair at least 3:1. Credentials use System Blue, Cards System Green, Documents `category-document`, Banks `category-bank` (dark variants alongside). The same colours fill the Settings-style icon squares in the menu.

### Neutral
- **Grouped Background** (`grouped-background`; dark `grouped-background-dark`): the page behind every list, and the page of sheets and the menu.
- **Cell** (`cell`; dark `cell-dark`): inset grouped cells, tiles, the favourites grid, form groups. Sheets and the menu in dark mode step up one level: `cell-dark` page, `cell-dark-raised` cells.
- **Labels** (`label`, `label-secondary`, `label-tertiary`, `label-quaternary`, with dark variants): primary text; secondary text raised to 5:1 (`#6c6c70` instead of iOS `#8e8e93`); placeholders and notes at 4.6:1; quaternary for chevrons and disclosure glyphs only, never text.
- **Separator** (`separator`; dark `separator-dark`): hairlines between cells and under bars, 0.5px on 2x screens.
- **Fills** (`fill` to `fill-quaternary`): text fields, the search field, gray buttons, segmented-control tracks, chips, hover washes, the off switch.
- **Materials** (`bar-material`, `bar-material-thick`, `menu-material`; dark `bar-material-dark`): translucent backgrounds for the toolbar, navigation bars and context menus, always with `saturate(180%) blur(20–30px)`.
- **Monogram Grey** (`monogram-grey`, bottom of a #a5abb8 → #858a96 gradient): the Contacts-style monogram behind an item without a favicon and behind the avatar.

### Named Rules
**The One Tint Rule.** System blue is the only interactive colour. Nothing else reads as a link, a button label or a selection.

**The One Red Rule.** Red means exactly one of: revealed, destructive, error, offline. It never decorates.

**The Text-Safe Variant Rule.** Any system colour that carries text or a glyph on white uses its higher-contrast variant (blue #0071e3, red #d70015, green #248a3d, orange #c93400, secondary label #6c6c70). iOS's brighter canonical values are for dark mode only.

## Typography

**Display Font:** SF Pro Display via `-apple-system` (with Helvetica Neue, Segoe UI, Roboto, system-ui)
**Body Font:** SF Pro Text via `-apple-system` (same fallbacks)
**Label/Mono Font:** SF Mono via `ui-monospace` (with SFMono-Regular, Menlo, Consolas)

**Character:** the system face, set at Apple's Dynamic Type default sizes with Apple's tracking (negative at 15–17px, slightly positive at display sizes). It never announces itself; the stored values read in the same face as the labels, exactly like Passwords.

### Hierarchy
- **Large Title** (700, 34px, 1.2, +0.012em): "Jisme" at the top of the navigation column, beside the logo.
- **Title 1** (700, 28px, 1.15, +0.01em): the item title under its icon in the detail view, and sign-in headings. The sign-in hero title scales `clamp(34px, 9vw, 52px)`.
- **Title 3** (700, 20px, −0.02em): section headers ("Favorites", "Recently opened", "Tags"), with a 15px secondary count trailing on the baseline. Wallet card names use 22px/700.
- **Headline** (600, 17px): navigation bar titles, filled buttons, the menu title.
- **Body** (400, 17px, −0.022em): cell titles, field values, text fields, bar text buttons.
- **Subheadline** (400, 15px, −0.015em): cell subtitles, search tokens, tag pills, category names (600).
- **Footnote** (400, 13px): field labels over values, form labels, helper text, the countdown line.
- **Caption** (500, 12px): vault status, chips, favourite names (400); 11px for the code chip and Wallet field labels.
- **Code** (SF Mono 500, 30px, +0.04em, tabular): the live TOTP code, in system blue.
- **Secret** (SF Mono 400, 17px, tabular): a revealed secret.

### Named Rules
**The Mono Is For Machines Rule.** SF Mono appears only on machine strings: a revealed secret, a one-time code, the number line of a Wallet card, the record ID footnote. Stored usernames, URLs and notes stay in the system face.

**The Dynamic Type Rule.** Sizes come from the iOS text-style ladder (34 / 28 / 22 / 20 / 17 / 15 / 13 / 12 / 11). No in-between sizes.

## Layout

A single column on phones; a split view from 768px, matching iPadOS.

- **Below 768px:** one navigation stack with 16px gutters. First viewport: large title with the avatar button (menu) top right; a 40px search field; a 2 × 2 grid of category tiles (12px gap); Favorites as a four-across app-icon grid; Recently opened as an inset grouped list; tags last, as a horizontally scrolling row. A translucent 49px toolbar is pinned to the bottom: Lock left, vault status centred, New item right. Opening an item pushes it in from the right while the list slides 30% left and dims to 90% brightness; a new item rises as a modal card 10px below the safe area while the page behind scales to 0.94 with 12px corners. An open sheet hides the toolbar.
- **768–1099px:** a 360px navigation column (title, search, tiles, lists, toolbar) with a hairline right edge | the detail pane.
- **1100px and up:** a 320px sidebar (title, search, tiles, tags, toolbar) | the item list on the cell colour, flush-edged with hairline top and bottom, as on iPad | the detail pane. Together the two left columns take 720px.
- **Detail pane:** content centred at a 640px measure with at least 20px gutters; it hosts both the open item and the New item form. With nothing open it shows a centred, greyscale empty state.
- **Rhythm:** 16px gutters and cell insets; section headers 26px above, 8px below; 22px between the item hero, its field group and the "Details & edit" row; 16px between form groups. Cells are at least 60px; every target is at least 44px (36px round buttons carry a 4px invisible halo).
- Safe-area insets are honoured on every fixed bar and sheet.

## Elevation & Depth

Flat by default, layered the iOS way. Cells sit on the grouped background with no shadow; separation comes from tone (cell on grouped background) and hairlines. Translucent material plus backdrop blur marks chrome (toolbar, navigation bars, pinned footers, context menus, the banner). Shadows are reserved for things that float above the page. In dark mode the ambient shadows deepen and gain a faint white hairline ring, and inline cell shadows drop away.

### Shadow Vocabulary
- **Pop** (`0 10px 38px rgba(0,0,0,0.18), 0 0 0 hairline rgba(0,0,0,0.06)`): context menus, the desktop menu form sheet, the banner toast.
- **Wallet card** (`0 1px 1px rgba(0,0,0,0.08), 0 12px 28px rgba(0,0,0,0.22)`): the card face only.
- **Push edge** (`-8px 0 24px rgba(0,0,0,0.12)`): the leading edge of an item pushed in on phones.
- **Segment thumb** (`0 3px 8px rgba(0,0,0,0.12), 0 3px 1px rgba(0,0,0,0.04)`): the selected segment of a segmented control.
- **App icon ring** (`inset 0 0 0 hairline rgba(0,0,0,0.14)`): the edge of a white favicon squircle.

### Named Rules
**The Only Floaters Cast Rule.** A shadow means the element floats over the page (menu, sheet, banner, Wallet card, pushed view). Cells, tiles, fields and buttons never cast.

**The Material Chrome Rule.** Bars and menus are translucent material with `saturate(180%) blur(20px)` (30px for menus, 24px for the banner) and a hairline edge, never an opaque slab.

## Shapes

Continuous-feeling rounded rectangles at Apple's radii, plus circles and capsules. Inset grouped lists, fields, the search field and the detail groups use 10px; tiles, filled buttons and the type-picker tiles 12px; the desktop menu sheet 14px; the Wallet card 16px; phone sheets and the menu 12px on their top corners only. App-icon squircles scale their radius with size (7.5px at 32px, 9px at 36px, 13px at 56px, 16px at 72px, 15px for the 64px sign-in mark). Category glyphs, avatars, round header buttons and banner marks are circles; chips, badges, tag pills, the banner and code chips are capsules. The segmented control is a 9px track with 7px thumbs; the search token 6px. Separators are hairlines (1px, 0.5px on 2x screens), inset 60px past the list icon or 16px in field groups.

## Components

### Buttons
Quiet, tinted and Apple-exact.
- **Shape:** 12px radius for filled buttons (`rounded.lg`), 10px for gray buttons in forms.
- **Filled:** system blue with white 17px/600 text, 50px tall, full width in forms and sign-in. Pressed: `system-blue-pressed`, scale 0.98. Disabled: tertiary fill with tertiary label.
- **Gray:** tertiary fill with a system-blue label (iOS "gray" style); hover steps to the secondary fill; active state takes the blue wash.
- **Bar buttons:** plain system-blue text or glyphs, 44px targets, no chrome; opacity 0.4 while pressed. The confirming action ("Add", "Done") is 600 weight.
- **Glyph buttons:** 44px circles in system blue (copy, reveal), with a quaternary-fill hover and a 0.94 press scale; a copy that succeeded turns green.
- **Round header button:** 36px circle on the tertiary fill with a secondary-label glyph.
- **Action rows:** full-width Settings rows (48px, 17px/400) with a leading glyph; destructive rows are centred red text.

### Chips
- **Code chip:** an 18px secondary-label capsule on the tertiary fill that marks items with a one-time code.
- **Tag pill:** a 34px capsule in the cell colour, 15px label; "More" is plain blue text. Scale 0.95 on press.
- **Badges:** 13px/500 capsules on the tertiary fill; red badges use the red wash.

### Cards / Containers
- **Inset grouped list:** 10px radius, cell background, overflow clipped, a hairline between cells inset 60px (past the icon). Hover washes 4% label into the cell; press 10%. In split view the open item's cell fills system blue with white text and hides its adjoining separators.
- **Category tile:** 80px, 12px radius, cell colour; a 30px colour circle with a white glyph top left, a 26px/700 tabular count top right, the name in 15px/600 secondary label at the foot. The chosen category fills with its colour and inverts the circle. Scale 0.97 on press.
- **Favourites grid:** four columns of 56px app-icon squircles with 12px names and 11px secondary lines, inside one cell-coloured group.
- **Empty state:** a centred cell group with a 64px blue glyph circle, a 22px/700 title, one 15px line and one filled button.

### Inputs / Fields
- **Text field:** borderless, the tertiary fill, 10px radius, 44px min height, 17px text, tertiary-label placeholder. Focus: a 2px system-blue ring.
- **Form groups:** fields inside a cell-coloured group, each a 13px secondary label over a transparent, borderless field, separated by hairlines inset 16px. The label turns blue while its field has focus.
- **Switch:** every checkbox is a 51 × 31 iOS switch: `fill` off, system green on, a white 27px knob that slides on the spring. Radios are 22px circles that fill blue with a cell-colour inner ring.
- **Segmented control:** tertiary-fill track, cell-colour thumb (#636366 in dark) with the segment-thumb shadow, 13px/500 labels, 600 when selected.
- **Type picker:** a 2 × 2 grid of 68px cell tiles; the chosen one gets a 2px inset blue ring and a blue check glyph.
- **Sign-in:** floating-label fields as 60px cells, "Remember me" as a Settings row with a switch, one filled button.

### Navigation
- **Toolbar:** a full-width translucent bar, 49px plus safe area, hairline top edge. Lock (left) and New item (right) as 21px blue glyphs; the vault status centred as caption text with a glyph (secondary label; orange for demo; red for offline). From 768px it spans the sidebar only.
- **Navigation bar (sheets):** thick material, 52px, hairline bottom edge; Back chevron or Cancel left, a 17px/600 centred title, text or ⋯ button right. The ⋯ opens an iOS context menu: blurred menu material, 13px radius, pop shadow, trailing glyphs, the destructive row in red.
- **Search:** the iOS search field (tertiary fill, 10px radius, 40px) with a leading magnifier and trailing glyph buttons. A selected category or tag appears inside the field as a blue search token with a white glyph, while the typed term stays beside it. The filter panel expands inside the same field.
- **Menu:** a Settings-style sheet on the grouped background: an account cell with a 52px monogram avatar, then grouped rows with 29px coloured icon squares (7px radius, white glyph) and trailing chevrons; New item and Sign out stand as their own groups. Bottom sheet on phones; a centred 480px form sheet with the pop shadow from 768px.

### Secret reveal (signature)
A field shows dots and a tertiary eye glyph. A tap (under 300ms) reveals the value in SF Mono for 20 seconds, fading in from a 4px blur; a red footnote line reads "Visible · hides in Ns" with a blue "Hide" action. Holding the dots reveals only while held and hides again on release, with no countdown. A saved password clue is always in view when filled: an inset quaternary-fill strip with an orange lightbulb "Clue" label, read in the system face.

### TOTP code (signature)
The live code in SF Mono 30px/500 system blue, beside a 44px ring that drains around it with the seconds left as a 12px tabular figure. The ring turns red as the code nears rollover.

### Wallet card (signature)
Cards, documents and bank accounts open as a Wallet pass: max 400px wide at a 1.586 aspect, 16px radius, white text on a 155° two-stop gradient picked from a fixed seven-pair palette by a hash of title and type (navy, green, burgundy, violet, teal, graphite, bronze), under a soft top-right radial sheen and a white hairline rim. Top: the item's squircle icon and its subtype. Then the name (22px/700), the masked number in SF Mono at the foot, and a row with the holder name ("Name on card", "Holder" or "Account holder") and expiry. Barcodes and QR codes follow on a white plate.

### Banner toast
An iOS banner that drops from the top at every size: a 56px blurred capsule (28px radius) with the pop shadow, a 34px round mark (green success, red danger, orange warning, or the item's favicon squircle), a 15px/600 title over a 13px secondary line, and a close glyph.

### Motion
One curve, the iOS spring approximated as `cubic-bezier(0.32, 0.72, 0, 1)`: 0.5s for pushes, modal cards and sheets, 0.4s for scrims, 0.2–0.25s for presses and switches. Presses scale (0.94–0.98). Everything collapses to near zero under `prefers-reduced-motion`.

## Do's and Don'ts

### Do:
- **Do** put every list in an inset grouped group (10px radius, cell colour) on the grouped background, with hairline separators inset past the leading icon.
- **Do** use the text-safe system colours for anything that carries text (#0071e3, #d70015, #248a3d, #c93400, secondary label #6c6c70), and the iOS dark values under `prefers-color-scheme: dark`.
- **Do** set type from the iOS text-style ladder in the system font; reserve SF Mono for revealed secrets, one-time codes, Wallet card numbers and record IDs.
- **Do** keep every target at 44px or more, extending 36px circles with an invisible halo.
- **Do** show secrets as dots with an eye glyph; tap reveals for 20s with a red "Visible · hides in Ns" line, hold reveals only while held.
- **Do** keep a filled password clue always visible.
- **Do** present a selected category or tag as a blue search token inside the search field, keeping the typed term.
- **Do** render cards, documents and bank accounts as Wallet card faces from the fixed gradient palette, showing the holder name.
- **Do** push items in from the right on phones and raise New item as a modal card; show both in the detail pane from 768px.
- **Do** animate with `cubic-bezier(0.32, 0.72, 0, 1)` and honour reduced motion.

### Don't:
- **Don't** introduce a second tint; blue is the only interactive colour.
- **Don't** use red for anything but revealed, destructive, error or offline.
- **Don't** cast shadows from cells, tiles, fields or buttons; only floating layers (menus, sheets, banner, Wallet card, pushed view) cast.
- **Don't** draw borders around text fields or cells; fields are fills, groups are tone plus hairlines.
- **Don't** make chrome opaque; bars and menus are blurred material with a hairline edge.
- **Don't** use the quaternary label for text; it is for chevrons and disclosure glyphs only.
- **Don't** set stored values (usernames, URLs, notes) in mono.
