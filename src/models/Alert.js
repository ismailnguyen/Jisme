class Alert
{
    constructor (title, message, type = 'info', image = null)
    {
        this.title = title;
        this.message = message;
        this.type = type;
        this.image = image;
    }
}

export default Alert;
