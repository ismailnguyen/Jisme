import { cleanUrl } from '../utils/textFormat'
import { randomPassword } from '../utils/password'
import { generatePassword } from "../utils/passwordLess";

class Account {
    constructor (
            _id = 0, 
            platform = '',
            icon = '',
            login = '', 
            password = '',
            is_password_less = true, // By default enforce password less
            password_clue = '', 
            tags = '', 
            created_date = new Date(),
            social_login = '', 
            description = '',
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
            totp_secret = '',
            isServerEncrypted = false
        ) {
        this._id = _id;
        this.icon = icon;
        this.platform = platform;
        this.login = login;
        this.password = password;
        this.is_password_less = Boolean(is_password_less);
		this.password_clue = password_clue;
        this.tags = tags;
        this.created_date = new Date(created_date).toUTCString();
		this.social_login = social_login;
		this.description = description;
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
        this.isServerEncrypted = isServerEncrypted;
    }

    get displayPlatform () {
        return cleanUrl(this.platform);
    }

    generatePassword () {
        this.password = randomPassword(8);
    }

    generatePasswordLess (masterPassword) {
        const passwordProfile = {
            lowercase: true,
            uppercase: true,
            digits: true,
            symbols: true,
            length: 16,
            counter: 1,
            version: 2
        };

        return generatePassword(this.platform, this.login, masterPassword, passwordProfile);
    }

    isValid () {
        return this.platform !== '';
    }

    contains (word) {
        return this.platform.toLowerCase().includes(word) ||
            this.displayPlatform.toLowerCase().includes(word) ||
            this.login.toLowerCase().includes(word) ||
            this.social_login.toLowerCase().includes(word) ||
            this.password.toLowerCase().includes(word) ||
            this.password_clue.toLowerCase().includes(word) ||
            this.tags.toLowerCase().includes(word) ||
            this.icon.toLowerCase().includes(word) ||
            this.card_number.toLowerCase().includes(word) ||
            this.card_expiracy.toLowerCase().includes(word) ||
            this.card_pin.toLowerCase().includes(word) ||
            this.card_cryptogram.toLowerCase().includes(word) ||
            this.card_name.toLowerCase().includes(word) ||
            this.description.toLowerCase().includes(word) ||
            this.notes.toLowerCase().includes(word);
    }
}

export default Account;