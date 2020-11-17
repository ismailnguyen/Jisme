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

export function getEncryptedAccount (account, token)
{
    let encryptedAccount = JSON.parse(JSON.stringify(account)); // Clone object without reference

    if (account.platform)
    {
        encryptedAccount['platform'] = encrypt(account.platform, token);;
    }

    if (account.login)
    {
        encryptedAccount['login'] = encrypt(account.login, token);
    }

    if (account.password)
    {
        encryptedAccount['password'] = encrypt(account.password, token);
    }
	
	if (account.password_clue)
    {
        encryptedAccount['password_clue'] = encrypt(account.password_clue, token);            
    }

    if (account.tags)
    {
        encryptedAccount['tags'] = encrypt(account.tags, token);            
    }
	
	if (account.tags)
    {
        encryptedAccount['tags'] = encrypt(account.tags, token);            
    }
	
	if (account.social_login)
    {
        encryptedAccount['social_login'] = encrypt(account.social_login, token);            
    }
	
	if (account.notes)
    {
        encryptedAccount['notes'] = encrypt(account.notes, token);            
    }

    return encryptedAccount;
}

export function getDecryptedAccount (account, token)
{
    let decryptedAccount = JSON.parse(JSON.stringify(account)); // Clone object without reference

    if (account.platform)
    {
        decryptedAccount['platform'] = decrypt(account.platform, token);
    }

    if (account.login)
    {
        decryptedAccount['login'] = decrypt(account.login, token);
    }

    if (account.password)
    {
        decryptedAccount['password'] = decrypt(account.password, token);
    }
	
	if (account.password_clue)
    {
        decryptedAccount['password_clue'] = decrypt(account.password_clue, token);
    }

    if (account.tags)
    {
        decryptedAccount['tags'] = decrypt(account.tags, token);            
    }

    if (account.created_date)
    {
        let created_date = decryptedAccount['created_date'];
        decryptedAccount['created_date'] = new Date(created_date).toUTCString();            
    }
	
	if (account.social_login)
    {
        decryptedAccount['social_login'] = decrypt(account.social_login, token);            
    }
	
	if (account.notes)
    {
        decryptedAccount['notes'] = decrypt(account.notes, token);            
    }

    return decryptedAccount;
}