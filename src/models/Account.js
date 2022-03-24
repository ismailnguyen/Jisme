import { cleanUrl, extractDomain } from '../utils/textFormat'
import { randomPassword } from '../utils/textFormat'

class Account {
    constructor (_id = 0, 
					platform = '',
                    icon = '',
					login = '', 
					password = '', 
					password_clue = '', 
					tags = '', 
					created_date = new Date(), 
					social_login = '', 
					notes = '',
					last_modified_date = null, 
					last_opened_date = null, 
                    opened_count = 0
				) {
        this._id = _id;
        this.icon = icon;
        this.platform = platform;
        this.login = login;
        this.password = password;
		this.password_clue = password_clue;
        this.tags = tags;
        this.created_date = new Date(created_date).toUTCString();
		this.social_login = social_login;
		this.notes = notes;
        this.last_modified_date = new Date(last_modified_date).toUTCString();
        this.last_opened_date = new Date(last_opened_date).toUTCString();
        this.opened_count = opened_count;
    }

    get displayPlatform () {
        return cleanUrl(this.platform);
    }

    get domain () {
        return extractDomain(this.platform);
    }

    generatePassword () {
        this.password = randomPassword(8);
    }

    isValid () {
        return this.platform !== ''
                && this.login !== '';
    }
}

export default Account;