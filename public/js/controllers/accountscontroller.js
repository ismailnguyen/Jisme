app.controller("AccountsController", function(accounts, $scope, AccountService, ngClipboard)
{
  $scope.user = JSON.parse(localStorage.getItem('user'));  

  $scope.accounts = accounts;
  $scope.tags = [];
  $scope.currentTag = 'All';
  $scope.currentDate = null;

  $scope.new_tags = '';
  $scope.new_platform = '';
  $scope.new_login = '';
  $scope.new_password = '';

  this.toClipboard = ngClipboard.toClipboard;

  angular.forEach($scope.accounts, function(item)
  {
    if ($scope.currentDate == null || $scope.currentDate > item.created_date)
    {
      $scope.currentDate = new Date(item.created_date).toUTCString();
    }
  });
    
  $scope.signOut = function()
  {
    $scope.user = null;

    localStorage.removeItem('user');
    
    location.reload();
  };

  $scope.updateCurrentTag = function (query)
	{
		var isQueryEmpty = typeof query == 'undefined';

		$scope.currentTag = isQueryEmpty ? 'All' : query;
	};
	
	$scope.add = function ()
	{
    var account = 
    {
			platform: $scope.new_platform,
			login: $scope.new_login,
			password: $scope.new_password,
      tags: $scope.new_tags,
      created_date: new Date().toUTCString(),
      user_id: $scope.user.token
		};

    AccountService.add(account, $scope.user);

    $scope.accounts.push(account);

    $scope.closeAddAccount();
	};

  $scope.closeAddAccount = function ()
  {
    //Empty fields
		$scope.new_tags = '';
		$scope.new_platform = '';
		$scope.new_login = '';
    $scope.new_password = '';
    
    $scope.addAccount = false;
  }

	$scope.save = function(account)
	{
    AccountService.save(account, $scope.user);
    
    var index = $scope.accounts.indexOf(account);
    $scope.accounts[index] = account; 
	};

	$scope.delete = function(account)
	{
    AccountService.remove(account, $scope.user);

    var index = $scope.accounts.indexOf(account);
    $scope.accounts.splice(index, 1);
  };
  
  $scope.generatePassword = function ()
  {
    $scope.new_password = randomPassword(8);
  }

  $scope.displayPlatform = function ()
  {
    return cleanUrl($scope.new_platform);
  }

  function randomPassword (length) {
    var chars = "abcdefghijklmnopqrstuvwxyz!@#$%^&*()-+<>ABCDEFGHIJKLMNOP1234567890";
    var pass = "";

    for (var x = 0; x < length; x++)
    {
        var i = Math.floor(Math.random() * chars.length);
        pass += chars.charAt(i);
    }

    return pass;
}
});