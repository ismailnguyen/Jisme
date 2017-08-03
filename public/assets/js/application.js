firebase.initializeApp(firebaseConfig);
	
function decrypt(encrypted, token)
{
	let masterpass = sha256(token)
	return sjcl.decrypt(masterpass, encrypted)
}

function encrypt(decrypted, token)
{
	let masterpass = sha256(token)
	return sjcl.encrypt(masterpass, decrypted)
}

var app = angular.module('jismeApp', ['firebase']);
var user;

app.controller('AuthCtrl', function($scope, $firebaseAuth)
{
	var auth = $firebaseAuth();
	
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
});

app.filter('orderObject', function()
{
	return function(items, reverse)
	{
		var filtered = [];
		
		angular.forEach(items, function(item)
		{
			filtered.push(item);
		});
		
		filtered.sort(function (a, b)
		{
			return a.localeCompare(b);
		});
		
		if(reverse)
		{
			filtered.reverse();
		}
			
		return filtered;
	};
});
	
app.filter('orderObjectBy', function()
{
	return function(items, field, reverse)
	{
		var filtered = [];
		
		angular.forEach(items, function(item)
		{
			filtered.push(item);
		});
		
		filtered.sort(function (a, b)
		{
			return a[field].localeCompare(b[field]);
		});
		
		if(reverse)
		{
			filtered.reverse();
		}
			
		return filtered;
	};
});

app.filter('distinctTags', function()
{
	return function(items)
	{
		var tags = [];
		
		angular.forEach(items, function(item)
		{
			let listTags = item.tags.split(',');

			angular.forEach(listTags, function(tag)
			{
				tag = tag.trim();
				
				if (tags.indexOf(tag) == -1)
				{
					tags.push(tag);
				}
			});
		});
		
		return tags;
	};
});
	
app.controller('AccountsCtrl', function ($scope, $firebaseArray)
{
	$scope.user = null;

	$scope.tags = [];

	$scope.currentDate = new Date().toLocaleDateString();
	$scope.currentTag = 'All';
	
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
		}
		else
		{
			$scope.user = null;
			$scope.accounts = null;
		}
	});
	
	$scope.search = function ()
	{
		var query = $scope.query;

		var keywords = query.split(',');
		
		//Show only accounts correspondings to query or show all if query is empty
		$('.account-row').each(function ()
		{
			var found = false;
			
			$(this).find('.account').each(function ()
			{
				var value = $(this).val();

				angular.forEach(keywords, function(keyword)
				{
					keyword = keyword.trim();

					if ((keyword.length > 0 && value.toUpperCase().indexOf(keyword.toUpperCase()) >= 0) || !query.length)
					{
						found = true;
					}
				});
			});
		
			if (found)
			{
				$(this).show();
			}
			else
			{
				$(this).hide();
			}
		});
	}

	$scope.filterTag = function (query)
	{
		var isQueryEmpty = typeof query == 'undefined';

		//Show only accounts correspondings to selected query tag
		$('.account-row').each(function ()
		{
			var found = isQueryEmpty;
			
			if (!isQueryEmpty)
			{
				$(this).find('.tag:hidden').each(function ()
				{
					let tags = $(this).val().split(',');

					angular.forEach(tags, function(tag)
					{
						tag = tag.trim();

						if (tag.toUpperCase() == query.toUpperCase())
						{
							found = true;
						}
					});
				});
			}
		
			if (found)
			{
				$(this).show();
			}
			else
			{
				$(this).hide();
			}

			$scope.currentTag = isQueryEmpty ? 'All' : query;
		});
	}

	$scope.filterDate = function()
	{
		var currentDate = $scope.currentDate;
				
		$('.account-row').each(function ()
		{
			var found = false;
			
			$(this).find('.created_date').each(function ()
			{
				var accountCreatedDate = new Date($(this).val());
				
				var selectedDate = new Date(currentDate);
				
				if (accountCreatedDate > selectedDate)
				{
					found = true;
				}
			});
		
			if (found)
			{
				$(this).show();
			} 
			else
			{
				$(this).hide();
			}
		});
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
			created_date: Date()
		});
		
		//Empty fields
		$scope.new_tags = null;
		$scope.new_platform = null;
		$scope.new_login = null;
		$scope.new_password = null;

		$('.add-account').hide();
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