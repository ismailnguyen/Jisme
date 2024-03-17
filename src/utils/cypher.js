export function encrypt(decrypted, token)
{
	let masterpass = sha256(token)
	return sjcl.encrypt(masterpass, decrypted)
}

export function decrypt(encrypted, token)
{
	let masterpass = sha256(token)
	return sjcl.decrypt(masterpass, encrypted)
}

export function encryptionKey(publicKey)
{
	return `${publicKey}`
	//return `${publicKey}${import.meta.env.VITE_PRIVATE_ENCRYPTION_KEY}`
}