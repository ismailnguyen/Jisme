import { sha256 } from 'js-sha256';
import {
	encrypt as sjclEncrypt,
	decrypt as sjclDecrypt,
} from 'sjcl';

export function encrypt(decrypted, token) {
	let masterpass = sha256(token);
	return sjclEncrypt(masterpass, decrypted);
}

export function decrypt(encrypted, token) {
	let masterpass = sha256(token);
	return sjclDecrypt(masterpass, encrypted);
}
