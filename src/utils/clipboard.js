// Copy text to the clipboard and report whether it actually worked.
// navigator.clipboard needs a secure context and a user gesture; the textarea
// fallback covers older WebViews. Never log or return the copied value.
export async function copyText (text) {
	if (text === undefined || text === null || text === '') {
		return false;
	}

	const value = String(text);

	if (navigator.clipboard && window.isSecureContext) {
		try {
			await navigator.clipboard.writeText(value);
			return true;
		}
		catch (error) {
			// fall through to the legacy path
		}
	}

	const textarea = document.createElement('textarea');
	textarea.value = value;
	textarea.setAttribute('readonly', '');
	textarea.setAttribute('aria-hidden', 'true');
	textarea.style.position = 'fixed';
	textarea.style.top = '-1000px';
	textarea.style.opacity = '0';
	document.body.appendChild(textarea);
	textarea.select();
	textarea.setSelectionRange(0, value.length);

	let isCopied = false;
	try {
		isCopied = document.execCommand('copy');
	}
	catch (error) {
		isCopied = false;
	}

	document.body.removeChild(textarea);
	window.getSelection()?.removeAllRanges();

	return isCopied;
}
