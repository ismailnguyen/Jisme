app.controller("LoginController", function($scope, UserService)
{
  $scope.email = null;
  $scope.password = null;

  $scope.signIn = function()
  {
    UserService.login($scope.email, $scope.password)
    .then(function(user)
    {
      if (user == null)
      {
        return;
      }

      localStorage.setItem('user', JSON.stringify(user));

      location.href = '/';
    });
  };
});