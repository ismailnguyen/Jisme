# Vault recovery design (recovery code, phrase reset, anti-downgrade)

Branch: `factory/security-vault-ux`. Flag: `VAULT_UNLOCK_KEY_ENABLED` (still default `false`).
Companion docs: `docs/vault-key-design.md` (envelope/KDF), `docs/vault-ux-design.md` (sync).

## 1. Threat model and goal

The vault key never leaves the client, so the API cannot reset a forgotten phrase. The recovery
code is a **second, independent secret** that can re-derive the AES-256-GCM vault key **without
the phrase**, enabling a phrase reset. Consequences:

- The recovery code is generated on-device and shown to the user exactly once; it is never
  stored (not even client-side) and never sent to the API (asserted in tests on every fetch
  body, including inside the base64url `ct`).
- Losing BOTH the phrase and the code means the vault is unrecoverable. The setup UI states
  this before the code can be dismissed.
- The code is high-entropy (24 random bytes, base64url, 32 chars), so unlike a phrase it
  cannot be guessed; PBKDF2 still runs on it with the same bounds as the phrase.

## 2. Recovery wrapping (exact scheme)

At setup (and at every re-seal / phrase reset), with `owner` = the signed-in user's uuid:

1. `phraseParams = createVaultParams()` — `{kdf:'PBKDF2', hash:'SHA-256', iterations, salt}`
   (salt 16 B, iterations within 100k–2M, default 600k).
2. `rawKey = deriveVaultKeyRaw(phrase, phraseParams)` — PBKDF2-SHA256 over the domain-separated
   salt `('jisme/vault-key/v1' || salt)`, 256 bits. `deriveVaultKey(phrase, params)` is exactly
   `importVaultKey(rawKey)` — same key by construction; the raw bytes are zeroized after use.
3. `check = sealEnvelope(key, phraseParams, 'jisme-vault-ok', vaultUsage('vault-check', owner))`
   — the verifier, unchanged from v1.
4. `recoveryCode = generateRecoveryCode()` — base64url of 24 random bytes.
5. `recoveryParams = createVaultParams()` — an independent second salt (same iteration bounds).
6. `recoveryKey = deriveVaultKey(recoveryCode, recoveryParams)`.
7. **Recovery envelope** = `sealEnvelope(recoveryKey, recoveryParams,
   JSON.stringify({ key: base64(rawKey /* 32 bytes */), params: phraseParams }),
   vaultUsage('vault-recovery', owner))` — stored in the vault blob as `recovery`.

The recovery envelope is a standard v1 envelope (AAD binds `vault-recovery`, owner and all
public params), so it cannot be swapped between vaults or owners.

### Unlock with the recovery code

`unlockWithRecovery(code)`: derive `recoveryKey` from the envelope's public params, open the
envelope, require the payload's `params` to equal the check verifier's params (canonical
comparison), import the wrapped `key` and confirm it by opening `check` (must yield
`'jisme-vault-ok'`). The vault is then unlocked with the original key and `needsPhraseReset`
is set — the UI forces a phrase reset before normal use. Every failure (wrong code, tampered
payload, junk key material) is the uniform `VaultEnvelopeError`; a missing recovery envelope
(legacy vault) is a `VaultLockedError` state error.

### Phrase reset / re-seal

`resetPhrase(newPhrase, {loginPassword, iterations})` (requires the vault to be unlocked, by
phrase or code): every record envelope is decrypted with the active key and re-sealed under a
key freshly derived from `newPhrase` + new params; a NEW recovery code wraps the new key (a
new recovery envelope replaces the old one). The old phrase and old recovery code stop
working. Returns the new recovery code, shown exactly once. Enforces the same phrase policy
as setup (min 12 chars, must differ from the login password) and the anti-downgrade floor.

## 3. Blob format (v2) — no API contract change

The recovery envelope rides inside the same `ct` blob; the API envelope stays `{v:1, ct}` and
`assertApiSafe` still rejects anything named `/prf/i` or non-JSON, so **no API change is
needed**. Blob version is bumped to 2 to make the optional field explicit:

- v2: `{ version: 2, check, recovery?, records }` — `recovery` present for every vault created
  or re-sealed by a recovery-capable client; omitted when unknown.
- v1: `{ version: 1, check, records }` — still decoded (legacy vaults); a v1 blob carrying a
  `recovery` field is rejected, as is a v2 blob with a malformed `recovery`.

## 4. Anti-downgrade (client-side parameter policy)

The client pins the KDF params it seals with (`pinnedIterations`): set at `setup()` and
`resetPhrase()`, defaulting to 600k iterations when nothing is pinned. Policy:

- **Sealing floor** — `put()` refuses (uniform `VaultEnvelopeError`) and flags
  `needsReseal` whenever `verifier.params.iterations < (pinned ?? 600k)`. Reading and
  unlocking a weak vault remain possible (data must stay accessible).
- **Server load, pinned client** — `loadFromServer()` refuses a server vault whose
  `check.params.iterations < pinned` outright: nothing is imported, `needsReseal` is set and
  a re-seal message is surfaced (`syncError`). This is the downgrade-attack case: a client
  that sealed at 600k will not silently consume a weakened vault.
- **Server load, unpinned client** (new device, legacy vault) — the vault is accepted
  (imported, locked) but flagged `needsReseal` when its params are below the default; the UI
  asks for a re-seal, which is exactly `resetPhrase` at ≥ default params followed by a push.
- `resetPhrase` refuses to re-seal below the floor (`RangeError`).
- The pin is store-instance state (per session); it survives `forget()` within the instance
  but not page reloads. A cross-session pin would need a trusted local store and is an open
  question.

## 5. UI (VaultUnlockPanel.vue, behind the same flag)

- **Setup** (when no vault exists): new phrase (min 12) + confirm + the login password (used
  only locally, to enforce that the phrase differs from it). On success the recovery code is
  revealed once with a copy button, the loss warning ("if you lose both the phrase and the
  code, the vault is unrecoverable") and an "I saved it" checkbox — the only way to dismiss.
- **Unlock** gains a "Forgot the phrase?" link (only when the vault has a recovery envelope).
  Entering the code unlocks and immediately forces the reset form.
- **Phrase reset**: new phrase + confirm + login password → `resetPhrase` → the NEW recovery
  code is shown once (same dismissal flow) → the re-sealed vault is pushed to the server.
- **Re-seal banner**: `needsReseal` while locked asks the user to unlock and set a new phrase;
  while unlocked the reset form is shown directly.

## 6. Test coverage and limitations

`tests/vaultRecovery.test.js` (13 tests, real WebCrypto, fetch mocked, flag forced on):
code generation entropy/uniqueness; raw-key/import equivalence; recovery wrap/unwrap roundtrip
and wrong-code/tamper failures; one-time code (never in store state); `unlockWithRecovery`
(incl. wrong code, tampered payload, legacy vaults without recovery); phrase reset end-to-end
(old phrase fails, new phrase + new code work); recovery code/phrase/secret never in any
request body (decoded `ct` included); v1 blob back-compat; anti-downgrade accept-and-flag +
refuse-and-re-seal paths; reset floor.

Limitations: the component is NOT mounted in tests (node environment, no jsdom) — the setup
and reset UIs are covered at the store level only; component-mount tests are future work.
