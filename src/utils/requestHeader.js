export function getHeaders()
{
    let headers = new Headers();

    headers.append('Content-Type', 'application/json');

    return headers;
}

export function getHeadersWithAuth(token)
{
    let headers = getHeaders();

    headers.append('Authorization', `Bearer ${token}`);

    return headers;
}