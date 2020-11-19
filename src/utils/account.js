import { encrypt, decrypt } from './cypher'
import Account from '../models/Account'

export function parseAccount(account)
{
    return new Account(
        account._id,
        account.platform,
        account.login,
        account.password,
        account.password_clue,
        account.tags,
        account.created_date,
		account.social_login,
		account.notes
    );
}

const cryptedArgs = [
	'platform',
	'login',
	'password',
	'password_clue',
	'tags',
	'social_login',
	'notes'
];

export function getEncryptedAccount (account, token)
{
    let encryptedAccount = JSON.parse(JSON.stringify(account)); // Clone object without reference
	
	cryptedArgs
	.filter(cryptedArg => account[cryptedArg])
	.forEach(cryptedArg => encryptedAccount[cryptedArg] = encrypt(account[cryptedArg], token))

    return encryptedAccount;
}

export function getDecryptedAccount (account, token)
{
    let decryptedAccount = JSON.parse(JSON.stringify(account)); // Clone object without reference

	cryptedArgs
	.filter(cryptedArg => account[cryptedArg])
	.forEach(cryptedArg => decryptedAccount[cryptedArg] = decrypt(account[cryptedArg], token))

    return decryptedAccount;
}