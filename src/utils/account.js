import { encrypt, decrypt } from './cypher'
import Account from '../models/Account'

export function parseAccount(account) {
    return new Account({
        id: account._id,
        label:account.label,
        platform: account.platform,
        icon: account.icon,
        login: account.login,
        password: account.password,
        is_password_less: account.is_password_less,
        password_clue: account.password_clue,
        tags: account.tags,
        created_date: account.created_date,
		social_login: account.social_login,
		description: account.description,
		notes: account.notes,
        last_modified_date: account.last_modified_date,
        last_opened_date: account.last_opened_date,
        opened_count: account.opened_count,
        type: account.type,
        subtype: account.subtype,
        card_number: account.card_number,
        card_name: account.card_name,
        card_expiracy: account.card_expiracy,
        card_issue_date: account.card_issue_date,
        card_cryptogram: account.card_cryptogram,
        card_pin: account.card_pin,
        card_format: account.card_format,
        totp_secret: account.totp_secret,
        isServerEncrypted: account.isServerEncrypted,
        isPinned: account.isPinned,
    });
}

const cryptedArgs = [
	'label',
    'platform',
    'icon',
	'login',
	'password',
	'password_clue',
	'tags',
	'social_login',
	'description',
	'notes',
    'card_number',
    'card_pin',
    'card_expiracy',
    'card_issue_date',
    'card_cryptogram',
    'card_number',
    'totp_secret'
];

export function getEncryptedAccount (account, secret) {
    let encryptedAccount = JSON.parse(JSON.stringify(account)); // Clone object without reference
	
    cryptedArgs
    .filter(cryptedArg => account[cryptedArg])
    .forEach(cryptedArg => encryptedAccount[cryptedArg] = encrypt(account[cryptedArg], secret));

    return encryptedAccount;
}

export function getDecryptedAccount (account, secret) {
    let decryptedAccount = JSON.parse(JSON.stringify(account)); // Clone object without reference

    cryptedArgs
    .filter(cryptedArg => account[cryptedArg])
    .forEach(cryptedArg => decryptedAccount[cryptedArg] = decrypt(account[cryptedArg], secret));

    return decryptedAccount;
}
