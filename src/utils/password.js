export function randomPassword (length) {
    let chars = "abcdefghijklmnopqrstuvwxyz!@#$%^&*()-+<>ABCDEFGHIJKLMNOP1234567890";
    let password = "";

    for (let x = 0; x < length; x++)
    {
        let i = Math.floor(Math.random() * chars.length);
        password += chars.charAt(i);
    }

    return password;
}
