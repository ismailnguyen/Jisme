import { encrypt, decrypt } from './cypher'
import Account from '../models/Account'

export function parseAccount(account) {
    return new Account(
        account._id,
        account.platform,
        account.icon,
        account.login,
        account.password,
        account.password_clue,
        account.tags,
        account.created_date,
		account.social_login,
		account.notes,
        account.last_modified_date,
        account.last_opened_date,
        account.opened_count,
        account.type,
        account.card_number,
        account.card_name,
        account.card_pin,
        account.card_expiracy,
        account.card_cryptogram,
        account.totp_secret
    );
}

const cryptedArgs = [
	'platform',
    'icon',
	'login',
	'password',
	'password_clue',
	'tags',
	'social_login',
	'notes',
    'card_number',
    'card_pin',
    'card_expiracy',
    'card_cryptogram',
    'card_number',
    'totp_secret'
];

export function getEncryptedAccount (account, token) {
    let encryptedAccount = JSON.parse(JSON.stringify(account)); // Clone object without reference
	
    cryptedArgs
    .filter(cryptedArg => account[cryptedArg])
    .forEach(cryptedArg => encryptedAccount[cryptedArg] = encrypt(account[cryptedArg], token))

    return encryptedAccount;
}

export function getDecryptedAccount (account, token) {
    let decryptedAccount = JSON.parse(JSON.stringify(account)); // Clone object without reference

        cryptedArgs
        .filter(cryptedArg => account[cryptedArg])
        .forEach(cryptedArg => decryptedAccount[cryptedArg] = decrypt(account[cryptedArg], token))
    

    return decryptedAccount;
}
