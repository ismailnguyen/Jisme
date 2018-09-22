import { cleanUrl } from '../utils/textFormat'
import { randomPassword } from '../utils/textFormat'

class Account
{
    constructor (_id= 0, platform = '', login = '', password = '', tags = '', created_date = new Date())
    {
        this._id = _id;
        this.platform = platform;
        this.login = login;
        this.password = password;
        this.tags = tags;
        this.created_date = new Date(created_date).toUTCString();
    }

    get displayPlatform ()
    {
        return cleanUrl(this.platform);
    }

    generatePassword()
    {
        this.password = randomPassword(8);
    }

    isValid ()
    {
        return this.platform !== ''
                && this.login !== ''
                && this.password !== ''
                && this.tags !== '';
    }
}

export default Account;