import { faviconUrl } from '../../utils/icon'

const DAY_MS = 24 * 60 * 60 * 1000;

const daysAgo = (days) => new Date(Date.now() - days * DAY_MS);

function login ({ id, label, platform, login, password = '', is_password_less = false, password_clue = '', tags = '', notes = '', totp_secret = '', isPinned = false, opened, openedCount = 0, created = 120 }) {
    return {
        _id: id,
        type: 'account',
        subtype: 'login',
        label,
        platform,
        icon: faviconUrl(platform),
        login,
        password,
        is_password_less,
        password_clue,
        tags,
        notes,
        totp_secret,
        isPinned,
        created_date: daysAgo(created),
        last_modified_date: daysAgo(opened),
        last_opened_date: daysAgo(opened),
        opened_count: openedCount
    };
}

// Fictional data only: test card numbers, sample IBAN, example.com logins
export function createDemoAccounts () {
    return [
        login({ id: 'demo_github', label: 'GitHub', platform: 'github.com', login: 'alex.martin@example.com', password: 'c0rrect-Horse-battery', tags: 'dev, work', totp_secret: 'JBSWY3DPEHPK3PXP', isPinned: true, opened: 0, openedCount: 42, notes: 'Recovery codes are in the safe.' }),
        login({ id: 'demo_google', label: 'Google', platform: 'accounts.google.com', login: 'alex.martin@example.com', is_password_less: true, password_clue: 'Usual phrase, first pet, + site year', tags: 'personal, email', isPinned: true, opened: 1, openedCount: 31 }),
        login({ id: 'demo_netflix', label: 'Netflix', platform: 'netflix.com', login: 'alex.martin@example.com', password: 'Popcorn&Sofa2024', tags: 'streaming, family', opened: 3, openedCount: 12 }),
        login({ id: 'demo_spotify', label: 'Spotify', platform: 'spotify.com', login: 'alexmartin', password: 'b4ssline!Loud', tags: 'streaming, music', opened: 5, openedCount: 9 }),
        login({ id: 'demo_amazon', label: 'Amazon', platform: 'amazon.com', login: 'alex.martin@example.com', is_password_less: true, tags: 'shopping', opened: 8, openedCount: 7 }),
        login({ id: 'demo_slack', label: 'Slack', platform: 'slack.com', login: 'alex@acme.example', password: 'Standup-at-9:30', tags: 'work', totp_secret: 'KRSXG5CTMVRXEZLU', opened: 2, openedCount: 18 }),
        login({ id: 'demo_figma', label: 'Figma', platform: 'figma.com', login: 'alex@acme.example', is_password_less: true, tags: 'work, design', opened: 14, openedCount: 4 }),
        login({ id: 'demo_airbnb', label: 'Airbnb', platform: 'airbnb.com', login: 'alex.martin@example.com', password: 'Weekend-in-Lisbon', tags: 'travel', opened: 40, openedCount: 2 }),
        {
            _id: 'demo_wifi',
            type: 'account',
            subtype: 'wifi',
            label: 'Home Wi-Fi',
            login: 'Martin-Home-5G',
            password: 'kettle-garden-47',
            password_clue: 'WPA',
            tags: 'home',
            isPinned: true,
            created_date: daysAgo(300),
            last_modified_date: daysAgo(6),
            last_opened_date: daysAgo(6),
            opened_count: 15
        },
        {
            _id: 'demo_ssh',
            type: 'account',
            subtype: 'secret_key',
            label: 'Deploy key',
            platform: 'api.acme.example',
            login: 'deploy',
            password: 'sk_demo_7f3a9c2e41b8d6f0',
            tags: 'dev, work',
            notes: 'Rotated every quarter.',
            created_date: daysAgo(60),
            last_modified_date: daysAgo(20),
            last_opened_date: daysAgo(20),
            opened_count: 3
        },
        {
            _id: 'demo_visa',
            type: 'card',
            subtype: 'payment',
            label: 'Everyday Visa',
            card_name: 'ALEX MARTIN',
            card_number: '4242 4242 4242 4242',
            card_expiracy: '08/29',
            card_cryptogram: '123',
            card_pin: '0000',
            tags: 'finance',
            created_date: daysAgo(200),
            last_modified_date: daysAgo(4),
            last_opened_date: daysAgo(4),
            opened_count: 21
        },
        {
            _id: 'demo_loyalty',
            type: 'card',
            subtype: 'loyalty',
            label: 'Coffee Club',
            card_name: 'Alex Martin',
            card_number: '9780201379624',
            card_format: 'barcode',
            tags: 'shopping',
            created_date: daysAgo(90),
            last_modified_date: daysAgo(10),
            last_opened_date: daysAgo(10),
            opened_count: 11
        },
        {
            _id: 'demo_gift',
            type: 'card',
            subtype: 'gift',
            label: 'Bookshop gift card',
            card_number: 'GIFT-2025-DEMO-0042',
            card_format: 'qrcode',
            card_pin: '4821',
            notes: 'Balance: 25 €',
            tags: 'shopping, gifts',
            created_date: daysAgo(30),
            last_modified_date: daysAgo(30),
            last_opened_date: daysAgo(30),
            opened_count: 1
        },
        {
            _id: 'demo_passport',
            type: 'document',
            subtype: 'identity',
            label: 'Passport',
            card_name: 'Alex Martin',
            card_number: '18AB12345',
            card_expiracy: '14/03/2031',
            card_issue_date: '15/03/2021',
            platform: 'Préfecture de Paris',
            tags: 'identity, travel',
            created_date: daysAgo(400),
            last_modified_date: daysAgo(40),
            last_opened_date: daysAgo(40),
            opened_count: 5
        },
        {
            _id: 'demo_passport_sam',
            type: 'document',
            subtype: 'identity',
            label: 'Passport',
            card_name: 'Sam Martin',
            card_number: '21CD67890',
            card_expiracy: '02/09/2029',
            card_issue_date: '03/09/2024',
            platform: 'Préfecture de Paris',
            tags: 'identity, travel, family',
            created_date: daysAgo(380),
            last_modified_date: daysAgo(60),
            last_opened_date: daysAgo(60),
            opened_count: 2
        },
        {
            _id: 'demo_iban',
            type: 'bank',
            subtype: 'iban',
            label: 'Main bank account',
            login: 'Alex Martin',
            password: 'FR14 2004 1010 0505 0001 3M02 606',
            platform: 'examplebank.com',
            tags: 'finance',
            created_date: daysAgo(500),
            last_modified_date: daysAgo(12),
            last_opened_date: daysAgo(12),
            opened_count: 8
        }
    ];
}

const DEMO_AGENT_MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15';
const DEMO_AGENT_IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';

export function createDemoUser () {
    return {
        uuid: 'demo-user',
        email: 'demo@jisme.app',
        avatarUrl: '',
        token: 'demo-token',
        // Used as the vault secret by the app: harmless here, nothing is ever encrypted to disk
        public_encryption_key: 'demo-public-key',
        hasAccounts: true,
        isMFAEnabled: false,
        totp_secret: '',
        passkeys: [],
        activities: [
            { action: 'login', activity_date: new Date().toISOString(), location: 'Paris, France', agent: DEMO_AGENT_MAC, ip: '203.0.113.24', referer: 'https://jisme.app' },
            { action: 'account_update', activity_date: daysAgo(1).toISOString(), location: 'Paris, France', agent: DEMO_AGENT_IPHONE, ip: '198.51.100.7', referer: 'https://jisme.app' },
            { action: 'login', activity_date: daysAgo(3).toISOString(), location: 'Lyon, France', agent: DEMO_AGENT_IPHONE, ip: '198.51.100.7', referer: 'https://jisme.app' }
        ]
    };
}
