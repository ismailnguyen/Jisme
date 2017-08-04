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

function capitalizeFirstLetter(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function extractHostname(url)
{
	var hostname;
	
    //find & remove protocol (http, ftp, etc.) and get hostname
	if (url.indexOf("://") > -1)
	{
        hostname = url.split('/')[2];
    }
	else
	{
        hostname = url.split('/')[0];
    }

    //find & remove port number
	hostname = hostname.split(':')[0];
	
    //find & remove "?"
	hostname = hostname.split('?')[0];
	
	hostname = hostname.replace(/^www\./, '');

	if (hostname.indexOf('.') > 0)
	{
		hostname = hostname.substring(0, hostname.lastIndexOf('.'));
	}

    return hostname;
}

function cleanUrl(url)
{
	url = extractHostname(url);
	url = url.replace(/-/g, ' ');
	url = url.replace(/\./g, ' ');
	url = capitalizeFirstLetter(url);

	return url;
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

app.filter('cleanUrl', function()
{
	return function(item)
	{
		return item;
	};
});

app.filter('filterByTag', function()
{
	return function(items, currentTag)
	{
		if (currentTag == 'All')
		{
			return items;
		}

		var filtered = [];

		angular.forEach(items, function(item) 
		{
			let tags = item.tags.split(',');
			currentTag = currentTag.trim().toUpperCase();
			
			angular.forEach(tags, function(tag)
			{
				tag = tag.trim().toUpperCase();

				if (tag == currentTag)
				{
					filtered.push(item);
				}
			});
		});

		return filtered;
	};
});

app.filter('filterByDate', function()
{
	return function(items, currentDate)
	{
		var filtered = [];

		angular.forEach(items, function(item)
		{
			let createdDate = new Date(item.created_date);

			currentDate = new Date(currentDate);

			if (createdDate > currentDate)
			{
				filtered.push(item);
			}
		});

		return filtered;
	};
});

app.filter('filterByQuery', function()
{
	return function(items, query)
	{
		let isQueryEmpty = typeof query == 'undefined' || query.length == 0; 

		if (isQueryEmpty)
		{
			return items;
		}

		if (!isQueryEmpty)
		{
			var filtered = [];

			var keywords = query.split(',');

			angular.forEach(keywords, function(keyword)
			{
				keyword = keyword.trim();

				angular.forEach(items, function(item)
				{
					query = query.toUpperCase();

					let platform = item.platform.toUpperCase();
					let login = item.login.toUpperCase();
					let password = item.password.toUpperCase();
					let tags = item.tags.toUpperCase();

					if (platform.indexOf(query) >= 0
						|| login.indexOf(query) >= 0
						|| password.indexOf(query) >= 0)
					{
						filtered.push(item);
					}
				});
			});
			
			return filtered;
		}
	};
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

	$scope.currentDate = null;
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

			$scope.accounts.$loaded().then(function(data)
			{
				angular.forEach(data, function(item)
				{
					if ($scope.currentDate == null)
					{
						$scope.currentDate = new Date(item.created_date).toLocaleDateString()
					}

					item['displayPlatform'] = cleanUrl(item.platform);

					item['created_date'] = new Date(item.created_date).toLocaleDateString();
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