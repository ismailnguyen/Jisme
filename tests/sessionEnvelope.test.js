import { test, expect } from 'vitest';
import { sealSessionEnvelope, openSessionEnvelope, deriveSessionWrapBits, SessionEnvelopeError } from '../src/utils/sessionEnvelope';
import { derivePasskeyWrapBits } from '../src/utils/vaultPasskey';
const prf = new Uint8Array(32).fill(7);
const owner = 'alice@example.invalid';
const user = { uuid: 'alice', email: owner, token: 'secret', tokenExpiry: new Date(Date.now() + 86400000).toISOString(), passkeys: [] };
test('full user roundtrip and domain separation', async () => {
    const envelope = await sealSessionEnvelope(user, prf, { owner, credentialId: 'Y3JlZA' });
    expect(await openSessionEnvelope(prf, envelope, owner)).toEqual(user);
    expect(JSON.stringify(envelope)).not.toContain('secret');
    const context = { owner, ...envelope };
    expect(await deriveSessionWrapBits(prf, context)).not.toEqual(await derivePasskeyWrapBits(prf, context));
});
test.each(['credentialId', 'salt', 'tokenExpiry', 'version', 'owner', 'sealedAt', 'nonce', 'ciphertext'])('rejects tampered %s uniformly', async field => {
    const envelope = await sealSessionEnvelope(user, prf, { owner, credentialId: 'Y3JlZA' });
    if (field !== 'owner') envelope[field] = field === 'version' ? 2 : field === 'tokenExpiry' ? '2099-01-01' : 'AAAA';
    const error = await openSessionEnvelope(prf, envelope, field === 'owner' ? 'other' : owner).catch(e => e);
    expect(error).toBeInstanceOf(SessionEnvelopeError);
    expect(error.message).toBe('Session could not be resumed.');
});
