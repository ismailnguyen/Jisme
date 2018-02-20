function getAuthorizationString(email, token)
{
    var authorizationBasic = btoa(email + ":" + token).toString("base64");

    return 'Basic ' + authorizationBasic;
}

export function getHeaders()
{
    let headers = new Headers();

    headers.append('Content-Type', 'application/json');

    return headers;
}

export function getHeadersWithAuth(email, token)
{
    let headers = getHeaders();

    headers.append('Authorization', getAuthorizationString(email, token));

    return headers;
}