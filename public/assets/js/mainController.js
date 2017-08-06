app.controller('MainController', function ($scope, $firebaseAuth, $firebaseArray, ngClipboard)
{
	$scope.currentDate = null;
	$scope.currentTag = 'All';

	$scope.tags = [];

	$scope.user = null;
	var auth = $firebaseAuth();

	this.toClipboard = ngClipboard.toClipboard;
	
	firebase.auth().onAuthStateChanged(function(firebaseUser)
	{
		if (firebaseUser)
		{
			$scope.user = firebaseUser;
		}
		else
		{
			$scope.user = null;
		}
	});

	$scope.signIn = function()
	{
		auth.$signInWithPopup('google').then(function(firebaseUser)
		{
			$scope.user = firebaseUser.user;
		})
		.catch(function(error)
		{
			alert(error);
		});
	};
	
	$scope.signOut = function ()
	{
		auth.$signOut();
		location.reload();
	}
	
	firebase.auth().onAuthStateChanged(function(firebaseUser)
	{
		if (firebaseUser)
		{
			$scope.user = firebaseUser;
			
			var accountsRef = firebase
				.database()
				.ref('users/' + $scope.user.uid + '/');
				
			//create a synchronized array
			$scope.accounts = $firebaseArray(accountsRef);

			$scope.accounts.$loaded().then(function(data)
			{
				angular.forEach(data, function(item)
				{
					if ($scope.currentDate == null)
					{
						$scope.currentDate = new Date(item.created_date).toLocaleDateString()
					}
				});
			});
		}
		else
		{
			$scope.user = null;
			$scope.accounts = null;
		}
	});
	
	$scope.updateCurrentTag = function (query)
	{
		var isQueryEmpty = typeof query == 'undefined';

		$scope.currentTag = isQueryEmpty ? 'All' : query;
	}
	
	$scope.add = function ()
	{
		var tags = $scope.new_tags;
		var platform = $scope.new_platform;
		var login = $scope.new_login;
		var password = $scope.new_password;
		
		var accountsRef = firebase
				.database()
				.ref('users/' + $scope.user.uid + '/');
		
		$firebaseArray(accountsRef).$add({
			tags: tags,
			platform: platform,
			login: login,
			password: password,
			created_date: new Date().toUTCString()
		});
		
		//Empty fields
		$scope.new_tags = null;
		$scope.new_platform = null;
		$scope.new_login = null;
		$scope.new_password = null;

		$scope.addAccount = false;
	}

	$scope.save = function(account)
	{
		$scope.accounts.$save(account);
	}

	$scope.delete = function(account)
	{
		$scope.accounts.$remove(account);
	}
});