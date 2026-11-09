# Vault unlock key — option A (client-controlled phrase)

Status: implemented behind `VAULT_UNLOCK_KEY_ENABLED = false` (`src/utils/secrets.js`).
Production behaviour is unchanged until the API vault endpoints land.

## Goal
A vault unlock **phrase**, distinct from the login password, that never leaves the
device. It is stretched into an AES-GCM key that seals vault data in versioned
envelopes. The server only ever sees ciphertext and public KDF parameters.

## Key derivation (`src/utils/vaultKey.js`)
- Phrase is NFKC-normalised and must be at least 12 characters. It must differ from the login password,
  which `vault.setup()` **requires** (`loginPassword` is mandatory). The comparison is made on a
  folded form (NFKC + case fold + trim), so `Password…`, `password… ` and full-width variants count as
  equal. The folded form is used only for this comparison, never as key material.
- PBKDF2-HMAC-SHA-256, 16-byte random salt, default 600 000 iterations.
  Bounds are enforced on derive **and** on open: `100 000 ≤ iterations ≤ 2 000 000`,
  salt exactly 16 bytes. Stops downgrade (tiny counts) and CPU-DoS (huge counts) from
  tampered params.
- PBKDF2 salt is domain-separated: `"jisme/vault-key/v1" || salt`.
- Output: non-extractable `CryptoKey` (AES-GCM 256, `encrypt`/`decrypt` only). The raw
  key never exists as JS bytes.

## Envelope v1
```json
{ "version": 1, "alg": "PBKDF2-SHA256/AES-256-GCM",
  "params": { "kdf": "PBKDF2", "hash": "SHA-256", "iterations": 600000, "salt": "<b64>" },
  "nonce": "<b64, 12 bytes>", "ciphertext": "<b64, includes GCM tag>" }
```
- Fresh random 96-bit nonce per seal; one key seals at most a few thousand records, far
  below the random-nonce limit.
- AAD = UTF-8 of `JSON.stringify(["jisme/vault", 1, alg, usage, kdf, hash, iterations, salt])`
  (JSON array: unambiguous even if a usage contains separators). The **usage** is
  given by the caller and is not stored in the envelope, so an envelope sealed for one
  purpose fails to open under another. Params in the AAD make tampering detectable even
  before the KDF mismatch.
- Usage labels are JSON arrays themselves (`vaultUsage()`): `["vault-check", owner]` and
  `["record", owner, id]`. The earlier `record:<owner>:<id>` concatenation was ambiguous:
  owner `a` with id `b:c` gave the same label as owner `a:b` with id `c`. Wrapping that label
  in the JSON-array AAD did not remove the ambiguity, because the collision already existed
  inside the usage string. It was unreachable in practice (the key is per owner), but the
  format is now injective.
- Unknown version/alg, bad nonce length, out-of-bounds params, malformed base64,
  WebCrypto import/derive errors, or GCM auth failure all raise one generic
  `VaultEnvelopeError`, with no oracle about which check failed. This holds for
  `deriveVaultKey` (the whole unlock path) as well as `openEnvelope`.
- Payload hygiene: `assertApiSafe()` rejects any field matching `/prf/i` and any
  non-JSON value (CryptoKey, ArrayBuffer). The API rejects PRF material, and nothing PRF-related is produced.

## Store lifecycle (`src/store/vault.js`, `useVaultStore`)
- `setup(phrase, { loginPassword })` → new params, derives the key and seals a **verifier**
  (`usage = ["vault-check", owner]`). Only one setup can be in flight at a time; a concurrent call
  is rejected. Installing the key bumps the epoch, so any in-flight `put`/`get` still holding an
  older key is discarded and can never write a record under an orphaned key. If a lock,
  owner switch or `importVault` happens during setup, that setup is rejected rather than
  overwriting the state.
- `unlock(phrase)` → re-derives using the verifier's params and opens the verifier; a wrong phrase fails and leaves the store locked.
  Only the owner who set up the vault can unlock it.
- `put(id, value)` / `get(id)` → seal/open JSON records (`usage = ["record", owner, id]`)
  in an in-memory ciphertext map. That map stands in for the future API vault. Lookups use own
  keys only, so ids such as `toString` or `constructor` behave like any other id.
- `lock()` → forgets the key synchronously. Ciphertext and verifier stay, so
  `unlock(phrase)` restores the in-memory vault.
- `forget()` → wipes key, verifier and ciphertext (full sign-out, or a different owner).
- Integration: `userStore.signOut` (and so `lock`, auto-lock, session expiry) calls
  `vault.lock()` in the synchronous revocation block, before any await or modal.
  A non-preserving sign-out calls `forget()`. A watch on the user owner forgets the vault when a
  different account signs in.
- Flag OFF: every mutating call throws `VaultDisabledError`, and nothing is derived or stored.

## Threat model notes
- **Usage-label ambiguity (fixed):** see Envelope v1. Labels are JSON arrays, so no choice of
  owner or id can collide with another (owner, id) pair or with the `vault-check` purpose.
- **Rollback / replay (open, accepted for P1):** the AAD binds owner, purpose and id, but no
  revision. A malicious server could replay an older ciphertext for the same id, drop
  records, or (once phrase change exists) restore an old verifier. Before the API lands, add a
  per-record revision to the AAD plus a MACed manifest.
- **Phrase in memory:** only the encoded phrase bytes are zeroed after derivation; JS strings
  cannot be wiped.

## Out of scope / next increments
- Persisting verifier and envelopes through API vault endpoints, and migrating existing
  sjcl-encrypted accounts.
- UI for setting up, unlocking and changing the phrase. Sealing the unsaved-edit outbox on auto-lock, so drafts
  survive a lock instead of being discarded.
- Argon2id: there is no WebCrypto support and the brief forbids new dependencies. PBKDF2 is the bounded fallback.
