import { cleanUrl } from '../utils/textFormat'
import { randomPassword } from '../utils/textFormat'

class Account
{
    constructor (_id = 0, 
					platform = '', 
					login = '', 
					password = '', 
					password_clue = '', 
					tags = '', 
					created_date = new Date(), 
					social_login = '', 
					notes = ''
				)
    {
        this._id = _id;
        this.platform = platform;
        this.login = login;
        this.password = password;
		this.password_clue = password_clue;
        this.tags = tags;
        this.created_date = new Date(created_date).toUTCString();
		this.social_login = social_login;
		this.notes = notes;
    }

    get displayPlatform ()
    {
        return cleanUrl(this.platform);
    }

    generatePassword ()
    {
        this.password = randomPassword(8);
    }

    isValid ()
    {
        return this.platform !== ''
                && this.login !== '';
    }
}

export default Account;