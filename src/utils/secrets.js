// Masked rendering for secrets shown at rest.
// The mask never reveals the secret's length: it is a fixed run of dots,
// optionally followed by the last characters for recognition (card numbers, IBANs).
const MASK = '••••••••';

export function maskSecret (value, visibleTail = 0) {
	if (!value) {
		return '';
	}

	const compact = String(value).replace(/\s+/g, '');

	if (!visibleTail || compact.length <= visibleTail + 2) {
		return MASK;
	}

	return `${ MASK.slice(0, 4) } ${ compact.slice(-visibleTail) }`;
}

// How long a revealed secret stays visible before it hides itself again.
export const REVEAL_DURATION_MS = 20000;

// Lock the vault after this long in the background or without interaction.
export const AUTO_LOCK_BACKGROUND_MS = 5 * 60 * 1000;
export const AUTO_LOCK_IDLE_MS = 10 * 60 * 1000;
