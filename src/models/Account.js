import { cleanUrl, extractDomain, randomPassword } from '../utils/textFormat'

class Account {
    constructor (
                    _id = 0, 
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
                    opened_count = 0,
                    type = 'account',
                    card_number = '',
                    card_name = '',
                    card_expiracy = '',
                    card_cryptogram = '',
                    card_pin = '',
                    totp_secret = ''
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
        // if account never modified, take creation date as last modification date
        this.last_modified_date = new Date((last_modified_date instanceof Date && !isNaN(last_modified_date)) ? last_modified_date : created_date).toUTCString();
        // if account never opened, take creation date as last opened date
        this.last_opened_date = new Date((last_opened_date instanceof Date && !isNaN(last_opened_date)) ? last_opened_date : created_date).toUTCString();
        this.opened_count = opened_count;
        this.type = type;
        this.card_number = card_number;
        this.card_name = card_name;
        this.card_expiracy = card_expiracy;
        this.card_cryptogram = card_cryptogram;
        this.card_pin = card_pin;
        this.totp_secret = totp_secret;
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
        return this.platform !== '';
    }
}

export default Account;