// Initial icons are printed in the vault's ink tones, never in random brights
export function generateRandomColor() {
    const color = [
        "#2e3a4f",
        "#4f5c72",
        "#66728a"
    ];

    let random = Math.floor(Math.random() * color.length);

    return color[random];
}

export function generateInitialIcon(name, color) {
    let avatar, ctx;

    //creating canvas
    avatar = document.createElement("canvas");
    avatar.width = avatar.height = "48";
    ctx = avatar.getContext("2d");
    ctx.font = `700 ${avatar.width / 2}px "Public Sans", Arial, sans-serif`;
    ctx.textAlign = "center";

    var initials = name ? name.split(' ').filter(x => x).map(s => s[0].toUpperCase()).join('') : '';

    //generating color if not provided
    color = color || generateRandomColor();

    //function to create avatar
    //clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, avatar.width, avatar.height);

    //add background
    ctx.fillStyle = "#eef1f4";
    ctx.fillRect(0, 0, avatar.width, avatar.height);

    //add text
    ctx.fillStyle = color;
    ctx.fillText(initials, avatar.width / 2, (65 / 100) * avatar.height);

    //generate as Image
    return avatar.toDataURL();
}

// Google's favicon service defaults to 16px, which pixelates in a 48px window.
// Ask for a larger size for new icons and upgrade stored ones at display time.
export function faviconUrl (platform) {
    return "https://www.google.com/s2/favicons?sz=128&domain=" + platform;
}

export function displayIcon (icon) {
    if (icon && icon.includes('google.com/s2/favicons') && !/[?&]sz=/.test(icon)) {
        return icon.replace('favicons?', 'favicons?sz=128&');
    }

    return icon;
}
