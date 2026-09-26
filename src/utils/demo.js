// Demo mode: the app runs against an in-memory vault, with no API calls and nothing
// written to the device storage. Changes last until the demo ends or the page is closed.

// Per-tab flag so a reload keeps the visitor in the demo (with a fresh vault)
const DEMO_SESSION_KEY = 'jisme_demo_session';

export function isDemoRequested () {
    try {
        if (new URLSearchParams(window.location.search).has('demo')) {
            return true;
        }

        return sessionStorage.getItem(DEMO_SESSION_KEY) === '1';
    }
    catch {
        return false;
    }
}

export function setDemoSession (active) {
    try {
        if (active) {
            sessionStorage.setItem(DEMO_SESSION_KEY, '1');
        } else {
            sessionStorage.removeItem(DEMO_SESSION_KEY);
        }
    }
    catch {
        // Storage can be blocked (private mode): the demo still works, it just won't survive a reload
    }
}
