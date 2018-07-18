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

export function cleanUrl (url)
{
	url = extractHostname(url);
	url = url.replace(/-/g, ' ');
	url = url.replace(/\./g, ' ');
	url = capitalizeFirstLetter(url);

	return url;
}

function capitalizeFirstLetter (str)
{
	return str.replace(/\w\S*/g, 
		txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
	);
}

function extractHostname (url)
{
	let hostname;
	
    //find & remove protocol (http, ftp, etc.) and get hostname
	if (url.indexOf("://") > -1)
	{
        hostname = url.split('/')[2];
    }
	else
	{
        hostname = url.split('/')[0];
    }

    //find & remove port number
	hostname = hostname.split(':')[0];
	
    //find & remove "?"
	hostname = hostname.split('?')[0];
	
	hostname = hostname.replace(/^www\./, '');

	if (hostname.indexOf('.') > 0)
	{
		hostname = hostname.substring(0, hostname.lastIndexOf('.'));
	}

    return hostname;
}