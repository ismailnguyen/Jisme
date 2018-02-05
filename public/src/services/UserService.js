function UserService()
{
  this.login = function(email, password)
  {
    let credentials =
    {
        email: email,
        password: password
    };

    return fetch('http://localhost:8090/api/users/login/', 
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
    })
    .then(response => response.json());
  }
};

export default UserService;