# Passkey UX: management, sign-in, vault unlock (PRF), recovery code

Front-end side of the passkey security feature. Companion of `vault-ux-design.md` and
`vault-recovery-design.md`.

## Modules

| Module | Role |
| --- | --- |
| `src/utils/webauthn.js` | Thin wrapper over `@simplewebauthn/browser`. The only place that touches `navigator.credentials`. Strips extension results (PRF) from anything returned for the API. |
| `src/utils/vaultPasskey.js` | Pure PRF crypto: HKDF derivation, passkey wrap seal/open, wrap validation. |
| `src/utils/apiError.js` | `ApiError` keeps `{ error: { message, reason } }`. `errorText()` shows the reason first. `isPasskeyReenrollmentRequired()`. |
| `src/services/PasskeyService.js` | Endpoints below. Bodies go through `assertApiSafe` (no `/prf/i` key can be sent). |
| `src/store/passkeys.js` | Settings state: list, enroll, delete with password, recovery code (memory only). |
| `src/store/user.js` | `verifyPasskey()` against a server challenge, `loginNotice`, `canUsePasskeyLogin`. |
| `src/store/vault.js` | `enablePasskeyUnlock(phrase)`, `unlockWithPasskey()`, `disablePasskeyUnlock(id)`, vault token. |
| `PasskeyManager.vue`, `RecoveryCodeSettings.vue`, `RecoveryCodeReveal.vue` | Settings → Security UI. The reveal is shared with `VaultUnlockPanel`. |

## API contract used

| # | Call | Body | Success |
| --- | --- | --- | --- |
| 1 | `POST users/passkeys/options` | `{}` | creation options JSON (`challenge`, `user`, `rp`, …) |
| 2 | `POST users/passkeys` | `{ name, response }` | `201 { credential: { id, name, createdAt, verified } }` |
| 3 | `POST users/login/passkey` | `{ passkey: assertion }` (field name kept from the legacy endpoint) | `200` login body |
| 4 | `DELETE users/passkeys/:id` | `{ password }` | `2xx` |
| 5 | `POST vaults/unlock/passkey` | `{ assertion }` (never the PRF output) | `{ token, expiresIn (s) \| expiresAt }` |
| 6 | `POST users/recovery` | `{}` | `{ code }` (or `{ recoveryCode }`) |

**Assumptions to confirm with the API team.** The spec gives no challenge source for 3 and 5, so the
client calls:

- `POST users/login/passkey/options`. If `requestLogin` already returns `next.passkeyOptions`, those are used instead and no extra call is made.
- `POST vaults/unlock/passkey/options` → request options JSON with a server challenge.

The passkey list is read from `user.passkeys` (`GET users`) as `{ id, name, createdAt, verified }`.
The legacy shape `{ deviceName, passkey: { id } }` is shown as "Re-enrollment required".

Errors: every non-2xx response becomes `ApiError(status, { message, reason })`. The UI shows `reason`,
then `message`, then a flow-specific fallback. It never shows a generic "Not authorized!".

## Sign-in fallback

The account is offered "Sign in with passkey" when `next.step === 'verify_passkey'`,
`next.passkey === true`, or any `user.passkeys[].verified`. If the server answers
`403 { reason: /re-?enrol/ }`:

- the store sets `loginNotice` to the reason;
- the pre-auth session is kept;
- `VerifyPasskey` routes to `VerifyPassword`, which shows the notice and hides the passkey button.

## Vault unlock with PRF

```
wrapKey = HKDF-SHA-256(ikm = PRF output (≥32 bytes), salt = wrap.salt (32 random bytes),
                       info = JSON["jisme/vault-passkey/v1", owner, credentialId]) → AES-256-GCM, non-extractable
wrap    = { version: 1, alg: "HKDF-SHA256/AES-256-GCM", credentialId, salt, nonce, ciphertext }   (base64url)
AAD     = JSON["jisme/vault", "passkey-wrap", version, alg, owner, credentialId, salt]
payload = JSON { key: base64(raw 32-byte vault key), params }   (same payload as the recovery envelope)
```

- `wrap.salt` is also the PRF eval input. On unlock, `evalByCredential` maps each wrapped credential to its salt.
- Wraps live in the vault blob as an optional `passkeys` **array**. It is omitted when empty, so existing blobs are unchanged. Credential ids are never object keys, because a random id could contain "prf" and `assertApiSafe` would reject it.
- **Enable**: the phrase re-derives the raw key, which is checked against the verifier. A PRF ceremony then runs with a local challenge; the assertion is discarded and only the PRF output is used. The raw key is sealed and the wrap added (one per credential). Settings pushes the vault when it is unlocked.
- **Unlock**: the client gets server options, then runs the PRF ceremony. It opens the wrap locally, checks the params and verifier, then posts the assertion only. The server's short-TTL vault token is then preferred by `loadFromServer`/`pushToServer` until it expires or the vault locks.
- PRF output and raw key bytes are zeroized after use. Every crypto failure is the uniform `VaultEnvelopeError`.
- `resetPhrase` drops all wraps, because they sealed the previous key. Passkey unlock must be re-enabled.
- Phrase unlock and recovery-code unlock remain available.

## Recovery code (Settings)

`POST users/recovery` returns a server-issued, one-time **account** recovery code. It is shown once,
with copy, a warning and a confirm-copy checkbox gating "Done". It is held in memory only and cleared
on dismiss.

It is deliberately **not** used as the vault recovery key. A code the server knows would let the
server unwrap the vault key from the blob it stores, breaking the client-held-key model. The vault
recovery code stays client-generated (`vault-recovery-design.md`). What the two flows share is the
one-time display (`RecoveryCodeReveal`).

## Strings

The app has no locale files; all UI strings are inline English. New strings follow that convention.
