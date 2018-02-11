function getAuthorizationString(email, token)
{
    var authorizationBasic = btoa(email + ":" + token).toString("base64");

    return 'Basic ' + authorizationBasic;
}

export function getHeaders(email, token)
{
    let headers = new Headers();

    headers.append('Authorization', getAuthorizationString(email, token));
    headers.append('Content-Type', 'application/json')

    return headers;
}