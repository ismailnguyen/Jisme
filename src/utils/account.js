import { encrypt, decrypt } from './cypher'
import { cleanUrl } from './textFormat'

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

    if (account.tags)
    {
        encryptedAccount['tags'] = encrypt(account.tags, token);            
    }

    return encryptedAccount;
}

export function getDecryptedAccount (account, token)
{
    let decryptedAccount = JSON.parse(JSON.stringify(account)); // Clone object without reference

    if (account.platform)
    {
        let platform = decrypt(account.platform, token);

        decryptedAccount['platform'] = platform;
        decryptedAccount['displayPlatform'] = cleanUrl(platform);
    }

    if (account.login)
    {
        decryptedAccount['login'] = decrypt(account.login, token);
    }

    if (account.password)
    {
        decryptedAccount['password'] = decrypt(account.password, token);
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

    return decryptedAccount;
}