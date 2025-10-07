import { cleanUrl } from '../utils/textFormat'
import { randomPassword } from '../utils/password'
import { generatePassword } from "../utils/passwordLess";

class Account {
    constructor (account = {}) {
        if (!account)
            return;

        this._id = account.id || 0;
        this.icon = account.icon || '';
        this.label = account.label || '';
        this.platform = account.platform || '';
        this.login = account.login || '';
        this.password = account.password || '';
        this.is_password_less = typeof account.is_password_less == "boolean" ? Boolean(account.is_password_less) : true; // By default enforce password less
		this.password_clue = account.password_clue || '';
        this.tags = account.tags || '';
        this.created_date = account.created_date ? new Date(account.created_date).toUTCString() : new Date().toUTCString();
		this.social_login = account.social_login || '';
		this.description = account.description || '';
		this.notes = account.notes || '';
        // if account never modified, take creation date as last modification date
        this.last_modified_date = new Date((account.last_modified_date instanceof Date && !isNaN(account.last_modified_date)) ? account.last_modified_date : account.created_date).toUTCString();
        // if account never opened, take creation date as last opened date
        this.last_opened_date = new Date((account.last_opened_date instanceof Date && !isNaN(account.last_opened_date)) ? account.last_opened_date : account.created_date).toUTCString();
        this.opened_count = account.opened_count || 0;
        this.type = account.type || 'account';
        this.subtype = account.subtype || 'login';
        this.card_number = account.card_number || '';
        this.card_name = account.card_name || '';
        this.card_expiracy = account.card_expiracy || '';
        this.card_issue_date = account.card_issue_date || '';
        this.card_cryptogram = account.card_cryptogram || '';
        this.card_pin = account.card_pin || '';
        this.card_format = account.card_format || '';
        this.totp_secret = account.totp_secret || '';
        this.isServerEncrypted = account.isServerEncrypted || false;
        this.isPinned = account.isPinned || false;
    }

    get displayPlatform () {
        return cleanUrl(this.platform);
    }

    get displayType () {
        // This workaround is needed to avoid confusion with the Account model
        if (this.type === 'account') { 
            return 'Credential';
        }
        return this.type.charAt(0).toUpperCase() + this.type.slice(1);
    }

    get displaySubtype () {
        if (['iban', 'swift'].includes(this.subtype)) { 
            return this.subtype.toUpperCase();
        }
        
        return this.subtype.charAt(0).toUpperCase() + this.subtype.slice(1);
    }

    // Trim card number to remove spaces because QRCode and Barcodes don't support spaces
    get rawCardNumber () {
        if (this.type === 'account' && this.subtype === 'wifi') {
            return this.wifiQrCode;
        }

        return this.card_number.replaceAll(' ', '');
    }

    get cardFormat () {
        if (this.type === 'account' && this.subtype === 'wifi') {
            return 'qrcode';
        }

        return this.card_format;
    }

    set cardFormat (value) {
        if (this.type === 'account' && this.subtype === 'wifi') {
            // Wi-Fi credentials always render as a QR code, ignore manual overrides
            this.card_format = 'qrcode';
            return;
        }

        this.card_format = value || '';
    }

    get wifiQrCode () {
        return `WIFI:S:${ this.login };T:${ this.password_clue };P:${ this.password };`;
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
        return this.label !== '';
    }

    duplicate () {
        return new Account({
            ...this,
            _id: 0, // Reset ID for duplication
            created_date: new Date().toUTCString(),
            last_modified_date: new Date().toUTCString(),
            last_opened_date: new Date().toUTCString(),
            opened_count: 0
        });
    }

    contains (word) {
        return this.label.toLowerCase().includes(word) ||
            this.platform.toLowerCase().includes(word) ||
            this.displayPlatform.toLowerCase().includes(word) ||
            this.login.toLowerCase().includes(word) ||
            this.social_login.toLowerCase().includes(word) ||
            this.password.toLowerCase().includes(word) ||
            this.password_clue.toLowerCase().includes(word) ||
            this.tags.toLowerCase().includes(word) ||
            this.icon.toLowerCase().includes(word) ||
            this.card_number.toLowerCase().includes(word) ||
            this.card_expiracy.toLowerCase().includes(word) ||
            this.card_issue_date.toLowerCase().includes(word) ||
            this.card_pin.toLowerCase().includes(word) ||
            this.card_cryptogram.toLowerCase().includes(word) ||
            this.card_name.toLowerCase().includes(word) ||
            this.description.toLowerCase().includes(word) ||
            this.notes.toLowerCase().includes(word);
    }
}

export default Account;
