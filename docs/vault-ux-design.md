# Vault UX + API wiring (P2)

Builds on `docs/vault-key-design.md` (unlock phrase, PBKDF2 + AES-256-GCM envelopes).
Code: `src/utils/vaultBlob.js`, `src/services/VaultService.js`, `src/store/vault.js`,
`src/components/VaultUnlockPanel.vue`. Tests: `tests/vaultApi.test.js`.

## Flag status

Everything sits behind `VAULT_UNLOCK_KEY_ENABLED` (`src/utils/secrets.js`), which still defaults to **false**.
With the flag off, the panel never renders, the auto-load watch does nothing and every store method throws `VaultDisabledError`.

## Flows

- **Sign-in to unlock prompt.** When the signed-in owner becomes truthy (`isLoggedIn && user.uuid`), the account is not demo and no local verifier exists, the store calls `loadFromServer()`. This happens once per sign-in and runs fire-and-forget.
  - `GET /vaults/primary` with 200: the blob is decoded and imported **locked** as this owner's vault. `VaultUnlockPanel` then shows "Vault locked" and `unlock(phrase)` derives the key locally.
  - 404: there is no server vault (`hasServerVault=false`, `serverRevision=null`, no error).
  - Other status, network failure or malformed blob: `syncError` is set and nothing throws.
  - If the local verifier matches the server check, local records win and server-only ids are added. A different check goes through `importVault`, which locks.
- **Push on demand.** `pushToServer()` requires an unlocked vault, otherwise it throws `VaultLockedError` before any request is made. It sends `PUT /vaults/primary {expectedRevision: serverRevision ?? 0, envelope}`. On 200/201 it stores `serverRevision` and sets `hasServerVault`. The "Retry sync" button in the panel calls it again.
- **No network** in `setup`, `unlock`, `put`, `get`, `lock` or `forget`. `forget()` also resets the local sync refs.

## Blob format (`vaultId` is always `primary`)

```
API envelope  { v: 1, ct: base64url(UTF-8 JSON(blob)) }        // unpadded, -_ alphabet; decode accepts padding
blob          { version: 1, check: <envelope v1>, records: { <id>: <envelope v1>, ... } }
envelope v1   { version: 1, alg: 'PBKDF2-SHA256/AES-256-GCM',
                params: { kdf, hash, iterations, salt }, nonce, ciphertext }   // AAD binds usage + params
```

- `check` is the local `verifier`. The owner is left out because the API knows it from the bearer token.
- Decoding rejects (with `VaultEnvelopeError`) when:
  - `v` is not 1, `ct` is not a string, or `ct` is not valid base64url;
  - the payload is not UTF-8 JSON, or `blob.version` is not 1;
  - `check` is not an envelope-shaped object (`version===1`, `params` object);
  - `records` is not a plain object of envelopes, or any field matches `/prf/i`.

## Optimistic concurrency and merge

- `expectedRevision: 0` means create-only. `n` means replace only if the server is still at `n`.
- On **409** there is exactly **one** retry:
  1. Re-`GET` the vault. If the server `check` differs from the local verifier (compared key-order-independently), set `syncError` to "…unlocked with a different phrase." and stop. A vault sealed under another key is never overwritten.
  2. Otherwise merge with `records = { ...serverRecords, ...localRecords }`. Server-only ids are kept as opaque envelopes and **local wins** on the same id. Nothing is decrypted to merge.
  3. Re-export and `PUT` with `expectedRevision` set to the refetched revision, falling back to the 409 body's `currentRevision`.
  4. Any failure of that retry, including another 409, sets `syncError` to "Vault sync conflict; …" and stops, so the client never loops. Local changes stay on the device.

## 401 fresh sign-in

- The API needs `auth_time < 300s` to replace an existing vault (creating one is exempt).
- `isFreshSignInRequired(err)` returns true for status 401 when:
  - the body is empty or not a JSON object, or
  - any of `message`/`error`/`reason`/`detail` matches `/fresh|re-?auth|sign.?in/i`.
- Any other 401 (for example "Session expired") is a generic sync error, and `needsFreshSignIn` stays false.
- When the flag is set, the panel asks the user to re-enter their account password. `retryPushAfterFreshSignIn(pw)` calls `userStore.verifyPassword({password})`, which refreshes the session. If that throws, the error is rethrown to the UI. If it succeeds, the store clears the flag and calls `pushToServer()` once more.

## Security invariants

- The phrase, the derived `CryptoKey` and PRF outputs never leave the device. Outbound bodies hold only `{expectedRevision, envelope}`.
- `assertApiSafe` runs on the blob before encoding, on the decoded blob, and on every PUT body. It rejects `/prf/i` keys and non-JSON values (such as a `CryptoKey`).
- The tests wrap every mocked request and check that the body contains no phrase, no plaintext and no `/prf/i` keys, either in the body or inside the decoded `ct`.
- Epoch guards: after each await, a push checks that the store has not locked or unlocked meanwhile (`started === epoch`) and that `signedInOwner()` is still the same user. If either changed, the push is discarded silently and `syncError` is not set. A load is discarded on sign-out, an account switch or `forget()`.
- The panel holds the phrase and password only in component-local state, clears them after each attempt and never logs them.

## Out of scope

- PRF/passkey-derived unlock and passkey wrapping.
- Recovery (lost phrase), phrase rotation and re-keying.
- `DELETE /vaults/:id`.
- Setup UI (creating a phrase from the app); `setup()` exists only in the store.
- Background or automatic sync after `put()`, offline queueing and multi-tab coordination.
- Full UX polish: copy, styling, a11y review, i18n.
