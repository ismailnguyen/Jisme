app.service("AccountService", function($http)
{
    function getAuthorizationHeaderfunction(email, token)
    {
        var authorizationBasic = btoa(email + ":" + token).toString("base64");

        return 'Basic ' + authorizationBasic;
    }

    function getEncryptedAccount(account, token)
    {
      var encryptedAccount = JSON.parse(JSON.stringify(account)); // Clone object without reference
  
      encryptedAccount['platform'] = encrypt(account.platform, token);
      encryptedAccount['login'] = encrypt(account.login, token);
      encryptedAccount['password'] = encrypt(account.password, token);
      encryptedAccount['tags'] = encrypt(account.tags, token);
  
      return encryptedAccount;
    }

    function getDecryptedAccount(account, token)
    {
      var encryptedAccount = JSON.parse(JSON.stringify(account)); // Clone object without reference
  
      encryptedAccount['platform'] = decrypt(account.platform, token);
      encryptedAccount['login'] = decrypt(account.login, token);
      encryptedAccount['password'] = decrypt(account.password, token);
      encryptedAccount['tags'] = decrypt(account.tags, token);
  
      return encryptedAccount;
    }

  this.get = function(user)
  {
    return $http.get('/api/accounts/',
    {
        headers:
        {
            'Authorization': getAuthorizationHeaderfunction(user.email, user.token)
        }
    }).
      then(function(response)
      {
            var accounts = [];
            response.data.forEach(account =>
            {
                accounts.push(getDecryptedAccount(account, user.token));       
            });

          return accounts;
      }, 
      function(response)
      {
          console.log(response);
      });
  }

  this.add = function(account, user)
  {
    return $http.post('/api/accounts', getEncryptedAccount(account, user.token),
    {
        headers:
        {
            'Authorization': getAuthorizationHeaderfunction(user.email, user.token)
        }
    }).
    then(function(response)
    {
        return getDecryptedAccount(response.data, user.token);
    }, 
    function(response)
    {
        console.log(response);
    });
  }
  
  this.save = function(account, user)
  {
    return $http.put('/api/accounts/' + account._id, getEncryptedAccount(account, user.token),
    {
        headers:
        {
            'Authorization': getAuthorizationHeaderfunction(user.email, user.token)
        }
    }).
    then(function(response)
    {
        return response.data;
    }, 
    function(response)
    {
        console.log(response);
    });
  }

  this.remove = function(account, user)
  {
    return $http.delete('/api/accounts/' + account._id,
    {
        headers:
        {
            'Authorization': getAuthorizationHeaderfunction(user.email, user.token)
        }
    }).
    then(function(response)
    {
        console.log(response.data);
        return response.data;
    }, 
    function(response)
    {
        console.log(response);
    });
  }
});