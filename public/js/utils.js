function decrypt(encrypted, token)
{
	let masterpass = sha256(token)
	return sjcl.decrypt(masterpass, encrypted)
}

function encrypt(decrypted, token)
{
	let masterpass = sha256(token)
	return sjcl.encrypt(masterpass, decrypted)
}

function capitalizeFirstLetter(str)
{
	return str.replace(/\w\S*/g, function(txt)
		{
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		}
	);
}

function extractHostname(url)
{
	var hostname;
	
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

function cleanUrl(url)
{
	url = extractHostname(url);
	url = url.replace(/-/g, ' ');
	url = url.replace(/\./g, ' ');
	url = capitalizeFirstLetter(url);

	return url;
}