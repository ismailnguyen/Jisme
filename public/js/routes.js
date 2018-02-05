app.config(function($routeProvider)
{
  $routeProvider
    .when('/',
    {
      templateUrl: 'accounts_list.html',
      controller: 'AccountsController',
      resolve:
      {
        factory: checkSession,
          accounts: function (AccountService)
          {
            if (localStorage.getItem('user') == null)
            {
                return;
            }

            var user =  JSON.parse(localStorage.getItem('user'));
            return  AccountService.get(user);
          }
      }
    })
    .when("/login",
    {
      templateUrl: 'login.html',
      controller: 'LoginController'
    })
    .otherwise({ redirectTo : '/' });
});

var checkSession = function ($q, $rootScope, $location)
{
    if (localStorage.getItem('user') == null)
    {
        $location.path('/login');
    }

    return true;
};