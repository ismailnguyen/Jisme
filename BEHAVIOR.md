# Behaviour contract — Jisme

What must not change, from the user's point of view. Every line is covered by
a named test; a task that would require breaking a line stops and raises the
question to the human. Editing this file is a human decision.

## Session

1. Reloading the page keeps the user signed in: the session is cached locally
   after sign-in. — `tests/storage.test.js`
2. Auto-login runs when the sign-in screen mounts, when it is enabled and an
   email is remembered. — `src/views/login/RequestLogin.vue`
3. Signing out clears the cache; locking keeps it. No native dialog (confirm,
   alert, beforeunload) interrupts either action. —
   `tests/storage.test.js`, `tests/safeguards.test.js`, `tests/accounts.test.js`

## Passkeys

4. One biometric prompt per action: sign in, enroll. No second WebAuthn
   ceremony follows the first. — `tests/passkeyComponents.test.js`,
   `tests/webauthn.test.js`
5. The password form never starts the passkey ceremony on its own; "Sign in
   with passkey" is an explicit choice. — `tests/passkeyComponents.test.js`
6. WebAuthn options reach the browser exactly as the server issued them; no
   transport is injected. — `tests/webauthn.test.js`
7. Adding a passkey asks for a name through `prompt`; deleting asks for a
   confirmation, then the current password. — `tests/passkeyComponents.test.js`
8. A passkey the server refuses (403) lets the user sign in with the password,
   shows the server's reason, and lands on Home. —
   `tests/passkeys.test.js`, `tests/passkeyComponents.test.js`

## Settings

9. "Confirm changes" in Security closes the menu after a successful save and
   shows the waiting state inside the button itself, never a page loader. —
   `tests/settings-security.test.js`

## Out of scope while `VAULT_UNLOCK_KEY_ENABLED` is `false`

10. The encrypted vault (`vault` store, `VaultUnlockPanel`) stays dormant and
    absent from Home. Any task that enables it is a human decision.
