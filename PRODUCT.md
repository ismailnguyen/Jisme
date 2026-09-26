# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The general public: anyone who wants one trustworthy place for their secrets. Mostly used on a phone as an installed PWA, often one-handed and in public (at a checkout, a login screen on another device, a Wi-Fi prompt), where the job is to find an item and copy or show one secret in seconds without exposing it to people nearby. Account creation and editing happen less often and are more deliberate.

## Product Purpose

Jisme is an open-source, client-side-encrypted password manager and wallet. Success means a person trusts it enough to put every secret in it, and can get the right one out quickly, safely and even offline.

## Positioning

- **Open source, nothing hidden:** the whole codebase is public and the server only ever stores encrypted data (zero-knowledge, SJCL AES, PBKDF2).
- **Password-less derivation:** a password can be generated on the device from site, login and master password, and never stored at all.
- **Everything in one wallet:** logins, payment/loyalty/gift cards (with full-screen barcodes), IDs and passports, IBAN/SWIFT, Wi-Fi, secret keys and TOTP codes in one place.
- **Offline first:** everything works without a connection; changes queue locally and sync when back online.

## Operating Context

- Installed PWA on iOS and Android (standalone display, `viewport-fit=cover`), plus desktop browsers.
- Sign-in is a two-step flow: identify with an email, then passkey (WebAuthn), password, or TOTP depending on the account.
- Main flow: search or browse (types, tags, favorites, recents), open an item, copy or reveal a field, sometimes show a barcode full screen.
- Backend: Jisme-Api (Express), with a mock mode for local development.

## Capabilities and Constraints

- Vue 3, Pinia, Vue Router, Vite, vite-plugin-pwa; LocalForage/IndexedDB for the local store.
- Item types: `account` (login, wifi, secret key), `card` (payment, loyalty, gift), `document` (ID, passport), `bank` (IBAN, SWIFT).
- Secrets are decrypted client-side; they must never appear in logs, toasts, or third-party requests.
- Registration is currently by request ("Request an access"); public sign-up is the intended direction.

## Brand Commitments

- Keep the **Jisme** name and the existing logo/app icons (`public/images/icons/`) as they are.
- Everything else about the visual world is open to replacement.

## Evidence on Hand

- Public source on GitHub (github.com/ismailnguyen/Jisme).
- No testimonials, user counts, audits, or security certifications exist; do not invent them.

## Product Principles

1. **Assume someone is watching the screen.** Secrets are hidden until deliberately revealed, and re-hide themselves.
2. **Copy before edit.** On a phone, getting a secret out beats changing it; editing is a deliberate, separate mode.
3. **Show the vault's state.** Locked, unlocked, offline and syncing are always visible, never inferred.
4. **Prove trust, don't claim it.** Point to the open code and on-device crypto rather than slogans.
5. **Work anywhere.** Offline, one-handed, small screen, poor light.

## Accessibility & Inclusion

WCAG 2.2 AA: pinch-zoom allowed, 44px touch targets, full keyboard and screen-reader operation, reduced-motion respected.
