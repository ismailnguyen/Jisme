export function generateRandomColor() {
    const color = [
        "#5050ff",
        "#50ff50",
        "#ff5050",
        "#ff5000",
        "#ff0050",
        "#0050ff",
        "#00ff50",
        "#50ff00",
        "#5000ff"
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
    ctx.font = `${avatar.width / 2}px Arial`;
    ctx.textAlign = "center";

    var initials = name ? name.split(' ').filter(x => x).map(s => s[0].toUpperCase()).join('') : '';

    //generating color if not provided
    color = color || generateRandomColor();

    //function to create avatar
    //clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, avatar.width, avatar.height);

    //add background
    ctx.fillStyle = `${color}60`;
    ctx.fillRect(0, 0, avatar.width, avatar.height);

    //add text
    ctx.fillStyle = color;
    ctx.fillText(initials, avatar.width / 2, (65 / 100) * avatar.height);

    //generate as Image
    return avatar.toDataURL();
}
