app.service("UserService", function($http)
{
  this.login = function(email, password)
  {
    let credentials =
    {
        email: email,
        password: password
    };

    return $http.post("/api/users/login/", credentials).
      then(function(response)
      {
          console.log(response.data);
          return response.data;
      }, 
      function(response)
      {
          console.log(response);
          return null;
      });
  }
});